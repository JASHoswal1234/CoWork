import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { supabase } from '../config/supabase';
import { authenticate, requireCustomer } from '../middleware/auth';

const router = Router();

/**
 * POST /api/reviews
 * Customer submits review after job completion
 */
router.post(
  '/',
  [
    authenticate,
    requireCustomer,
    body('job_id').notEmpty().withMessage('Job ID required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    body('comment').optional().isString(),
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

      const { job_id, rating, comment } = req.body;
      const customerId = req.user!.id;

      // Validate job belongs to customer and is completed
      const { data: job } = await supabase
        .from('jobs')
        .select('id, status, worker_id, customer_id')
        .eq('id', job_id)
        .eq('customer_id', customerId)
        .single();

      if (!job) {
        res.status(404).json({
          success: false,
          error: { code: 'JOB_NOT_FOUND', message: 'Job not found' },
        });
        return;
      }

      if (job.status !== 'completed') {
        res.status(400).json({
          success: false,
          error: { code: 'JOB_NOT_COMPLETED', message: 'Can only review completed jobs' },
        });
        return;
      }

      // Check if review already exists
      const { data: existing } = await supabase
        .from('jobs')
        .select('rating')
        .eq('id', job_id)
        .not('rating', 'is', null)
        .single();

      if (existing?.rating) {
        res.status(400).json({
          success: false,
          error: { code: 'ALREADY_REVIEWED', message: 'You have already reviewed this job' },
        });
        return;
      }

      // Save review directly on the jobs table (simpler - no separate reviews table in schema)
      const { data: updatedJob, error } = await supabase
        .from('jobs')
        .update({
          rating,
          review: comment,
          review_date: new Date().toISOString(),
        })
        .eq('id', job_id)
        .select()
        .single();

      if (error) {
        res.status(500).json({
          success: false,
          error: { code: 'REVIEW_FAILED', message: 'Failed to submit review' },
        });
        return;
      }

      // Recalculate worker average rating
      if (job.worker_id) {
        await recalculateWorkerRating(job.worker_id);
      }

      res.status(201).json({
        success: true,
        data: {
          job_id,
          rating,
          comment,
          message: 'Review submitted successfully',
        },
      });
    } catch (error) {
      console.error('Submit review error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to submit review' },
      });
    }
  }
);

/**
 * Recalculate worker's average rating from all completed jobs
 */
async function recalculateWorkerRating(workerId: string): Promise<void> {
  const { data: jobs } = await supabase
    .from('jobs')
    .select('rating')
    .eq('worker_id', workerId)
    .not('rating', 'is', null);

  if (!jobs || jobs.length === 0) return;

  const totalRating = jobs.reduce((sum: number, j: any) => sum + j.rating, 0);
  const avgRating = Number((totalRating / jobs.length).toFixed(2));

  await supabase
    .from('workers')
    .update({
      rating: avgRating,
      total_ratings: jobs.length,
    })
    .eq('id', workerId);
}

/**
 * GET /api/reviews/worker/:id
 * Get all reviews for a worker
 */
router.get('/worker/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { page = '1', limit = '10' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const { data: jobs, count, error } = await supabase
      .from('jobs')
      .select('id, rating, review, review_date, service_category_name, customer_name', {
        count: 'exact',
      })
      .eq('worker_id', id)
      .not('rating', 'is', null)
      .order('review_date', { ascending: false })
      .range(offset, offset + parseInt(limit as string) - 1);

    if (error) {
      res.status(500).json({
        success: false,
        error: { code: 'QUERY_FAILED', message: 'Failed to fetch reviews' },
      });
      return;
    }

    // Anonymize customer names
    const reviews = jobs?.map((j: any, index: number) => ({
      id: j.id,
      rating: j.rating,
      comment: j.review,
      date: j.review_date,
      service: j.service_category_name,
      customer: `Customer ${String.fromCharCode(65 + (index % 26))}`, // Customer A, B, C...
    }));

    // Get worker average rating
    const { data: worker } = await supabase
      .from('workers')
      .select('rating, total_ratings')
      .eq('id', id)
      .single();

    res.json({
      success: true,
      data: {
        reviews,
        average_rating: worker?.rating || 0,
        total_reviews: count || 0,
        pagination: {
          total: count || 0,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch reviews' },
    });
  }
});

/**
 * GET /api/reviews/job/:id
 * Get review for a specific job
 */
router.get('/job/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { data: job, error } = await supabase
      .from('jobs')
      .select('id, rating, review, review_date')
      .eq('id', req.params.id)
      .single();

    if (error || !job) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Job not found' },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        job_id: job.id,
        rating: job.rating,
        comment: job.review,
        date: job.review_date,
        has_review: job.rating !== null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch review' },
    });
  }
});

export default router;
