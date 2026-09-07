import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Check, CircleHelp, MapPin, Phone, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
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
    : state?.worker?.lat != null
    ? { lat: state.worker.lat, lng: state.worker.lng }
    : undefined;

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
          } else if (j.status === 'accepted') {
            setStatusStepIndex(1);
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
          }
        }
      } catch {
        // Polling failure fallback
      }
    }, 4000);

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

  const handleMarkComplete = async () => {
    setIsProcessing(true);
    try {
      if (jobId && jobId !== 'DEMO001') {
        await jobsApi.updateStatus(jobId, 'completed');
      }
    } catch (err) {
      console.warn('Update job status error:', err);
    } finally {
      setIsProcessing(false);
      setStage('completed');
    }
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    try {
      if (jobId && jobId !== 'DEMO001') {
        await paymentsApi.createOrder(jobId, price);
        await paymentsApi.verify(jobId, 'success');
      }
    } catch (err) {
      console.warn('Payment API error:', err);
    } finally {
      setIsProcessing(false);
      setStage('paid');
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
              ? 'PAYMENT SUCCESSFUL'
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
                <p className="mt-1.5 text-xs text-text-secondary sm:mt-2 sm:text-sm">UPI / Cooperative Escrow Payment</p>
              </div>
              <button
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="mt-6 w-full rounded-2xl bg-accent-primary py-3.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-50 sm:mt-8 sm:py-4"
              >
                {isProcessing ? 'PROCESSING PAYMENT…' : 'CONFIRM PAYMENT (₹' + price + ')'}
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
              <GoogleMap customer={customerLocation} worker={workerLocation} workerLabel={worker.name} />

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
              <button
                onClick={handleMarkComplete}
                disabled={isProcessing}
                className="rounded-xl border border-accent-primary px-3.5 py-2.5 text-[10px] font-semibold text-accent-primary hover:bg-accent-light disabled:opacity-50 sm:px-4 sm:py-3 sm:text-xs"
              >
                {isProcessing ? 'UPDATING…' : 'MARK COMPLETE'}
              </button>
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
