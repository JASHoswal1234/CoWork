import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { supabase, supabaseAdmin } from '../config/supabase';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user with email and password
 */
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('phone').isMobilePhone('any').withMessage('Valid phone number is required'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('role')
      .isIn(['customer', 'worker', 'admin'])
      .withMessage('Valid role is required (customer, worker, admin)'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: errors.array(),
          },
        });
        return;
      }

      const { email, password, phone, name, role } = req.body;

      // Register user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            role,
          },
        },
      });

      if (authError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'REGISTRATION_FAILED',
            message: authError.message,
          },
        });
        return;
      }

      if (!authData.user) {
        res.status(500).json({
          success: false,
          error: {
            code: 'REGISTRATION_FAILED',
            message: 'User creation failed',
          },
        });
        return;
      }

      // Create user profile in database (using anon key since service key format is different)
      const { data: profile, error: profileError} = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          phone,
          name,
          role,
          phone_verified: false,
          email_verified: false,
        })
        .select()
        .single();

      if (profileError) {
        // Note: In production, you'd want to cleanup the auth user
        console.error('Profile creation error:', profileError);

        res.status(500).json({
          success: false,
          error: {
            code: 'PROFILE_CREATION_FAILED',
            message: 'Failed to create user profile',
          },
        });
        return;
      }

      // Auto-login after registration
      const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (sessionError || !sessionData.session) {
        // User created but login failed - they can login manually
        res.status(201).json({
          success: true,
          data: {
            user: {
              id: profile.id,
              email: profile.email,
              phone: profile.phone,
              name: profile.name,
              role: profile.role,
            },
            message: 'Registration successful. Please login.',
          },
        });
        return;
      }

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: profile.id,
            email: profile.email,
            phone: profile.phone,
            name: profile.name,
            role: profile.role,
          },
          session: {
            access_token: sessionData.session?.access_token,
            refresh_token: sessionData.session?.refresh_token,
            expires_at: sessionData.session?.expires_at,
          },
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Registration failed',
        },
      });
    }
  }
);

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: errors.array(),
          },
        });
        return;
      }

      const { email, password } = req.body;

      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        res.status(401).json({
          success: false,
          error: {
            code: 'LOGIN_FAILED',
            message: 'Invalid email or password',
          },
        });
        return;
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('id, email, phone, name, role')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        res.status(500).json({
          success: false,
          error: {
            code: 'PROFILE_NOT_FOUND',
            message: 'User profile not found',
          },
        });
        return;
      }

      // Update last login
      await supabaseAdmin
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', data.user.id);

      res.json({
        success: true,
        data: {
          user: profile,
          session: {
            access_token: data.session?.access_token,
            refresh_token: data.session?.refresh_token,
            expires_at: data.session?.expires_at,
          },
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Login failed',
        },
      });
    }
  }
);

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REFRESH_TOKEN',
          message: 'Refresh token is required',
        },
      });
      return;
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    });

    if (error) {
      res.status(401).json({
        success: false,
        error: {
          code: 'REFRESH_FAILED',
          message: 'Invalid or expired refresh token',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        session: {
          access_token: data.session?.access_token,
          refresh_token: data.session?.refresh_token,
          expires_at: data.session?.expires_at,
        },
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Token refresh failed',
      },
    });
  }
});

/**
 * POST /api/auth/password/reset
 * Request password reset
 */
router.post(
  '/password/reset',
  [body('email').isEmail().withMessage('Valid email is required')],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: errors.array(),
          },
        });
        return;
      }

      const { email } = req.body;

      // Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL}/auth/reset-password`,
      });

      if (error) {
        res.status(500).json({
          success: false,
          error: {
            code: 'RESET_FAILED',
            message: 'Failed to send password reset email',
          },
        });
        return;
      }

      // Always return success (security best practice - don't reveal if email exists)
      res.json({
        success: true,
        data: {
          message: 'If the email exists, a password reset link has been sent',
        },
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Password reset failed',
        },
      });
    }
  }
);

/**
 * POST /api/auth/password/update
 * Update password with reset token
 */
router.post(
  '/password/update',
  [
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: errors.array(),
          },
        });
        return;
      }

      const { password } = req.body;
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        res.status(500).json({
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: 'Failed to update password',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          message: 'Password updated successfully',
        },
      });
    } catch (error) {
      console.error('Password update error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Password update failed',
        },
      });
    }
  }
);

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { data: profile, error } = await supabase
      .from('users')
      .select('id, email, phone, name, role, created_at, last_login_at')
      .eq('id', req.user!.id)
      .single();

    if (error) {
      res.status(404).json({
        success: false,
        error: {
          code: 'PROFILE_NOT_FOUND',
          message: 'User profile not found',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: { user: profile },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get user profile',
      },
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout (invalidate session)
 */
router.post('/logout', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'LOGOUT_FAILED',
          message: 'Failed to logout',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        message: 'Logged out successfully',
      },
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Logout failed',
      },
    });
  }
});

export default router;
