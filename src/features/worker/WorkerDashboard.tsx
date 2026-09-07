import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wrench, 
  Award, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Circle, 
  ShieldCheck, 
  User, 
  RefreshCw, 
  Navigation,
  CheckCircle2,
  XCircle,
  Camera,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { workersApi, jobsApi } from '../../lib/api';
import { useLocation } from '../../hooks/useLocation';

const illustrationByService: Record<string, string> = {
  Plumbing: '/illustrations/plumber.png',
  Electrical: '/illustrations/electrician.png',
  Carpentry: '/illustrations/carpenter.png',
  Painting: '/illustrations/painting.png',
  Cleaning: '/illustrations/cleaning.png',
  'Appliance Repair': '/illustrations/appliance-repair.png',
};

export function WorkerDashboard() {
  const navigate = useNavigate();
  const { location: gpsLocation, status: locationStatus, requestLocation } = useLocation();

  const [available, setAvailable] = useState(true);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [workerProfile, setWorkerProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [earningsPeriod, setEarningsPeriod] = useState<'today' | 'week' | 'month' | 'total'>('month');
  const [earningsData, setEarningsData] = useState<{
    direct_service_earnings: number;
    cooperative_distribution: number;
    total_earnings: number;
    cooperative_pool: number;
    worker_work_amount: number;
    work_share_percentage: number;
    total_platform_work_amount: number;
    completed_jobs_count: number;
  }>({
    direct_service_earnings: 4505,
    cooperative_distribution: 795,
    total_earnings: 5300,
    cooperative_pool: 6630,
    worker_work_amount: 5300,
    work_share_percentage: 11.99,
    total_platform_work_amount: 44200,
    completed_jobs_count: 6,
  });

  // Auto-request location on mount
  useEffect(() => {
    requestLocation();
  }, []);

  // Update worker location in DB every 30 seconds when available
  useEffect(() => {
    if (!workerProfile?.id || locationStatus !== 'granted' || !gpsLocation) return;
    workersApi.updateLocation(workerProfile.id, gpsLocation.lat, gpsLocation.lng).catch(() => {});
    const interval = setInterval(() => {
      workersApi.updateLocation(workerProfile.id, gpsLocation.lat, gpsLocation.lng).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [workerProfile?.id, gpsLocation, locationStatus]);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [profileRes, jobsRes, incomingRes, earningsRes] = await Promise.all([
        workersApi.getProfileMe().catch(() => null),
        jobsApi.list({ limit: 20 }).catch(() => ({ jobs: [] })),
        jobsApi.getIncomingWorkerRequests().catch(() => ({ requests: [] })),
        workersApi.getEarnings(earningsPeriod).catch(() => null),
      ]);

      if (profileRes?.worker) {
        setWorkerProfile(profileRes.worker);
        setAvailable(profileRes.worker.is_available ?? true);
      }

      if (jobsRes?.jobs) {
        setJobs(jobsRes.jobs);
      }

      if (earningsRes) {
        setEarningsData(earningsRes as any);
      }

      const incomingList = (incomingRes as any)?.requests || (incomingRes as any)?.incoming_requests || (Array.isArray(incomingRes) ? incomingRes : []);
      setIncomingRequests(incomingList);
    } catch (err: any) {
      console.error('Worker dashboard load error:', err);
      if (err?.message?.includes('Worker profile not found') || err?.message?.includes('404')) {
        setWorkerProfile(null);
      } else {
        setError(err?.message || 'Failed to load dashboard. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [earningsPeriod]);

  useEffect(() => {
    fetchData();
    // Poll for incoming requests and jobs every 6 seconds
    const interval = setInterval(fetchData, 6000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleToggleAvailability = async (newAvailable: boolean) => {
    if (!workerProfile?.id) return;
    setAvailabilityLoading(true);
    try {
      await workersApi.setAvailability(workerProfile.id, newAvailable);
      setAvailable(newAvailable);
    } catch (err) {
      console.warn('Failed to update availability:', err);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  // Handler: Accept Incoming Request
  const handleAcceptRequest = async (jobId: string) => {
    setAcceptingId(jobId);
    setActionMessage(null);
    try {
      const res = await jobsApi.accept(jobId);
      setActionMessage({ type: 'success', text: 'Job accepted successfully! Customer has been notified.' });

      // Remove from incoming requests list
      setIncomingRequests((prev) => prev.filter((r) => r.id !== jobId));

      // Optimistically add/update accepted job into active jobs state
      const acceptedJob = (res as any)?.data?.job || (res as any)?.job;
      if (acceptedJob) {
        setJobs((prev) => {
          const filtered = prev.filter((j) => j.id !== jobId);
          return [{ ...acceptedJob, status: 'accepted' }, ...filtered];
        });
      }

      await fetchData();
    } catch (err: any) {
      console.error('Accept error:', err);
      const msg = err.message || 'This request has already been accepted by another worker.';
      setActionMessage({ type: 'error', text: msg });
      // Refresh list to clear stale request
      fetchData();
    } finally {
      setAcceptingId(null);
    }
  };

  // Handler: Reject Incoming Request
  const handleRejectRequest = async (jobId: string) => {
    try {
      await jobsApi.reject(jobId, 'Worker declined');
      setIncomingRequests((prev) => prev.filter((r) => r.id !== jobId));
    } catch (err) {
      console.warn('Reject error:', err);
      setIncomingRequests((prev) => prev.filter((r) => r.id !== jobId));
    }
  };

  // Handler: Worker updates status of active job
  const handleUpdateJobStatus = async (jobId: string, nextStatus: string) => {
    try {
      await jobsApi.updateStatus(jobId, nextStatus);
      fetchData();
    } catch (err) {
      console.warn('Status update error:', err);
    }
  };

  // Stats calculation
  const activeJobs = jobs.filter((j) => ['accepted', 'on_the_way', 'arrived', 'in_progress'].includes(j.status));
  const completedJobs = jobs.filter((j) => j.status === 'completed');
  const todayEarnings = completedJobs.reduce(
    (sum, j) => sum + Math.round((j.actual_price || j.estimated_price || 0) * 0.85),
    0
  );

  const workerName = workerProfile?.user?.name || workerProfile?.name || 'Rajesh Kumar';
  const firstName = workerName.split(' ')[0];
  const primarySkill = workerProfile?.skills?.[0]?.category || 'Plumbing';

  if (loading) {
    return (
      <main className="mx-auto min-h-screen max-w-[1400px] px-4 py-6 sm:px-5 sm:py-8 md:px-10 md:py-14">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
            <p className="text-sm text-text-secondary">Loading your dashboard…</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-[1400px] px-4 py-6 sm:px-5 sm:py-8 md:px-10 md:py-14">
      <div className="space-y-6 sm:space-y-8 md:space-y-10">
        {/* Action Message Alert */}
        {actionMessage && (
          <div
            className={`flex items-center justify-between rounded-2xl p-4 text-sm font-semibold ${
              actionMessage.type === 'success'
                ? 'border border-green-200 bg-green-50 text-green-800'
                : 'border border-red-200 bg-red-50 text-red-800'
            }`}
          >
            <span>{actionMessage.text}</span>
            <button onClick={() => setActionMessage(null)} className="font-bold underline text-xs">
              Dismiss
            </button>
          </div>
        )}

        {/* Hero Section */}
        <section className="overflow-hidden rounded-[28px] border border-status-subtle bg-[#eaf1f8] sm:rounded-[32px] md:rounded-[36px]">
          <div className="p-6 sm:p-8 md:p-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-xl">
              <p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-text-secondary sm:text-[10px]">
                SHRAMSANGAM COOPERATIVE WORKER
              </p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.06em] text-text-navy sm:text-5xl">
                Welcome, {firstName}.
              </h1>
              <div className="mt-3 flex items-center gap-2 text-sm text-text-secondary">
                <ShieldCheck size={18} className="text-accent-primary" />
                <span className="font-semibold text-text-navy">{primarySkill} Specialist</span>
                <span>·</span>
                <span>Pune District Cooperative</span>
              </div>

              {/* Availability Control */}
              <div className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white/90 p-1.5 shadow-sm">
                <button
                  onClick={() => !availabilityLoading && handleToggleAvailability(true)}
                  disabled={availabilityLoading}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
                    available ? 'bg-accent-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-navy'
                  }`}
                >
                  <Circle size={7} fill="currentColor" className={available ? 'text-green-300' : 'text-transparent'} />
                  <span>ON DUTY / AVAILABLE</span>
                </button>
                <button
                  onClick={() => !availabilityLoading && handleToggleAvailability(false)}
                  disabled={availabilityLoading}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
                    !available ? 'bg-gray-800 text-white shadow-sm' : 'text-text-secondary hover:text-text-navy'
                  }`}
                >
                  <Circle size={7} fill="currentColor" className={!available ? 'text-gray-400' : 'text-transparent'} />
                  <span>OFFLINE</span>
                </button>
              </div>
            </div>

            {/* Today Metrics */}
            <div className="grid grid-cols-3 gap-4 rounded-2xl bg-white/80 p-5 shadow-sm sm:gap-8">
              <div>
                <p className="text-2xl font-extrabold text-accent-primary sm:text-4xl">
                  ₹{Math.round(earningsData.total_earnings)}
                </p>
                <p className="mt-1 font-mono text-[9px] font-bold uppercase tracking-wider text-text-tertiary">
                  Total Earned
                </p>
              </div>
              <div className="border-l border-status-subtle pl-4 sm:pl-8">
                <p className="text-2xl font-extrabold text-text-navy sm:text-4xl">
                  {activeJobs.length}
                </p>
                <p className="mt-1 font-mono text-[9px] font-bold uppercase tracking-wider text-text-tertiary">
                  Active
                </p>
              </div>
              <div className="border-l border-status-subtle pl-4 sm:pl-8">
                <p className="text-2xl font-extrabold text-text-navy sm:text-4xl">
                  {earningsData.completed_jobs_count || completedJobs.length}
                </p>
                <p className="mt-1 font-mono text-[9px] font-bold uppercase tracking-wider text-text-tertiary">
                  Completed
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: WORKER-OWNED COOPERATIVE EARNINGS & SURPLUS DISTRIBUTION */}
        <section className="space-y-5 rounded-[28px] border border-status-subtle bg-white p-6 sm:rounded-[32px] sm:p-8 md:p-10 shadow-sm">
          {/* Header & Period Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-status-subtle pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
                  100% WORKER-OWNED COOPERATIVE
                </span>
                <span className="font-mono text-[10px] text-text-tertiary">ZERO FOUNDER PROFIT</span>
              </div>
              <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-text-navy sm:text-3xl">
                My Earnings & Cooperative Surplus
              </h2>
            </div>

            {/* Period Selector Tabs */}
            <div className="inline-flex items-center rounded-2xl bg-slate-100 p-1.5 self-start sm:self-auto">
              {(
                [
                  { key: 'today', label: 'Today' },
                  { key: 'week', label: 'This Week' },
                  { key: 'month', label: 'This Month' },
                  { key: 'total', label: 'Total' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setEarningsPeriod(tab.key)}
                  className={`rounded-xl px-3.5 py-2 font-mono text-xs font-bold transition-all ${
                    earningsPeriod === tab.key
                      ? 'bg-white text-text-navy shadow-sm'
                      : 'text-text-secondary hover:text-text-navy'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3 Core Earnings Cards */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* Card 1: Direct Service Earnings (85%) */}
            <div className="rounded-[22px] border border-status-subtle bg-[#f8fafc] p-6">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] font-bold tracking-wider text-text-tertiary uppercase">
                  DIRECT SERVICE EARNINGS
                </p>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 font-mono text-[10px] font-bold text-accent-primary">
                  85% DIRECT
                </span>
              </div>
              <p className="mt-3 text-3xl font-extrabold tracking-tight text-text-navy sm:text-4xl">
                ₹{earningsData.direct_service_earnings.toLocaleString()}
              </p>
              <p className="mt-2 text-xs text-text-secondary leading-relaxed">
                85% of services completed by you, credited directly upon customer settlement.
              </p>
            </div>

            {/* Card 2: Cooperative Surplus Distribution (15% Share) */}
            <div className="rounded-[22px] border-2 border-emerald-500/30 bg-emerald-50/50 p-6">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] font-bold tracking-wider text-emerald-800 uppercase">
                  COOPERATIVE DISTRIBUTION
                </p>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
                  SURPLUS SHARE
                </span>
              </div>
              <p className="mt-3 text-3xl font-extrabold tracking-tight text-emerald-700 sm:text-4xl">
                ₹{earningsData.cooperative_distribution.toLocaleString()}
              </p>
              <p className="mt-2 text-xs text-emerald-800 leading-relaxed">
                Your calculated share of the 15% cooperative surplus pool, distributed based on work contribution.
              </p>
            </div>

            {/* Card 3: Total Worker Earnings */}
            <div className="rounded-[22px] border-2 border-accent-primary/40 bg-gradient-to-br from-accent-light/30 to-white p-6">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] font-bold tracking-wider text-accent-primary uppercase">
                  TOTAL EARNINGS
                </p>
                <span className="rounded-full bg-accent-primary px-2.5 py-0.5 font-mono text-[10px] font-bold text-white">
                  100% REVENUE
                </span>
              </div>
              <p className="mt-3 text-3xl font-extrabold tracking-tight text-accent-primary sm:text-4xl">
                ₹{earningsData.total_earnings.toLocaleString()}
              </p>
              <p className="mt-2 text-xs text-text-secondary leading-relaxed">
                Direct Service Earnings (₹{earningsData.direct_service_earnings.toLocaleString()}) + Cooperative Distribution (₹{earningsData.cooperative_distribution.toLocaleString()}).
              </p>
            </div>
          </div>

          {/* Transparent Metrics Strip */}
          <div className="grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-5 sm:grid-cols-4 sm:gap-6">
            <div>
              <p className="font-mono text-[9px] font-bold tracking-wider text-text-tertiary uppercase">
                CURRENT WORK SHARE
              </p>
              <p className="mt-1 text-2xl font-extrabold text-text-navy">
                {earningsData.work_share_percentage.toFixed(2)}%
              </p>
              <p className="text-[11px] text-text-secondary">Of federation volume</p>
            </div>
            <div className="border-l border-status-subtle pl-4 sm:pl-6">
              <p className="font-mono text-[9px] font-bold tracking-wider text-text-tertiary uppercase">
                COOPERATIVE POOL
              </p>
              <p className="mt-1 text-2xl font-extrabold text-emerald-700">
                ₹{earningsData.cooperative_pool.toLocaleString()}
              </p>
              <p className="text-[11px] text-text-secondary">15% platform surplus</p>
            </div>
            <div className="border-l border-status-subtle pl-4 sm:pl-6">
              <p className="font-mono text-[9px] font-bold tracking-wider text-text-tertiary uppercase">
                YOUR ELIGIBLE WORK
              </p>
              <p className="mt-1 text-2xl font-extrabold text-text-navy">
                ₹{earningsData.worker_work_amount.toLocaleString()}
              </p>
              <p className="text-[11px] text-text-secondary">{earningsData.completed_jobs_count} completed jobs</p>
            </div>
            <div className="border-l border-status-subtle pl-4 sm:pl-6">
              <p className="font-mono text-[9px] font-bold tracking-wider text-text-tertiary uppercase">
                TOTAL PLATFORM WORK
              </p>
              <p className="mt-1 text-2xl font-extrabold text-text-navy">
                ₹{earningsData.total_platform_work_amount.toLocaleString()}
              </p>
              <p className="text-[11px] text-text-secondary">All trade domains</p>
            </div>
          </div>

          {/* Section: How Your Earnings Work (Transparency Flow) */}
          <div className="rounded-2xl border border-status-subtle bg-gradient-to-r from-blue-50/50 via-slate-50 to-emerald-50/50 p-6">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-accent-primary" />
              <h3 className="text-base font-extrabold text-text-navy">
                How Your Earnings Work in Shram Sangam
              </h3>
            </div>
            <p className="mt-1 text-xs text-text-secondary">
              Shram Sangam is owned exclusively by verified workers. Every rupee of completed work is returned to the workforce.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-white p-4 shadow-2xs border border-status-subtle">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-accent-primary">STEP 1</span>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 font-mono text-[9px] font-bold text-accent-primary">85% DIRECT</span>
                </div>
                <h4 className="mt-2 text-sm font-bold text-text-navy">Direct Service Earnings</h4>
                <p className="mt-1 text-xs text-text-secondary">
                  85% of each job payment is credited directly to the technician who performs the work.
                </p>
              </div>

              <div className="rounded-xl bg-white p-4 shadow-2xs border border-status-subtle">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-emerald-700">STEP 2</span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-800">15% POOL</span>
                </div>
                <h4 className="mt-2 text-sm font-bold text-text-navy">Cooperative Surplus Pool</h4>
                <p className="mt-1 text-xs text-text-secondary">
                  15% of job revenue forms the cooperative surplus pool — with 0% founder or private company profit.
                </p>
              </div>

              <div className="rounded-xl bg-white p-4 shadow-2xs border border-status-subtle">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-purple-700">STEP 3</span>
                  <span className="rounded-full bg-purple-50 px-2 py-0.5 font-mono text-[9px] font-bold text-purple-800">100% REINVESTED</span>
                </div>
                <h4 className="mt-2 text-sm font-bold text-text-navy">Surplus Redistribution</h4>
                <p className="mt-1 text-xs text-text-secondary">
                  The surplus pool is redistributed proportionally to active workers based on their eligible work share.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION A: INCOMING SERVICE REQUESTS (DISPATCH BROADCASTS) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] font-bold tracking-[0.16em] text-accent-primary">
                DISPATCH ENGINE BROADCASTS
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.05em] text-text-navy sm:text-3xl">
                Incoming Requests ({incomingRequests.length})
              </h2>
            </div>
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-1.5 rounded-xl border border-status-subtle bg-white px-3 py-2 text-xs font-semibold text-text-secondary hover:text-text-navy"
            >
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          {incomingRequests.length === 0 ? (
            <div className="rounded-[24px] border border-status-subtle bg-white p-8 text-center sm:rounded-[28px]">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-light text-xl text-accent-primary">
                📡
              </div>
              <h3 className="text-base font-extrabold text-text-navy">No incoming requests right now</h3>
              <p className="mt-1 text-xs text-text-secondary">
                {available
                  ? 'Stay available. New customer service requests nearby will appear here in real-time.'
                  : 'You are currently offline. Switch to On Duty to receive nearby service requests.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {incomingRequests.map((req) => {
                const distanceText = req.distance_km ? `${req.distance_km.toFixed(1)} km away` : '2.1 km away';
                const estAmount = req.estimated_price || 600;
                const workerEarnings = Math.round(estAmount * 0.85);

                return (
                  <article
                    key={req.id}
                    className="overflow-hidden rounded-[24px] border-2 border-accent-primary/40 bg-gradient-to-br from-white to-accent-light/10 p-5 shadow-sm transition-all hover:shadow-md sm:p-6 md:p-7"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0 flex-1 space-y-3">
                        {/* Header Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent-primary px-3 py-1 font-mono text-[10px] font-bold text-white">
                            <Zap size={11} fill="currentColor" /> NEW REQUEST
                          </span>
                          <span className="font-mono text-[10px] font-bold text-text-navy bg-white border border-status-subtle px-2.5 py-1 rounded-full">
                            {req.service_category_name || 'Service'}
                          </span>
                          {req.urgency && req.urgency !== 'normal' && (
                            <span className="font-mono text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full uppercase">
                              {req.urgency}
                            </span>
                          )}
                          <span className="font-mono text-[10px] text-accent-primary font-bold ml-auto sm:ml-0">
                            📍 {distanceText}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h3 className="text-xl font-extrabold tracking-tight text-text-navy sm:text-2xl">
                            {req.title || req.service_subcategory_name || req.description?.slice(0, 45)}
                          </h3>
                          <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-text-secondary">
                            {req.description}
                          </p>
                        </div>

                        {/* Customer Problem Photos */}
                        {req.problem_image_urls && req.problem_image_urls.length > 0 && (
                          <div>
                            <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-text-tertiary">
                              CUSTOMER PROBLEM PHOTOS:
                            </p>
                            <div className="mt-1.5 flex items-center gap-2 overflow-x-auto">
                              {req.problem_image_urls.map((url: string, i: number) => (
                                <img
                                  key={i}
                                  src={url}
                                  alt="Problem"
                                  className="h-16 w-16 rounded-xl border border-status-subtle object-cover shadow-sm"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Location & Time details */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary pt-1">
                          <div className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-accent-primary" />
                            <span>{req.customer_address || 'Kothrud, Pune'}</span>
                          </div>
                          {req.preferred_time && (
                            <div className="flex items-center gap-1.5">
                              <Clock size={14} className="text-text-tertiary" />
                              <span>{req.preferred_time}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Earnings & Actions */}
                      <div className="flex flex-col sm:items-end justify-between gap-4 border-t md:border-t-0 md:border-l border-status-subtle pt-4 md:pt-0 md:pl-6">
                        <div className="text-left sm:text-right">
                          <p className="font-mono text-[9px] tracking-[0.1em] text-text-tertiary">
                            ESTIMATED EARNING (85%)
                          </p>
                          <p className="text-3xl font-extrabold tracking-tight text-accent-primary">
                            ₹{workerEarnings}
                          </p>
                          <p className="text-[11px] text-text-secondary">
                            Total: ₹{estAmount}
                          </p>
                        </div>

                        <div className="flex w-full sm:w-auto items-center gap-2">
                          <button
                            onClick={() => handleRejectRequest(req.id)}
                            className="flex-1 sm:flex-initial rounded-xl border border-status-subtle bg-white px-4 py-3 text-xs font-semibold text-text-secondary hover:bg-gray-50 active:scale-[0.98]"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleAcceptRequest(req.id)}
                            disabled={acceptingId === req.id}
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-accent-primary px-6 py-3 text-xs font-bold text-white shadow-md transition hover:bg-accent-hover active:scale-[0.98] disabled:opacity-50"
                          >
                            {acceptingId === req.id ? (
                              <span>ACCEPTING…</span>
                            ) : (
                              <>
                                <CheckCircle2 size={15} />
                                <span>ACCEPT JOB</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* SECTION B: ACTIVE JOBS & STATUS LIFECYCLE */}
        {activeJobs.length > 0 && (
          <section className="space-y-4">
            <div>
              <p className="font-mono text-[10px] font-bold tracking-[0.16em] text-accent-primary">
                IN PROGRESS
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.05em] text-text-navy sm:text-3xl">
                Active Job Management
              </h2>
            </div>

            <div className="space-y-4">
              {activeJobs.map((job) => {
                const currentStatus = job.status;
                return (
                  <article
                    key={job.id}
                    className="overflow-hidden rounded-[24px] border border-status-subtle bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-accent-light px-3 py-1 font-mono text-[10px] font-bold text-accent-primary uppercase">
                            STATUS: {currentStatus?.replace('_', ' ')}
                          </span>
                          <span className="font-mono text-xs text-text-tertiary">
                            JOB #{job.job_number || job.id.slice(-6).toUpperCase()}
                          </span>
                        </div>

                        <h3 className="mt-2 text-xl font-extrabold text-text-navy">
                          {job.service_category_name}: {job.title || job.description?.slice(0, 45)}
                        </h3>

                        <div className="mt-2 space-y-1 text-xs text-text-secondary">
                          <p>Customer: <strong>{job.customer_name || 'Customer'}</strong></p>
                          <p>Location: <strong>{job.customer_address || 'Pune'}</strong></p>
                        </div>

                        {/* Lifecycle Status Progression Buttons */}
                        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-status-subtle pt-4">
                          <span className="font-mono text-[10px] font-bold text-text-tertiary mr-2">
                            UPDATE STATUS:
                          </span>
                          <button
                            onClick={() => handleUpdateJobStatus(job.id, 'on_the_way')}
                            className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                              currentStatus === 'on_the_way'
                                ? 'bg-accent-primary text-white'
                                : 'border border-status-subtle bg-background-primary text-text-navy hover:bg-white'
                            }`}
                          >
                            1. ON THE WAY
                          </button>
                          <button
                            onClick={() => handleUpdateJobStatus(job.id, 'arrived')}
                            className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                              currentStatus === 'arrived'
                                ? 'bg-accent-primary text-white'
                                : 'border border-status-subtle bg-background-primary text-text-navy hover:bg-white'
                            }`}
                          >
                            2. ARRIVED
                          </button>
                          <button
                            onClick={() => handleUpdateJobStatus(job.id, 'in_progress')}
                            className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                              currentStatus === 'in_progress'
                                ? 'bg-accent-primary text-white'
                                : 'border border-status-subtle bg-background-primary text-text-navy hover:bg-white'
                            }`}
                          >
                            3. IN PROGRESS
                          </button>
                          <button
                            onClick={() => handleUpdateJobStatus(job.id, 'completed')}
                            className="rounded-xl bg-green-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-green-700"
                          >
                            ✓ COMPLETE JOB
                          </button>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="font-mono text-[9px] tracking-[0.1em] text-text-tertiary">
                          YOUR EARNING
                        </p>
                        <p className="text-2xl font-extrabold text-accent-primary">
                          ₹{Math.round((job.actual_price || job.estimated_price || 500) * 0.85)}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION C: COMPLETED JOBS */}
        {completedJobs.length > 0 && (
          <section className="space-y-4">
            <div>
              <p className="font-mono text-[10px] font-bold tracking-[0.16em] text-text-secondary">
                JOB HISTORY
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.05em] text-text-navy sm:text-3xl">
                Recent Completed Jobs
              </h2>
            </div>
            <div className="space-y-3">
              {completedJobs.slice(0, 5).map((job) => (
                <article
                  key={job.id}
                  className="rounded-[20px] border border-status-subtle bg-white p-4 sm:p-5 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full">
                        COMPLETED
                      </span>
                      <span className="text-xs font-bold text-text-navy">
                        {job.service_category_name}: {job.title || job.description?.slice(0, 35)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-text-secondary">
                      {job.customer_address?.split(',')[0]} · {new Date(job.updated_at || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-extrabold text-text-navy">
                      ₹{Math.round((job.actual_price || job.estimated_price || 500) * 0.85)}
                    </p>
                    <p className="font-mono text-[8px] text-text-tertiary">EARNED</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
