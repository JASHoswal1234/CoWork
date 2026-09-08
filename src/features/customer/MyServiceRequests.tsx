import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  MapPin,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Camera,
  Plus,
  X,
  Star,
} from 'lucide-react';
import { jobsApi } from '../../lib/api';

interface MyServiceRequestsProps {
  onNewRequest: () => void;
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const FINDING_STATUSES = ['pending', 'matching', 'created', 'requested', 'matched'];
const ACTIVE_STATUSES  = ['accepted', 'on_the_way', 'arrived', 'in_progress'];

function isFinding(status: string)   { return FINDING_STATUSES.includes(status); }
function isActive(status: string)    { return ACTIVE_STATUSES.includes(status); }
function isCompleted(status: string) { return status === 'completed'; }
function isCancelled(status: string) { return status === 'cancelled' || status === 'rejected'; }

/** Statuses the customer is allowed to cancel (before any worker accepted) */
const CUSTOMER_CANCELLABLE = new Set(['pending', 'matching', 'matched', 'created', 'requested']);
function canCancel(status: string) { return CUSTOMER_CANCELLABLE.has(status); }

function StatusBadge({ status }: { status: string }) {
  if (isFinding(status))
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 font-mono text-[10px] font-bold tracking-wide text-amber-700">
        <span className="h-1.5 w-1.5 animate-ping rounded-full bg-amber-500" />
        FINDING WORKER
      </span>
    );
  if (status === 'accepted')
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 font-mono text-[10px] font-bold tracking-wide text-accent-primary">
        <ShieldCheck size={11} />
        WORKER ACCEPTED
      </span>
    );
  if (status === 'on_the_way')
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 font-mono text-[10px] font-bold tracking-wide text-purple-700">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-500" />
        ON THE WAY
      </span>
    );
  if (status === 'arrived')
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 font-mono text-[10px] font-bold tracking-wide text-indigo-700">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
        WORKER ARRIVED
      </span>
    );
  if (status === 'in_progress')
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 font-mono text-[10px] font-bold tracking-wide text-blue-700">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
        IN PROGRESS
      </span>
    );
  if (isCompleted(status))
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 font-mono text-[10px] font-bold tracking-wide text-emerald-700">
        <CheckCircle2 size={11} />
        COMPLETED
      </span>
    );
  if (isCancelled(status))
    return (
      <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 font-mono text-[10px] font-bold tracking-wide text-red-700">
        {status === 'rejected' ? 'REJECTED' : 'CANCELLED'}
      </span>
    );
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 font-mono text-[10px] font-bold tracking-wide text-gray-700">
      {status?.toUpperCase().replace(/_/g, ' ')}
    </span>
  );
}

// ─── Cancel Confirmation Dialog ───────────────────────────────────────────────

function CancelDialog({
  job,
  onConfirm,
  onDismiss,
  isLoading,
}: {
  job: any;
  onConfirm: () => void;
  onDismiss: () => void;
  isLoading: boolean;
}) {
  return (
    /* backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-dialog-title"
    >
      <div className="w-full max-w-sm overflow-hidden rounded-[24px] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-status-subtle px-6 py-5">
          <div>
            <p className="font-mono text-[10px] font-bold tracking-[0.14em] text-red-500 uppercase">
              Cancel Request
            </p>
            <h2 id="cancel-dialog-title" className="mt-1 text-lg font-extrabold text-text-navy">
              Cancel this service request?
            </h2>
          </div>
          <button
            onClick={onDismiss}
            className="ml-4 flex-shrink-0 rounded-full p-1 text-text-tertiary hover:text-text-navy"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="rounded-2xl bg-red-50 px-4 py-3">
            <p className="text-sm font-semibold text-text-navy">
              {job.service_category_name || 'Service'}: {job.title || job.description?.slice(0, 50)}
            </p>
            {job.service_subcategory_name && (
              <p className="mt-0.5 text-xs text-text-secondary">{job.service_subcategory_name}</p>
            )}
          </div>
          <p className="mt-4 text-sm text-text-secondary">
            This request has <strong>not yet been accepted</strong> by a worker. Cancelling will
            immediately stop the search and no worker will be dispatched.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 border-t border-status-subtle px-6 py-4">
          <button
            onClick={onDismiss}
            disabled={isLoading}
            className="flex-1 rounded-2xl border border-status-subtle py-3 text-sm font-bold text-text-navy transition hover:bg-background-primary disabled:opacity-50"
          >
            Keep Request
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 rounded-2xl bg-red-600 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? 'Cancelling…' : 'Yes, Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Single Request Card ──────────────────────────────────────────────────────

function RequestCard({
  job,
  onCancelClick,
}: {
  job: any;
  onCancelClick: (job: any) => void;
}) {
  const navigate = useNavigate();

  const status = job.status;
  const finding   = isFinding(status);
  const active    = isActive(status);
  const completed = isCompleted(status);
  const cancelled = isCancelled(status);

  const workerName =
    job.worker_name ||
    job.worker?.user?.name ||
    job.worker?.name ||
    null;

  return (
    <article className="overflow-hidden rounded-[24px] border border-status-subtle bg-white transition-all hover:shadow-md">
      {/* Card top strip — coloured by status */}
      <div
        className={`h-1 w-full ${
          active    ? 'bg-accent-primary' :
          finding   ? 'bg-amber-400' :
          completed ? 'bg-emerald-500' :
          cancelled ? 'bg-red-400' :
          'bg-status-subtle'
        }`}
      />

      <div className="p-5 sm:p-6">
        {/* Status + meta row */}
        <div className="flex flex-wrap items-center gap-2.5">
          <StatusBadge status={status} />
          <span className="font-mono text-[11px] font-bold text-text-tertiary">
            #{job.job_number || job.id?.slice(-6).toUpperCase()}
          </span>
          <span className="font-mono text-[11px] text-text-tertiary">·</span>
          <span className="font-mono text-[11px] text-text-tertiary">
            {new Date(job.created_at || Date.now()).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-3 text-lg font-extrabold tracking-tight text-text-navy sm:text-xl">
          {job.service_category_name || 'Service'}
          {job.service_subcategory_name
            ? ` · ${job.service_subcategory_name}`
            : job.title
            ? ` · ${job.title}`
            : ''}
        </h3>

        {/* Description */}
        {job.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-secondary sm:text-sm">
            {job.description}
          </p>
        )}

        {/* Problem image thumbnails */}
        {job.problem_image_urls?.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <Camera size={13} className="flex-shrink-0 text-text-tertiary" />
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {job.problem_image_urls.map((url: string, i: number) => (
                <img
                  key={i}
                  src={url}
                  alt="Problem"
                  className="h-9 w-9 rounded-lg border border-status-subtle object-cover"
                />
              ))}
            </div>
          </div>
        )}

        {/* Worker card — shown when a worker is assigned */}
        {(active || completed) && workerName && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-accent-primary/20 bg-accent-light/30 p-3">
            {/* Avatar initial */}
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent-primary text-sm font-bold text-white">
              {workerName[0]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-text-navy">{workerName}</p>
                <ShieldCheck size={13} className="text-accent-primary" />
              </div>
              <div className="flex items-center gap-2 text-[11px] text-text-secondary">
                <span>Verified Specialist</span>
                {job.worker_rating && (
                  <>
                    <span>·</span>
                    <Star size={11} className="text-amber-400" fill="currentColor" />
                    <span className="font-semibold text-text-navy">{job.worker_rating}</span>
                  </>
                )}
                {job.worker_distance_km && (
                  <>
                    <span>·</span>
                    <span>{job.worker_distance_km} km away</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Location + time meta */}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-text-secondary">
          {job.customer_address && (
            <div className="flex items-center gap-1.5">
              <MapPin size={13} className="text-accent-primary" />
              <span>{job.customer_address.split(',')[0]}</span>
            </div>
          )}
          {job.preferred_time && (
            <div className="flex items-center gap-1.5">
              <Clock size={13} className="text-text-tertiary" />
              <span>{job.preferred_time}</span>
            </div>
          )}
          {(job.actual_price || job.estimated_price) && (
            <div className="flex items-center gap-1 font-semibold text-text-navy">
              <span>₹{job.actual_price || job.estimated_price}</span>
            </div>
          )}
        </div>

        {/* Action buttons — shown only for valid statuses */}
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          {/* Track Worker Live */}
          {active && (
            <button
              onClick={() => navigate(`/job/${job.id}`)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-accent-primary px-4 py-2.5 text-xs font-bold text-white transition hover:bg-accent-hover"
            >
              Track Worker Live <ArrowRight size={13} />
            </button>
          )}

          {/* View Details / Rate Worker */}
          {completed && (
            <button
              onClick={() => navigate(`/job/${job.id}`)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100"
            >
              <CheckCircle2 size={13} />
              View / Rate
            </button>
          )}

          {/* Finding state: View Details link */}
          {finding && (
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
              <span className="h-2 w-2 animate-ping rounded-full bg-amber-500" />
              Finding Worker…
            </div>
          )}

          {/* Cancel — only pre-acceptance */}
          {canCancel(status) && (
            <button
              onClick={() => onCancelClick(job)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700 transition hover:bg-red-100"
            >
              <X size={13} />
              Cancel Request
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

type Tab = 'all' | 'active' | 'completed' | 'cancelled';

const TABS: { id: Tab; label: string }[] = [
  { id: 'all',       label: 'All' },
  { id: 'active',    label: 'Active' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

function filterByTab(jobs: any[], tab: Tab): any[] {
  switch (tab) {
    case 'active':    return jobs.filter((j) => isFinding(j.status) || isActive(j.status));
    case 'completed': return jobs.filter((j) => isCompleted(j.status));
    case 'cancelled': return jobs.filter((j) => isCancelled(j.status));
    default:          return jobs;
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export function MyServiceRequests({ onNewRequest }: MyServiceRequestsProps) {
  const [requests, setRequests]     = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [tab, setTab]               = useState<Tab>('all');

  // Cancel dialog state
  const [cancelJob, setCancelJob]         = useState<any | null>(null);
  const [isCancelling, setIsCancelling]   = useState(false);
  const [cancelError, setCancelError]     = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchRequests = useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      setError(null);
      const res = await jobsApi.list({ limit: 50 });
      if (res?.jobs) {
        // Sort: newest first
        const sorted = [...res.jobs].sort(
          (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
        setRequests(sorted);
      }
    } catch (err: any) {
      console.warn('Failed to fetch customer requests:', err);
      setError('Could not load service requests. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch + 5 s auto-refresh
  useEffect(() => {
    fetchRequests();
    const interval = setInterval(() => fetchRequests(), 5000);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  // Dismiss success toast after 4 s
  useEffect(() => {
    if (!cancelSuccess) return;
    const t = setTimeout(() => setCancelSuccess(null), 4000);
    return () => clearTimeout(t);
  }, [cancelSuccess]);

  // ── Cancel handler ─────────────────────────────────────────────────────
  const handleConfirmCancel = async () => {
    if (!cancelJob) return;
    setIsCancelling(true);
    setCancelError(null);
    try {
      await jobsApi.cancel(cancelJob.id);
      // Optimistically update local state so UI reflects instantly
      setRequests((prev) =>
        prev.map((j) => (j.id === cancelJob.id ? { ...j, status: 'cancelled' } : j))
      );
      setCancelSuccess('Service request cancelled.');
      setCancelJob(null);
    } catch (err: any) {
      setCancelError(err.message || 'Could not cancel the request. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  // ── Derived data ───────────────────────────────────────────────────────
  const filtered = filterByTab(requests, tab);

  const tabCounts: Record<Tab, number> = {
    all:       requests.length,
    active:    requests.filter((j) => isFinding(j.status) || isActive(j.status)).length,
    completed: requests.filter((j) => isCompleted(j.status)).length,
    cancelled: requests.filter((j) => isCancelled(j.status)).length,
  };

  // ── Render ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
        <p className="mt-3 text-sm text-text-secondary">Loading your service requests…</p>
      </div>
    );
  }

  return (
    <>
      {/* Cancel confirmation dialog */}
      {cancelJob && (
        <CancelDialog
          job={cancelJob}
          onConfirm={handleConfirmCancel}
          onDismiss={() => { setCancelJob(null); setCancelError(null); }}
          isLoading={isCancelling}
        />
      )}

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:py-12">
        {/* ── Page header ── */}
        <div className="flex flex-col gap-4 border-b border-status-subtle pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-accent-primary">
              TRACK &amp; MANAGE
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-[-0.05em] text-text-navy sm:text-4xl">
              My Requests
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchRequests(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-xl border border-status-subtle bg-white px-3.5 py-2.5 text-xs font-semibold text-text-secondary hover:text-text-navy disabled:opacity-50"
              aria-label="Refresh requests"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
            <button
              onClick={onNewRequest}
              className="inline-flex items-center gap-2 rounded-xl bg-accent-primary px-4 py-2.5 text-xs font-bold text-white transition hover:bg-accent-hover"
            >
              <Plus size={15} /> New Request
            </button>
          </div>
        </div>

        {/* ── Toasts ── */}
        {cancelSuccess && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            <CheckCircle2 size={16} className="flex-shrink-0" />
            {cancelSuccess}
          </div>
        )}
        {cancelError && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={16} className="flex-shrink-0" />
            {cancelError}
            <button onClick={() => setCancelError(null)} className="ml-auto font-bold underline">
              Dismiss
            </button>
          </div>
        )}
        {error && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => fetchRequests(true)} className="ml-auto font-bold underline">
              Retry
            </button>
          </div>
        )}

        {/* ── Tab bar ── */}
        <div className="mt-6 flex items-center gap-1 overflow-x-auto rounded-2xl border border-status-subtle bg-background-primary p-1">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition ${
                tab === id
                  ? 'bg-white text-text-navy shadow-sm'
                  : 'text-text-secondary hover:text-text-navy'
              }`}
            >
              {label}
              {tabCounts[id] > 0 && (
                <span
                  className={`ml-1.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                    tab === id ? 'bg-accent-primary text-white' : 'bg-status-subtle text-text-tertiary'
                  }`}
                >
                  {tabCounts[id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Empty state ── */}
        {filtered.length === 0 && !error && (
          <div className="mt-10 rounded-[28px] border border-status-subtle bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-light text-2xl">
              {tab === 'completed' ? '✅' : tab === 'cancelled' ? '❌' : '📋'}
            </div>
            <h2 className="text-xl font-extrabold text-text-navy">
              {tab === 'all'
                ? 'No service requests yet'
                : tab === 'active'
                ? 'No active requests'
                : tab === 'completed'
                ? 'No completed requests yet'
                : 'No cancelled requests'}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
              {tab === 'all'
                ? 'When you request a service, you can track candidate matching, worker arrival, and job progress here.'
                : tab === 'active'
                ? 'Active requests will appear here once you submit a service request.'
                : tab === 'completed'
                ? 'Completed jobs will appear here after your service is done.'
                : 'Cancelled requests will appear here if you or the system cancels a request.'}
            </p>
            {tab === 'all' || tab === 'active' ? (
              <button
                onClick={onNewRequest}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-accent-primary px-6 py-3.5 text-sm font-bold text-white transition hover:bg-accent-hover"
              >
                Request a Service Now <ArrowRight size={16} />
              </button>
            ) : null}
          </div>
        )}

        {/* ── Request cards ── */}
        <div className="mt-5 space-y-4">
          {filtered.map((job) => (
            <RequestCard
              key={job.id}
              job={job}
              onCancelClick={(j) => { setCancelJob(j); setCancelError(null); }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
