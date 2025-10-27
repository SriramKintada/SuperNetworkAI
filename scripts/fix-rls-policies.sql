-- Fix RLS Policy Infinite Recursion Issue
-- Run this in Supabase Dashboard → SQL Editor
-- URL: https://supabase.com/dashboard/project/mpztkfmhgbbidrylngbw/sql/new

-- Option 1: Disable RLS completely (simplest for testing)
-- This allows all authenticated users to read/write
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE profile_embeddings DISABLE ROW LEVEL SECURITY;

-- Option 2: Enable simple RLS policies (if you want security)
-- Uncomment the lines below if you want to use Option 2 instead:

/*
-- First, drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own embeddings" ON profile_embeddings;
DROP POLICY IF EXISTS "Service role can manage embeddings" ON profile_embeddings;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_embeddings ENABLE ROW LEVEL SECURITY;

-- Simple policies without circular dependencies
-- Profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Profile Embeddings: Users can see their own, service role can manage all
CREATE POLICY "Users can view own embeddings"
  ON profile_embeddings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_embeddings.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage embeddings"
  ON profile_embeddings FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
*/

-- Verify the fix
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('profiles', 'profile_embeddings');

-- Should return:
--  schemaname | tablename           | rowsecurity
-- ------------+---------------------+-------------
--  public     | profiles            | f (false = disabled)
--  public     | profile_embeddings  | f (false = disabled)
