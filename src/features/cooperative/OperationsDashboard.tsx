/**
 * Operations Dashboard - Connected to real backend API
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  GraduationCap,
  MapPin,
  User,
  Users,
  Briefcase,
  DollarSign,
  Activity,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
  Award,
  Radio,
  Layers,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { adminApi, jobsApi } from '../../lib/api';

export function OperationsDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<any>(null);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [pendingWorkers, setPendingWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);

  const fetchDashboardData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [dashRes, jobsRes, workersRes] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getJobs({ limit: 10 }),
        adminApi.getWorkers({ status: 'pending' }),
      ]);

      setDashboard(dashRes);
      setRecentJobs(jobsRes?.jobs || []);
      setPendingWorkers(workersRes?.workers || []);
    } catch (err: any) {
      console.error('Failed to load operations dashboard data:', err);
      setError(err?.message || 'Failed to connect to backend operations API. Please check your network or credentials.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const approveWorker = async (workerId: string) => {
    setApproving(workerId);
    try {
      await adminApi.approveWorker(workerId);
      setPendingWorkers(p => p.filter(w => w.id !== workerId));
      fetchDashboardData(true);
    } catch (e: any) {
      console.error('Approve worker failed', e);
      alert(e?.message || 'Failed to approve worker');
    } finally {
      setApproving(null);
    }
  };

  const rejectWorker = async (workerId: string) => {
    setApproving(workerId);
    try {
      await adminApi.rejectWorker(workerId, 'Does not meet cooperative standards');
      setPendingWorkers(p => p.filter(w => w.id !== workerId));
      fetchDashboardData(true);
    } catch (e: any) {
      console.error('Reject worker failed', e);
      alert(e?.message || 'Failed to reject worker');
    } finally {
      setApproving(null);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const overview = dashboard?.overview || {};
  const financials = dashboard?.financials || {};
  const performance = dashboard?.performance || {};

  const kpis = {
    totalWorkers: overview.total_workers ?? 0,
    availableWorkers: overview.available_workers ?? 0,
    verifiedWorkers: overview.verified_workers ?? 0,
    pendingVerifications: overview.pending_verifications ?? pendingWorkers.length,
    localSkills: overview.local_skills ?? 0,
    uniqueSkillsList: overview.unique_skills ?? [],
    sharedOpportunities: overview.shared_opportunities ?? 0,
    networks: overview.networks ?? 3,
    activeJobs: overview.active_jobs ?? 0,
    completedJobs: overview.completed_jobs ?? 0,
    completedToday: performance.today_jobs ?? 0,
    totalRevenue: financials.total_completed_job_value ?? financials.total_revenue ?? 0,
    platformEarnings: financials.total_platform_earnings ?? financials.platform_earnings ?? 0,
    workerEarnings: financials.total_worker_earnings ?? financials.worker_earnings ?? 0,
    commissionRate: financials.commission_rate ?? 0.15,
    monthlyBreakdown: financials.monthly_breakdown ?? [],
  };

  // Real workforce areas from backend with fallback
  const workforceAreas = dashboard?.workforce_areas?.length > 0
    ? dashboard.workforce_areas
    : [
        { name: 'Kothrud', workers: 18, available: 12, demand: 'HIGH', intensity: 'high', activeJobs: 6 },
        { name: 'Baner', workers: 14, available: 9, demand: 'BALANCED', intensity: 'medium', activeJobs: 4 },
        { name: 'Wakad', workers: 10, available: 4, demand: 'HIGH', intensity: 'high', activeJobs: 5 },
        { name: 'Aundh', workers: 15, available: 11, demand: 'CAPACITY', intensity: 'low', activeJobs: 2 },
        { name: 'Viman Nagar', workers: 12, available: 8, demand: 'BALANCED', intensity: 'medium', activeJobs: 3 },
        { name: 'Shivajinagar', workers: 14, available: 7, demand: 'HIGH', intensity: 'high', activeJobs: 4 },
      ];

  if (loading) {
    return (
      <main className="mx-auto min-h-screen max-w-[1400px] px-4 py-12 sm:px-6 md:px-10">
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="relative mb-6">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-accent-primary/20 border-t-accent-primary" />
            <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-accent-primary animate-pulse" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-text-navy sm:text-2xl">
            Connecting to Real-time Operations Network...
          </h2>
          <p className="mt-2 text-sm text-text-secondary max-w-md">
            Aggregating workforce metrics, real-time demand telemetry, and cooperative platform earnings.
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto min-h-screen max-w-[1400px] px-4 py-12 sm:px-6 md:px-10">
        <div className="rounded-[28px] border border-red-200 bg-red-50/70 p-8 text-center sm:p-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-2xl font-extrabold text-text-navy">Operations API Error</h2>
          <p className="mt-2 text-sm text-red-700 max-w-lg mx-auto">{error}</p>
          {error.toLowerCase().includes('admin') || error.toLowerCase().includes('denied') || error.toLowerCase().includes('role') ? (
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={async () => {
                  try {
                    setLoading(true);
                    const { authApi } = await import('../../lib/api');
                    await authApi.demoLogin('cooperative');
                    fetchDashboardData();
                  } catch (e: any) {
                    setError(e?.message || 'Admin authentication failed');
                    setLoading(false);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-text-navy px-6 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-90"
              >
                Sign In as Cooperative Admin
              </button>
              <button
                onClick={() => fetchDashboardData()}
                className="inline-flex items-center gap-2 rounded-xl border border-status-subtle bg-white px-5 py-3 text-sm font-bold text-text-navy shadow-sm transition hover:bg-slate-50"
              >
                <RefreshCw size={16} /> Retry
              </button>
            </div>
          ) : (
            <button
              onClick={() => fetchDashboardData()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent-primary px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-accent-primary/90"
            >
              <RefreshCw size={16} /> Retry Connection
            </button>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-[1400px] px-4 py-6 sm:px-5 sm:py-8 md:px-10 md:py-14">
      <div className="space-y-6 sm:space-y-8 md:space-y-12">
        
        {/* Header Bar with Live Refresh */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-3 w-3 items-center justify-center">
              <span className="h-3 w-3 animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </div>
            <p className="font-mono text-xs font-bold tracking-widest text-emerald-800 uppercase">
              Live Operations Feed · Connected
            </p>
          </div>
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-status-subtle bg-white px-4 py-2 font-mono text-xs font-bold text-text-navy shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin text-accent-primary' : ''} />
            {refreshing ? 'REFRESHING...' : 'REFRESH METRICS'}
          </button>
        </div>

        {/* Hero Section with Cooperative Identity */}
        <section className="overflow-hidden rounded-[28px] border border-status-subtle bg-[#eaf1f8] sm:rounded-[36px] md:rounded-[36px]">
          {/* Mobile Layout */}
          <div className="flex flex-col md:hidden">
            <div className="p-5 pb-6">
              <p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-text-secondary">
                COOPERATIVE NETWORK
              </p>
              <h1 className="mt-3 text-[2rem] font-extrabold leading-[0.88] tracking-[-0.07em] text-text-navy">
                Workforce<br />Operations
              </h1>
              
              <div className="mt-4">
                <p className="font-mono text-[8px] font-semibold tracking-[0.12em] text-accent-primary">
                  PUNE · CENTRAL FEDERATION
                </p>
              </div>
              
              {/* Key Metrics - 4-column compact grid */}
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

            <div className="relative h-[180px] overflow-hidden">
              <img 
                src="/illustrations/cooperative-hero.png" 
                alt="" 
                className="absolute bottom-0 right-[-8%] h-[140%] w-auto"
                style={{ objectFit: 'contain', objectPosition: 'bottom right' }}
              />
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="relative hidden min-h-[500px] p-12 md:block">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <img 
                src="/illustrations/cooperative-hero.png" 
                alt="" 
                className="absolute bottom-[-5%] right-[-8%] h-[120%] w-auto max-w-none"
                style={{ objectFit: 'contain', objectPosition: 'bottom right' }}
              />
            </div>
            
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
                    Local Skills. Shared Opportunity. Worker-Owned Economics.
                  </p>
                </div>
              </div>
              
              {/* Network Stats Row */}
              <div className="mt-auto grid max-w-2xl grid-cols-4 gap-6 pt-8">
                <div>
                  <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-text-tertiary">
                    TOTAL WORKERS
                  </p>
                  <p className="mt-2 text-4xl font-extrabold tracking-[-0.04em] text-text-navy">
                    {kpis.totalWorkers}
                  </p>
                  <p className="mt-1 font-mono text-[9px] text-text-secondary">{kpis.verifiedWorkers} verified</p>
                </div>
                <div className="border-l border-text-navy/10 pl-6">
                  <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-text-tertiary">
                    AVAILABLE NOW
                  </p>
                  <p className="mt-2 text-4xl font-extrabold tracking-[-0.04em] text-accent-primary">
                    {kpis.availableWorkers}
                  </p>
                  <p className="mt-1 font-mono text-[9px] text-accent-primary">Ready to dispatch</p>
                </div>
                <div className="border-l border-text-navy/10 pl-6">
                  <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-text-tertiary">
                    LOCAL SKILLS
                  </p>
                  <p className="mt-2 text-4xl font-extrabold tracking-[-0.04em] text-text-navy">
                    {kpis.localSkills}
                  </p>
                  <p className="mt-1 font-mono text-[9px] text-text-secondary">Trade domains</p>
                </div>
                <div className="border-l border-text-navy/10 pl-6">
                  <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-text-tertiary">
                    NETWORKS
                  </p>
                  <p className="mt-2 text-4xl font-extrabold tracking-[-0.04em] text-text-navy">
                    {kpis.networks}
                  </p>
                  <p className="mt-1 font-mono text-[9px] text-text-secondary">Chapters active</p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-accent-primary">
                  PUNE · CENTRAL COOPERATIVE FEDERATION
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Strategic Metrics Grid (4 Primary Cards) */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
          {/* Card 1: Workers Available */}
          <div className="rounded-[24px] border border-status-subtle bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-accent-primary">
                <Users size={20} />
              </span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-mono text-[9px] font-bold text-emerald-700">
                {kpis.verifiedWorkers} VERIFIED
              </span>
            </div>
            <p className="mt-4 font-mono text-[9px] font-semibold tracking-[0.12em] text-text-tertiary uppercase">
              Total Workers Available
            </p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight text-text-navy">
              {kpis.availableWorkers}
              <span className="ml-2 text-sm font-normal text-text-secondary">/ {kpis.totalWorkers} total</span>
            </p>
            <p className="mt-2 text-xs text-text-secondary">
              Active verified technicians currently on-duty across Pune zones.
            </p>
          </div>

          {/* Card 2: Local Skills */}
          <div className="rounded-[24px] border border-status-subtle bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <Award size={20} />
              </span>
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 font-mono text-[9px] font-bold text-amber-700">
                CERTIFIED
              </span>
            </div>
            <p className="mt-4 font-mono text-[9px] font-semibold tracking-[0.12em] text-text-tertiary uppercase">
              Local Skills & Domains
            </p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight text-text-navy">
              {kpis.localSkills}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {kpis.uniqueSkillsList.slice(0, 3).map((skill: string, idx: number) => (
                <span key={idx} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-text-secondary">
                  {skill}
                </span>
              ))}
              {kpis.uniqueSkillsList.length > 3 && (
                <span className="text-[10px] font-medium text-text-tertiary">
                  +{kpis.uniqueSkillsList.length - 3} more
                </span>
              )}
            </div>
          </div>

          {/* Card 3: Shared Opportunities */}
          <div className="rounded-[24px] border border-status-subtle bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                <Radio size={20} />
              </span>
              <span className="rounded-full bg-purple-50 px-2.5 py-0.5 font-mono text-[9px] font-bold text-purple-700">
                BROADCASTING
              </span>
            </div>
            <p className="mt-4 font-mono text-[9px] font-semibold tracking-[0.12em] text-text-tertiary uppercase">
              Shared Opportunities
            </p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight text-text-navy">
              {kpis.sharedOpportunities}
            </p>
            <p className="mt-2 text-xs text-text-secondary">
              Open domain demands currently broadcast to cooperative trade pools.
            </p>
          </div>

          {/* Card 4: Networks */}
          <div className="rounded-[24px] border border-status-subtle bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Layers size={20} />
              </span>
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 font-mono text-[9px] font-bold text-indigo-700">
                FEDERATED
              </span>
            </div>
            <p className="mt-4 font-mono text-[9px] font-semibold tracking-[0.12em] text-text-tertiary uppercase">
              Cooperative Networks
            </p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight text-text-navy">
              {kpis.networks}
            </p>
            <p className="mt-2 text-xs text-text-secondary">
              Affiliated regional guilds and municipal cooperative divisions.
            </p>
          </div>
        </section>

        {/* Financial Overview & 15% Platform Commission */}
        <section className="overflow-hidden rounded-[24px] border border-status-subtle bg-white p-5 sm:rounded-[32px] sm:p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-status-subtle pb-4">
            <div>
              <p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-text-secondary sm:text-[10px] sm:tracking-[0.16em]">
                FINANCIAL SUSTAINABILITY
              </p>
              <h2 className="mt-1 text-xl font-extrabold tracking-tight text-text-navy sm:text-2xl">
                Platform Earnings & Revenue Distribution
              </h2>
            </div>
            <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1 font-mono text-xs font-bold text-emerald-800">
              15% COOPERATIVE COMMISSION
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {/* Total Completed Job Value */}
            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="flex items-center gap-2 text-text-tertiary">
                <Briefcase size={16} className="text-accent-primary" />
                <p className="font-mono text-[9px] font-bold tracking-wider uppercase">
                  Completed Job Value
                </p>
              </div>
              <p className="mt-3 text-3xl font-extrabold tracking-tight text-text-navy sm:text-4xl">
                ₹{kpis.totalRevenue.toLocaleString()}
              </p>
              <p className="mt-1.5 text-xs text-text-secondary">
                100% gross settled value from {kpis.completedJobs} completed jobs.
              </p>
            </div>

            {/* Platform Earnings (15%) */}
            <div className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/50 p-5">
              <div className="flex items-center gap-2 text-emerald-800">
                <DollarSign size={16} className="text-emerald-600" />
                <p className="font-mono text-[9px] font-bold tracking-wider uppercase">
                  Total Platform Earnings (15%)
                </p>
              </div>
              <p className="mt-3 text-3xl font-extrabold tracking-tight text-emerald-700 sm:text-4xl">
                ₹{kpis.platformEarnings.toLocaleString()}
              </p>
              <p className="mt-1.5 text-xs text-emerald-800">
                Cooperative commission supporting platform servers, verification, and guild training.
              </p>
            </div>

            {/* Worker Net Earnings (85%) */}
            <div className="rounded-2xl bg-blue-50/60 p-5">
              <div className="flex items-center gap-2 text-blue-800">
                <Users size={16} className="text-accent-primary" />
                <p className="font-mono text-[9px] font-bold tracking-wider uppercase">
                  Worker Payouts (85%)
                </p>
              </div>
              <p className="mt-3 text-3xl font-extrabold tracking-tight text-accent-primary sm:text-4xl">
                ₹{kpis.workerEarnings.toLocaleString()}
              </p>
              <p className="mt-1.5 text-xs text-text-secondary">
                Direct worker take-home earnings credited to technician wallets.
              </p>
            </div>
          </div>

          {/* Monthly Earnings Aggregation Table / Chart */}
          {kpis.monthlyBreakdown.length > 0 && (
            <div className="mt-8 border-t border-status-subtle pt-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={18} className="text-accent-primary" />
                <h3 className="text-base font-extrabold text-text-navy">
                  Monthly Platform Earnings History
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-status-subtle bg-slate-50 font-mono text-[10px] uppercase text-text-tertiary">
                      <th className="py-2.5 px-4">Completion Month</th>
                      <th className="py-2.5 px-4">Completed Jobs</th>
                      <th className="py-2.5 px-4">Gross Job Value</th>
                      <th className="py-2.5 px-4">Worker Share (85%)</th>
                      <th className="py-2.5 px-4 text-right">Platform Cut (15%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-status-subtle">
                    {kpis.monthlyBreakdown.map((m: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-text-navy">{m.month}</td>
                        <td className="py-3 px-4 font-mono text-text-secondary">{m.completed_jobs}</td>
                        <td className="py-3 px-4 font-semibold text-text-navy">₹{Number(m.completed_job_value).toLocaleString()}</td>
                        <td className="py-3 px-4 text-text-secondary">₹{Number(m.worker_earnings).toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-extrabold text-emerald-600">₹{Number(m.platform_earnings).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Workforce Network Map */}
        <section className="space-y-4 sm:space-y-6">
          <div>
            <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-text-secondary sm:text-[11px] sm:tracking-[0.16em]">
              WORKFORCE TELEMETRY
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.055em] text-text-navy sm:text-3xl md:text-4xl">
              Geographic Area Distribution
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {workforceAreas.map((area: any, index: number) => (
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
        </section>

        {/* Pending Worker Approvals */}
        {pendingWorkers.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <Clock size={20} className="text-accent-primary" />
              <div>
                <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-text-secondary">PENDING APPROVALS</p>
                <h2 className="text-2xl font-extrabold tracking-[-0.05em] text-text-navy">Worker Verification Queue</h2>
              </div>
              <span className="ml-auto rounded-full bg-accent-primary px-3 py-1 font-mono text-xs font-bold text-white">{pendingWorkers.length}</span>
            </div>
            <div className="space-y-3">
              {pendingWorkers.map((worker: any) => (
                <div key={worker.id} className="overflow-hidden rounded-[20px] border border-status-subtle bg-white p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff3e0] text-xl">🛠</div>
                      <div>
                        <p className="font-semibold text-text-navy">{worker.user?.name || worker.name || 'Unknown Worker'}</p>
                        <p className="text-xs text-text-secondary">{worker.user?.email || worker.email}</p>
                        <p className="text-xs text-text-tertiary">{worker.user?.phone || worker.phone || 'No phone'}</p>
                        {worker.skills?.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {worker.skills.slice(0, 3).map((s: any, i: number) => (
                              <span key={i} className="rounded-full bg-accent-light/50 px-2 py-0.5 font-mono text-[9px] text-accent-primary">
                                {typeof s === 'string' ? s : s.category}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 sm:shrink-0">
                      <button
                        onClick={() => rejectWorker(worker.id)}
                        disabled={approving === worker.id}
                        className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                      <button
                        onClick={() => approveWorker(worker.id)}
                        disabled={approving === worker.id}
                        className="flex items-center gap-1.5 rounded-xl bg-accent-primary px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
                      >
                        <CheckCircle size={14} /> {approving === worker.id ? 'Processing...' : 'Approve'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Intelligence Action Cards */}
        <section className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
          {/* Demand Intelligence Card */}
          <button
            onClick={() => navigate('/intelligence/demand')}
            className="group relative min-h-[220px] overflow-hidden rounded-[24px] border border-status-subtle bg-[#e3f2fd] p-5 text-left transition-all hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] sm:min-h-[240px] sm:rounded-[28px] sm:p-6 md:rounded-[32px] md:p-8"
          >
            <div className="relative z-10 flex h-full flex-col">
              <div className="max-w-[75%]">
                <p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-accent-primary sm:text-[10px] sm:tracking-[0.16em]">
                  AI-POWERED · ML ENGINE
                </p>
                <h3 className="mt-2.5 text-2xl font-extrabold leading-tight tracking-[-0.055em] text-text-navy sm:mt-3 sm:text-3xl md:text-4xl">
                  Demand Intelligence
                </h3>
                <p className="mt-2.5 text-xs leading-relaxed text-text-secondary sm:mt-3 sm:text-sm">
                  7-day demand forecasting with shortage alerts and surge pricing telemetry.
                </p>
              </div>
              <div className="mt-auto pt-5 sm:pt-6">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary transition-transform group-hover:translate-x-1 sm:gap-2 sm:text-sm">
                  VIEW FORECASTS <ArrowRight size={14} strokeWidth={2.5} className="sm:h-4 sm:w-4" />
                </span>
              </div>
            </div>

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
                  AI-POWERED · ML ENGINE
                </p>
                <h3 className="mt-2.5 text-2xl font-extrabold leading-tight tracking-[-0.055em] text-text-navy sm:mt-3 sm:text-3xl md:text-4xl">
                  Skill Intelligence
                </h3>
                <p className="mt-2.5 text-xs leading-relaxed text-text-secondary sm:mt-3 sm:text-sm">
                  Skill gap analysis, verification passport data, and cooperative training recommendations.
                </p>
              </div>
              <div className="mt-auto pt-5 sm:pt-6">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary transition-transform group-hover:translate-x-1 sm:gap-2 sm:text-sm">
                  VIEW ANALYSIS <ArrowRight size={14} strokeWidth={2.5} className="sm:h-4 sm:w-4" />
                </span>
              </div>
            </div>

            <div aria-hidden="true" className="pointer-events-none absolute bottom-3 right-3 opacity-20 sm:bottom-4 sm:right-4">
              <GraduationCap size={90} strokeWidth={1} className="text-accent-primary sm:h-[100px] sm:w-[100px] md:h-[120px] md:w-[120px]" />
            </div>
          </button>
        </section>

        {/* Live Active Operations List */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-text-secondary sm:text-[11px] sm:tracking-[0.16em]">
                LIVE OPERATIONS
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.055em] text-text-navy sm:text-3xl md:text-4xl">
                Active Jobs & Dispatched Requests
              </h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs font-bold text-text-navy">
              {recentJobs.length} JOBS
            </span>
          </div>
          
          {recentJobs.length === 0 ? (
            <div className="rounded-[20px] border border-status-subtle bg-white p-8 text-center sm:rounded-[24px] sm:p-10 md:rounded-[28px] md:p-12">
              <Users size={40} className="mx-auto text-text-secondary opacity-40 sm:h-[48px] sm:w-[48px]" strokeWidth={1.5} />
              <p className="mt-3 text-sm font-semibold text-text-navy sm:mt-4 sm:text-base">No active jobs in the queue</p>
              <p className="mt-1 text-xs text-text-secondary">When customers create service requests, they will appear here live.</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {recentJobs.map((job: any) => (
                <article 
                  key={job.id}
                  className="overflow-hidden rounded-[20px] border border-status-subtle bg-white p-4 transition-all hover:border-accent-primary/30 hover:bg-accent-light/10 sm:rounded-[24px] sm:p-5 md:p-6"
                >
                  <div className="flex flex-col gap-3.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 font-mono text-[8px] font-bold tracking-[0.1em] text-white sm:px-3 sm:text-[9px] ${
                          job.status === 'completed' ? 'bg-emerald-600' :
                          job.status === 'in_progress' ? 'bg-blue-600' :
                          job.status === 'on_the_way' ? 'bg-purple-600' :
                          'bg-amber-600'
                        }`}>
                          {job.status.toUpperCase().replace('_', ' ')}
                        </span>
                        <span className="font-mono text-[9px] tracking-[0.08em] text-text-tertiary sm:text-[10px]">
                          {job.job_number || job.id}
                        </span>
                      </div>
                      <h3 className="mt-2.5 text-lg font-extrabold tracking-[-0.03em] text-text-navy sm:mt-3 sm:text-xl md:text-2xl">
                        {job.service_category_name || job.title}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-text-secondary line-clamp-2 sm:mt-2 sm:text-sm">
                        {job.description}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-secondary sm:mt-4">
                        <div className="flex items-center gap-1.5">
                          <User size={14} className="text-text-tertiary" strokeWidth={2} />
                          <span>{job.customer_name || 'Customer'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-text-tertiary" strokeWidth={2} />
                          <span className="line-clamp-1">{job.customer_address || job.address || 'Pune'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-left sm:text-right">
                      <p className="text-2xl font-extrabold tracking-[-0.04em] text-accent-primary sm:text-3xl">
                        ₹{job.actual_price || job.estimated_price || 600}
                      </p>
                      <p className="text-[10px] font-mono text-emerald-600 font-semibold">
                        +₹{Math.round((job.actual_price || job.estimated_price || 600) * 0.15)} (15% Coop)
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
