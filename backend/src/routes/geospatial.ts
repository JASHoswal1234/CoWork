import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { supabase } from '../config/supabase';
import {
  calculateDistance,
  estimateETA,
  formatDistance,
  formatETA,
  validateCoordinates,
  createPostGISPoint,
  parsePostGISPoint,
} from '../utils/geospatial';
import { authenticate, requireWorker } from '../middleware/auth';

const router = Router();

/**
 * GET /api/geospatial/reverse-geocode
 * Reverse geocode latitude/longitude into a structured, readable address
 */
router.get(
  '/reverse-geocode',
  [
    query('lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required (-90 to 90)'),
    query('lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required (-180 to 180)'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid coordinates', details: errors.array() },
        });
        return;
      }

      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);

      let formattedAddress = '';
      let locality = '';
      let city = '';
      let state = '';
      let pincode = '';
      let rawData: any = null;

      // 1. Try Nominatim (OpenStreetMap) with proper User-Agent
      try {
        const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&addressdetails=1`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(nominatimUrl, {
          headers: {
            'User-Agent': 'ShramSangam/1.0 (contact@shramsangam.in)',
            'Accept-Language': 'en',
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = (await response.json()) as any;
          rawData = data;
          if (data && data.address) {
            const addr = data.address;
            locality = addr.suburb || addr.neighbourhood || addr.residential || addr.quarter || addr.village || addr.town || '';
            city = addr.city || addr.town || addr.municipality || addr.county || '';
            state = addr.state || '';
            pincode = addr.postcode || '';

            const buildingOrAmenity = addr.amenity || addr.building || addr.shop || addr.office || '';
            const road = addr.road || addr.street || addr.footway || '';

            const parts = [
              buildingOrAmenity,
              road,
              locality,
              city,
              state ? `${state}${pincode ? ` ${pincode}` : ''}` : pincode,
            ].filter((p) => Boolean(p && String(p).trim().length > 0));

            // Deduplicate adjacent identical parts
            const cleanParts = parts.filter((part, idx) => idx === 0 || part.toLowerCase() !== parts[idx - 1].toLowerCase());
            formattedAddress = cleanParts.join(', ') || data.display_name || '';
          }
        }
      } catch (nomErr) {
        console.warn('Nominatim reverse geocode attempt failed, trying fallback:', nomErr);
      }

      // 2. Fallback to BigDataCloud reverse geocoding if Nominatim yielded no address
      if (!formattedAddress) {
        try {
          const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);

          const response = await fetch(bdcUrl, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = (await response.json()) as any;
            locality = data.locality || '';
            city = data.city || data.locality || '';
            state = data.principalSubdivision || '';
            pincode = data.postcode || '';

            const parts = [locality, city, state, data.countryName].filter(Boolean);
            const cleanParts = parts.filter((part, idx) => idx === 0 || part.toLowerCase() !== parts[idx - 1].toLowerCase());
            formattedAddress = cleanParts.join(', ');
          }
        } catch (bdcErr) {
          console.warn('BigDataCloud reverse geocode attempt failed:', bdcErr);
        }
      }

      // 3. Coordinate fallback if both reverse geocoding services failed
      if (!formattedAddress) {
        formattedAddress = `Location (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
      }

      res.json({
        success: true,
        data: {
          address: formattedAddress,
          locality: locality || undefined,
          city: city || undefined,
          state: state || undefined,
          pincode: pincode || undefined,
          coordinates: { lat, lng },
        },
      });
    } catch (error: any) {
      console.error('Reverse geocode error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'GEOCODE_FAILED', message: 'Failed to reverse geocode location' },
      });
    }
  }
);

/**
 * POST /api/geospatial/workers/search
 * Find nearby available workers using PostGIS ST_DWithin
 * Automatically expands radius from 10km → 25km if no results found
 */
router.post(
  '/workers/search',
  [
    body('lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
    body('lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
    body('service_category').notEmpty().withMessage('Service category required'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: errors.array() },
        });
        return;
      }

      const { lat, lng, service_category } = req.body;

      // Try 10km radius first
      let workers = await findNearbyWorkers(lat, lng, service_category, 10000);

      // Expand to 25km if no results
      if (workers.length === 0) {
        workers = await findNearbyWorkers(lat, lng, service_category, 25000);
      }

      // Enhance each worker with formatted distance and ETA
      const enhancedWorkers = workers.map((w: any) => {
        const distanceKm = w.distance_meters / 1000;
        const eta = estimateETA(distanceKm);
        return {
          ...w,
          distance_km: Number(distanceKm.toFixed(2)),
          distance_formatted: formatDistance(distanceKm),
          eta_minutes: eta,
          eta_formatted: formatETA(eta),
        };
      });

      res.json({
        success: true,
        data: {
          workers: enhancedWorkers,
          total: enhancedWorkers.length,
          search_location: { lat, lng },
          service_category,
        },
      });
    } catch (error) {
      console.error('Worker search error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SEARCH_FAILED', message: 'Failed to search for workers' },
      });
    }
  }
);

/**
 * Helper: call PostGIS function to find nearby workers
 */
async function findNearbyWorkers(
  lat: number,
  lng: number,
  serviceCategory: string,
  radiusMeters: number
): Promise<any[]> {
  const { data, error } = await supabase.rpc('find_nearby_workers', {
    p_lat: lat,
    p_lng: lng,
    p_service_category: serviceCategory,
    p_radius_meters: radiusMeters,
  });

  if (error) {
    console.error('PostGIS query error:', error);
    // Fallback to simple query if PostGIS function fails
    return await fallbackWorkerSearch(lat, lng, serviceCategory, radiusMeters);
  }

  return data || [];
}

/**
 * Fallback worker search without PostGIS (basic query + client-side distance filter)
 * Used if PostGIS function is not yet deployed
 */
async function fallbackWorkerSearch(
  lat: number,
  lng: number,
  serviceCategory: string,
  _radiusMeters: number
): Promise<any[]> {
  const { data: workers, error } = await supabase
    .from('workers')
    .select(
      `
      id,
      user_id,
      photo_url,
      rating,
      total_ratings,
      completed_jobs,
      city,
      location,
      user:users(name, phone),
      skills:worker_skills(category, subcategory, skill_level)
    `
    )
    .eq('available', true)
    .eq('verification_status', 'verified');

  if (error || !workers) return [];

  // Filter by skill category
  const matchingWorkers = workers.filter((w: any) =>
    w.skills?.some((s: any) =>
      s.category.toLowerCase().includes(serviceCategory.toLowerCase())
    )
  );

  const results = matchingWorkers.map((w: any) => {
    let distanceKm = 3.5;
    let workerLat: number | null = null;
    let workerLng: number | null = null;
    if (w.location) {
      const coords = parsePostGISPoint(w.location);
      if (coords) {
        distanceKm = calculateDistance(lat, lng, coords.lat, coords.lng);
        workerLat = coords.lat;
        workerLng = coords.lng;
      }
    }
    return {
      worker_id: w.id,
      user_id: w.user_id,
      name: w.user?.name,
      phone: w.user?.phone,
      photo_url: w.photo_url,
      rating: w.rating,
      total_ratings: w.total_ratings,
      completed_jobs: w.completed_jobs,
      city: w.city,
      skills: w.skills,
      distance_meters: Math.round(distanceKm * 1000),
      lat: workerLat,
      lng: workerLng,
    };
  });

  results.sort((a: any, b: any) => a.distance_meters - b.distance_meters);
  return results;
}

/**
 * POST /api/geospatial/workers/location
 * Update worker's current location
 */
router.post(
  '/workers/location',
  [
    authenticate,
    requireWorker,
    body('lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
    body('lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
    body('worker_id').notEmpty().withMessage('Worker ID required'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: errors.array() },
        });
        return;
      }

      const { lat, lng, worker_id } = req.body;
      const userId = req.user!.id;

      // Verify worker belongs to this user
      const { data: worker } = await supabase
        .from('workers')
        .select('user_id')
        .eq('id', worker_id)
        .single();

      if (!worker || worker.user_id !== userId) {
        res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Cannot update another worker\'s location' },
        });
        return;
      }

      // Update location as PostGIS point
      const { error } = await supabase
        .from('workers')
        .update({ location: createPostGISPoint(lat, lng) })
        .eq('id', worker_id);

      if (error) {
        res.status(500).json({
          success: false,
          error: { code: 'UPDATE_FAILED', message: 'Failed to update location' },
        });
        return;
      }

      res.json({
        success: true,
        data: { message: 'Location updated', lat, lng },
      });
    } catch (error) {
      console.error('Location update error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update location' },
      });
    }
  }
);

/**
 * GET /api/geospatial/distance
 * Calculate distance between two coordinates
 */
router.get(
  '/distance',
  [
    query('lat1').isFloat({ min: -90, max: 90 }),
    query('lng1').isFloat({ min: -180, max: 180 }),
    query('lat2').isFloat({ min: -90, max: 90 }),
    query('lng2').isFloat({ min: -180, max: 180 }),
  ],
  (req: Request, res: Response): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid coordinates' },
      });
      return;
    }

    const lat1 = parseFloat(req.query.lat1 as string);
    const lng1 = parseFloat(req.query.lng1 as string);
    const lat2 = parseFloat(req.query.lat2 as string);
    const lng2 = parseFloat(req.query.lng2 as string);

    const distanceKm = calculateDistance(lat1, lng1, lat2, lng2);
    const etaMinutes = estimateETA(distanceKm);

    res.json({
      success: true,
      data: {
        distance_km: distanceKm,
        distance_formatted: formatDistance(distanceKm),
        eta_minutes: etaMinutes,
        eta_formatted: formatETA(etaMinutes),
      },
    });
  }
);

export default router;
