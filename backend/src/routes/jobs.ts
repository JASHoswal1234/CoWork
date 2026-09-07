import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { supabase } from '../config/supabase';
import { authenticate, requireCustomer, requireWorker, requireAdmin } from '../middleware/auth';
import { createPostGISPoint, calculateDistance, estimateETA } from '../utils/geospatial';

const router = Router();

// Valid job status transitions
const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['matched', 'cancelled'],
  matched: ['accepted', 'cancelled'],
  accepted: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
  rejected: [],
};

function isValidTransition(from: string, to: string): boolean {
  return STATUS_TRANSITIONS[from]?.includes(to) || false;
}

/**
 * POST /api/jobs
 * Customer creates a new job
 */
router.post(
  '/',
  [
    authenticate,
    requireCustomer,
    body('service_category_name').notEmpty().withMessage('Service category is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('location.lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
    body('location.lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
    body('estimated_price').isFloat({ min: 0 }).withMessage('Valid price estimate required'),
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

      const userId = req.user!.id;
      const {
        service_category_name,
        service_subcategory_name,
        description,
        address,
        location,
        estimated_price,
        scheduled_at,
        problem_image_urls,
      } = req.body;

      // Get customer info
      const { data: customer } = await supabase
        .from('users')
        .select('name, phone')
        .eq('id', userId)
        .single();

      // Create job
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert({
          customer_id: userId,
          customer_name: customer?.name || 'Unknown',
          customer_phone: customer?.phone || '',
          customer_location: createPostGISPoint(location.lat, location.lng),
          customer_address: address,
          service_category_name,
          service_subcategory_name,
          description,
          estimated_price,
          scheduled_at: scheduled_at || null,
          is_immediate: !scheduled_at,
          problem_image_urls: problem_image_urls || [],
          status: 'pending',
          payment_status: 'pending',
        })
        .select()
        .single();

      if (jobError) {
        console.error('Job creation error:', jobError);
        res.status(500).json({
          success: false,
          error: { code: 'JOB_CREATION_FAILED', message: 'Failed to create job' },
        });
        return;
      }

      // Trigger async worker matching (don't await - return job immediately)
      matchAndAssignWorker(job.id, location.lat, location.lng, service_category_name).catch(
        console.error
      );

      res.status(201).json({
        success: true,
        data: {
          job,
          message: 'Job created. Finding nearby workers...',
        },
      });
    } catch (error) {
      console.error('Create job error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to create job' },
      });
    }
  }
);

/**
 * Background: find nearest worker and assign job
 */
async function matchAndAssignWorker(
  jobId: string,
  lat: number,
  lng: number,
  serviceCategory: string
): Promise<void> {
  // Try PostGIS function first
  let workers: any[] = [];

  const { data: postgisData } = await supabase.rpc('find_nearby_workers', {
    p_lat: lat,
    p_lng: lng,
    p_service_category: serviceCategory,
    p_radius_meters: 10000,
  });

  workers = postgisData || [];

  // Expand to 25km if no match
  if (workers.length === 0) {
    const { data: expanded } = await supabase.rpc('find_nearby_workers', {
      p_lat: lat,
      p_lng: lng,
      p_service_category: serviceCategory,
      p_radius_meters: 25000,
    });
    workers = expanded || [];
  }

  if (workers.length === 0) {
    // No workers found - update job status
    await supabase
      .from('jobs')
      .update({ status: 'cancelled' })
      .eq('id', jobId);
    return;
  }

  const bestWorker = workers[0];

  // Assign job to worker
  await supabase
    .from('jobs')
    .update({
      worker_id: bestWorker.worker_id,
      status: 'matched',
      assigned_at: new Date().toISOString(),
    })
    .eq('id', jobId);

  // Mark worker temporarily unavailable
  await supabase
    .from('workers')
    .update({ available: false })
    .eq('id', bestWorker.worker_id);

  // Create notification for worker
  await supabase.from('notifications').insert({
    user_id: bestWorker.user_id,
    title: 'New Job Request!',
    message: `New ${serviceCategory} job nearby. Tap to view details.`,
    type: 'job_request',
    related_job_id: jobId,
  });
}

/**
 * GET /api/jobs/:id
 * Get job details
 */
router.get('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { data: job, error } = await supabase
      .from('jobs')
      .select(`
        *,
        worker:workers(
          id, photo_url, rating, total_ratings, completed_jobs, city,
          user:users(name, phone)
        )
      `)
      .eq('id', id)
      .single();

    if (error || !job) {
      res.status(404).json({
        success: false,
        error: { code: 'JOB_NOT_FOUND', message: 'Job not found' },
      });
      return;
    }

    res.json({ success: true, data: { job } });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get job' },
    });
  }
});

/**
 * GET /api/jobs
 * List jobs with filters (customer sees their jobs, worker sees assigned jobs, admin sees all)
 */
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { status, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let queryBuilder = supabase
      .from('jobs')
      .select('*, worker:workers(id, photo_url, rating, user:users(name, phone))', {
        count: 'exact',
      });

    // Filter by role
    if (userRole === 'customer') {
      queryBuilder = queryBuilder.eq('customer_id', userId);
    } else if (userRole === 'worker') {
      // Get worker profile first
      const { data: workerProfile } = await supabase
        .from('workers')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (workerProfile) {
        queryBuilder = queryBuilder.eq('worker_id', workerProfile.id);
      }
    }
    // Admin sees all jobs

    if (status) {
      queryBuilder = queryBuilder.eq('status', status as string);
    }

    const { data: jobs, count, error } = await queryBuilder
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) {
      res.status(500).json({
        success: false,
        error: { code: 'QUERY_FAILED', message: 'Failed to fetch jobs' },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          total: count || 0,
          page: pageNum,
          limit: limitNum,
          total_pages: Math.ceil((count || 0) / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('List jobs error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list jobs' },
    });
  }
});

/**
 * POST /api/jobs/:id/accept
 * Worker accepts an assigned job
 */
router.post('/:id/accept', [authenticate, requireWorker], async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Get worker profile
    const { data: workerProfile } = await supabase
      .from('workers')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!workerProfile) {
      res.status(404).json({
        success: false,
        error: { code: 'WORKER_NOT_FOUND', message: 'Worker profile not found' },
      });
      return;
    }

    // Get job and validate
    const { data: job } = await supabase
      .from('jobs')
      .select('status, worker_id, customer_id')
      .eq('id', id)
      .single();

    if (!job) {
      res.status(404).json({
        success: false,
        error: { code: 'JOB_NOT_FOUND', message: 'Job not found' },
      });
      return;
    }

    if (job.worker_id !== workerProfile.id) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'This job is not assigned to you' },
      });
      return;
    }

    if (job.status !== 'matched') {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: `Cannot accept job with status: ${job.status}` },
      });
      return;
    }

    // Update job status
    const { data: updatedJob, error } = await supabase
      .from('jobs')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      res.status(500).json({
        success: false,
        error: { code: 'UPDATE_FAILED', message: 'Failed to accept job' },
      });
      return;
    }

    // Notify customer
    await supabase.from('notifications').insert({
      user_id: job.customer_id,
      title: 'Worker Accepted!',
      message: 'A worker has accepted your job request and is on the way.',
      type: 'job_accepted',
      related_job_id: id,
    });

    res.json({ success: true, data: { job: updatedJob } });
  } catch (error) {
    console.error('Accept job error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to accept job' },
    });
  }
});

/**
 * PATCH /api/jobs/:id/status
 * Update job status (with validation of state machine)
 */
router.patch('/:id/status', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status: newStatus } = req.body;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    if (!newStatus) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Status is required' },
      });
      return;
    }

    const { data: job } = await supabase
      .from('jobs')
      .select('status, customer_id, worker_id')
      .eq('id', id)
      .single();

    if (!job) {
      res.status(404).json({
        success: false,
        error: { code: 'JOB_NOT_FOUND', message: 'Job not found' },
      });
      return;
    }

    // Validate transition
    if (!isValidTransition(job.status, newStatus)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TRANSITION',
          message: `Cannot transition from '${job.status}' to '${newStatus}'`,
        },
      });
      return;
    }

    // Build update payload
    const updates: any = {
      status: newStatus,
    };

    if (newStatus === 'in_progress') updates.started_at = new Date().toISOString();
    if (newStatus === 'completed') updates.completed_at = new Date().toISOString();
    if (newStatus === 'cancelled') {
      updates.cancelled_at = new Date().toISOString();
      updates.cancellation_reason = req.body.reason || 'Cancelled by user';
    }

    const { data: updatedJob, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      res.status(500).json({
        success: false,
        error: { code: 'UPDATE_FAILED', message: 'Failed to update job status' },
      });
      return;
    }

    // If completed, free up worker and create payment record
    if (newStatus === 'completed' && job.worker_id) {
      await supabase
        .from('workers')
        .update({ available: true })
        .eq('id', job.worker_id);

      // Notify customer to confirm and pay
      await supabase.from('notifications').insert({
        user_id: job.customer_id,
        title: 'Job Completed!',
        message: 'Your job has been marked as completed. Please confirm and make payment.',
        type: 'job_completed',
        related_job_id: id,
      });
    }

    // Record status change history
    await supabase.from('job_status_history').insert({
      job_id: id,
      from_status: job.status,
      to_status: newStatus,
      changed_by: userId,
    });

    res.json({ success: true, data: { job: updatedJob } });
  } catch (error) {
    console.error('Update job status error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update status' },
    });
  }
});

/**
 * POST /api/jobs/:id/dispute
 * Customer disputes job completion
 */
router.post('/:id/dispute', [authenticate, requireCustomer], async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const { data: job } = await supabase
      .from('jobs')
      .select('status, customer_id')
      .eq('id', id)
      .single();

    if (!job || job.customer_id !== req.user!.id) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Cannot dispute this job' },
      });
      return;
    }

    const { data: updatedJob, error } = await supabase
      .from('jobs')
      .update({
        status: 'rejected',
        cancellation_reason: reason || 'Disputed by customer',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      res.status(500).json({
        success: false,
        error: { code: 'UPDATE_FAILED', message: 'Failed to dispute job' },
      });
      return;
    }

    res.json({
      success: true,
      data: { job: updatedJob, message: 'Dispute submitted. Admin will review.' },
    });
  } catch (error) {
    console.error('Dispute job error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to dispute job' },
    });
  }
});

/**
 * GET /api/jobs/:id/status
 * Lightweight polling endpoint for job status
 */
router.get('/:id/status', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { data: job } = await supabase
      .from('jobs')
      .select('id, status, worker_id, assigned_at, accepted_at, started_at, completed_at')
      .eq('id', req.params.id)
      .single();

    if (!job) {
      res.status(404).json({
        success: false,
        error: { code: 'JOB_NOT_FOUND', message: 'Job not found' },
      });
      return;
    }

    res.json({ success: true, data: { ...job, last_updated: new Date().toISOString() } });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get job status' },
    });
  }
});

export default router;
