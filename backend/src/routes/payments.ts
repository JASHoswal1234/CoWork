import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { supabase } from '../config/supabase';
import { authenticate, requireCustomer, requireWorker, requireAdmin } from '../middleware/auth';

const router = Router();

const WORKER_SPLIT = 0.85;  // 85% to worker
const COOP_SPLIT = 0.15;    // 15% to cooperative

/**
 * POST /api/payments/create-order
 * Customer initiates payment for a completed job
 */
router.post(
  '/create-order',
  [
    authenticate,
    requireCustomer,
    body('job_id').notEmpty().withMessage('Job ID is required'),
    body('amount').isFloat({ min: 1 }).withMessage('Valid amount required'),
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

      const { job_id, amount } = req.body;
      const customerId = req.user!.id;

      // Verify job belongs to customer and is completed
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
          error: { code: 'JOB_NOT_COMPLETED', message: 'Job must be completed before payment' },
        });
        return;
      }

      // Check if payment already exists
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id, status')
        .eq('job_id', job_id)
        .single();

      if (existingPayment && existingPayment.status === 'completed') {
        res.status(400).json({
          success: false,
          error: { code: 'ALREADY_PAID', message: 'Payment already completed for this job' },
        });
        return;
      }

      const workerAmount = Number((amount * WORKER_SPLIT).toFixed(2));
      const coopAmount = Number((amount * COOP_SPLIT).toFixed(2));

      // Create payment record (simulation mode)
      const { data: payment, error } = await supabase
        .from('payments')
        .insert({
          job_id,
          customer_id: customerId,
          worker_id: job.worker_id,
          amount,
          worker_earnings: workerAmount,
          cooperative_share: coopAmount,
          payment_method: 'simulation',
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        res.status(500).json({
          success: false,
          error: { code: 'PAYMENT_CREATION_FAILED', message: 'Failed to create payment' },
        });
        return;
      }

      // Return mock order (simulated)
      res.status(201).json({
        success: true,
        data: {
          payment_id: payment.id,
          order_id: `ORDER_${Date.now()}`,
          amount,
          worker_amount: workerAmount,
          cooperative_amount: coopAmount,
          currency: 'INR',
          status: 'pending',
          // For demo: show Razorpay would be called here
          gateway: 'simulation',
          message: 'Payment order created. Call /verify to complete.',
        },
      });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to create payment order' },
      });
    }
  }
);

/**
 * POST /api/payments/verify
 * Complete payment and credit worker wallet
 */
router.post(
  '/verify',
  [
    authenticate,
    body('payment_id').notEmpty().withMessage('Payment ID is required'),
    body('status').isIn(['success', 'failed']).withMessage('Status must be success or failed'),
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

      const { payment_id, status } = req.body;

      const { data: payment } = await supabase
        .from('payments')
        .select('*, job:jobs(customer_id, worker_id)')
        .eq('id', payment_id)
        .eq('status', 'pending')
        .single();

      if (!payment) {
        res.status(404).json({
          success: false,
          error: { code: 'PAYMENT_NOT_FOUND', message: 'Pending payment not found' },
        });
        return;
      }

      if (status === 'failed') {
        await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('id', payment_id);

        res.json({
          success: true,
          data: { message: 'Payment marked as failed', status: 'failed' },
        });
        return;
      }

      // Mark payment as completed
      await supabase
        .from('payments')
        .update({
          status: 'completed',
          paid_at: new Date().toISOString(),
          gateway_payment_id: `SIM_${Date.now()}`,
        })
        .eq('id', payment_id);

      // Credit worker wallet
      const { data: wallet } = await supabase
        .from('worker_wallets')
        .select('id, balance, total_earned')
        .eq('worker_id', payment.worker_id)
        .single();

      if (wallet) {
        const newBalance = Number((wallet.balance + payment.worker_earnings).toFixed(2));
        const newTotalEarned = Number((wallet.total_earned + payment.worker_earnings).toFixed(2));

        await supabase
          .from('worker_wallets')
          .update({ balance: newBalance, total_earned: newTotalEarned })
          .eq('id', wallet.id);

        // Record wallet transaction
        await supabase.from('wallet_transactions').insert({
          wallet_id: wallet.id,
          transaction_type: 'credit',
          amount: payment.worker_earnings,
          balance_after: newBalance,
          job_id: payment.job_id,
          description: `Payment for job ${payment.job_id}`,
        });
      }

      // Update job payment status
      await supabase
        .from('jobs')
        .update({ payment_status: 'completed', actual_price: payment.amount })
        .eq('id', payment.job_id);

      // Notify worker
      if (payment.job?.worker_id) {
        const { data: workerUser } = await supabase
          .from('workers')
          .select('user_id')
          .eq('id', payment.worker_id)
          .single();

        if (workerUser) {
          await supabase.from('notifications').insert({
            user_id: workerUser.user_id,
            title: 'Payment Received!',
            message: `₹${payment.worker_earnings} has been credited to your wallet.`,
            type: 'payment_received',
            related_job_id: payment.job_id,
          });
        }
      }

      res.json({
        success: true,
        data: {
          message: 'Payment completed successfully',
          amount: payment.amount,
          worker_credited: payment.worker_earnings,
          cooperative_share: payment.cooperative_share,
          status: 'completed',
        },
      });
    } catch (error) {
      console.error('Verify payment error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to verify payment' },
      });
    }
  }
);

/**
 * GET /api/payments/transactions
 * List user's transactions
 */
router.get('/transactions', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { page = '1', limit = '20' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const { data: payments, count, error } = await supabase
      .from('payments')
      .select('*, job:jobs(service_category_name, customer_address)', { count: 'exact' })
      .eq('customer_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit as string) - 1);

    if (error) {
      res.status(500).json({
        success: false,
        error: { code: 'QUERY_FAILED', message: 'Failed to fetch transactions' },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        transactions: payments,
        pagination: { total: count || 0, page: parseInt(page as string), limit: parseInt(limit as string) },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch transactions' },
    });
  }
});

/**
 * GET /api/payments/wallet/:worker_id
 * Get worker wallet balance
 */
router.get('/wallet/:worker_id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { worker_id } = req.params;

    const { data: wallet, error } = await supabase
      .from('worker_wallets')
      .select('*, transactions:wallet_transactions(amount, transaction_type, description, created_at)')
      .eq('worker_id', worker_id)
      .single();

    if (error || !wallet) {
      res.status(404).json({
        success: false,
        error: { code: 'WALLET_NOT_FOUND', message: 'Wallet not found' },
      });
      return;
    }

    res.json({ success: true, data: { wallet } });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch wallet' },
    });
  }
});

/**
 * POST /api/payments/payout
 * Worker requests payout
 */
router.post(
  '/payout',
  [
    authenticate,
    requireWorker,
    body('worker_id').notEmpty(),
    body('amount').isFloat({ min: 100 }).withMessage('Minimum payout is ₹100'),
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

      const { worker_id, amount, upi_id, bank_account_number, ifsc_code } = req.body;

      // Check wallet balance
      const { data: wallet } = await supabase
        .from('worker_wallets')
        .select('balance')
        .eq('worker_id', worker_id)
        .single();

      if (!wallet || wallet.balance < amount) {
        res.status(400).json({
          success: false,
          error: { code: 'INSUFFICIENT_BALANCE', message: 'Insufficient wallet balance' },
        });
        return;
      }

      const { data: payout, error } = await supabase
        .from('payout_requests')
        .insert({
          worker_id,
          amount,
          upi_id,
          bank_account_number,
          ifsc_code,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        res.status(500).json({
          success: false,
          error: { code: 'PAYOUT_FAILED', message: 'Failed to create payout request' },
        });
        return;
      }

      res.status(201).json({
        success: true,
        data: {
          payout,
          message: 'Payout request submitted. Admin will process within 24 hours.',
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to request payout' },
      });
    }
  }
);

export default router;
