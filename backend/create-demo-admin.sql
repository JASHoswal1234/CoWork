-- Create demo cooperative admin user
-- Run this in Supabase SQL Editor

-- Step 1: Create the auth user via Supabase Auth API (run this via backend script)
-- OR manually insert into the users table with a known ID

-- Insert demo admin into users table
-- NOTE: You also need to create this in Supabase Auth dashboard manually
-- Go to: https://supabase.com/dashboard/project/cwmnedvufqogcxulriom/auth/users
-- Click "Add User" → Email: admin@shramsangam.coop, Password: Admin@123456

-- After creating in Auth dashboard, run this to set the role:
INSERT INTO users (id, email, name, role, password_hash, is_active, email_verified)
SELECT 
  id,
  email,
  'Cooperative Admin',
  'admin',
  'supabase_auth',
  true,
  true
FROM auth.users 
WHERE email = 'admin@shramsangam.coop'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
