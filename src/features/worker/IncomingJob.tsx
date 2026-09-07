import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Clock, User, AlertCircle, CheckCircle2, X, Camera, ShieldCheck, Zap } from 'lucide-react';
import { jobsApi } from '../../lib/api';

const illustrationByService: Record<string, string> = {
  Plumbing: '/illustrations/plumber.png',
  Electrical: '/illustrations/electrician.png',
  Carpentry: '/illustrations/carpenter.png',
  Painting: '/illustrations/painting.png',
  Cleaning: '/illustrations/cleaning.png',
  'Appliance Repair': '/illustrations/appliance-repair.png',
};

export function IncomingJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(45);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch the real job
  useEffect(() => {
    if (!jobId) return;
    jobsApi
      .getById(jobId)
      .then((res) => {
        if (res?.job) setJob(res.job);
      })
      .catch((err) => console.warn('Failed to fetch job:', err))
      .finally(() => setLoading(false));
  }, [jobId]);

  // Auto-decline timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleAccept = async () => {
    if (!jobId) return;
    setAccepting(true);
    setErrorMsg(null);
    try {
      await jobsApi.accept(jobId);
      navigate('/');
    } catch (err: any) {
      console.warn('Accept job error:', err);
      setErrorMsg(err.message || 'This request has already been accepted by another worker.');
    } finally {
      setAccepting(false);
    }
  };

  const handleReject = async () => {
    if (jobId) {
      await jobsApi.reject(jobId, 'Declined by worker').catch(() => {});
    }
    navigate('/');
  };

  const serviceCategory = job?.service_category_name || 'Plumbing';
  const problemTitle = job?.title || job?.service_subcategory_name || 'Service Request';
  const totalAmount = job?.actual_price || job?.estimated_price || 600;
  const earnings = Math.round(totalAmount * 0.85);

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-8 sm:px-6 md:py-12">
      <section className="relative w-full overflow-hidden rounded-[28px] border border-status-subtle bg-white p-6 sm:rounded-[36px] sm:p-10 md:p-12">
        {/* Background illustration */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <img
            src={illustrationByService[serviceCategory] || '/illustrations/worker-job.png'}
            alt=""
            className="absolute bottom-[-10%] right-[-12%] h-[103%] w-auto max-w-none opacity-10 sm:bottom-[-8%] sm:right-[-10%] sm:h-[105%] sm:opacity-15 md:bottom-[-5%] md:right-[-8%] md:h-[110%]"
            style={{ objectFit: 'contain', objectPosition: 'bottom right' }}
          />
        </div>

        <div className="relative z-10 space-y-6">
          {/* Header & Timer */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-primary px-3 py-1 font-mono text-[10px] font-bold text-white">
                <Zap size={11} fill="currentColor" /> DISPATCH BROADCAST
              </span>
              <span className="font-mono text-xs text-text-tertiary">
                JOB #{job?.job_number || jobId?.slice(-6).toUpperCase()}
              </span>
            </div>
            <div
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold ${
                timeLeft <= 10 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-accent-light/50 text-accent-primary'
              }`}
            >
              <Clock size={15} />
              <span>{timeLeft}s TO RESPOND</span>
            </div>
          </div>

          {errorMsg && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
              {errorMsg}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
            </div>
          ) : (
            <>
              {/* Problem Title & Category */}
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-wider text-accent-primary">
                  {serviceCategory} SPECIALIST REQUEST
                </p>
                <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-text-navy sm:text-4xl">
                  {problemTitle}
                </h1>
              </div>

              {/* Customer & Location Grid */}
              <div className="grid grid-cols-1 gap-4 border-y border-status-subtle py-5 sm:grid-cols-2">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                    CUSTOMER
                  </p>
                  <p className="mt-1 text-base font-bold text-text-navy">
                    {job?.customer_name || 'Customer'}
                  </p>
                  <p className="text-xs text-text-secondary">
                    Verified Customer · Cooperative Platform
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                    SERVICE LOCATION & TIME
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-text-navy">
                    <MapPin size={15} className="text-accent-primary flex-shrink-0" />
                    <span>{job?.customer_address || 'Kothrud, Pune'}</span>
                  </div>
                  {job?.preferred_time && (
                    <p className="text-xs text-text-secondary mt-0.5">
                      Preferred: {job.preferred_time}
                    </p>
                  )}
                </div>
              </div>

              {/* Problem Description */}
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                  PROBLEM DESCRIPTION
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-text-navy">
                  {job?.description || 'Service request from customer.'}
                </p>
                {job?.additional_instructions && (
                  <p className="mt-2 text-xs italic text-text-secondary">
                    Note: {job.additional_instructions}
                  </p>
                )}
              </div>

              {/* Problem Photos */}
              {job?.problem_image_urls && job.problem_image_urls.length > 0 && (
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                    CUSTOMER UPLOADED PHOTOS
                  </p>
                  <div className="mt-2 flex items-center gap-3 overflow-x-auto">
                    {job.problem_image_urls.map((url: string, idx: number) => (
                      <img
                        key={idx}
                        src={url}
                        alt="Customer problem photo"
                        className="h-24 w-24 rounded-2xl border border-status-subtle object-cover shadow-sm"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Earnings & Pricing */}
              <div className="rounded-2xl border border-accent-primary/20 bg-accent-light/30 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-accent-primary">
                    YOUR NET EARNINGS (85%)
                  </p>
                  <p className="mt-1 text-3xl font-extrabold text-accent-primary">
                    ₹{earnings}
                  </p>
                  <p className="text-xs text-text-secondary">
                    Customer estimated total: ₹{totalAmount} (15% cooperative allocation)
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                    DISPATCH DISTANCE
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-text-navy">
                    2.1 KM
                  </p>
                  <p className="text-xs text-text-secondary">~8 min travel time</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={handleReject}
                  className="w-full sm:w-auto flex-1 rounded-2xl border border-status-subtle bg-white py-4 text-xs font-bold text-text-secondary hover:text-text-navy"
                >
                  DECLINE REQUEST
                </button>
                <button
                  onClick={handleAccept}
                  disabled={accepting}
                  className="w-full sm:w-auto flex-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-accent-primary px-8 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-accent-hover active:scale-[0.98] disabled:opacity-50"
                >
                  <CheckCircle2 size={18} />
                  <span>{accepting ? 'ACCEPTING JOB…' : 'ACCEPT THIS JOB'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
