/**
 * Worker Dashboard
 *
 * Connected to real backend APIs:
 * - Fetches worker profile via GET /api/workers/profile/me
 * - Fetches assigned jobs via GET /api/jobs
 * - Toggles availability via PATCH /api/workers/:id/availability
 *
 * Validates Requirements: 4.1, 4.2
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Award, MapPin, Clock, ArrowRight, Circle, ShieldCheck, User, RefreshCw, Navigation } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-request location on mount
  useEffect(() => {
    requestLocation();
  }, []);

  // Update worker location in DB every 30 seconds when available
  useEffect(() => {
    if (!workerProfile?.id || locationStatus !== 'granted') return;
    // Update immediately
    workersApi.updateLocation(workerProfile.id, gpsLocation.lat, gpsLocation.lng).catch(() => {});
    // Then every 30 seconds
    const interval = setInterval(() => {
      workersApi.updateLocation(workerProfile.id, gpsLocation.lat, gpsLocation.lng).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [workerProfile?.id, gpsLocation, locationStatus]);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [profileRes, jobsRes] = await Promise.all([
        workersApi.getProfileMe(),
        jobsApi.list({ limit: 20 }),
      ]);

      if (profileRes?.worker) {
        setWorkerProfile(profileRes.worker);
        setAvailable(profileRes.worker.is_available ?? true);
      }

      if (jobsRes?.jobs) {
        setJobs(jobsRes.jobs);
      }
    } catch (err: any) {
      console.error('Worker dashboard load error:', err);
      // If worker profile not found, don't show error - show setup prompt
      if (err?.message?.includes('Worker profile not found') || err?.message?.includes('404')) {
        setWorkerProfile(null);
      } else {
        setError(err?.message || 'Failed to load dashboard. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Poll for new jobs every 15 seconds
    const interval = setInterval(fetchData, 15000);
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
      // Revert on error
    } finally {
      setAvailabilityLoading(false);
    }
  };

  // Derive stats from real jobs
  const activeJobs = jobs.filter((j) => j.status === 'in_progress' || j.status === 'accepted');
  const completedToday = jobs.filter((j) => {
    if (j.status !== 'completed') return false;
    const completed = new Date(j.updated_at || j.created_at);
    const today = new Date();
    return completed.toDateString() === today.toDateString();
  });
  const incomingJob = jobs.find((j) => j.status === 'matched' || j.status === 'pending');
  const todayEarnings = completedToday.reduce((sum, j) => sum + (j.actual_price || j.estimated_price || 0) * 0.85, 0);

  const workerName = workerProfile?.user?.name || workerProfile?.name || 'Worker';
  const firstName = workerName.split(' ')[0];
  const primarySkill = workerProfile?.skills?.[0]?.category || 'Service';

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

  if (error) {
    return (
      <main className="mx-auto min-h-screen max-w-[1400px] px-4 py-6 sm:px-5 sm:py-8 md:px-10 md:py-14">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="max-w-sm text-center">
            <p className="text-base font-semibold text-text-navy">Could not load dashboard</p>
            <p className="mt-2 text-sm text-text-secondary">{error}</p>
            <button onClick={fetchData} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover">
              <RefreshCw size={15} /> Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  // New worker: registered but no worker profile created yet
  if (!workerProfile) {
    return (
      <main className="mx-auto min-h-screen max-w-[1400px] px-4 py-6 sm:px-5 sm:py-8 md:px-10 md:py-14">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] bg-[#fff3e0]">
              <ShieldCheck size={36} className="text-accent-primary" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-[-0.05em] text-text-navy">Registration Received!</h2>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              Your worker profile is pending verification by the cooperative admin. 
              You'll be able to accept jobs once your skills and documents are verified.
            </p>
            <div className="mt-6 rounded-2xl border border-status-subtle bg-white p-5 text-left space-y-3">
              <p className="font-mono text-[10px] font-semibold tracking-[0.1em] text-text-tertiary">VERIFICATION STATUS</p>
              {['Account created ✓', 'Documents under review', 'Skills verification pending', 'Admin approval pending'].map((step, i) => (
                <div key={i} className={`flex items-center gap-2 text-sm ${i === 0 ? 'text-green-600 font-semibold' : 'text-text-secondary'}`}>
                  <div className={`h-2 w-2 rounded-full ${i === 0 ? 'bg-green-500' : 'bg-gray-200'}`} />
                  {step}
                </div>
              ))}
            </div>
            <button onClick={fetchData} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-status-subtle px-5 py-2.5 text-sm font-semibold text-text-secondary hover:text-text-navy">
              <RefreshCw size={15} /> Refresh Status
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-[1400px] px-4 py-6 sm:px-5 sm:py-8 md:px-10 md:py-14">
      <div className="space-y-6 sm:space-y-8 md:space-y-12">
        {/* Hero Panel with Worker Identity & Availability */}
        <section className="overflow-hidden rounded-[28px] border border-status-subtle bg-[#eaf1f8] sm:rounded-[32px] md:rounded-[36px]">
          {/* Mobile: Vertical composition */}
          <div className="flex flex-col md:hidden">
            <div className="p-5">
              <p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-text-secondary">
                COOPERATIVE WORKER
              </p>
              <h1 className="mt-3 text-[2.25rem] font-extrabold leading-[0.88] tracking-[-0.07em] text-text-navy">
                Welcome back,<br />{firstName}.
              </h1>
              <div className="mt-4 space-y-2">
                <p className="text-base font-semibold tracking-[-0.02em] text-text-navy">
                  {primarySkill} Specialist
                </p>
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <ShieldCheck size={16} className="text-accent-primary" strokeWidth={2.5} />
                  <span className="font-medium">Cooperative Verified</span>
                </div>
              </div>

              {/* Availability Control */}
              <div className="mt-5">
                <div className="relative overflow-hidden rounded-xl bg-white p-1.5 shadow-sm">
                  <div
                    className={`absolute top-1.5 bottom-1.5 rounded-lg bg-accent-primary shadow-md transition-all duration-300 ease-out ${
                      available ? 'left-1.5 right-1/2 mr-0.5' : 'left-1/2 right-1.5 ml-0.5'
                    }`}
                  />
                  <div className="relative grid grid-cols-2 gap-1">
                    <button
                      onClick={() => !availabilityLoading && handleToggleAvailability(true)}
                      disabled={availabilityLoading}
                      className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 px-3 text-xs font-semibold transition-colors duration-300 ${
                        available ? 'text-white' : 'text-text-secondary'
                      }`}
                    >
                      <Circle size={7} fill="currentColor" className={available ? 'text-green-300' : 'text-transparent'} />
                      <span>Available</span>
                    </button>
                    <button
                      onClick={() => !availabilityLoading && handleToggleAvailability(false)}
                      disabled={availabilityLoading}
                      className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 px-3 text-xs font-semibold transition-colors duration-300 ${
                        !available ? 'text-white' : 'text-text-secondary'
                      }`}
                    >
                      <Circle size={7} fill="currentColor" className={!available ? 'text-gray-300' : 'text-transparent'} />
                      <span>Offline</span>
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-[10px] text-text-secondary">
                  {available ? 'Receiving nearby service requests' : 'Not receiving new requests'}
                </p>
              </div>
            </div>

            <div className="relative h-[180px] overflow-hidden">
              <img
                src="/illustrations/worker-hero.png"
                alt=""
                className="absolute bottom-0 left-1/2 h-auto w-[85%] -translate-x-1/2"
                style={{ objectFit: 'contain', objectPosition: 'bottom center' }}
              />
            </div>
          </div>

          {/* Desktop: Layered composition */}
          <div className="relative hidden min-h-[500px] p-12 md:block">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <img
                src="/illustrations/worker-hero.png"
                alt=""
                className="absolute bottom-[-5%] right-[-8%] h-[120%] w-auto max-w-none"
                style={{ objectFit: 'contain', objectPosition: 'bottom right' }}
              />
            </div>
            <div className="relative z-10 flex h-full flex-col">
              <div className="max-w-[55%]">
                <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-text-secondary">
                  COOPERATIVE WORKER
                </p>
                <h1 className="mt-4 text-[4.5rem] font-extrabold leading-[0.88] tracking-[-0.07em] text-text-navy">
                  Welcome back,<br />{firstName}.
                </h1>
                <div className="mt-6 space-y-3">
                  <p className="text-xl font-semibold tracking-[-0.02em] text-text-navy">
                    {primarySkill} Specialist
                  </p>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <ShieldCheck size={18} className="text-accent-primary" strokeWidth={2.5} />
                    <span className="font-medium">Cooperative Verified</span>
                  </div>
                </div>
              </div>

              {/* Availability Control */}
              <div className="mt-auto max-w-sm pt-8">
                <div className="relative overflow-hidden rounded-2xl bg-white/90 p-1.5 shadow-sm backdrop-blur-sm">
                  <div
                    className={`absolute top-1.5 bottom-1.5 rounded-xl bg-accent-primary shadow-md transition-all duration-300 ease-out ${
                      available ? 'left-1.5 right-1/2 mr-0.5' : 'left-1/2 right-1.5 ml-0.5'
                    }`}
                  />
                  <div className="relative grid grid-cols-2 gap-1">
                    <button
                      onClick={() => !availabilityLoading && handleToggleAvailability(true)}
                      disabled={availabilityLoading}
                      className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-300 ${
                        available ? 'text-white' : 'text-text-secondary'
                      }`}
                    >
                      <Circle size={8} fill="currentColor" className={available ? 'text-green-300' : 'text-transparent'} />
                      <span>Available</span>
                    </button>
                    <button
                      onClick={() => !availabilityLoading && handleToggleAvailability(false)}
                      disabled={availabilityLoading}
                      className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-300 ${
                        !available ? 'text-white' : 'text-text-secondary'
                      }`}
                    >
                      <Circle size={8} fill="currentColor" className={!available ? 'text-gray-300' : 'text-transparent'} />
                      <span>Offline</span>
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-xs text-text-secondary">
                  {available ? 'Receiving nearby service requests' : 'Not receiving new requests'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Today Metrics */}
        <section className="overflow-hidden rounded-[24px] border border-status-subtle bg-white p-5 sm:rounded-[28px] sm:p-6 md:rounded-[32px] md:p-8">
          <p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-text-secondary sm:text-[10px] sm:tracking-[0.16em]">TODAY</p>
          <div className="mt-5 grid grid-cols-3 gap-5 sm:mt-6 sm:gap-6 md:gap-12">
            <div>
              <p className="text-[clamp(2rem,7vw,4rem)] font-extrabold leading-none tracking-[-0.05em] text-accent-primary">
                ₹{Math.round(todayEarnings)}
              </p>
              <p className="mt-1.5 font-mono text-[9px] font-semibold tracking-[0.12em] text-text-tertiary sm:mt-2 sm:text-[10px]">
                EARNED
              </p>
            </div>
            <div className="border-l border-status-subtle pl-5 sm:pl-6 md:pl-12">
              <p className="text-[clamp(2rem,7vw,4rem)] font-extrabold leading-none tracking-[-0.05em] text-text-navy">
                {activeJobs.length}
              </p>
              <p className="mt-1.5 font-mono text-[9px] font-semibold tracking-[0.12em] text-text-tertiary sm:mt-2 sm:text-[10px]">
                ACTIVE
              </p>
            </div>
            <div className="border-l border-status-subtle pl-5 sm:pl-6 md:pl-12">
              <p className="text-[clamp(2rem,7vw,4rem)] font-extrabold leading-none tracking-[-0.05em] text-text-navy">
                {completedToday.length}
              </p>
              <p className="mt-1.5 font-mono text-[9px] font-semibold tracking-[0.12em] text-text-tertiary sm:mt-2 sm:text-[10px]">
                COMPLETED
              </p>
            </div>
          </div>
        </section>

        {/* Incoming Job Request */}
        {available && incomingJob && (
          <section className="relative min-h-[300px] overflow-hidden rounded-[24px] border border-accent-primary/20 bg-accent-light/30 p-5 sm:min-h-[340px] sm:rounded-[28px] sm:p-6 md:min-h-[380px] md:rounded-[32px] md:p-8">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <img
                src={illustrationByService[incomingJob.service_category_name] || '/illustrations/worker-job.png'}
                alt=""
                className="absolute bottom-[-10%] right-[-12%] h-[103%] w-auto max-w-none opacity-35 sm:bottom-[-8%] sm:right-[-10%] sm:h-[105%] sm:opacity-40 md:bottom-[-5%] md:right-[-8%] md:h-[110%]"
                style={{ objectFit: 'contain', objectPosition: 'bottom right' }}
              />
            </div>

            <div className="relative z-10 flex flex-col gap-5 sm:gap-6">
              <div className="flex flex-col gap-3.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-accent-primary sm:text-[10px] sm:tracking-[0.16em]">
                    NEW SERVICE REQUEST
                  </p>
                  <h2 className="mt-3.5 text-2xl font-extrabold leading-tight tracking-[-0.055em] text-text-navy sm:mt-4 sm:text-3xl md:text-4xl">
                    {incomingJob.service_category_name}
                  </h2>
                  <p className="mt-1.5 text-base font-semibold text-text-secondary sm:mt-2 sm:text-lg">
                    {incomingJob.service_subcategory_name || incomingJob.description?.slice(0, 40)}
                  </p>

                  <div className="mt-4 space-y-1.5 sm:mt-5 sm:space-y-2">
                    <div className="flex items-center gap-2 text-xs text-text-secondary sm:text-sm">
                      <MapPin size={14} className="text-accent-primary sm:h-4 sm:w-4" />
                      <span className="font-medium">{incomingJob.customer_address?.split(',')[0]}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-text-secondary line-clamp-2 sm:text-sm">
                      {incomingJob.description}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 text-left sm:text-right">
                  <p className="text-3xl font-extrabold tracking-[-0.05em] text-accent-primary sm:text-4xl md:text-5xl">
                    ₹{Math.round((incomingJob.estimated_price || 500) * 0.85)}
                  </p>
                  <p className="mt-0.5 font-mono text-[8px] tracking-[0.1em] text-text-tertiary sm:mt-1 sm:text-[9px]">
                    ESTIMATED EARNING
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate(`/job/${incomingJob.id}`)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-primary px-5 py-3.5 text-xs font-semibold text-white transition-all hover:bg-accent-hover active:scale-[0.98] sm:w-auto sm:px-6 sm:py-4 sm:text-sm"
              >
                VIEW & ACCEPT JOB
                <ArrowRight size={16} strokeWidth={2.5} className="sm:h-[18px] sm:w-[18px]" />
              </button>
            </div>
          </section>
        )}

        {/* Active Jobs Section */}
        {activeJobs.length > 0 && (
          <section className="space-y-6">
            <div>
              <p className="font-mono text-[11px] font-semibold tracking-[0.16em] text-text-secondary">
                ACTIVE WORK
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.055em] text-text-navy md:text-4xl">
                Jobs in Progress
              </h2>
            </div>
            <div className="space-y-5">
              {activeJobs.map((job) => (
                <article
                  key={job.id}
                  onClick={() => navigate(`/job/${job.id}`)}
                  className="cursor-pointer overflow-hidden rounded-[24px] border border-status-subtle bg-white transition-all hover:shadow-lg sm:rounded-[28px] md:rounded-[32px]"
                >
                  <div className="p-5 sm:p-6 md:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.1em] ${
                          job.status === 'in_progress'
                            ? 'bg-accent-light text-accent-primary'
                            : 'bg-yellow-50 text-yellow-700'
                        }`}>
                          {job.status === 'in_progress' ? 'IN PROGRESS' : 'ACCEPTED'}
                        </span>
                        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.08em] text-text-tertiary">
                          {job.service_category_name}
                        </p>
                        <h3 className="mt-1.5 text-xl font-extrabold tracking-[-0.04em] text-text-navy">
                          {job.service_subcategory_name || job.description?.slice(0, 50)}
                        </h3>
                        <div className="mt-3 space-y-1.5">
                          <div className="flex items-center gap-2 text-sm text-text-secondary">
                            <User size={15} className="text-accent-primary" strokeWidth={2} />
                            <span className="font-medium">{job.customer_name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-text-secondary">
                            <MapPin size={15} className="text-accent-primary" strokeWidth={2} />
                            <span>{job.customer_address?.split(',').slice(0, 2).join(',')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-3xl font-extrabold tracking-[-0.05em] text-accent-primary">
                          ₹{Math.round((job.actual_price || job.estimated_price || 500) * 0.85)}
                        </p>
                        <p className="mt-1 font-mono text-[9px] tracking-[0.08em] text-text-tertiary">
                          YOUR EARNING
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
          {/* Skill Passport Card */}
          <button
            onClick={() => navigate('/passport')}
            className="group relative min-h-[220px] overflow-hidden rounded-[24px] border border-status-subtle bg-[#f3e5f5] p-5 text-left transition-all hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] sm:min-h-[240px] sm:rounded-[28px] sm:p-6 md:rounded-[32px] md:p-8"
          >
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <img
                src="/illustrations/worker-passport.png"
                alt=""
                className="absolute bottom-[-10%] right-[-12%] h-[98%] w-auto max-w-none opacity-55 transition-all duration-500 group-hover:opacity-75 group-hover:scale-105 sm:bottom-[-8%] sm:right-[-10%] sm:h-[100%] sm:opacity-60 md:bottom-[-6%] md:right-[-8%]"
                style={{ objectFit: 'contain', objectPosition: 'bottom right' }}
              />
            </div>
            <div className="relative z-10 flex h-full flex-col">
              <div className="max-w-[72%] sm:max-w-[70%]">
                <p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-text-secondary sm:text-[10px] sm:tracking-[0.16em]">
                  YOUR IDENTITY
                </p>
                <h3 className="mt-2.5 text-2xl font-extrabold leading-tight tracking-[-0.055em] text-text-navy sm:mt-3 sm:text-3xl md:text-4xl">
                  Skill Passport
                </h3>
                <p className="mt-2.5 text-xs leading-relaxed text-text-secondary sm:mt-3 sm:text-sm">
                  Verified skills, certifications and training progress
                </p>
              </div>
              <div className="mt-auto pt-5 sm:pt-6">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary transition-transform group-hover:translate-x-1 sm:gap-2 sm:text-sm">
                  VIEW PASSPORT <ArrowRight size={14} strokeWidth={2.5} className="sm:h-4 sm:w-4" />
                </span>
              </div>
            </div>
          </button>

          {/* Training Hub Card */}
          <button
            onClick={() => {/* Training navigation */}}
            className="group relative min-h-[220px] overflow-hidden rounded-[24px] border border-status-subtle bg-[#fff3e0] p-5 text-left transition-all hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] sm:min-h-[240px] sm:rounded-[28px] sm:p-6 md:rounded-[32px] md:p-8"
          >
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <img
                src="/illustrations/worker-training.png"
                alt=""
                className="absolute bottom-[-10%] right-[-12%] h-[98%] w-auto max-w-none opacity-55 transition-all duration-500 group-hover:opacity-75 group-hover:scale-105 sm:bottom-[-8%] sm:right-[-10%] sm:h-[100%] sm:opacity-60 md:bottom-[-6%] md:right-[-8%]"
                style={{ objectFit: 'contain', objectPosition: 'bottom right' }}
              />
            </div>
            <div className="relative z-10 flex h-full flex-col">
              <div className="max-w-[72%] sm:max-w-[70%]">
                <p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-text-secondary sm:text-[10px] sm:tracking-[0.16em]">
                  SKILL DEVELOPMENT
                </p>
                <h3 className="mt-2.5 text-2xl font-extrabold leading-tight tracking-[-0.055em] text-text-navy sm:mt-3 sm:text-3xl md:text-4xl">
                  Training Hub
                </h3>
                <p className="mt-2.5 text-xs leading-relaxed text-text-secondary sm:mt-3 sm:text-sm">
                  Continue learning and earn new certifications
                </p>
              </div>
              <div className="mt-auto pt-5 sm:pt-6">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary transition-transform group-hover:translate-x-1 sm:gap-2 sm:text-sm">
                  CONTINUE TRAINING <ArrowRight size={14} strokeWidth={2.5} className="sm:h-4 sm:w-4" />
                </span>
              </div>
            </div>
          </button>
        </section>

        {/* Recent Completed Jobs */}
        {jobs.filter((j) => j.status === 'completed').length > 0 && (
          <section className="space-y-6">
            <div>
              <p className="font-mono text-[11px] font-semibold tracking-[0.16em] text-text-secondary">
                RECENT WORK
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.055em] text-text-navy md:text-4xl">
                Completed Jobs
              </h2>
            </div>
            <div className="space-y-4">
              {jobs
                .filter((j) => j.status === 'completed')
                .slice(0, 5)
                .map((job) => (
                  <article
                    key={job.id}
                    className="overflow-hidden rounded-[24px] border border-status-subtle bg-white p-5 transition-all hover:bg-background-primary md:p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="inline-flex rounded-full bg-green-50 px-3 py-1 font-mono text-[9px] font-bold tracking-[0.1em] text-green-700">
                            COMPLETED
                          </span>
                          {job.review?.rating && (
                            <span className="text-sm font-semibold text-text-navy">
                              ★ {Number(job.review.rating).toFixed(1)}
                            </span>
                          )}
                        </div>
                        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.08em] text-text-tertiary">
                          {job.service_category_name}
                        </p>
                        <h3 className="mt-1 text-lg font-extrabold tracking-[-0.03em] text-text-navy md:text-xl">
                          {job.service_subcategory_name || job.description?.slice(0, 50)}
                        </h3>
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-secondary">
                          <span>{job.customer_name}</span>
                          <span>·</span>
                          <span>{job.customer_address?.split(',').slice(0, 2).join(',')}</span>
                          {job.updated_at && (
                            <>
                              <span>·</span>
                              <span>{new Date(job.updated_at).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-left sm:text-right">
                        <p className="text-2xl font-extrabold tracking-[-0.04em] text-text-navy md:text-3xl">
                          ₹{Math.round((job.actual_price || job.estimated_price || 0) * 0.85)}
                        </p>
                        <p className="mt-1 font-mono text-[9px] tracking-[0.08em] text-text-tertiary">
                          EARNED
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
            </div>
          </section>
        )}

        {/* Empty state when no jobs */}
        {jobs.length === 0 && (
          <section className="rounded-[24px] border border-status-subtle bg-white p-8 text-center sm:rounded-[28px] md:rounded-[32px]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-light">
              <Wrench size={24} className="text-accent-primary" />
            </div>
            <h3 className="text-lg font-extrabold text-text-navy">No jobs yet</h3>
            <p className="mt-2 text-sm text-text-secondary">
              Stay available to receive new service requests from nearby customers.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
