import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import { useRole } from '../../contexts/RoleContext';
import { NotificationItem, NotificationType } from '../../types/notification';
import {
  Bell,
  CheckCheck,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  Navigation,
  PlayCircle,
  Award,
  XCircle,
  AlertCircle,
  Clock,
  ChevronRight,
} from 'lucide-react';

function getNotificationIcon(type: string) {
  switch (type) {
    case 'NEW_SERVICE_REQUEST':
      return <Sparkles size={16} className="text-accent-primary" />;
    case 'REQUEST_ACCEPTED':
    case 'JOB_ASSIGNED':
      return <CheckCircle2 size={16} className="text-emerald-600" />;
    case 'WORKER_ON_THE_WAY':
      return <Navigation size={16} className="text-amber-600" />;
    case 'JOB_STARTED':
      return <PlayCircle size={16} className="text-blue-600" />;
    case 'JOB_COMPLETED':
      return <Award size={16} className="text-emerald-600" />;
    case 'JOB_CANCELLED':
      return <XCircle size={16} className="text-red-500" />;
    default:
      return <Bell size={16} className="text-text-secondary" />;
  }
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 45) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  } catch {
    return 'Recent';
  }
}

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, soundEnabled, toggleSound } = useNotifications();
  const { role } = useRole();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.is_read) {
      await markAsRead(notif.id);
    }
    setIsOpen(false);

    const jobId = notif.data?.job_id;
    if (jobId) {
      navigate(`/job/${jobId}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-status-subtle bg-white text-text-secondary transition hover:border-accent-primary/40 hover:text-text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell size={17} className={unreadCount > 0 ? 'text-accent-primary' : ''} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[340px] sm:w-[400px] max-w-[calc(100vw-24px)] rounded-2xl border border-status-subtle bg-white shadow-xl ring-1 ring-black/5 z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Panel Header */}
          <div className="flex items-center justify-between border-b border-status-subtle bg-background-primary/60 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-text-navy">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-accent-light px-2 py-0.5 font-mono text-[10px] font-bold text-accent-primary">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleSound}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary hover:bg-white hover:text-text-navy transition"
                title={soundEnabled ? 'Mute notification sound' : 'Unmute notification sound'}
                aria-label="Toggle notification sound"
              >
                {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} className="text-red-400" />}
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-accent-primary hover:bg-white transition"
                  title="Mark all as read"
                >
                  <CheckCheck size={13} />
                  <span>Mark all read</span>
                </button>
              )}
            </div>
          </div>

          {/* Panel Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-status-subtle/60">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-background-primary text-text-tertiary">
                  <Bell size={18} />
                </div>
                <p className="text-xs font-semibold text-text-navy">No notifications</p>
                <p className="text-[11px] text-text-tertiary mt-0.5">
                  You're all caught up! New requests and updates will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const icon = getNotificationIcon(notif.type);
                return (
                  <button
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-background-primary/80 ${
                      !notif.is_read ? 'bg-accent-light/30' : 'bg-white'
                    }`}
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white border border-status-subtle shadow-xs">
                      {icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs truncate ${!notif.is_read ? 'font-bold text-text-navy' : 'font-semibold text-text-navy'}`}>
                          {notif.title}
                        </p>
                        <span className="shrink-0 font-mono text-[10px] text-text-tertiary">
                          {formatRelativeTime(notif.created_at)}
                        </span>
                      </div>

                      <p className="mt-0.5 text-xs text-text-secondary leading-snug line-clamp-2">
                        {notif.message}
                      </p>

                      {notif.data && (notif.data.estimated_price || notif.data.earned || notif.data.domain) && (
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          {notif.data.domain && (
                            <span className="rounded bg-background-primary px-1.5 py-0.5 font-mono text-[9px] font-semibold text-text-secondary">
                              {notif.data.domain}
                            </span>
                          )}
                          {notif.data.estimated_price && (
                            <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-700">
                              Est: ₹{notif.data.estimated_price}
                            </span>
                          )}
                          {notif.data.earned && (
                            <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-700">
                              +₹{notif.data.earned}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {!notif.is_read && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-primary" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
