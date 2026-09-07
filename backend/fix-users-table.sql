-- Fix users table constraints for hackathon
-- Run this in Supabase SQL Editor

-- Increase phone length
ALTER TABLE users ALTER COLUMN phone TYPE VARCHAR(20);

-- Make password_hash optional (we use Supabase Auth)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;

-- Make phone unique constraint optional too
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_phone_key;
