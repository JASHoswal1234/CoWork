import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { supabase } from '../config/supabase';
import { authenticate, requireWorker, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * POST /api/workers
 * Create worker profile after user registration
 * Requires user to have role='worker'
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

      // Check if worker profile already exists
      const { data: existingWorker } = await supabase
        .from('workers')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingWorker) {
        res.status(400).json({
          success: false,
          error: {
            code: 'WORKER_EXISTS',
            message: 'Worker profile already exists',
          },
        });
        return;
      }

      // Create PostGIS point from lat/lng
      const locationPoint = `POINT(${location.lng} ${location.lat})`;

      // Insert worker profile
      const { data: worker, error: workerError } = await supabase
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

      if (workerError) {
        console.error('Worker creation error:', workerError);
        res.status(500).json({
          success: false,
          error: {
            code: 'WORKER_CREATION_FAILED',
            message: 'Failed to create worker profile',
          },
        });
        return;
      }

      // Insert worker skills
      if (skills && skills.length > 0) {
        const skillsData = skills.map((skill: any) => ({
          worker_id: worker.id,
          category: skill.category,
          subcategory: skill.subcategory || null,
          skill_level: skill.skill_level || 'beginner',
        }));

        const { error: skillsError } = await supabase
          .from('worker_skills')
          .insert(skillsData);

        if (skillsError) {
          console.error('Skills insertion error:', skillsError);
        }
      }

      // Create wallet for worker
      const { error: walletError } = await supabase
        .from('worker_wallets')
        .insert({
          worker_id: worker.id,
          balance: 0,
          total_earned: 0,
          total_withdrawn: 0,
        });

      if (walletError) {
        console.error('Wallet creation error:', walletError);
      }

      res.status(201).json({
        success: true,
        data: { worker },
      });
    } catch (error) {
      console.error('Worker registration error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Worker registration failed',
        },
      });
    }
  }
);

/**
 * GET /api/workers/:id
 * Get worker profile with skills and ratings
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Get worker with user info
    const { data: worker, error } = await supabase
      .from('workers')
      .select(
        `
        *,
        user:users(id, name, email, phone),
        skills:worker_skills(category, subcategory, skill_level, verified)
      `
      )
      .eq('id', id)
      .single();

    if (error || !worker) {
      res.status(404).json({
        success: false,
        error: {
          code: 'WORKER_NOT_FOUND',
          message: 'Worker not found',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: { worker },
    });
  } catch (error) {
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
      const userRole = req.user!.role;

      // Check if user owns this worker profile or is admin
      const { data: worker } = await supabase
        .from('workers')
        .select('user_id')
        .eq('id', id)
        .single();

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

      if (worker.user_id !== userId && userRole !== 'admin') {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only update your own profile',
          },
        });
        return;
      }

      const { address, city, state, pincode, service_radius, photo_url, available } = req.body;

      const updates: any = {};
      if (address !== undefined) updates.address = address;
      if (city !== undefined) updates.city = city;
      if (state !== undefined) updates.state = state;
      if (pincode !== undefined) updates.pincode = pincode;
      if (service_radius !== undefined) updates.service_radius = service_radius;
      if (photo_url !== undefined) updates.photo_url = photo_url;
      if (available !== undefined) updates.available = available;

      const { data: updatedWorker, error } = await supabase
        .from('workers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        res.status(500).json({
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: 'Failed to update worker profile',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: { worker: updatedWorker },
      });
    } catch (error) {
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

      const { id } = req.params;
      const userId = req.user!.id;
      const { lat, lng } = req.body;

      // Verify worker ownership
      const { data: worker } = await supabase
        .from('workers')
        .select('user_id')
        .eq('id', id)
        .single();

      if (!worker || worker.user_id !== userId) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only update your own location',
          },
        });
        return;
      }

      // Update location
      const locationPoint = `POINT(${lng} ${lat})`;

      const { error } = await supabase
        .from('workers')
        .update({
          location: locationPoint,
          location_updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        res.status(500).json({
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: 'Failed to update location',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          message: 'Location updated successfully',
        },
      });
    } catch (error) {
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

      // Verify worker ownership
      const { data: worker } = await supabase
        .from('workers')
        .select('user_id')
        .eq('id', id)
        .single();

      if (!worker || worker.user_id !== userId) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only update your own availability',
          },
        });
        return;
      }

      const { error } = await supabase
        .from('workers')
        .update({ available })
        .eq('id', id);

      if (error) {
        res.status(500).json({
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: 'Failed to update availability',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          message: `Availability set to ${available ? 'available' : 'unavailable'}`,
          available,
        },
      });
    } catch (error) {
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

/**
 * GET /api/admin/workers/pending
 * List workers pending verification (admin only)
 */
router.get(
  '/admin/pending',
  [authenticate, requireAdmin],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { data: workers, error } = await supabase
        .from('workers')
        .select(
          `
          *,
          user:users(name, email, phone),
          skills:worker_skills(category, subcategory)
        `
        )
        .eq('verification_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        res.status(500).json({
          success: false,
          error: {
            code: 'QUERY_FAILED',
            message: 'Failed to fetch pending workers',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: { workers },
      });
    } catch (error) {
      console.error('Get pending workers error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch pending workers',
        },
      });
    }
  }
);

/**
 * PATCH /api/admin/workers/:id/approve
 * Approve worker verification (admin only)
 */
router.patch(
  '/admin/:id/approve',
  [authenticate, requireAdmin],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const { data: worker, error } = await supabase
        .from('workers')
        .update({
          verification_status: 'verified',
          verified_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        res.status(500).json({
          success: false,
          error: {
            code: 'APPROVAL_FAILED',
            message: 'Failed to approve worker',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          message: 'Worker approved successfully',
          worker,
        },
      });
    } catch (error) {
      console.error('Approve worker error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to approve worker',
        },
      });
    }
  }
);

/**
 * PATCH /api/admin/workers/:id/reject
 * Reject worker verification (admin only)
 */
router.patch(
  '/admin/:id/reject',
  [authenticate, requireAdmin, body('reason').notEmpty()],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const { data: worker, error } = await supabase
        .from('workers')
        .update({
          verification_status: 'rejected',
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        res.status(500).json({
          success: false,
          error: {
            code: 'REJECTION_FAILED',
            message: 'Failed to reject worker',
          },
        });
        return;
      }

      // TODO: Send notification to worker with rejection reason

      res.json({
        success: true,
        data: {
          message: 'Worker rejected',
          worker,
          reason,
        },
      });
    } catch (error) {
      console.error('Reject worker error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to reject worker',
        },
      });
    }
  }
);

export default router;
