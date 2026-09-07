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
} from '../utils/geospatial';
import { authenticate, requireWorker } from '../middleware/auth';

const router = Router();

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
  radiusMeters: number
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

  // Return all matching workers (no distance filter in fallback)
  return matchingWorkers.map((w: any) => ({
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
    distance_meters: 5000, // Default 5km for fallback
  }));
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
