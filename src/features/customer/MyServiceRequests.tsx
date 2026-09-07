import React, { useState, useEffect } from 'react';
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
  Plus
} from 'lucide-react';
import { jobsApi } from '../../lib/api';

interface MyServiceRequestsProps {
  onNewRequest: () => void;
}

export function MyServiceRequests({ onNewRequest }: MyServiceRequestsProps) {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      setError(null);
      const res = await jobsApi.list({ limit: 50 });
      if (res?.jobs) {
        setRequests(res.jobs);
      }
    } catch (err: any) {
      console.warn('Failed to fetch customer requests:', err);
      setError('Could not load service requests. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(() => fetchRequests(), 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
      case 'matching':
      case 'created':
      case 'requested':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 font-mono text-[10px] font-bold tracking-wide text-amber-700">
            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-amber-500" />
            FINDING WORKER
          </span>
        );
      case 'matched':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 font-mono text-[10px] font-bold tracking-wide text-amber-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
            MATCHED
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 font-mono text-[10px] font-bold tracking-wide text-accent-primary">
            <ShieldCheck size={12} />
            WORKER ACCEPTED
          </span>
        );
      case 'on_the_way':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 font-mono text-[10px] font-bold tracking-wide text-purple-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-500" />
            ON THE WAY
          </span>
        );
      case 'arrived':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 font-mono text-[10px] font-bold tracking-wide text-indigo-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
            WORKER ARRIVED
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 font-mono text-[10px] font-bold tracking-wide text-blue-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
            IN PROGRESS
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 font-mono text-[10px] font-bold tracking-wide text-emerald-700">
            <CheckCircle2 size={12} />
            COMPLETED
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 font-mono text-[10px] font-bold tracking-wide text-red-700">
            CANCELLED
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 font-mono text-[10px] font-bold tracking-wide text-red-700">
            REJECTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 font-mono text-[10px] font-bold tracking-wide text-gray-700">
            {status?.toUpperCase().replace('_', ' ')}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
        <p className="mt-3 text-sm text-text-secondary">Loading your service requests…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-status-subtle pb-6">
        <div>
          <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-accent-primary">
            TRACK & MANAGE
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-[-0.05em] text-text-navy sm:text-4xl">
            My Service Requests
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchRequests(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-status-subtle bg-white px-3.5 py-2.5 text-xs font-semibold text-text-secondary hover:text-text-navy disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={onNewRequest}
            className="inline-flex items-center gap-2 rounded-xl bg-accent-primary px-4 py-2.5 text-xs font-bold text-white transition hover:bg-accent-hover"
          >
            <Plus size={16} /> Request New Service
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => fetchRequests(true)} className="ml-auto font-bold underline">Retry</button>
        </div>
      )}

      {/* Empty State */}
      {requests.length === 0 && !error && (
        <div className="mt-10 rounded-[28px] border border-status-subtle bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-light text-2xl">
            📋
          </div>
          <h2 className="text-xl font-extrabold text-text-navy">No service requests yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
            When you request a service, you can track candidate matching, worker arrival, and job progress here.
          </p>
          <button
            onClick={onNewRequest}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-accent-primary px-6 py-3.5 text-sm font-bold text-white transition hover:bg-accent-hover"
          >
            Request a Service Now <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Requests List */}
      <div className="mt-6 space-y-4">
        {requests.map((job) => {
          const isPending = ['pending', 'matching', 'created', 'requested', 'matched'].includes(job.status);
          const isActive = ['accepted', 'on_the_way', 'arrived', 'in_progress'].includes(job.status);
          const isCompleted = job.status === 'completed';

          return (
            <article
              key={job.id}
              className="overflow-hidden rounded-[24px] border border-status-subtle bg-white p-5 transition-all hover:shadow-md sm:p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {getStatusBadge(job.status)}
                    <span className="font-mono text-[11px] font-bold text-text-tertiary">
                      JOB #{job.job_number || job.id.slice(-6).toUpperCase()}
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

                  <h3 className="mt-2.5 text-lg font-extrabold tracking-tight text-text-navy sm:text-xl">
                    {job.service_category_name || job.service_category || 'Service'}: {job.title || job.description?.slice(0, 45) || 'Service Request'}
                  </h3>

                  <p className="mt-1 text-xs leading-relaxed text-text-secondary sm:text-sm line-clamp-2">
                    {job.description}
                  </p>

                  {/* Problem Image Thumbnails */}
                  {job.problem_image_urls && job.problem_image_urls.length > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      <Camera size={14} className="text-text-tertiary" />
                      <div className="flex items-center gap-1.5 overflow-x-auto">
                        {job.problem_image_urls.map((url: string, i: number) => (
                          <img
                            key={i}
                            src={url}
                            alt="Problem photo"
                            className="h-10 w-10 rounded-lg object-cover border border-status-subtle"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assigned Worker Banner if accepted / in-progress / completed */}
                  {(isActive || isCompleted) && (job.worker_name || job.worker) && (
                    <div className="mt-3.5 flex items-center gap-3 rounded-xl bg-accent-light/40 p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-primary text-sm font-bold text-white">
                        {(job.worker_name || job.worker?.user?.name || 'W')[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-text-navy">{job.worker_name || job.worker?.user?.name || 'Assigned Specialist'}</p>
                          <ShieldCheck size={14} className="text-accent-primary" />
                        </div>
                        <p className="text-[11px] text-text-secondary">
                          Verified Specialist · ShramSangam Cooperative
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-text-secondary">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-accent-primary" />
                      <span>{job.customer_address?.split(',')[0] || 'Pune'}</span>
                    </div>
                    {job.preferred_time && (
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-text-tertiary" />
                        <span>{job.preferred_time}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col items-end justify-between sm:justify-start gap-3 sm:border-l sm:border-status-subtle sm:pl-6">
                  <div className="text-left sm:text-right">
                    <p className="font-mono text-[9px] tracking-[0.1em] text-text-tertiary">ESTIMATE</p>
                    <p className="mt-0.5 text-xl font-extrabold tracking-tight text-text-navy">
                      ₹{job.actual_price || job.estimated_price || 500}
                    </p>
                  </div>

                  {isActive ? (
                    <button
                      onClick={() => navigate(`/job/${job.id}`)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-accent-primary px-4 py-2.5 text-xs font-bold text-white transition hover:bg-accent-hover"
                    >
                      <span>Track Live</span>
                      <ArrowRight size={14} />
                    </button>
                  ) : isCompleted ? (
                    <button
                      onClick={() => navigate(`/job/${job.id}`)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100"
                    >
                      <span>Completed / Rating</span>
                      <ArrowRight size={14} />
                    </button>
                  ) : isPending ? (
                    <div className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                      <div className="h-2 w-2 animate-ping rounded-full bg-amber-500" />
                      <span>Finding Worker...</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => navigate(`/job/${job.id}`)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-accent-primary hover:underline"
                    >
                      View Details <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
