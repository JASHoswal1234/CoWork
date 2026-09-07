import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import {
  Sparkles,
  CheckCircle2,
  Navigation,
  PlayCircle,
  Award,
  XCircle,
  Bell,
  X,
  ArrowRight,
} from 'lucide-react';

function getToastIcon(type: string) {
  switch (type) {
    case 'NEW_SERVICE_REQUEST':
      return <Sparkles size={18} className="text-accent-primary" />;
    case 'REQUEST_ACCEPTED':
    case 'JOB_ASSIGNED':
      return <CheckCircle2 size={18} className="text-emerald-600" />;
    case 'WORKER_ON_THE_WAY':
      return <Navigation size={18} className="text-amber-600" />;
    case 'JOB_STARTED':
      return <PlayCircle size={18} className="text-blue-600" />;
    case 'JOB_COMPLETED':
      return <Award size={18} className="text-emerald-600" />;
    case 'JOB_CANCELLED':
      return <XCircle size={18} className="text-red-500" />;
    default:
      return <Bell size={18} className="text-accent-primary" />;
  }
}

export function NotificationToast() {
  const { activeToast, dismissToast, markAsRead } = useNotifications();
  const navigate = useNavigate();

  if (!activeToast) return null;

  const handleAction = async () => {
    await markAsRead(activeToast.id);
    dismissToast();

    const jobId = activeToast.data?.job_id;
    if (jobId) {
      navigate(`/job/${jobId}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="fixed top-20 right-4 sm:top-24 sm:right-6 z-50 max-w-[380px] w-[calc(100vw-32px)] animate-in slide-in-from-top-4 fade-in duration-200">
      <div className="flex flex-col gap-2.5 rounded-2xl border border-status-subtle bg-white p-4 shadow-2xl ring-1 ring-black/5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-light border border-status-subtle shadow-xs">
            {getToastIcon(activeToast.type)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-accent-primary">
                New Notification
              </span>
              <button
                onClick={dismissToast}
                className="rounded-lg p-1 text-text-tertiary hover:bg-background-primary hover:text-text-navy transition"
                aria-label="Close notification"
              >
                <X size={14} />
              </button>
            </div>

            <h4 className="mt-0.5 text-sm font-bold text-text-navy truncate">
              {activeToast.title}
            </h4>

            <p className="mt-0.5 text-xs text-text-secondary leading-snug">
              {activeToast.message}
            </p>

            {activeToast.data && (activeToast.data.estimated_price || activeToast.data.earned || activeToast.data.domain) && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {activeToast.data.domain && (
                  <span className="rounded bg-background-primary px-2 py-0.5 font-mono text-[9px] font-semibold text-text-secondary">
                    {activeToast.data.domain}
                  </span>
                )}
                {activeToast.data.estimated_price && (
                  <span className="rounded bg-emerald-50 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-700">
                    Est: ₹{activeToast.data.estimated_price}
                  </span>
                )}
                {activeToast.data.earned && (
                  <span className="rounded bg-emerald-50 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-700">
                    +₹{activeToast.data.earned}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-status-subtle/80 pt-2.5">
          <button
            onClick={dismissToast}
            className="rounded-xl px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-text-navy transition"
          >
            Dismiss
          </button>
          <button
            onClick={handleAction}
            className="flex items-center gap-1 rounded-xl bg-accent-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-accent-hover transition"
          >
            <span>View Details</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
