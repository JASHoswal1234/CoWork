import { Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { inMemoryStore } from '../db/inMemoryStore';

export interface NotificationPayload {
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}

// Active Server-Sent Event (SSE) client connections keyed by user_id
const sseClients = new Map<string, Set<Response>>();

export function addSSEClient(userId: string, res: Response) {
  if (!sseClients.has(userId)) {
    sseClients.set(userId, new Set());
  }
  sseClients.get(userId)!.add(res);

  res.on('close', () => {
    const clients = sseClients.get(userId);
    if (clients) {
      clients.delete(res);
      if (clients.size === 0) {
        sseClients.delete(userId);
      }
    }
  });
}

export async function createNotification(payload: NotificationPayload) {
  const notification = {
    id: `notif-${Math.random().toString(36).substring(2, 9)}-${Date.now()}`,
    user_id: payload.user_id,
    type: payload.type,
    title: payload.title,
    message: payload.message,
    data: payload.data || {},
    is_read: false,
    created_at: new Date().toISOString(),
  };

  // 1. Store in memory store
  inMemoryStore.notifications.unshift(notification);

  // 2. Persist in Supabase notifications table
  try {
    await supabaseAdmin.from('notifications').insert({
      id: notification.id,
      user_id: notification.user_id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      is_read: false,
      created_at: notification.created_at,
    });
  } catch (err) {
    console.warn('[NotificationService] Supabase insert fallback to inMemory:', err);
  }

  // 3. Broadcast to active SSE clients
  const clients = sseClients.get(payload.user_id);
  if (clients && clients.size > 0) {
    const eventData = `data: ${JSON.stringify(notification)}\n\n`;
    for (const res of clients) {
      try {
        res.write(eventData);
      } catch (err) {
        console.warn('[NotificationService] SSE push error:', err);
      }
    }
  }

  return notification;
}
