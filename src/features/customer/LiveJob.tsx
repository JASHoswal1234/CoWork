import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Check, CircleHelp, MapPin, Phone, ShieldCheck, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { jobsApi, paymentsApi, reviewsApi, workersApi } from '../../lib/api';
import { GoogleMap, type MapCoordinate } from '../../components/GoogleMap';

type JobStage = 'active' | 'completed' | 'paid' | 'rated';
const statusSteps = ['ACCEPTED', 'ON THE WAY', 'ARRIVED', 'SERVICE'];

function parseCoordinate(value: any): MapCoordinate {
  if (typeof value === 'string') {
    const match = value.match(/POINT\s*\(\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*\)/i);
    if (match) return { lat: Number(match[2]), lng: Number(match[1]) };
  }

  if (value?.coordinates?.lat != null && value?.coordinates?.lng != null) {
    return { lat: Number(value.coordinates.lat), lng: Number(value.coordinates.lng) };
  }

  if (value?.lat != null && value?.lng != null) {
    return { lat: Number(value.lat), lng: Number(value.lng) };
  }

  return { lat: 18.5074, lng: 73.8077 };
}

// ─── Razorpay Checkout script loader ─────────────────────────────────────────
// Loads the Razorpay Standard Checkout script once and resolves when ready.
// Safe to call multiple times — subsequent calls reuse the same promise.
let _rzpLoader: Promise<void> | null = null;

function loadRazorpay(): Promise<void> {
  if ((window as any).Razorpay) return Promise.resolve();
  if (_rzpLoader) return _rzpLoader;

  _rzpLoader = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-razorpay]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Razorpay script failed to load')));
      return;
    }
    const script = document.createElement('script');
    script.dataset.razorpay = 'true';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload  = () => resolve();
    script.onerror = () => reject(new Error('Razorpay script failed to load'));
    document.body.appendChild(script);
  });

  return _rzpLoader;
}

export function LiveJob() {
  const { jobId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [eta, setEta] = useState<number>(state?.eta ?? 8);
  const [stage, setStage] = useState<JobStage>('active');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [realJob, setRealJob] = useState<any>(null);
  const [realWorker, setRealWorker] = useState<any>(state?.worker || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusStepIndex, setStatusStepIndex] = useState(1); // 0=accepted, 1=on the way, 2=arrived, 3=service

  // Razorpay payment state
  const [paymentError, setPaymentError]   = useState<string | null>(null);
  const [paymentId, setPaymentId]         = useState<string | null>(null); // razorpay_payment_id after success
  const [paidAmount, setPaidAmount]       = useState<number>(0);
  // Guard against opening Checkout twice while one is already in-flight
  const checkoutOpenRef = useRef(false);

  const service = realJob?.service_category_name || state?.service || 'Plumbing';
  const price = realJob?.actual_price || realJob?.estimated_price || state?.price || 500;

  const worker = {
    name: realWorker?.name || realWorker?.user?.name || state?.worker?.name || 'Rajesh Kumar',
    phone: realWorker?.phone || realWorker?.user?.phone || '+91 98220 11001',
    rating: realWorker?.rating ? Number(realWorker.rating) : 4.88,
    completedJobs: realWorker?.completed_jobs || realWorker?.completedJobs || 167,
  };
  // Priority: real job location from DB → GPS passed via nav state → browser GPS → Kothrud fallback
  const [browserLocation, setBrowserLocation] = useState<MapCoordinate | null>(null);
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setBrowserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { timeout: 5000 }
      );
    }
  }, []);

  const customerLocation: MapCoordinate =
    (realJob?.customer_location ? parseCoordinate(realJob.customer_location) : null) ||
    (state?.customerLocation as MapCoordinate | undefined) ||
    browserLocation ||
    { lat: 18.5074, lng: 73.8077 };

  const workerLocation: MapCoordinate | undefined = realWorker?.location
    ? parseCoordinate(realWorker.location)
    : (state?.workerLocation as MapCoordinate | undefined) ||
      (state?.worker?.lat != null ? { lat: state.worker.lat, lng: state.worker.lng } : undefined);

  // If we still have no worker coords, approximate from distanceKm + a NE bearing
  // so the marker is always visible on the map
  const workerLocationOrApprox: MapCoordinate = workerLocation ?? (() => {
    const distKm = state?.worker?.distanceKm ?? 2.5;
    const R = 6371;
    const bearing = (45 * Math.PI) / 180; // NE direction
    const d = distKm / R;
    const lat1 = (customerLocation.lat * Math.PI) / 180;
    const lng1 = (customerLocation.lng * Math.PI) / 180;
    const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(bearing));
    const lng2 = lng1 + Math.atan2(Math.sin(bearing) * Math.sin(d) * Math.cos(lat1), Math.cos(d) - Math.sin(lat1) * Math.sin(lat2));
    return { lat: (lat2 * 180) / Math.PI, lng: (lng2 * 180) / Math.PI };
  })();

  // Fetch real job from backend
  useEffect(() => {
    if (!jobId || jobId === 'DEMO001') return;

    jobsApi
      .getById(jobId)
      .then(async (res) => {
        if (res?.job) {
          const j = res.job;
          setRealJob(j);

          if (j.status === 'completed') {
            setStage('completed');
          } else if (j.status === 'in_progress') {
            setStatusStepIndex(3);
          } else if (j.status === 'arrived') {
            setStatusStepIndex(2);
          } else if (j.status === 'on_the_way') {
            setStatusStepIndex(1);
          } else if (j.status === 'accepted') {
            setStatusStepIndex(0);
          }

          if (j.worker_id) {
            try {
              const workerRes = await workersApi.getById(j.worker_id);
              if (workerRes?.worker) {
                setRealWorker(workerRes.worker);
              }
            } catch (wErr) {
              console.warn('Could not fetch worker profile:', wErr);
            }
          }
        }
      })
      .catch((err) => console.warn('Could not fetch job from API:', err));
  }, [jobId]);

  // Real-time status polling
  useEffect(() => {
    if (!jobId || jobId === 'DEMO001' || stage !== 'active') return;

    const interval = setInterval(async () => {
      try {
        const res = await jobsApi.getStatus(jobId);
        if (res?.status) {
          if (res.status === 'completed') {
            setStage('completed');
          } else if (res.status === 'in_progress') {
            setStatusStepIndex(3);
          } else if (res.status === 'arrived') {
            setStatusStepIndex(2);
          } else if (res.status === 'on_the_way') {
            setStatusStepIndex(1);
          } else if (res.status === 'accepted') {
            setStatusStepIndex(0);
          }
        }
      } catch {
        // Polling failure fallback
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [jobId, stage]);

  // ETA countdown
  useEffect(() => {
    if (stage !== 'active') return;
    const timer = window.setInterval(() => setEta((value) => Math.max(1, value - 1)), 60000);
    return () => window.clearInterval(timer);
  }, [stage]);

  const toggleFeedback = (label: string) =>
    setFeedback((current) => (current.includes(label) ? current.filter((item) => item !== label) : [...current, label]));

  const handleConfirmPayment = async () => {
    if (!jobId || jobId === 'DEMO001' || checkoutOpenRef.current) return;

    setPaymentError(null);
    setIsProcessing(true);

    try {
      // ── Step 1: backend creates the Razorpay order ──────────────────
      const order = await paymentsApi.createOrder(jobId);

      // ── Step 2: load Razorpay Checkout script ───────────────────────
      try {
        await loadRazorpay();
      } catch {
        setPaymentError('Could not load payment gateway. Please check your connection and try again.');
        setIsProcessing(false);
        return;
      }

      setIsProcessing(false); // Checkout modal takes over from here
      checkoutOpenRef.current = true;

      // ── Step 3: open Razorpay Standard Checkout ─────────────────────
      const rzp = new (window as any).Razorpay({
        key:         order.keyId,
        amount:      order.amount,       // paise — already set by backend
        currency:    order.currency,
        order_id:    order.orderId,
        name:        'ShramSangam',
        description: order.description,
        image:       '/illustrations/hero.png',
        prefill: {
          name:  worker.name,
          // email/contact intentionally omitted — customer data stays server-side
        },
        theme: { color: '#1a56db' },

        // ── Success callback ─────────────────────────────────────────
        // Razorpay calls this ONLY after the payment is captured on their side.
        // We must still verify the signature server-side before trusting it.
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id:   string;
          razorpay_signature:  string;
        }) => {
          checkoutOpenRef.current = false;
          setIsProcessing(true);
          setPaymentError(null);

          try {
            const result = await paymentsApi.verify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });

            // Verification passed — advance to paid stage
            setPaymentId(response.razorpay_payment_id);
            setPaidAmount(result.amount ?? price);
            setStage('paid');
          } catch (verifyErr: any) {
            console.error('[LiveJob] Payment verification failed:', verifyErr);
            setPaymentError(
              verifyErr?.message ||
              'Payment could not be verified. Please contact support with your payment ID: ' +
              response.razorpay_payment_id
            );
          } finally {
            setIsProcessing(false);
          }
        },

        // ── Modal dismiss ────────────────────────────────────────────
        modal: {
          ondismiss: () => {
            checkoutOpenRef.current = false;
            setIsProcessing(false);
            setPaymentError('Payment was cancelled. You can try again.');
          },
        },
      });

      rzp.on('payment.failed', (response: any) => {
        checkoutOpenRef.current = false;
        setIsProcessing(false);
        const desc = response?.error?.description || 'Payment failed. Please try again.';
        setPaymentError(desc);
      });

      rzp.open();
    } catch (err: any) {
      console.error('[LiveJob] Payment initiation failed:', err);
      checkoutOpenRef.current = false;
      setIsProcessing(false);
      if (err?.code === 'ALREADY_PAID') {
        setStage('paid');
      } else if (err?.code === 'PAYMENT_GATEWAY_UNAVAILABLE') {
        setPaymentError('Payment gateway is temporarily unavailable. Please try again later.');
      } else {
        setPaymentError(err?.message || 'Failed to initiate payment. Please try again.');
      }
    }
  };

  const handleSubmitFeedback = async () => {
    if (!rating) return;
    setIsProcessing(true);
    try {
      if (jobId && jobId !== 'DEMO001') {
        await reviewsApi.submit(jobId, rating, feedback.join(', '));
      }
    } catch (err) {
      console.warn('Review API error:', err);
    } finally {
      setIsProcessing(false);
      setStage('rated');
    }
  };

  if (stage !== 'active') {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl items-center px-4 py-8 sm:px-5 sm:py-10">
        <section className="w-full rounded-[28px] border border-status-subtle bg-white p-6 text-center sm:rounded-[32px] sm:p-7 md:rounded-[34px] md:p-12">
          <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-accent-primary sm:text-[11px] sm:tracking-[0.16em]">
            {stage === 'completed'
              ? 'SERVICE COMPLETED'
              : stage === 'paid'
              ? 'PAYMENT VERIFIED'
              : 'REVIEW RECORDED'}
          </p>
          <div className="mx-auto mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent-light text-accent-primary sm:mt-6 sm:h-16 sm:w-16">
            <Check size={28} />
          </div>
          <h1 className="mt-5 text-3xl font-extrabold tracking-[-0.06em] text-text-navy sm:mt-6 sm:text-4xl">
            {stage === 'completed'
              ? 'All sorted.'
              : stage === 'paid'
              ? 'Payment confirmed.'
              : 'Thank you for your rating!'}
          </h1>

          {stage === 'paid' && (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 sm:mt-8">
              <div className="flex items-center justify-center gap-2 text-emerald-700">
                <CheckCircle2 size={18} />
                <span className="font-mono text-xs font-bold tracking-wider">PAYMENT SUCCESSFUL</span>
              </div>
              <p className="mt-3 text-3xl font-extrabold tracking-[-0.05em] text-text-navy">
                ₹{paidAmount || price}
              </p>
              {paymentId && (
                <p className="mt-1.5 font-mono text-[10px] text-text-secondary">
                  ID: {paymentId}
                </p>
              )}
            </div>
          )}
          {stage === 'completed' ? (
            <>
              <p className="mt-3.5 text-sm text-text-secondary sm:mt-4 sm:text-base">
                {service} service completed by {worker.name}.
              </p>
              <div className="mt-6 rounded-2xl bg-background-primary px-5 py-4 sm:mt-8 sm:px-6 sm:py-5">
                <p className="font-mono text-[9px] tracking-[0.12em] text-text-secondary sm:text-[10px]">TOTAL AMOUNT</p>
                <p className="mt-1.5 text-3xl font-extrabold tracking-[-0.05em] text-text-navy sm:mt-2 sm:text-4xl">
                  ₹{price}
                </p>
                <p className="mt-1.5 text-xs text-text-secondary sm:mt-2 sm:text-sm">
                  Cooperative Secure Payment · Razorpay Test Mode
                </p>
              </div>

              {/* Inline payment error */}
              {paymentError && (
                <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-700">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{paymentError}</span>
                </div>
              )}

              <button
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="mt-6 w-full rounded-2xl bg-accent-primary py-3.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-50 sm:mt-8 sm:py-4"
              >
                {isProcessing
                  ? 'PROCESSING…'
                  : paymentError
                  ? `RETRY PAYMENT (₹${price})`
                  : `PAY ₹${price}`}
              </button>
            </>
          ) : stage === 'paid' ? (
            <>
              <p className="mt-3.5 text-sm text-text-secondary sm:mt-4 sm:text-base">
                How was your service experience with {worker.name}?
              </p>
              <div className="mt-6 flex justify-center gap-2 sm:mt-8">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    aria-label={`Rate ${value} stars`}
                    key={value}
                    onClick={() => setRating(value)}
                    className={`text-3xl transition-transform hover:scale-110 sm:text-4xl ${
                      value <= rating ? 'text-amber-400' : 'text-status-subtle'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap justify-center gap-1.5 sm:mt-7 sm:gap-2">
                {['Professional', 'On time', 'Skilled', 'Polite', 'Clean work'].map((label) => (
                  <button
                    key={label}
                    onClick={() => toggleFeedback(label)}
                    className={`rounded-full border px-2.5 py-1.5 text-[10px] font-medium transition sm:px-3 sm:py-2 sm:text-xs ${
                      feedback.includes(label)
                        ? 'border-accent-primary bg-accent-light text-accent-primary'
                        : 'border-status-subtle text-text-secondary'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                disabled={!rating || isProcessing}
                onClick={handleSubmitFeedback}
                className="mt-6 w-full rounded-2xl bg-accent-primary py-3.5 text-sm font-semibold text-white disabled:bg-status-neutral sm:mt-8 sm:py-4"
              >
                {isProcessing ? 'RECORDING REVIEW…' : 'SUBMIT FEEDBACK'}
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/')}
              className="mt-6 w-full rounded-2xl bg-accent-primary py-3.5 text-sm font-semibold text-white sm:mt-8 sm:py-4"
            >
              BACK TO SERVICES
            </button>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-5 sm:py-8 md:px-10 md:py-14">
      <div className="mb-6 flex items-center justify-between sm:mb-8">
        <div>
          <p className="font-mono text-[10px] font-semibold tracking-[0.15em] text-accent-primary sm:text-[11px]">
            {service.toUpperCase()} // ACTIVE REQUEST
          </p>
          <h1 className="mt-1.5 text-3xl font-extrabold tracking-[-0.06em] text-text-navy sm:mt-2 sm:text-4xl">
            Your worker is on the way.
          </h1>
        </div>
        <span className="hidden font-mono text-[10px] tracking-[0.1em] text-text-secondary sm:block">
          JOB #{jobId?.slice(-6) || 'ACTIVE'}
        </span>
      </div>

      <div className="grid gap-5 sm:gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <section className="overflow-hidden rounded-[24px] border border-status-subtle bg-white sm:rounded-[28px] md:rounded-[32px]">
          <div className="relative min-h-[260px] overflow-hidden bg-[#eaf1f8] sm:min-h-[300px]">
              <GoogleMap customer={customerLocation} worker={workerLocationOrApprox} workerLabel={worker.name} />

            <div className="absolute bottom-5 left-5 flex items-center gap-1.5 font-mono text-[9px] tracking-[0.1em] text-text-secondary sm:bottom-7 sm:left-7 sm:gap-2 sm:text-[10px]">
              <MapPin size={12} className="text-accent-primary sm:h-[14px] sm:w-[14px]" /> GOOGLE MAPS LIVE TRACKING











            </div>
          </div>

          <div className="p-5 sm:p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[9px] tracking-[0.12em] text-text-secondary sm:text-[10px]">ESTIMATED ARRIVAL</p>
                <p className="mt-1.5 text-4xl font-extrabold tracking-[-0.06em] text-accent-primary sm:mt-2 sm:text-5xl">
                  {String(eta).padStart(2, '0')} MIN
                </p>
              </div>
              {/* Mark Complete is a worker action — not shown on customer view */}
            </div>

            <div className="mt-6 grid grid-cols-4 gap-1 sm:mt-8">
              {statusSteps.map((step, index) => (
                <div key={step} className="text-center">
                  <span
                    className={`mx-auto flex h-5 w-5 items-center justify-center rounded-full text-[9px] sm:h-6 sm:w-6 sm:text-[10px] ${
                      index <= statusStepIndex
                        ? 'bg-accent-primary text-white'
                        : 'bg-status-subtle text-text-secondary'
                    }`}
                  >
                    {index <= statusStepIndex ? <Check size={11} className="sm:h-[13px] sm:w-[13px]" /> : index + 1}
                  </span>
                  <p
                    className={`mt-1.5 font-mono text-[7px] tracking-[0.06em] sm:mt-2 sm:text-[8px] ${
                      index <= statusStepIndex ? 'font-bold text-accent-primary' : 'text-text-tertiary'
                    }`}
                  >
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="rounded-[24px] border border-status-subtle bg-white p-5 sm:rounded-[28px] sm:p-6 md:rounded-[32px] md:p-8">
          <p className="font-mono text-[9px] tracking-[0.12em] text-text-secondary sm:text-[10px]">
            YOUR COOPERATIVE WORKER
          </p>
          <div className="mt-4 flex items-center gap-3 sm:mt-5 sm:gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8e5e0] text-xl sm:h-16 sm:w-16 sm:text-2xl">
              🛠
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-[-0.04em] text-text-navy sm:text-2xl">{worker.name}</h2>
              <p className="mt-1 text-xs text-text-secondary sm:text-sm">
                ★ {worker.rating} · {worker.completedJobs} jobs
              </p>
            </div>
          </div>
          <p className="mt-4 flex items-center gap-2 text-[10px] font-semibold text-accent-primary sm:mt-5 sm:text-xs">
            <ShieldCheck size={14} className="sm:h-4 sm:w-4" /> COOPERATIVE VERIFIED MEMBER
          </p>

          <div className="my-5 border-t border-status-subtle sm:my-7" />

          <p className="font-mono text-[9px] tracking-[0.12em] text-text-secondary sm:text-[10px]">SERVICE</p>
          <p className="mt-1.5 text-base font-semibold text-text-navy sm:mt-2 sm:text-lg">
            {service} · Estimated ₹{price}
          </p>
          <p className="mt-1.5 text-xs leading-5 text-text-secondary sm:mt-2 sm:text-sm">
            Kothrud, Pune · Worker dispatched with cooperative fair-pay guarantee.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-8 sm:gap-3">
            <a
              href={`tel:${worker.phone}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-status-subtle py-2.5 text-[10px] font-semibold text-text-navy hover:border-accent-primary hover:text-accent-primary sm:gap-2 sm:py-3 sm:text-xs"
            >
              <Phone size={13} className="sm:h-[15px] sm:w-[15px]" /> CALL WORKER
            </a>
            <button
              onClick={() => alert('Support helpline: 1800-SAHAKAR (24x7 Cooperative Helpline)')}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-status-subtle py-2.5 text-[10px] font-semibold text-text-navy hover:border-accent-primary hover:text-accent-primary sm:gap-2 sm:py-3 sm:text-xs"
            >
              <CircleHelp size={13} className="sm:h-[15px] sm:w-[15px]" /> SUPPORT
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
