/**
 * Operations Dashboard
 * 
 * PRIORITY SCREEN #4: Cooperative operations with KPIs and workforce map
 * Phase 3: Premium editorial redesign - Workforce Intelligence Control Layer
 * 
 * Validates Requirements: 6.1-6.7, 14.5, 16.5, 7.1-7.5
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, GraduationCap, MapPin, Clock, User, Users, Briefcase, DollarSign, Activity, ArrowRight } from 'lucide-react';
import { useMockData } from '../../contexts/MockDataContext';

export function OperationsDashboard() {
  const navigate = useNavigate();
  const { jobs, workers } = useMockData();

  // Get active jobs (in-progress and accepted)
  const activeJobs = jobs.filter(job => 
    job.status === 'in-progress' || job.status === 'accepted'
  );

  // Get today's completed jobs
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const completedToday = jobs.filter(job => {
    if (job.status !== 'completed' || !job.completedAt) return false;
    const completedDate = new Date(job.completedAt);
    completedDate.setHours(0, 0, 0, 0);
    return completedDate.getTime() === today.getTime();
  });

  // Calculate today's revenue
  const todayRevenue = completedToday.reduce((sum, job) => sum + (job.actualPrice || job.estimatedPrice), 0);
  const cooperativeShare = todayRevenue * 0.15;

  // Count available workers
  const availableWorkers = workers.filter(w => w.available).length;

  const kpis = {
    activeJobs: activeJobs.length,
    availableWorkers: availableWorkers,
    totalWorkers: workers.length,
    completedToday: completedToday.length,
    todayRevenue: todayRevenue,
    cooperativeShare: cooperativeShare,
    workerEarnings: todayRevenue * 0.85
  };

  // Simulated Pune workforce areas
  const workforceAreas = [
    { name: 'Kothrud', workers: 186, available: 42, demand: 'HIGH', intensity: 'high', activeJobs: 28 },
    { name: 'Baner', workers: 142, available: 38, demand: 'BALANCED', intensity: 'medium', activeJobs: 18 },
    { name: 'Wakad', workers: 98, available: 12, demand: 'SHORTAGE', intensity: 'high', activeJobs: 24 },
    { name: 'Aundh', workers: 156, available: 52, demand: 'CAPACITY', intensity: 'low', activeJobs: 12 },
    { name: 'Viman Nagar', workers: 124, available: 28, demand: 'BALANCED', intensity: 'medium', activeJobs: 16 },
    { name: 'Shivajinagar', workers: 142, available: 34, demand: 'HIGH', intensity: 'high', activeJobs: 22 }
  ];

  return (
    <main className="mx-auto min-h-screen max-w-[1400px] px-4 py-6 sm:px-5 sm:py-8 md:px-10 md:py-14">
      <div className="space-y-6 sm:space-y-8 md:space-y-12">
        {/* Hero Section with Cooperative Identity */}
        <section className="overflow-hidden rounded-[28px] border border-status-subtle bg-[#eaf1f8] sm:rounded-[36px] md:rounded-[36px]">
          {/* Mobile: Vertical composition - Content zone above, illustration zone below */}
          <div className="flex flex-col md:hidden">
            {/* Content Zone */}
            <div className="p-5 pb-6">
              <p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-text-secondary">
                COOPERATIVE NETWORK
              </p>
              <h1 className="mt-3 text-[2rem] font-extrabold leading-[0.88] tracking-[-0.07em] text-text-navy">
                Workforce<br />Operations
              </h1>
              
              <div className="mt-4">
                <p className="font-mono text-[8px] font-semibold tracking-[0.12em] text-accent-primary">
                  PUNE · DEMO NETWORK
                </p>
              </div>
              
              {/* Key Metrics - Compact 2-column grid */}
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <p className="font-mono text-[8px] font-semibold tracking-[0.12em] text-text-tertiary">
                    TOTAL WORKERS
                  </p>
                  <p className="mt-1 text-2xl font-extrabold tracking-[-0.04em] text-text-navy">
                    {kpis.totalWorkers}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[8px] font-semibold tracking-[0.12em] text-text-tertiary">
                    AVAILABLE NOW
                  </p>
                  <p className="mt-1 text-2xl font-extrabold tracking-[-0.04em] text-accent-primary">
                    {kpis.availableWorkers}
                  </p>
                </div>
              </div>
            </div>

            {/* Illustration Zone - Separate from content */}
            <div className="relative h-[180px] overflow-hidden">
              <img 
                src="/illustrations/cooperative-hero.png" 
                alt="" 
                className="absolute bottom-0 right-[-8%] h-[140%] w-auto"
                style={{ objectFit: 'contain', objectPosition: 'bottom right' }}
              />
            </div>
          </div>

          {/* Desktop: Layered composition - Keep existing sophisticated layout */}
          <div className="relative hidden min-h-[500px] p-12 md:block">
            {/* Background illustration layer */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <img 
                src="/illustrations/cooperative-hero.png" 
                alt="" 
                className="absolute bottom-[-5%] right-[-8%] h-[120%] w-auto max-w-none"
                style={{ objectFit: 'contain', objectPosition: 'bottom right' }}
              />
            </div>
            
            {/* Content layer */}
            <div className="relative z-10 flex h-full min-h-[300px] flex-col">
              <div className="max-w-[55%]">
                <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-text-secondary">
                  COOPERATIVE NETWORK
                </p>
                <h1 className="mt-4 text-[4.5rem] font-extrabold leading-[0.88] tracking-[-0.07em] text-text-navy">
                  Workforce<br />Operations
                </h1>
                
                <div className="mt-6 space-y-3">
                  <p className="text-xl font-semibold tracking-[-0.02em] text-text-navy">
                    ShramSangam
                  </p>
                  <p className="text-base leading-relaxed text-text-secondary">
                    Local Skills. Shared Opportunity.
                  </p>
                </div>
              </div>
              
              {/* Network Stats Row */}
              <div className="mt-auto grid max-w-lg grid-cols-2 gap-6 pt-8">
                <div>
                  <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-text-tertiary">
                    TOTAL WORKERS
                  </p>
                  <p className="mt-2 text-4xl font-extrabold tracking-[-0.04em] text-text-navy">
                    {kpis.totalWorkers}
                  </p>
                </div>
                <div className="border-l border-text-navy/10 pl-6">
                  <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-text-tertiary">
                    AVAILABLE NOW
                  </p>
                  <p className="mt-2 text-4xl font-extrabold tracking-[-0.04em] text-accent-primary">
                    {kpis.availableWorkers}
                  </p>
                </div>
              </div>
              
              {/* Network Label */}
              <div className="mt-4">
                <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-accent-primary">
                  PUNE · DEMO NETWORK
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Today's Network - Compact 2x2 grid on mobile */}
        <section className="overflow-hidden rounded-[24px] border border-status-subtle bg-white p-4 sm:rounded-[32px] sm:p-6 md:p-8">
          <p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-text-secondary sm:text-[10px] sm:tracking-[0.16em]">
            TODAY'S NETWORK
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:mt-6 sm:gap-6 md:grid-cols-3 md:gap-12">
            <div>
              <div className="mb-2 flex items-center gap-2 sm:mb-3">
                <Activity size={16} className="text-accent-primary sm:h-5 sm:w-5" />
                <p className="font-mono text-[8px] font-semibold tracking-[0.12em] text-text-tertiary sm:text-[9px]">
                  ACTIVE
                </p>
              </div>
              <p className="text-[clamp(2rem,7vw,4rem)] font-extrabold leading-none tracking-[-0.05em] text-text-navy">
                {kpis.activeJobs}
              </p>
            </div>
            <div className="border-l border-status-subtle pl-4 sm:pl-6 md:pl-12">
              <div className="mb-2 flex items-center gap-2 sm:mb-3">
                <Briefcase size={16} className="text-accent-primary sm:h-5 sm:w-5" />
                <p className="font-mono text-[8px] font-semibold tracking-[0.12em] text-text-tertiary sm:text-[9px]">
                  DONE
                </p>
              </div>
              <p className="text-[clamp(2rem,7vw,4rem)] font-extrabold leading-none tracking-[-0.05em] text-text-navy">
                {kpis.completedToday}
              </p>
            </div>
            <div className="col-span-2 border-t border-status-subtle pt-4 md:col-span-1 md:border-l md:border-t-0 md:pl-12 md:pt-0">
              <div className="mb-2 flex items-center gap-2 sm:mb-3">
                <DollarSign size={16} className="text-accent-primary sm:h-5 sm:w-5" />
                <p className="font-mono text-[8px] font-semibold tracking-[0.12em] text-text-tertiary sm:text-[9px]">
                  EARNINGS
                </p>
              </div>
              <p className="text-[clamp(1.75rem,6vw,3rem)] font-extrabold leading-none tracking-[-0.05em] text-accent-primary">
                ₹{(kpis.workerEarnings / 100000).toFixed(1)}L
              </p>
            </div>
          </div>
        </section>

        {/* Workforce Network Map - Mobile-optimized grid */}
        <section className="space-y-4 sm:space-y-6">
          <div>
            <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-text-secondary sm:text-[11px] sm:tracking-[0.16em]">
              WORKFORCE NETWORK
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.055em] text-text-navy sm:text-3xl md:text-4xl">
              Where workers are available.
            </h2>
          </div>

          {/* Network Map Grid - Single column on mobile, responsive grid on larger screens */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {workforceAreas.map((area, index) => (
              <article 
                key={index}
                className={`group relative overflow-hidden rounded-[20px] border p-4 transition-all hover:shadow-lg sm:rounded-[24px] sm:p-5 md:p-6 ${
                  area.intensity === 'high' 
                    ? 'border-accent-primary/30 bg-accent-light/40' 
                    : area.intensity === 'medium'
                    ? 'border-status-subtle bg-[#f3f3f3]'
                    : 'border-status-subtle bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-extrabold tracking-[-0.04em] text-text-navy sm:text-2xl">
                      {area.name}
                    </h3>
                    <p className={`mt-1 font-mono text-[9px] font-bold tracking-[0.1em] sm:text-[10px] ${
                      area.intensity === 'high' ? 'text-accent-primary' : 'text-text-secondary'
                    }`}>
                      {area.demand}
                    </p>
                  </div>
                  <MapPin 
                    size={24} 
                    className={`sm:h-7 sm:w-7 ${area.intensity === 'high' ? 'text-accent-primary' : 'text-text-secondary'}`} 
                    strokeWidth={2}
                  />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 sm:mt-5 sm:gap-4">
                  <div>
                    <p className="font-mono text-[8px] font-semibold tracking-[0.12em] text-text-tertiary sm:text-[9px]">
                      WORKERS
                    </p>
                    <p className="mt-1 text-lg font-extrabold tracking-[-0.04em] text-text-navy sm:text-xl md:text-2xl">
                      {area.workers}
                    </p>
                  </div>
                  <div className="border-l border-text-navy/10 pl-3 sm:pl-4">
                    <p className="font-mono text-[8px] font-semibold tracking-[0.12em] text-text-tertiary sm:text-[9px]">
                      AVAIL
                    </p>
                    <p className="mt-1 text-lg font-extrabold tracking-[-0.04em] text-accent-primary sm:text-xl md:text-2xl">
                      {area.available}
                    </p>
                  </div>
                  <div className="border-l border-text-navy/10 pl-3 sm:pl-4">
                    <p className="font-mono text-[8px] font-semibold tracking-[0.12em] text-text-tertiary sm:text-[9px]">
                      ACTIVE
                    </p>
                    <p className="mt-1 text-lg font-extrabold tracking-[-0.04em] text-text-navy sm:text-xl md:text-2xl">
                      {area.activeJobs}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Legend - Compact on mobile */}
          <div className="rounded-[18px] border border-status-subtle bg-white p-4 sm:rounded-[20px] sm:p-5">
            <p className="mb-2 font-mono text-[8px] font-semibold tracking-[0.12em] text-text-tertiary sm:mb-3 sm:text-[9px]">
              DEMAND INTENSITY
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 sm:gap-x-6">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full border-2 border-accent-primary bg-accent-light sm:h-3 sm:w-3" />
                <span className="text-xs text-text-secondary sm:text-sm">High Demand</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full border-2 border-status-subtle bg-[#f3f3f3] sm:h-3 sm:w-3" />
                <span className="text-xs text-text-secondary sm:text-sm">Balanced</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full border-2 border-status-subtle bg-white sm:h-3 sm:w-3" />
                <span className="text-xs text-text-secondary sm:text-sm">Capacity</span>
              </div>
            </div>
            <p className="mt-2 font-mono text-[8px] tracking-[0.08em] text-text-tertiary sm:mt-3 sm:text-[9px]">
              * SIMULATED PUNE NETWORK DATA
            </p>
          </div>
        </section>

        {/* Intelligence Action Cards - Mobile optimized */}
        <section className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
          {/* Demand Intelligence Card */}
          <button
            onClick={() => navigate('/intelligence/demand')}
            className="group relative min-h-[220px] overflow-hidden rounded-[24px] border border-status-subtle bg-[#e3f2fd] p-5 text-left transition-all hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] sm:min-h-[240px] sm:rounded-[28px] sm:p-6 md:rounded-[32px] md:p-8"
          >
            <div className="relative z-10 flex h-full flex-col">
              <div className="max-w-[75%]">
                <p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-accent-primary sm:text-[10px] sm:tracking-[0.16em]">
                  AI-POWERED · SIMULATED
                </p>
                <h3 className="mt-2.5 text-2xl font-extrabold leading-tight tracking-[-0.055em] text-text-navy sm:mt-3 sm:text-3xl md:text-4xl">
                  Demand Intelligence
                </h3>
                <p className="mt-2.5 text-xs leading-relaxed text-text-secondary sm:mt-3 sm:text-sm">
                  7-day demand forecasting with shortage alerts
                </p>
              </div>
              <div className="mt-auto pt-5 sm:pt-6">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary transition-transform group-hover:translate-x-1 sm:gap-2 sm:text-sm">
                  VIEW FORECASTS <ArrowRight size={14} strokeWidth={2.5} className="sm:h-4 sm:w-4" />
                </span>
              </div>
            </div>

            {/* Background Icon - Responsive sizing */}
            <div aria-hidden="true" className="pointer-events-none absolute bottom-3 right-3 opacity-20 sm:bottom-4 sm:right-4">
              <TrendingUp size={90} strokeWidth={1} className="text-accent-primary sm:h-[100px] sm:w-[100px] md:h-[120px] md:w-[120px]" />
            </div>
          </button>

          {/* Skill Intelligence Card */}
          <button
            onClick={() => navigate('/intelligence/skills')}
            className="group relative min-h-[220px] overflow-hidden rounded-[24px] border border-status-subtle bg-[#fff3e0] p-5 text-left transition-all hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] sm:min-h-[240px] sm:rounded-[28px] sm:p-6 md:rounded-[32px] md:p-8"
          >
            <div className="relative z-10 flex h-full flex-col">
              <div className="max-w-[75%]">
                <p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-accent-primary sm:text-[10px] sm:tracking-[0.16em]">
                  AI-POWERED · SIMULATED
                </p>
                <h3 className="mt-2.5 text-2xl font-extrabold leading-tight tracking-[-0.055em] text-text-navy sm:mt-3 sm:text-3xl md:text-4xl">
                  Skill Intelligence
                </h3>
                <p className="mt-2.5 text-xs leading-relaxed text-text-secondary sm:mt-3 sm:text-sm">
                  Skill gap analysis and training recommendations
                </p>
              </div>
              <div className="mt-auto pt-5 sm:pt-6">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary transition-transform group-hover:translate-x-1 sm:gap-2 sm:text-sm">
                  VIEW ANALYSIS <ArrowRight size={14} strokeWidth={2.5} className="sm:h-4 sm:w-4" />
                </span>
              </div>
            </div>

            {/* Background Icon - Responsive sizing */}
            <div aria-hidden="true" className="pointer-events-none absolute bottom-3 right-3 opacity-20 sm:bottom-4 sm:right-4">
              <GraduationCap size={90} strokeWidth={1} className="text-accent-primary sm:h-[100px] sm:w-[100px] md:h-[120px] md:w-[120px]" />
            </div>
          </button>
        </section>

        {/* Active Jobs - Mobile optimized Editorial List */}
        <section className="space-y-4 sm:space-y-6">
          <div>
            <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-text-secondary sm:text-[11px] sm:tracking-[0.16em]">
              LIVE OPERATIONS
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.055em] text-text-navy sm:text-3xl md:text-4xl">
              Active Jobs
            </h2>
          </div>
          
          {activeJobs.length === 0 ? (
            <div className="rounded-[20px] border border-status-subtle bg-white p-8 text-center sm:rounded-[24px] sm:p-10 md:rounded-[28px] md:p-12">
              <Users size={40} className="mx-auto text-text-secondary opacity-40 sm:h-[48px] sm:w-[48px]" strokeWidth={1.5} />
              <p className="mt-3 text-sm text-text-secondary sm:mt-4 sm:text-base">No active jobs at the moment</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {activeJobs.map((job) => {
                const worker = workers.find(w => w.id === job.assignedWorkerId);
                
                return (
                  <article 
                    key={job.id}
                    className="overflow-hidden rounded-[20px] border border-status-subtle bg-white p-4 transition-all hover:border-accent-primary/30 hover:bg-accent-light/10 sm:rounded-[24px] sm:p-5 md:p-6"
                  >
                    <div className="flex flex-col gap-3.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <span className={`inline-flex rounded-full px-2.5 py-1 font-mono text-[8px] font-bold tracking-[0.1em] sm:px-3 sm:text-[9px] ${
                            job.status === 'in-progress' 
                              ? 'bg-accent-primary text-white' 
                              : 'bg-text-navy text-white'
                          }`}>
                            {job.status === 'in-progress' ? 'IN PROGRESS' : 'ACCEPTED'}
                          </span>
                          <span className="font-mono text-[9px] tracking-[0.08em] text-text-tertiary sm:text-[10px]">
                            ID: {job.id}
                          </span>
                        </div>
                        <h3 className="mt-2.5 text-lg font-extrabold tracking-[-0.03em] text-text-navy sm:mt-3 sm:text-xl md:text-2xl">
                          {job.serviceCategory} · {job.serviceSubcategory}
                        </h3>
                        <p className="mt-1.5 text-xs leading-relaxed text-text-secondary line-clamp-2 sm:mt-2 sm:text-sm">
                          {job.description}
                        </p>
                        
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-secondary sm:mt-4 sm:gap-x-5 sm:gap-y-2 sm:text-sm">
                          <div className="flex items-center gap-1.5">
                            <User size={14} className="text-text-tertiary sm:h-[15px] sm:w-[15px]" strokeWidth={2} />
                            <span>{job.customerName}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User size={14} className="text-accent-primary sm:h-[15px] sm:w-[15px]" strokeWidth={2} />
                            <span className="font-medium text-text-navy">
                              {worker ? worker.name : 'Assigning...'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-text-tertiary sm:h-[15px] sm:w-[15px]" strokeWidth={2} />
                            <span className="line-clamp-1">{job.customerLocation.address.split(',').slice(0, 2).join(',')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex-shrink-0 text-left sm:text-right">
                        <p className="text-2xl font-extrabold tracking-[-0.04em] text-accent-primary sm:text-3xl md:text-4xl">
                          ₹{job.estimatedPrice}
                        </p>
                        <p className="mt-0.5 font-mono text-[8px] tracking-[0.08em] text-text-tertiary sm:mt-1 sm:text-[9px]">
                          WORKER: ₹{job.workerEarnings}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
