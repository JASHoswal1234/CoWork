import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { authenticate } from '../middleware/auth';
import { inMemoryStore } from '../db/inMemoryStore';
import { addSSEClient } from '../services/notificationService';

const router = Router();

/**
 * GET /api/notifications/stream
 * Real-time SSE stream for notifications
 */
router.get('/stream', authenticate, (req: Request, res: Response): void => {
  const userId = req.user!.id;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send initial connection event
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', user_id: userId })}\n\n`);

  // Register client for user and all linked IDs
  addSSEClient(userId, res);
  const worker = inMemoryStore.getWorkerByUserId(userId);
  if (worker && worker.id) {
    addSSEClient(worker.id, res);
  }
  if (worker && worker.user_id) {
    addSSEClient(worker.user_id, res);
  }

  // Periodic heartbeat to prevent timeout
  const interval = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch {
      clearInterval(interval);
    }
  }, 25000);

  res.on('close', () => {
    clearInterval(interval);
  });
});

/**
 * GET /api/notifications
 * Get user's notifications (unread first, then by created_at DESC)
 */
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { page = '1', limit = '50' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let dbNotifications: any[] = [];
    try {
      const { data, error } = await supabaseAdmin
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        dbNotifications = data;
      }
    } catch {}

    // Merge in-memory notifications for this user
    const storeNotifications = (inMemoryStore.notifications || []).filter(
      (n: any) => n.user_id === userId
    );

    // Combine and deduplicate by id
    const allMap = new Map<string, any>();
    for (const n of [...storeNotifications, ...dbNotifications]) {
      if (!allMap.has(n.id)) {
        allMap.set(n.id, n);
      }
    }

    const allNotifications = Array.from(allMap.values()).sort((a, b) => {
      // Unread first
      if (a.is_read !== b.is_read) {
        return a.is_read ? 1 : -1;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const paginated = allNotifications.slice(offset, offset + parseInt(limit as string));
    const unreadCount = allNotifications.filter((n: any) => !n.is_read).length;

    res.json({
      success: true,
      data: {
        notifications: paginated,
        unread_count: unreadCount,
        pagination: {
          total: allNotifications.length,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
        },
      },
    });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch notifications' },
    });
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read
 */
router.patch('/:id/read', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Update inMemoryStore
    for (const n of inMemoryStore.notifications) {
      if (n.id === id && n.user_id === userId) {
        n.is_read = true;
        n.read_at = new Date().toISOString();
      }
    }

    // Update Supabase
    try {
      await supabaseAdmin
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId);
    } catch {}

    res.json({ success: true, data: { message: 'Notification marked as read' } });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update notification' },
    });
  }
});

/**
 * PATCH /api/notifications/read-all
 * Mark all user's notifications as read
 */
router.patch('/read-all', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Update inMemoryStore
    for (const n of inMemoryStore.notifications) {
      if (n.user_id === userId) {
        n.is_read = true;
        n.read_at = new Date().toISOString();
      }
    }

    // Update Supabase
    try {
      await supabaseAdmin
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('is_read', false);
    } catch {}

    res.json({ success: true, data: { message: 'All notifications marked as read' } });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update notifications' },
    });
  }
});

export default router;
