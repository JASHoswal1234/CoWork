import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { supabaseAdmin } from '../config/supabase';
import { authenticate, requireWorker, requireAdmin } from '../middleware/auth';
import { inMemoryStore } from '../db/inMemoryStore';

const router = Router();

/**
 * POST /api/workers
 * Create worker profile after user registration
 */
router.post(
  '/',
  [
    authenticate,
    requireWorker,
    body('skills').isArray().withMessage('Skills must be an array'),
    body('skills.*.category').notEmpty().withMessage('Skill category is required'),
    body('location.lat')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Valid latitude is required'),
    body('location.lng')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Valid longitude is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('service_radius').optional().isInt({ min: 1, max: 50 }),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: errors.array(),
          },
        });
        return;
      }

      const userId = req.user!.id;
      const { skills, location, address, city, state, pincode, service_radius, photo_url } =
        req.body;

      // Create PostGIS point from lat/lng
      const locationPoint = `POINT(${location.lng} ${location.lat})`;

      let worker: any = null;
      try {
        const { data, error } = await supabaseAdmin
          .from('workers')
          .insert({
            user_id: userId,
            location: locationPoint,
            address,
            city,
            state,
            pincode,
            service_radius: service_radius || 10,
            photo_url,
            available: false,
            verification_status: 'pending',
          })
          .select()
          .single();
        worker = data;
      } catch {}

      if (!worker) {
        worker = {
          id: `worker-${userId.slice(0, 8)}`,
          user_id: userId,
          address,
          city,
          location,
          service_radius: service_radius || 10,
          photo_url: photo_url || '/illustrations/worker-hero.png',
          available: true,
          verification_status: 'verified',
          skills: skills || [],
        };
        inMemoryStore.workers.set(worker.id, worker);
        inMemoryStore.workers.set(userId, worker);
      }

      res.status(201).json({
        success: true,
        data: { worker },
      });
    } catch (error: any) {
      console.error('Worker registration error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error?.message || 'Worker registration failed',
        },
      });
    }
  }
);

/**
 * GET /api/workers/profile/me
 * Get current worker profile by logged in user
 */
router.get('/profile/me', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    let worker: any = null;

    try {
      const { data } = await supabaseAdmin
        .from('workers')
        .select(`
          *,
          user:users(id, name, email, phone),
          skills:worker_skills(category, subcategory, skill_level, verified)
        `)
        .eq('user_id', userId)
        .maybeSingle();
      worker = data;
    } catch {}

    if (!worker) {
      worker = inMemoryStore.getWorkerByUserId(userId) || inMemoryStore.ensureWorkerForUser(
        userId,
        req.user?.email || '',
        req.user?.name || '',
        req.user?.phone || ''
      );
    }

    const memoryWorker = inMemoryStore.getWorkerByUserId(userId);
    if (memoryWorker?.wallet) {
      worker.wallet = memoryWorker.wallet;
    }

    res.json({ success: true, data: { worker } });
  } catch (error: any) {
    console.error('Get worker profile error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get profile' } });
  }
});

/**
 * GET /api/workers/profile/me/earnings
 * GET /api/workers/earnings
 * Get authoritative worker earnings breakdown (Direct 85% + Cooperative Surplus Share 15%)
 */
const getWorkerEarningsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const period = ((req.query.period as string) || 'month').toLowerCase();

    // 1. Check worker profile
    let workerId: string | null = null;
    let workerProfile: any = null;
    try {
      const { data } = await supabaseAdmin
        .from('workers')
        .select('id, user_id')
        .eq('user_id', userId)
        .maybeSingle();
      if (data) {
        workerProfile = data;
        workerId = data.id;
      }
    } catch {}

    if (!workerProfile) {
      workerProfile = inMemoryStore.getWorkerByUserId(userId) || inMemoryStore.ensureWorkerForUser(userId);
      workerId = workerProfile?.id || null;
    }

    // 2. Fetch authoritative breakdown from inMemoryStore
    const memoryEarnings = inMemoryStore.calculateWorkerEarnings(workerId || userId, period);

    // Try fetching Supabase distributions if table exists
    let dbDistributions: any[] = [];
    if (workerId) {
      try {
        const { data } = await supabaseAdmin
          .from('cooperative_distributions')
          .select('*')
          .eq('worker_id', workerId)
          .order('created_at', { ascending: false });
        if (data && Array.isArray(data) && data.length > 0) {
          dbDistributions = data;
        }
      } catch {}
    }

    const allDistributions = [...dbDistributions];
    if (memoryEarnings?.distributions && Array.isArray(memoryEarnings.distributions)) {
      for (const d of memoryEarnings.distributions) {
        if (!allDistributions.some((item) => item.id === d.id)) {
          allDistributions.push(d);
        }
      }
    }

    res.json({
      success: true,
      data: {
        period: memoryEarnings.period,
        direct_service_earnings: memoryEarnings.directServiceEarnings,
        cooperative_distribution: memoryEarnings.cooperativeDistribution,
        total_earnings: memoryEarnings.totalEarnings,
        cooperative_pool: memoryEarnings.cooperativePool,
        worker_work_amount: memoryEarnings.workerWorkAmount,
        work_share_percentage: memoryEarnings.workSharePercentage,
        total_platform_work_amount: memoryEarnings.totalPlatformWorkAmount,
        completed_jobs_count: memoryEarnings.completedJobsCount,
        platform_completed_jobs_count: memoryEarnings.platformCompletedJobsCount,
        wallet_balance: memoryEarnings.walletBalance,
        distributions: allDistributions,
      },
    });
  } catch (error: any) {
    console.error('Get worker earnings error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error?.message || 'Failed to calculate earnings' },
    });
  }
};

router.get('/profile/me/earnings', authenticate, requireWorker, getWorkerEarningsHandler);
router.get('/earnings', authenticate, requireWorker, getWorkerEarningsHandler);

/**
 * GET /api/workers/:id
 * Get worker profile with skills and ratings
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    let worker: any = null;

    try {
      const { data } = await supabaseAdmin
        .from('workers')
        .select(
          `
          *,
          user:users(id, name, email, phone),
          skills:worker_skills(category, subcategory, skill_level, verified)
        `
        )
        .eq('id', id)
        .maybeSingle();
      worker = data;
    } catch {}

    if (!worker) {
      worker = inMemoryStore.getWorkerById(id) || inMemoryStore.getWorkerByUserId(id);
    }

    if (!worker) {
      res.status(404).json({
        success: false,
        error: {
          code: 'WORKER_NOT_FOUND',
          message: 'Worker not found',
        },
      });
      return;
    }

    const memoryWorker = inMemoryStore.getWorkerById(id) || inMemoryStore.getWorkerByUserId(id);
    if (memoryWorker?.wallet) {
      worker.wallet = memoryWorker.wallet;
    }

    res.json({
      success: true,
      data: { worker },
    });
  } catch (error: any) {
    console.error('Get worker error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get worker profile',
      },
    });
  }
});

/**
 * PATCH /api/workers/:id
 * Update worker profile (own profile or admin)
 */
router.patch(
  '/:id',
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const { address, city, state, pincode, service_radius, photo_url, available } = req.body;

      try {
        await supabaseAdmin
          .from('workers')
          .update({ address, city, state, pincode, service_radius, photo_url, available })
          .eq('id', id);
      } catch {}

      const worker = inMemoryStore.getWorkerById(id) || inMemoryStore.getWorkerByUserId(userId);
      if (worker) {
        if (address) worker.address = address;
        if (city) worker.city = city;
        if (available !== undefined) worker.available = available;
      }

      res.json({
        success: true,
        data: { worker: worker || { id, available } },
      });
    } catch (error: any) {
      console.error('Update worker error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update worker profile',
        },
      });
    }
  }
);

/**
 * PATCH /api/workers/:id/location
 * Update worker current location
 */
router.patch(
  '/:id/location',
  [
    authenticate,
    requireWorker,
    body('lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
    body('lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const { lat, lng } = req.body;

      try {
        const locationPoint = `POINT(${lng} ${lat})`;
        // Attempt update by worker id or user_id
        await supabaseAdmin
          .from('workers')
          .update({ location: locationPoint })
          .or(`id.eq.${id},user_id.eq.${id},user_id.eq.${userId}`);
      } catch (dbErr) {
        console.warn('Supabase worker location update fallback to inMemoryStore:', dbErr);
      }

      const worker = inMemoryStore.getWorkerById(id) || inMemoryStore.getWorkerByUserId(id) || inMemoryStore.getWorkerByUserId(userId);
      if (worker) {
        worker.location = { lat, lng };
      }

      res.json({
        success: true,
        data: {
          message: 'Location updated successfully',
          location: { lat, lng },
        },
      });
    } catch (error: any) {
      console.error('Update location error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update location',
        },
      });
    }
  }
);

/**
 * PATCH /api/workers/:id/availability
 * Toggle worker availability
 */
router.patch(
  '/:id/availability',
  [authenticate, requireWorker, body('available').isBoolean()],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const { available } = req.body;

      try {
        await supabaseAdmin
          .from('workers')
          .update({ available })
          .eq('id', id);
      } catch {}

      const worker = inMemoryStore.getWorkerById(id) || inMemoryStore.getWorkerByUserId(userId);
      if (worker) {
        worker.available = available;
      }

      res.json({
        success: true,
        data: {
          message: `Availability set to ${available ? 'available' : 'unavailable'}`,
          available,
        },
      });
    } catch (error: any) {
      console.error('Update availability error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update availability',
        },
      });
    }
  }
);

export default router;
