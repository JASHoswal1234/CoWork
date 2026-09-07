import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { useAuth } from './AuthContext';
import { notificationsApi, getToken, API_BASE_URL } from '../lib/api';
import { NotificationItem } from '../types/notification';
import { playNotificationSound } from '../utils/sound';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  activeToast: NotificationItem | null;
  soundEnabled: boolean;
  toggleSound: () => void;
  dismissToast: () => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeToast, setActiveToast] = useState<NotificationItem | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('shram_notification_sound');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      try {
        localStorage.setItem('shram_notification_sound', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const dismissToast = () => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setActiveToast(null);
  };

  const showToast = useCallback((notif: NotificationItem) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setActiveToast(notif);
    toastTimeoutRef.current = setTimeout(() => {
      setActiveToast(null);
    }, 6000);
  }, []);

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;
    try {
      setIsLoading(true);
      const res = await notificationsApi.list();
      if (res?.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.unread_count ?? res.notifications.filter(n => !n.is_read).length);
      }
    } catch (err) {
      console.warn('[NotificationContext] Failed to fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  // Initial fetch when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      refreshNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setActiveToast(null);
    }
  }, [isAuthenticated, user?.id, refreshNotifications]);

  // Handle incoming notification
  const handleIncomingNotification = useCallback((incoming: NotificationItem) => {
    if (!incoming || !incoming.id) return;

    setNotifications(prev => {
      // Prevent duplicate notification IDs
      if (prev.some(n => n.id === incoming.id)) {
        return prev;
      }
      return [incoming, ...prev];
    });

    setUnreadCount(prev => prev + 1);

    // Trigger in-app toast
    showToast(incoming);

    // Play subtle audio chime if enabled
    if (soundEnabled) {
      playNotificationSound();
    }
  }, [showToast, soundEnabled]);

  // Real-time EventSource / SSE subscription
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const token = getToken();
    if (!token) return;

    let eventSource: EventSource | null = null;
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    try {
      // Connect to SSE stream
      const streamUrl = `${API_BASE_URL}/api/notifications/stream?token=${encodeURIComponent(token)}`;
      eventSource = new EventSource(streamUrl);

      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed && parsed.id && parsed.type !== 'CONNECTED') {
            handleIncomingNotification(parsed);
          }
        } catch (err) {
          console.warn('[NotificationContext] SSE parse error:', err);
        }
      };

      eventSource.onerror = () => {
        // Fallback to periodic polling if SSE drops
        if (!pollInterval) {
          pollInterval = setInterval(() => {
            refreshNotifications();
          }, 10000);
        }
      };
    } catch {
      // Fallback polling
      pollInterval = setInterval(() => {
        refreshNotifications();
      }, 10000);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [isAuthenticated, user?.id, handleIncomingNotification, refreshNotifications]);

  const markAsRead = async (id: string) => {
    try {
      // Optimistic UI update
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      await notificationsApi.markRead(id);
    } catch (err) {
      console.warn('[NotificationContext] Failed to mark read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Optimistic UI update
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);

      await notificationsApi.markAllRead();
    } catch (err) {
      console.warn('[NotificationContext] Failed to mark all read:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        activeToast,
        soundEnabled,
        toggleSound,
        dismissToast,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return ctx;
}
