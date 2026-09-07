import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { supabase, supabaseAdmin } from '../config/supabase';
import { authenticate } from '../middleware/auth';
import { inMemoryStore } from '../db/inMemoryStore';

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
    body('phone').notEmpty().withMessage('Phone number is required'),
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

      // Use admin API to create user - bypasses email rate limits
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm, no email sent
        user_metadata: { name, phone, role },
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

      // Create user profile in database using service role key
      // First check if profile already exists (in case of retry)
      const { data: existingProfile } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', authData.user.id)
        .single();

      let profile;
      if (existingProfile) {
        // Profile already exists, just fetch it
        const { data } = await supabaseAdmin
          .from('users')
          .select()
          .eq('id', authData.user.id)
          .single();
        profile = data;
      } else {
        const { data, error: profileError } = await supabaseAdmin
          .from('users')
          .insert({
            id: authData.user.id,
            email,
            phone: phone || null,
            name,
            role,
            password_hash: 'supabase_auth',
            phone_verified: false,
            email_verified: true,
          })
          .select()
          .single();

        if (profileError) {
          console.error('Profile creation error:', profileError);
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
          res.status(500).json({
            success: false,
            error: {
              code: 'PROFILE_CREATION_FAILED',
              message: `Failed to create user profile: ${profileError.message}`,
            },
          });
          return;
        }
        profile = data;
      }

      // If role is worker, auto-create pending worker profile
      if (role === 'worker' && profile) {
        const { data: existingWorker } = await supabaseAdmin
          .from('workers').select('id').eq('user_id', profile.id).single();

        if (!existingWorker) {
          const { data: newWorker } = await supabaseAdmin
            .from('workers')
            .insert({ user_id: profile.id, verification_status: 'pending', available: false, rating: 0, total_ratings: 0, completed_jobs: 0 })
            .select('id').single();

          if (newWorker) {
            await supabaseAdmin.from('worker_wallets').insert({ worker_id: newWorker.id, balance: 0, total_earned: 0, total_withdrawn: 0 });
          }
        }
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

      let userObj: any = null;
      let accessToken: string | null = null;
      let refreshToken: string | null = null;
      let expiresAt: number | null = null;

      // Try signing in with Supabase Auth
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!error && data?.user && data?.session) {
          userObj = data.user;
          accessToken = data.session.access_token;
          refreshToken = data.session.refresh_token;
          expiresAt = data.session.expires_at || null;
        }
      } catch (authErr) {
        console.warn('Supabase auth sign in error:', authErr);
      }

      // If Supabase auth was unavailable or returned an error, check demo credentials
      if (!userObj || !accessToken) {
        const isDemoCustomer = (email === 'customer@sahakar.org' || email === 'priya@sahakar.org') && password === 'demo123';
        const isDemoWorker = email.includes('@sahakar.org') && (
          email.includes('rajesh') || email.includes('suresh') || email.includes('amit') || 
          email.includes('manoj') || email.includes('ramesh') || email.includes('worker')
        ) && password === 'demo123';
        const isDemoAdmin = (email === 'admin@cooperative.org' || email === 'admin@sahakar.org') && (password === 'admin123' || password === 'demo123');

        if (isDemoCustomer || isDemoWorker || isDemoAdmin) {
          const role = isDemoCustomer ? 'customer' : (isDemoWorker ? 'worker' : 'admin');
          let name = 'Cooperative Admin';
          let userId = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d';

          if (isDemoCustomer) {
            name = 'Priya Sharma';
            userId = '46740ff3-9955-4573-a4a5-d9d674ffa9e7';
          } else if (isDemoWorker) {
            if (email.includes('suresh')) {
              name = 'Suresh Patil';
              userId = '78b525a6-92cc-47fb-9cdc-58f3a8dd01d2';
            } else if (email.includes('amit')) {
              name = 'Amit Verma';
              userId = '78b525a6-92cc-47fb-9cdc-58f3a8dd01d3';
            } else if (email.includes('manoj')) {
              name = 'Manoj Kulkarni';
              userId = '78b525a6-92cc-47fb-9cdc-58f3a8dd01d4';
            } else if (email.includes('ramesh')) {
              name = 'Ramesh Sharma';
              userId = '78b525a6-92cc-47fb-9cdc-58f3a8dd01d5';
            } else {
              name = 'Rajesh Kumar';
              userId = '78b525a6-92cc-47fb-9cdc-58f3a8dd01d9';
            }
          }

          userObj = { id: userId, email, user_metadata: { name, role, phone: '+91 98220 11001' } };
          accessToken = `demo-token-${userId}-${Date.now()}`;
        } else {
          res.status(401).json({
            success: false,
            error: {
              code: 'LOGIN_FAILED',
              message: 'Invalid email or password',
            },
          });
          return;
        }
      }

      // Get or create user profile
      let profile: any = null;
      try {
        const { data } = await supabaseAdmin
          .from('users')
          .select('id, email, phone, name, role')
          .eq('id', userObj.id)
          .maybeSingle();
        profile = data;
      } catch {}

      if (!profile) {
        const role = userObj.user_metadata?.role || (email.includes('rajesh') || email.includes('worker') ? 'worker' : (email.includes('admin') ? 'admin' : 'customer'));
        const name = userObj.user_metadata?.name || (email.includes('rajesh') ? 'Rajesh Kumar' : (email.includes('admin') ? 'Cooperative Admin' : 'Priya Sharma'));
        profile = {
          id: userObj.id,
          email,
          name,
          phone: userObj.user_metadata?.phone || '+91 98220 11001',
          role,
        };

        try {
          await supabaseAdmin.from('users').upsert(profile);
        } catch {}
      }

      // If user is a worker, ensure worker profile exists
      if (profile.role === 'worker') {
        inMemoryStore.ensureWorkerForUser(profile.id, email, profile.name, profile.phone);

        try {
          const { data: existingWorker } = await supabaseAdmin
            .from('workers')
            .select('id')
            .eq('user_id', profile.id)
            .maybeSingle();

          if (!existingWorker) {
            const { data: createdWorker } = await supabaseAdmin
              .from('workers')
              .insert({
                user_id: profile.id,
                location: 'POINT(73.8077 18.5074)',
                address: 'Kothrud, Pune',
                city: 'Pune',
                service_radius: 15,
                available: true,
                verification_status: 'verified',
                rating: 4.88,
                total_ratings: 142,
                completed_jobs: 167,
                photo_url: '/illustrations/plumber.png',
              })
              .select()
              .single();

            if (createdWorker) {
              await supabaseAdmin.from('worker_skills').insert({
                worker_id: createdWorker.id,
                category: 'Plumbing',
                subcategory: 'Pipe Fitting & Leak Repair',
                skill_level: 'expert',
                verified: true,
              });

              await supabaseAdmin.from('worker_wallets').insert({
                worker_id: createdWorker.id,
                balance: 1450,
                total_earned: 32400,
                total_withdrawn: 0,
              });
            }
          }
        } catch {}
      }

      // Update last login safely
      if (userObj?.id) {
        try {
          await supabaseAdmin
            .from('users')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', userObj.id);
        } catch {}
      }

      res.json({
        success: true,
        data: {
          user: profile,
          session: {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_at: expiresAt,
          },
        },
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error?.message || 'Login failed',
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
