/**
 * Worker Dashboard
 * 
 * PRIORITY SCREEN #2 PART 1: Worker dashboard with availability toggle
 * Phase 2: Premium editorial redesign matching Customer design system
 * 
 * Validates Requirements: 4.1, 4.2
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Award, MapPin, Clock, ArrowRight, Circle, User, ShieldCheck } from 'lucide-react';
import { useMockData } from '../../contexts/MockDataContext';
import { getJobsByWorker, getActiveJobs, getTodayCompletedJobsCount } from '../../data/jobs';

const illustrationByService: Record<string, string> = {
  Plumbing: '/illustrations/plumber.png',
  Electrical: '/illustrations/electrician.png',
  Carpentry: '/illustrations/carpenter.png',
  Painting: '/illustrations/painting.png',
  Cleaning: '/illustrations/cleaning.png',
  'Appliance Repair': '/illustrations/appliance-repair.png'
};

export function WorkerDashboard() {
  const [available, setAvailable] = useState(true);
  const navigate = useNavigate();
  const { workers } = useMockData();
  
  // Get worker data (using W001 - Rajesh Kumar as demo)
  const currentWorker = workers.find(w => w.id === 'W001');
  const workerJobs = getJobsByWorker('W001');
  const activeJobsCount = workerJobs.filter(j => j.status === 'in-progress' || j.status === 'accepted').length;
  const incomingJob = workerJobs.find(j => j.status === 'matched' || j.status === 'pending');
  
  const stats = {
    todayEarnings: currentWorker?.todayEarnings || 0,
    activeJobs: activeJobsCount,
    completedToday: getTodayCompletedJobsCount()
  };

  // Get worker's primary skill
  const primarySkill = currentWorker?.skills[0]?.category || 'Plumbing';

  return (
    <main className="mx-auto min-h-screen max-w-[1400px] px-4 py-6 sm:px-5 sm:py-8 md:px-10 md:py-14">
      <div className="space-y-6 sm:space-y-8 md:space-y-12">
        {/* Hero Panel with Worker Identity & Availability */}
        <section className="overflow-hidden rounded-[28px] border border-status-subtle bg-[#eaf1f8] sm:rounded-[32px] md:rounded-[36px]">
          {/* Mobile: Vertical composition - Content zone above, illustration zone below */}
          <div className="flex flex-col md:hidden">
            {/* Content Zone */}
            <div className="p-5 pb-6">
              <p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-text-secondary">
                COOPERATIVE WORKER
              </p>
              <h1 className="mt-3 text-[2.25rem] font-extrabold leading-[0.88] tracking-[-0.07em] text-text-navy">
                Welcome back,<br />Rajesh.
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
                <div className="relative overflow-hidden rounded-2xl bg-white p-1.5 shadow-sm">
                  {/* Sliding Background */}
                  <div 
                    className={`absolute top-1.5 bottom-1.5 rounded-xl bg-accent-primary shadow-md transition-all duration-300 ease-out ${
                      available ? 'left-1.5 right-1/2 mr-0.5' : 'left-1/2 right-1.5 ml-0.5'
                    }`}
                  />
                  
                  {/* Toggle Options */}
                  <div className="relative grid grid-cols-2 gap-1">
                    <button
                      onClick={() => setAvailable(true)}
                      className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 text-xs font-semibold transition-colors duration-300 ${
                        available ? 'text-white' : 'text-text-secondary'
                      }`}
                    >
                      <Circle 
                        size={7} 
                        fill="currentColor" 
                        className={available ? 'text-green-300' : 'text-transparent'}
                      />
                      <span>Available</span>
                    </button>
                    
                    <button
                      onClick={() => setAvailable(false)}
                      className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 text-xs font-semibold transition-colors duration-300 ${
                        !available ? 'text-white' : 'text-text-secondary'
                      }`}
                    >
                      <Circle 
                        size={7} 
                        fill="currentColor" 
                        className={!available ? 'text-gray-300' : 'text-transparent'}
                      />
                      <span>Offline</span>
                    </button>
                  </div>
                </div>
                {available && (
                  <p className="mt-2.5 text-[10px] text-text-secondary">
                    Receiving nearby service requests
                  </p>
                )}
                {!available && (
                  <p className="mt-2.5 text-[10px] text-text-secondary">
                    Not receiving new requests
                  </p>
                )}
              </div>
            </div>

            {/* Illustration Zone - Separate from content */}
            <div className="relative h-[160px] overflow-hidden">
              <img 
                src="/illustrations/worker-hero.png" 
                alt="" 
                className="absolute bottom-0 right-[-5%] h-[140%] w-auto"
                style={{ objectFit: 'contain', objectPosition: 'bottom right' }}
              />
            </div>
          </div>

          {/* Desktop: Layered composition - Keep existing sophisticated layout */}
          <div className="relative hidden min-h-[500px] p-12 md:block">
            {/* Background illustration layer */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <img 
                src="/illustrations/worker-hero.png" 
                alt="" 
                className="absolute bottom-[-5%] right-[-8%] h-[120%] w-auto max-w-none"
                style={{ objectFit: 'contain', objectPosition: 'bottom right' }}
              />
            </div>
            
            {/* Content layer */}
            <div className="relative z-10 flex h-full flex-col">
              <div className="max-w-[55%]">
                <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-text-secondary">
                  COOPERATIVE WORKER
                </p>
                <h1 className="mt-4 text-[4.5rem] font-extrabold leading-[0.88] tracking-[-0.07em] text-text-navy">
                  Welcome back,<br />Rajesh.
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
                  {/* Sliding Background */}
                  <div 
                    className={`absolute top-1.5 bottom-1.5 rounded-xl bg-accent-primary shadow-md transition-all duration-300 ease-out ${
                      available ? 'left-1.5 right-1/2 mr-0.5' : 'left-1/2 right-1.5 ml-0.5'
                    }`}
                  />
                  
                  {/* Toggle Options */}
                  <div className="relative grid grid-cols-2 gap-1">
                    <button
                      onClick={() => setAvailable(true)}
                      className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-300 ${
                        available ? 'text-white' : 'text-text-secondary'
                      }`}
                    >
                      <Circle 
                        size={8} 
                        fill="currentColor" 
                        className={available ? 'text-green-300' : 'text-transparent'}
                      />
                      <span>Available</span>
                    </button>
                    
                    <button
                      onClick={() => setAvailable(false)}
                      className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-300 ${
                        !available ? 'text-white' : 'text-text-secondary'
                      }`}
                    >
                      <Circle 
                        size={8} 
                        fill="currentColor" 
                        className={!available ? 'text-gray-300' : 'text-transparent'}
                      />
                      <span>Offline</span>
                    </button>
                  </div>
                </div>
                {available && (
                  <p className="mt-3 text-xs text-text-secondary">
                    Receiving nearby service requests
                  </p>
                )}
                {!available && (
                  <p className="mt-3 text-xs text-text-secondary">
                    Not receiving new requests
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Today Metrics - Unified Editorial Panel */}
        <section className="overflow-hidden rounded-[24px] border border-status-subtle bg-white p-5 sm:rounded-[28px] sm:p-6 md:rounded-[32px] md:p-8">
          <p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-text-secondary sm:text-[10px] sm:tracking-[0.16em]">TODAY</p>
          <div className="mt-5 grid grid-cols-3 gap-5 sm:mt-6 sm:gap-6 md:gap-12">
            <div>
              <p className="text-[clamp(2rem,7vw,4rem)] font-extrabold leading-none tracking-[-0.05em] text-accent-primary">
                ₹{stats.todayEarnings}
              </p>
              <p className="mt-1.5 font-mono text-[9px] font-semibold tracking-[0.12em] text-text-tertiary sm:mt-2 sm:text-[10px]">
                EARNED
              </p>
            </div>
            <div className="border-l border-status-subtle pl-5 sm:pl-6 md:pl-12">
              <p className="text-[clamp(2rem,7vw,4rem)] font-extrabold leading-none tracking-[-0.05em] text-text-navy">
                {stats.activeJobs}
              </p>
              <p className="mt-1.5 font-mono text-[9px] font-semibold tracking-[0.12em] text-text-tertiary sm:mt-2 sm:text-[10px]">
                ACTIVE
              </p>
            </div>
            <div className="border-l border-status-subtle pl-5 sm:pl-6 md:pl-12">
              <p className="text-[clamp(2rem,7vw,4rem)] font-extrabold leading-none tracking-[-0.05em] text-text-navy">
                {stats.completedToday}
              </p>
              <p className="mt-1.5 font-mono text-[9px] font-semibold tracking-[0.12em] text-text-tertiary sm:mt-2 sm:text-[10px]">
                COMPLETED
              </p>
            </div>
          </div>
        </section>

        {/* Incoming Job Request - Only shown when available - Mobile optimized */}
        {available && incomingJob && (
          <section className="relative min-h-[300px] overflow-hidden rounded-[24px] border border-accent-primary/20 bg-accent-light/30 p-5 sm:min-h-[340px] sm:rounded-[28px] sm:p-6 md:min-h-[380px] md:rounded-[32px] md:p-8">
            {/* Background illustration */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <img 
                src={illustrationByService[incomingJob.serviceCategory] || '/illustrations/worker-job.png'}
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
                    {incomingJob.serviceCategory}
                  </h2>
                  <p className="mt-1.5 text-base font-semibold text-text-secondary sm:mt-2 sm:text-lg">{incomingJob.serviceSubcategory}</p>
                  
                  <div className="mt-4 space-y-1.5 sm:mt-5 sm:space-y-2">
                    <div className="flex items-center gap-2 text-xs text-text-secondary sm:text-sm">
                      <MapPin size={14} className="text-accent-primary sm:h-4 sm:w-4" />
                      <span className="font-medium">{incomingJob.customerLocation.address.split(',')[0]}</span>
                      <span className="font-mono text-[10px] sm:text-xs">· {(Math.random() * 3 + 1).toFixed(1)} KM</span>
                    </div>
                    <p className="text-xs leading-relaxed text-text-secondary line-clamp-2 sm:text-sm">{incomingJob.description}</p>
                  </div>
                </div>
                <div className="flex-shrink-0 text-left sm:text-right">
                  <p className="text-3xl font-extrabold tracking-[-0.05em] text-accent-primary sm:text-4xl md:text-5xl">
                    ₹{incomingJob.workerEarnings}
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
        {workerJobs.filter(j => j.status === 'in-progress' || j.status === 'accepted').length > 0 && (
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
              {workerJobs
                .filter(j => j.status === 'in-progress' || j.status === 'accepted')
                .map((job) => (
                  <article 
                    key={job.id}
                    className="overflow-hidden rounded-[24px] border border-status-subtle bg-white transition-all hover:shadow-lg sm:rounded-[28px] md:rounded-[32px]"
                  >
                    {/* Mobile: Vertical composition - Content, Illustration, Timeline separated */}
                    <div className="flex flex-col md:hidden">
                      {/* Content Zone */}
                      <div className="p-5">
                        <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.1em] ${
                          job.status === 'in-progress' 
                            ? 'bg-accent-light text-accent-primary' 
                            : 'bg-yellow-50 text-yellow-700'
                        }`}>
                          {job.status === 'in-progress' ? 'IN PROGRESS' : 'ACCEPTED'}
                        </span>
                        
                        <p className="mt-3.5 font-mono text-[11px] uppercase tracking-[0.08em] text-text-tertiary">
                          {job.serviceCategory}
                        </p>
                        <h3 className="mt-1.5 text-xl font-extrabold tracking-[-0.04em] text-text-navy">
                          {job.serviceSubcategory}
                        </h3>
                        
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center gap-2 text-sm text-text-secondary">
                            <User size={15} className="text-accent-primary" strokeWidth={2} />
                            <span className="font-medium">{job.customerName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-text-secondary">
                            <MapPin size={15} className="text-accent-primary" strokeWidth={2} />
                            <span>{job.customerLocation.address.split(',').slice(0, 2).join(',')}</span>
                          </div>
                        </div>

                        <div className="mt-5 pt-5 border-t border-status-subtle">
                          <p className="text-3xl font-extrabold tracking-[-0.05em] text-accent-primary">
                            ₹{job.workerEarnings}
                          </p>
                          <p className="mt-1 font-mono text-[9px] tracking-[0.08em] text-text-tertiary">
                            YOUR EARNING
                          </p>
                        </div>
                      </div>

                      {/* Illustration Zone - Separate visual area */}
                      <div className="relative h-[140px] overflow-hidden bg-background-primary">
                        <img 
                          src={illustrationByService[job.serviceCategory]}
                          alt="" 
                          className="absolute bottom-0 right-[-8%] h-[130%] w-auto opacity-40"
                          style={{ objectFit: 'contain', objectPosition: 'bottom right' }}
                        />
                      </div>

                      {/* Timeline Zone */}
                      {job.status === 'in-progress' && (
                        <div className="p-5 border-t border-status-subtle bg-white">
                          <div className="space-y-3">
                            {['ACCEPTED', 'ON THE WAY', 'ARRIVED', 'SERVICE', 'COMPLETED'].map((step, index) => (
                              <div key={step} className="flex items-center gap-3">
                                <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
                                  index <= 2 ? 'bg-accent-primary' : 'bg-status-subtle'
                                }`}>
                                  {index <= 2 && (
                                    <div className="h-2 w-2 rounded-full bg-white" />
                                  )}
                                </div>
                                <span className={`font-mono text-[10px] font-semibold tracking-[0.08em] ${
                                  index <= 2 ? 'text-accent-primary' : 'text-text-tertiary'
                                }`}>
                                  {step}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Desktop: Layered composition - Keep existing sophisticated layout */}
                    <div className="group relative hidden min-h-[280px] p-8 md:block">
                      {/* Background illustration */}
                      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                        <img 
                          src={illustrationByService[job.serviceCategory]}
                          alt="" 
                          className="absolute bottom-[-8%] right-[-6%] h-[100%] w-auto max-w-none opacity-20 transition-all duration-500 group-hover:opacity-30 group-hover:scale-105"
                          style={{ objectFit: 'contain', objectPosition: 'bottom right' }}
                        />
                      </div>

                      <div className="relative z-10 flex flex-col gap-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.1em] ${
                              job.status === 'in-progress' 
                                ? 'bg-accent-light text-accent-primary' 
                                : 'bg-yellow-50 text-yellow-700'
                            }`}>
                              {job.status === 'in-progress' ? 'IN PROGRESS' : 'ACCEPTED'}
                            </span>
                            <p className="mt-4 text-sm font-mono uppercase tracking-[0.08em] text-text-tertiary">
                              {job.serviceCategory}
                            </p>
                            <h3 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-text-navy">
                              {job.serviceSubcategory}
                            </h3>
                            <div className="mt-4 space-y-2">
                              <div className="flex items-center gap-2 text-sm text-text-secondary">
                                <User size={16} className="text-accent-primary" />
                                <span className="font-medium">{job.customerName}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-text-secondary">
                                <MapPin size={16} className="text-accent-primary" />
                                <span>{job.customerLocation.address.split(',').slice(0, 2).join(',')}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <p className="text-5xl font-extrabold tracking-[-0.05em] text-accent-primary">
                              ₹{job.workerEarnings}
                            </p>
                            <p className="mt-1 font-mono text-[9px] tracking-[0.08em] text-text-tertiary">
                              YOUR EARNING
                            </p>
                          </div>
                        </div>

                        {/* Job Status Timeline */}
                        {job.status === 'in-progress' && (
                          <div className="mt-2 border-t border-status-subtle pt-5">
                            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                              {['ACCEPTED', 'ON THE WAY', 'ARRIVED', 'SERVICE', 'COMPLETED'].map((step, index) => (
                                <React.Fragment key={step}>
                                  <div className="flex items-center gap-2">
                                    <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
                                      index <= 2 ? 'bg-accent-primary' : 'bg-status-subtle'
                                    }`}>
                                      {index <= 2 && (
                                        <div className="h-2 w-2 rounded-full bg-white" />
                                      )}
                                    </div>
                                    <span className={`whitespace-nowrap font-mono text-[9px] font-semibold tracking-[0.08em] ${
                                      index <= 2 ? 'text-accent-primary' : 'text-text-tertiary'
                                    }`}>
                                      {step}
                                    </span>
                                  </div>
                                  {index < 4 && (
                                    <div className={`h-px w-4 flex-shrink-0 ${
                                      index < 2 ? 'bg-accent-primary' : 'bg-status-subtle'
                                    }`} />
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
            </div>
          </section>
        )}

        {/* Quick Actions - Skill Passport & Training - Mobile optimized */}
        <section className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
          {/* Skill Passport Card */}
          <button
            onClick={() => navigate('/passport')}
            className="group relative min-h-[220px] overflow-hidden rounded-[24px] border border-status-subtle bg-[#f3e5f5] p-5 text-left transition-all hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] sm:min-h-[240px] sm:rounded-[28px] sm:p-6 md:rounded-[32px] md:p-8"
          >
            {/* Background illustration */}
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
            {/* Background illustration */}
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
        {workerJobs.filter(j => j.status === 'completed').length > 0 && (
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
              {workerJobs
                .filter(j => j.status === 'completed')
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
                          {job.rating && (
                            <span className="text-sm font-semibold text-text-navy">
                              ★ {job.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.08em] text-text-tertiary">
                          {job.serviceCategory}
                        </p>
                        <h3 className="mt-1 text-lg font-extrabold tracking-[-0.03em] text-text-navy md:text-xl">
                          {job.serviceSubcategory}
                        </h3>
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-secondary">
                          <span>{job.customerName}</span>
                          <span>·</span>
                          <span>{job.customerLocation.address.split(',').slice(0, 2).join(',')}</span>
                          {job.completedAt && (
                            <>
                              <span>·</span>
                              <span>{new Date(job.completedAt).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-left sm:text-right">
                        <p className="text-2xl font-extrabold tracking-[-0.04em] text-text-navy md:text-3xl">
                          ₹{job.workerEarnings}
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
      </div>
    </main>
  );
}
