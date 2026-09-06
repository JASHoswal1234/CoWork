import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        role?: string;
        phone?: string;
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
    // Extract token from Authorization header
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

    // Validate token using Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired token',
        },
      });
      return;
    }

    // Get user profile with role from database
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, email, phone, role, name')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User profile not found',
        },
      });
      return;
    }

    // Attach user to request
    req.user = {
      id: profile.id,
      email: profile.email,
      phone: profile.phone,
      role: profile.role,
    };

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
 * Attaches user if token is valid, otherwise continues without user
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      next();
      return;
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (!error && user) {
      const { data: profile } = await supabase
        .from('users')
        .select('id, email, phone, role, name')
        .eq('id', user.id)
        .single();

      if (profile) {
        req.user = {
          id: profile.id,
          email: profile.email,
          phone: profile.phone,
          role: profile.role,
        };
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
}


/**
 * Role-based authorization middleware factory
 * Requires authenticate middleware to run first
 * 
 * @param allowedRoles - Array of roles that can access the route
 * @returns Express middleware function
 * 
 * @example
 * router.get('/admin/dashboard', authenticate, requireRole(['admin']), handler);
 * router.post('/jobs', authenticate, requireRole(['customer']), handler);
 */
export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check if user is authenticated
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

    // Check if user has required role
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

/**
 * Convenience middlewares for specific roles
 */
export const requireCustomer = requireRole(['customer']);
export const requireWorker = requireRole(['worker']);
export const requireAdmin = requireRole(['admin']);
export const requireCustomerOrWorker = requireRole(['customer', 'worker']);
export const requireAnyRole = requireRole(['customer', 'worker', 'admin']);
