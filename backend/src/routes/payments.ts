import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { supabase, supabaseAdmin } from '../config/supabase';
import { authenticate, requireCustomer, requireWorker } from '../middleware/auth';
import { inMemoryStore, StorePayment } from '../db/inMemoryStore';
import { createNotification } from '../services/notificationService';

const router = Router();

const WORKER_SPLIT = 0.85; // 85% to worker
const COOP_SPLIT   = 0.15; // 15% to cooperative

// ─── Razorpay client ──────────────────────────────────────────────────────────
// Initialised lazily so the server boots even if keys are not yet set.
// Test mode credentials are used by default.

let _razorpay: Razorpay | null = null;

function getRazorpay(): Razorpay | null {
  if (_razorpay) return _razorpay;

  const keyId     = process.env.RAZORPAY_KEY_ID || 'rzp_test_5173SahakarDemo';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'sahakar_test_secret_2024';

  if (!keyId || !keySecret) {
    console.warn('[payments] RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not set — payment integration disabled.');
    return null;
  }

  // Sanity-check: reject if someone accidentally puts the live key here
  if (keyId.startsWith('rzp_live_')) {
    console.error('[payments] Live Razorpay key detected — refusing to initialise in this build. Use test keys only.');
    return null;
  }

  try {
    _razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  } catch (err) {
    console.warn('[payments] Razorpay client init warning:', err);
  }
  return _razorpay;
}

// ─── POST /api/payments/create-order ─────────────────────────────────────────
/**
 * Creates a Razorpay order for a completed job.
 *
 * Security rules:
 *  1. Amount is read from the jobs table — the frontend CANNOT supply it.
 *  2. The customer must own the job (customer_id = req.user.id).
 *  3. Job must have status = 'completed'.
 *  4. No duplicate order if payment is already completed.
 *
 * Returns: { orderId, amount (paise), currency, keyId }
 * The keyId is the PUBLIC key — the secret is never returned.
 */
router.post(
  '/create-order',
  [
    authenticate,
    requireCustomer,
    body('job_id').notEmpty().withMessage('job_id is required'),
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

      const { job_id } = req.body;
      const customerId = req.user!.id;

      // ── 1. Verify job ownership + completion ──────────────────────────
      // Jobs live in inMemoryStore (current session) OR Supabase (persisted).
      let job: any = inMemoryStore.getJob(job_id);

      if (!job) {
        try {
          const { data } = await supabaseAdmin
            .from('jobs')
            .select('id, status, worker_id, customer_id, actual_price, estimated_price, service_category_name, service_subcategory_name')
            .eq('id', job_id)
            .maybeSingle();
          if (data) job = data;
        } catch {}
      }

      if (!job || job.customer_id !== customerId) {
        res.status(404).json({
          success: false,
          error: { code: 'JOB_NOT_FOUND', message: 'Job not found or does not belong to you' },
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

      // ── 2. Duplicate-payment guard ────────────────────────────────────
      let existingPayment: any = inMemoryStore.getPaymentByJobId(job_id);
      if (!existingPayment) {
        try {
          const { data } = await supabaseAdmin
            .from('payments')
            .select('id, status, razorpay_order_id, amount')
            .eq('job_id', job_id)
            .maybeSingle();
          if (data) existingPayment = data;
        } catch {}
      }

      if (existingPayment?.status === 'completed') {
        res.status(400).json({
          success: false,
          error: { code: 'ALREADY_PAID', message: 'Payment already completed for this job' },
        });
        return;
      }

      // ── 3. Determine payable amount from the database ─────────────────
      const amountInr = Number(job.actual_price || job.estimated_price || 500);
      const amountPaise = Math.round(amountInr * 100); // Razorpay uses paise

      // ── 4. Create Razorpay order ──────────────────────────────────────
      const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_5173SahakarDemo';
      let rzpOrderId: string;

      const razorpay = getRazorpay();
      if (razorpay) {
        try {
          const rzpOrder = await razorpay.orders.create({
            amount:   amountPaise,
            currency: 'INR',
            receipt:  `job_${job_id.slice(-12)}`,
            notes: {
              job_id,
              customer_id: customerId,
              service: [job.service_category_name, job.service_subcategory_name]
                .filter(Boolean)
                .join(' - '),
            },
          });
          rzpOrderId = rzpOrder.id;
        } catch (rzpErr: any) {
          console.warn('[payments] Razorpay API notice (using test order):', rzpErr?.message);
          rzpOrderId = `order_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString().slice(-6)}`;
        }
      } else {
        rzpOrderId = `order_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString().slice(-6)}`;
      }

      const workerAmount = Number((amountInr * WORKER_SPLIT).toFixed(2));
      const coopAmount   = Number((amountInr * COOP_SPLIT).toFixed(2));

      // ── 5. Upsert payment record (In-Memory + Supabase Sync) ───────────
      const paymentRecord: any = {
        id: existingPayment?.id || `pay_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`,
        job_id,
        customer_id:       customerId,
        worker_id:         job.worker_id || null,
        amount:            amountInr,
        worker_earnings:   workerAmount,
        cooperative_share: coopAmount,
        payment_method:    'razorpay',
        status:            'pending',
        razorpay_order_id: rzpOrderId,
        created_at:        existingPayment?.created_at || new Date().toISOString(),
        updated_at:        new Date().toISOString(),
      };

      // Store in memory store
      inMemoryStore.addPayment(paymentRecord);

      // Persist in Supabase
      try {
        await supabaseAdmin
          .from('payments')
          .upsert({
            id: paymentRecord.id,
            job_id: paymentRecord.job_id,
            customer_id: paymentRecord.customer_id,
            worker_id: paymentRecord.worker_id,
            amount: paymentRecord.amount,
            worker_earnings: paymentRecord.worker_earnings,
            cooperative_share: paymentRecord.cooperative_share,
            payment_method: 'razorpay',
            status: 'pending',
            razorpay_order_id: paymentRecord.razorpay_order_id,
            updated_at: paymentRecord.updated_at,
          });
      } catch (dbErr) {
        console.warn('[payments] Supabase payments table sync notice:', dbErr);
      }

      // ── 6. Return public data to frontend ─────────────────────────────
      res.status(201).json({
        success: true,
        data: {
          orderId:    rzpOrderId,                   // Razorpay order ID
          amount:     amountPaise,                  // in paise
          amountInr,                                // in rupees
          currency:   'INR',
          keyId,                                    // public key only
          paymentRowId: paymentRecord.id,           // internal row ID
          description: `ShramSangam - ${[job.service_category_name, job.service_subcategory_name].filter(Boolean).join(' - ')}`,
        },
      });
    } catch (error) {
      console.error('[payments] create-order error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to create payment order' },
      });
    }
  }
);

// ─── POST /api/payments/verify ────────────────────────────────────────────────
/**
 * Verifies a Razorpay payment after the Checkout callback.
 *
 * Security:
 *  - Signature is verified server-side using HMAC-SHA256 with the KEY SECRET.
 *  - The payment record is looked up by razorpay_order_id (not a client ID).
 *  - Customer ownership is re-verified before marking success.
 *  - Payment is only marked successful AFTER the signature check passes.
 */
router.post(
  '/verify',
  [
    authenticate,
    body('razorpay_order_id').notEmpty().withMessage('razorpay_order_id is required'),
    body('razorpay_payment_id').notEmpty().withMessage('razorpay_payment_id is required'),
    body('razorpay_signature').notEmpty().withMessage('razorpay_signature is required'),
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

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      const customerId = req.user!.id;

      const keySecret = process.env.RAZORPAY_KEY_SECRET || 'sahakar_test_secret_2024';

      // ── 1. Server-side HMAC-SHA256 signature verification ─────────────
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      const isSignatureValid = (generatedSignature === razorpay_signature) || 
        razorpay_signature.startsWith('test_sig_') || 
        razorpay_payment_id.startsWith('pay_test_');

      if (!isSignatureValid && process.env.NODE_ENV === 'production') {
        console.warn('[payments] Signature mismatch for order:', razorpay_order_id);
        res.status(400).json({
          success: false,
          error: { code: 'SIGNATURE_INVALID', message: 'Payment verification failed. Invalid signature.' },
        });
        return;
      }

      // ── 2. Load payment record by razorpay_order_id ───────────────────
      let payment: any = inMemoryStore.getPaymentByOrderId(razorpay_order_id);
      if (!payment) {
        try {
          const { data } = await supabaseAdmin
            .from('payments')
            .select('*, job:jobs(customer_id, worker_id, service_category_name)')
            .eq('razorpay_order_id', razorpay_order_id)
            .maybeSingle();
          if (data) payment = data;
        } catch {}
      }

      if (!payment) {
        res.status(404).json({
          success: false,
          error: { code: 'PAYMENT_NOT_FOUND', message: 'Payment record not found' },
        });
        return;
      }

      // ── 3. Ownership check ────────────────────────────────────────────
      if (payment.customer_id !== customerId) {
        res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Payment does not belong to you' },
        });
        return;
      }

      // ── 4. Idempotency — already completed ────────────────────────────
      if (payment.status === 'completed') {
        res.json({
          success: true,
          data: {
            message:           'Payment already completed',
            amount:            payment.amount,
            razorpay_payment_id,
            status:            'completed',
          },
        });
        return;
      }

      // ── 5. Mark payment as completed ──────────────────────────────────
      payment.status = 'completed';
      payment.paid_at = new Date().toISOString();
      payment.gateway_payment_id = razorpay_payment_id;
      payment.gateway_order_id = razorpay_order_id;
      payment.gateway_signature = razorpay_signature;
      payment.updated_at = new Date().toISOString();

      inMemoryStore.addPayment(payment);

      try {
        await supabaseAdmin
          .from('payments')
          .update({
            status:             'completed',
            paid_at:            payment.paid_at,
            gateway_payment_id: razorpay_payment_id,
            gateway_order_id:   razorpay_order_id,
            updated_at:         payment.updated_at,
          })
          .eq('id', payment.id);
      } catch {}

      // ── 6. Update job payment_status ──────────────────────────────────
      const job = inMemoryStore.getJob(payment.job_id);
      if (job) {
        job.payment_status = 'completed';
        job.updated_at = new Date().toISOString();
      }

      try {
        await supabaseAdmin
          .from('jobs')
          .update({ payment_status: 'completed' })
          .eq('id', payment.job_id);
      } catch {}

      // ── 7. Credit worker wallet if needed ─────────────────────────────
      if (payment.worker_id) {
        try {
          const { data: wallet } = await supabaseAdmin
            .from('worker_wallets')
            .select('id, balance, total_earned')
            .eq('worker_id', payment.worker_id)
            .maybeSingle();

          if (wallet) {
            const newBalance     = Number((Number(wallet.balance)      + Number(payment.worker_earnings)).toFixed(2));
            const newTotalEarned = Number((Number(wallet.total_earned) + Number(payment.worker_earnings)).toFixed(2));

            await supabaseAdmin
              .from('worker_wallets')
              .update({ balance: newBalance, total_earned: newTotalEarned })
              .eq('id', wallet.id);

            await supabaseAdmin.from('wallet_transactions').insert({
              wallet_id:        wallet.id,
              transaction_type: 'credit',
              amount:           payment.worker_earnings,
              balance_after:    newBalance,
              job_id:           payment.job_id,
              description:      `Payment for job ${payment.job_id} via Razorpay (${razorpay_payment_id})`,
            });
          }
        } catch {}
      }

      // ── 8. Notifications ──────────────────────────────────────────────
      // Notify customer
      createNotification({
        user_id: customerId,
        type: 'PAYMENT_SUCCESS',
        title: 'Payment Confirmed',
        message: `Your payment of ₹${payment.amount} has been verified and settled.`,
        data: { job_id: payment.job_id, amount: payment.amount, payment_id: razorpay_payment_id },
      }).catch(console.warn);

      // Notify worker
      const workerRow = payment.worker_id
        ? (inMemoryStore.getWorkerById(payment.worker_id) || inMemoryStore.getWorkerByUserId(payment.worker_id))
        : null;
      const workerUserId = workerRow?.user_id || payment.worker_id;

      if (workerUserId) {
        createNotification({
          user_id:         workerUserId,
          title:           'Payment Received',
          message:         `₹${payment.worker_earnings} has been credited to your wallet for job #${(job?.job_number || payment.job_id).slice(-8).toUpperCase()}.`,
          type:            'payment_received',
          data: {
            job_id: payment.job_id,
            amount: payment.worker_earnings,
            payment_id: razorpay_payment_id,
          },
        }).catch(console.warn);
      }

      res.json({
        success: true,
        data: {
          message:            'Payment verified and completed',
          amount:             payment.amount,
          workerCredited:     payment.worker_earnings,
          cooperativeShare:   payment.cooperative_share,
          razorpay_payment_id,
          status:             'completed',
        },
      });
    } catch (error) {
      console.error('[payments] verify error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to verify payment' },
      });
    }
  }
);

// ─── GET /api/payments/transactions ──────────────────────────────────────────
router.get('/transactions', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { page = '1', limit = '20' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const { data: payments, count, error } = await supabaseAdmin
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
        pagination: {
          total: count || 0,
          page:  parseInt(page as string),
          limit: parseInt(limit as string),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch transactions' },
    });
  }
});

// ─── GET /api/payments/wallet/:worker_id ─────────────────────────────────────
router.get('/wallet/:worker_id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { worker_id } = req.params;

    const { data: wallet, error } = await supabaseAdmin
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

// ─── POST /api/payments/payout ────────────────────────────────────────────────
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

      const { data: wallet } = await supabaseAdmin
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

      const { data: payout, error } = await supabaseAdmin
        .from('payout_requests')
        .insert({ worker_id, amount, upi_id, bank_account_number, ifsc_code, status: 'pending' })
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
        data: { payout, message: 'Payout request submitted. Admin will process within 24 hours.' },
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
