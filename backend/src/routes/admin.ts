import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

/**
 * GET /api/admin/dashboard
 * Summary metrics for cooperative admin
 */
router.get('/dashboard', async (req: Request, res: Response): Promise<void> => {
  try {
    const [
      { count: totalJobs },
      { count: activeWorkers },
      { count: pendingVerifications },
      { count: pendingJobs },
      { count: disputedJobs },
    ] = await Promise.all([
      supabase.from('jobs').select('id', { count: 'exact' }),
      supabase.from('workers').select('id', { count: 'exact' }).eq('verification_status', 'verified').eq('available', true),
      supabase.from('workers').select('id', { count: 'exact' }).eq('verification_status', 'pending'),
      supabase.from('jobs').select('id', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('jobs').select('id', { count: 'exact' }).eq('status', 'rejected'),
    ]);

    // Total revenue from payments
    const { data: revenueData } = await supabase
      .from('payments')
      .select('amount, cooperative_share')
      .eq('status', 'completed');

    const totalRevenue = (revenueData || []).reduce((sum: number, p: any) => sum + p.amount, 0);
    const coopEarnings = (revenueData || []).reduce((sum: number, p: any) => sum + p.cooperative_share, 0);

    // Job completion rate
    const { count: completedJobs } = await supabase
      .from('jobs')
      .select('id', { count: 'exact' })
      .eq('status', 'completed');

    const completionRate = totalJobs
      ? Number(((completedJobs || 0) / (totalJobs || 1) * 100).toFixed(1))
      : 0;

    // Average worker rating
    const { data: workerRatings } = await supabase
      .from('workers')
      .select('rating')
      .not('rating', 'is', null)
      .gt('rating', 0);

    const avgRating = workerRatings && workerRatings.length > 0
      ? Number((workerRatings.reduce((s: number, w: any) => s + w.rating, 0) / workerRatings.length).toFixed(2))
      : 0;

    // Today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: todayJobs } = await supabase
      .from('jobs')
      .select('id', { count: 'exact' })
      .gte('created_at', today.toISOString());

    res.json({
      success: true,
      data: {
        overview: {
          total_jobs: totalJobs || 0,
          active_workers: activeWorkers || 0,
          pending_verifications: pendingVerifications || 0,
          pending_jobs: pendingJobs || 0,
          disputed_jobs: disputedJobs || 0,
          completed_jobs: completedJobs || 0,
        },
        financials: {
          total_revenue: Number(totalRevenue.toFixed(2)),
          cooperative_earnings: Number(coopEarnings.toFixed(2)),
        },
        performance: {
          completion_rate: `${completionRate}%`,
          average_worker_rating: avgRating,
          today_jobs: todayJobs || 0,
        },
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to load dashboard' },
    });
  }
});

/**
 * GET /api/admin/workers
 * List all workers with filters
 */
router.get('/workers', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, skills, search, page = '1', limit = '20', sort_by = 'created_at', order = 'desc' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let queryBuilder = supabase
      .from('workers')
      .select(`
        *,
        user:users(name, email, phone),
        skills:worker_skills(category, subcategory, skill_level)
      `, { count: 'exact' });

    if (status) queryBuilder = queryBuilder.eq('verification_status', status as string);
    if (search) {
      // Search in users table - we'll filter client side for now
    }

    const { data: workers, count, error } = await queryBuilder
      .order(sort_by as string, { ascending: order === 'asc' })
      .range(offset, offset + parseInt(limit as string) - 1);

    if (error) {
      res.status(500).json({
        success: false,
        error: { code: 'QUERY_FAILED', message: 'Failed to fetch workers' },
      });
      return;
    }

    // Filter by search term (client side)
    let filtered = workers || [];
    if (search) {
      const term = (search as string).toLowerCase();
      filtered = filtered.filter((w: any) =>
        w.user?.name?.toLowerCase().includes(term) ||
        w.user?.phone?.includes(term) ||
        w.city?.toLowerCase().includes(term)
      );
    }

    res.json({
      success: true,
      data: {
        workers: filtered,
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
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch workers' },
    });
  }
});

/**
 * GET /api/admin/jobs
 * List all jobs with status breakdown
 */
router.get('/jobs', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let queryBuilder = supabase
      .from('jobs')
      .select(`
        *,
        worker:workers(id, user:users(name, phone))
      `, { count: 'exact' });

    if (status) queryBuilder = queryBuilder.eq('status', status as string);

    const { data: jobs, count, error } = await queryBuilder
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit as string) - 1);

    if (error) {
      res.status(500).json({
        success: false,
        error: { code: 'QUERY_FAILED', message: 'Failed to fetch jobs' },
      });
      return;
    }

    // Status breakdown
    const { data: statusCounts } = await supabase
      .from('jobs')
      .select('status');

    const breakdown: Record<string, number> = {};
    (statusCounts || []).forEach((j: any) => {
      breakdown[j.status] = (breakdown[j.status] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        jobs,
        status_breakdown: breakdown,
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
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch jobs' },
    });
  }
});

/**
 * GET /api/admin/financials
 * Financial overview
 */
router.get('/financials', async (req: Request, res: Response): Promise<void> => {
  try {
    const { data: payments } = await supabase
      .from('payments')
      .select('amount, worker_earnings, cooperative_share, status, created_at')
      .order('created_at', { ascending: false });

    const completed = (payments || []).filter((p: any) => p.status === 'completed');

    const totalRevenue = completed.reduce((s: number, p: any) => s + p.amount, 0);
    const totalWorkerEarnings = completed.reduce((s: number, p: any) => s + p.worker_earnings, 0);
    const totalCoopEarnings = completed.reduce((s: number, p: any) => s + p.cooperative_share, 0);

    // Pending payouts
    const { data: pendingPayouts } = await supabase
      .from('payout_requests')
      .select('amount')
      .eq('status', 'pending');

    const pendingPayoutTotal = (pendingPayouts || []).reduce((s: number, p: any) => s + p.amount, 0);

    // Monthly breakdown (last 6 months)
    const monthlyBreakdown = buildMonthlyBreakdown(completed);

    res.json({
      success: true,
      data: {
        summary: {
          total_revenue: Number(totalRevenue.toFixed(2)),
          worker_earnings: Number(totalWorkerEarnings.toFixed(2)),
          cooperative_earnings: Number(totalCoopEarnings.toFixed(2)),
          pending_payouts: Number(pendingPayoutTotal.toFixed(2)),
          total_transactions: completed.length,
        },
        monthly_breakdown: monthlyBreakdown,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch financials' },
    });
  }
});

function buildMonthlyBreakdown(payments: any[]): any[] {
  const months: Record<string, { revenue: number; transactions: number }> = {};
  payments.forEach((p: any) => {
    const month = p.created_at.substring(0, 7); // YYYY-MM
    if (!months[month]) months[month] = { revenue: 0, transactions: 0 };
    months[month].revenue += p.amount;
    months[month].transactions += 1;
  });
  return Object.entries(months)
    .map(([month, data]) => ({ month, ...data, revenue: Number(data.revenue.toFixed(2)) }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6);
}

/**
 * GET /api/admin/disputes
 * List disputed jobs
 */
router.get('/disputes', async (req: Request, res: Response): Promise<void> => {
  try {
    const { data: disputes, error } = await supabase
      .from('jobs')
      .select(`
        *,
        worker:workers(id, user:users(name, phone))
      `)
      .eq('status', 'rejected')
      .order('updated_at', { ascending: false });

    if (error) {
      res.status(500).json({
        success: false,
        error: { code: 'QUERY_FAILED', message: 'Failed to fetch disputes' },
      });
      return;
    }

    res.json({ success: true, data: { disputes } });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch disputes' },
    });
  }
});

/**
 * PATCH /api/admin/disputes/:id/resolve
 * Resolve a dispute
 */
router.patch('/disputes/:id/resolve', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { resolution } = req.body; // 'customer_favor' | 'worker_favor'

    const newStatus = resolution === 'customer_favor' ? 'cancelled' : 'completed';

    const { data: job, error } = await supabase
      .from('jobs')
      .update({ status: newStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      res.status(500).json({
        success: false,
        error: { code: 'UPDATE_FAILED', message: 'Failed to resolve dispute' },
      });
      return;
    }

    // Notify customer
    await supabase.from('notifications').insert({
      user_id: job.customer_id,
      title: 'Dispute Resolved',
      message: resolution === 'customer_favor'
        ? 'Your dispute has been resolved. A refund will be processed.'
        : 'Your dispute has been reviewed. Payment has been confirmed.',
      type: 'dispute_resolved',
      related_job_id: id,
    });

    res.json({
      success: true,
      data: { job, resolution, message: 'Dispute resolved successfully' },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to resolve dispute' },
    });
  }
});

/**
 * PATCH /api/admin/payouts/:id/approve
 * Approve worker payout request
 */
router.patch('/payouts/:id/approve', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { data: payout } = await supabase
      .from('payout_requests')
      .select('worker_id, amount')
      .eq('id', id)
      .single();

    if (!payout) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Payout request not found' },
      });
      return;
    }

    // Deduct from wallet
    const { data: wallet } = await supabase
      .from('worker_wallets')
      .select('id, balance')
      .eq('worker_id', payout.worker_id)
      .single();

    if (wallet) {
      await supabase
        .from('worker_wallets')
        .update({ balance: Math.max(0, wallet.balance - payout.amount) })
        .eq('id', wallet.id);
    }

    // Approve payout
    await supabase
      .from('payout_requests')
      .update({
        status: 'completed',
        processed_at: new Date().toISOString(),
        processed_by: req.user!.id,
      })
      .eq('id', id);

    res.json({
      success: true,
      data: { message: 'Payout approved and processed' },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to approve payout' },
    });
  }
});

export default router;
