import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

/**
 * GET /api/test/users
 * Check if users exist in database (for testing only)
 */
router.get('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error, count } = await supabase
      .from('users')
      .select('id, email, name, role', { count: 'exact' })
      .limit(10);

    if (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'QUERY_FAILED',
          message: error.message,
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        total: count,
        users: data,
      },
    });
  } catch (error) {
    console.error('Test users error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to query users',
      },
    });
  }
});

/**
 * POST /api/test/create-user
 * Directly create a user in database (bypasses Supabase Auth for testing)
 */
router.post('/create-user', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, phone, name, role, password_hash } = req.body;

    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        phone,
        name,
        role,
        password_hash: password_hash || 'dummy_hash_for_testing',
        phone_verified: true,
        email_verified: true,
      })
      .select()
      .single();

    if (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'INSERT_FAILED',
          message: error.message,
        },
      });
      return;
    }

    res.json({
      success: true,
      data: { user: data },
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create user',
      },
    });
  }
});

export default router;
