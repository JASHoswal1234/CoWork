import { Request, Response, NextFunction } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        role?: string;
        phone?: string;
        name?: string;
      };
    }
  }
}

/**
 * Auth middleware - validates JWT token from Authorization header
 * Attaches user object to req.user
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authorization header',
        },
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    // 1. Handle Demo tokens
    if (token.startsWith('demo-token-')) {
      const parts = token.split('-');
      const userId = parts.slice(2, 7).join('-');

      let profile: any = null;
      try {
        const { data } = await supabaseAdmin
          .from('users')
          .select('id, email, phone, role, name')
          .eq('id', userId)
          .maybeSingle();
        profile = data;
      } catch {}

      if (!profile) {
        const isWorker = userId.includes('78b525a6') || token.includes('worker');
        const isAdmin = userId.includes('a1b2c3d4') || token.includes('admin');
        profile = {
          id: userId || '46740ff3-9955-4573-a4a5-d9d674ffa9e7',
          email: isWorker ? 'rajesh@sahakar.org' : (isAdmin ? 'admin@cooperative.org' : 'customer@sahakar.org'),
          phone: '+91 98220 11001',
          name: isWorker ? 'Rajesh Kumar' : (isAdmin ? 'Cooperative Admin' : 'Priya Sharma'),
          role: isWorker ? 'worker' : (isAdmin ? 'admin' : 'customer'),
        };
      }

      req.user = profile;
      return next();
    }

    // 2. Validate token using Supabase Auth
    let user: any = null;
    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data?.user) {
        user = data.user;
      }
    } catch {}

    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired token',
        },
      });
      return;
    }

    // 3. Get user profile from database
    let profile: any = null;
    try {
      const { data } = await supabaseAdmin
        .from('users')
        .select('id, email, phone, role, name')
        .eq('id', user.id)
        .maybeSingle();
      profile = data;
    } catch {}

    if (!profile) {
      profile = {
        id: user.id,
        email: user.email,
        phone: user.user_metadata?.phone || '+91 98220 11001',
        name: user.user_metadata?.name || 'User',
        role: user.user_metadata?.role || 'customer',
      };
    }

    req.user = profile;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Authentication failed',
      },
    });
  }
}

/**
 * Optional auth middleware - doesn't fail if token is missing
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];

    if (token.startsWith('demo-token-')) {
      const parts = token.split('-');
      const userId = parts.slice(2, 7).join('-');
      const isWorker = userId.includes('78b525a6');
      const isAdmin = userId.includes('a1b2c3d4');
      req.user = {
        id: userId,
        email: isWorker ? 'rajesh@sahakar.org' : (isAdmin ? 'admin@cooperative.org' : 'customer@sahakar.org'),
        phone: '+91 98220 11001',
        name: isWorker ? 'Rajesh Kumar' : (isAdmin ? 'Cooperative Admin' : 'Priya Sharma'),
        role: isWorker ? 'worker' : (isAdmin ? 'admin' : 'customer'),
      };
      return next();
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        req.user = {
          id: user.id,
          email: user.email,
          phone: user.user_metadata?.phone,
          name: user.user_metadata?.name,
          role: user.user_metadata?.role || 'customer',
        };
      }
    } catch {}

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
}

/**
 * Role-based authorization middleware factory
 */
export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
        },
      });
      return;
    }

    next();
  };
}

export const requireCustomer = requireRole(['customer']);
export const requireWorker = requireRole(['worker']);
export const requireAdmin = requireRole(['admin']);
export const requireCustomerOrWorker = requireRole(['customer', 'worker']);
export const requireAnyRole = requireRole(['customer', 'worker', 'admin']);
