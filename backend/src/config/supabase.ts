import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load backend/.env even when the server is started from the workspace root.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;

// IMPORTANT: The Auth SDK client MUST use the classic anon JWT key (eyJ...) for
// supabase.auth.getUser() to work correctly. The new-style publishable key
// (sb_publishable_...) is for the Management API and cannot validate user JWTs.
// Always prefer SUPABASE_ANON_KEY; only fall back to SUPABASE_PUBLISHABLE_KEY
// if the classic key is genuinely absent.
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

// Same rule applies for the service role: prefer the classic JWT service key.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const missing = [
    !supabaseUrl && 'SUPABASE_URL',
    !supabaseAnonKey && 'SUPABASE_ANON_KEY',
  ].filter(Boolean);
  throw new Error(`Missing Supabase environment variables: ${missing.join(', ')}. Check backend/.env.`);
}

// Client for regular operations (respects RLS).
// This client is used by auth.ts middleware to call supabase.auth.getUser(token).
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for service operations (bypasses RLS).
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : supabase;

export default supabase;
