-- Fix RLS policies for student_comments to allow public access
-- Execute this in Supabase SQL Editor

-- Drop existing restrictive policies
DROP POLICY IF EXISTS public_view_student_comments ON student_comments;
DROP POLICY IF EXISTS student_view_own_comments ON student_comments;

-- Create a permissive policy for public access
-- This allows both anonymous and authenticated users to view student comments
CREATE POLICY allow_public_access_student_comments ON student_comments
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Add helpful comment
COMMENT ON POLICY allow_public_access_student_comments ON student_comments IS 'Allow public access for student score pages - application handles student filtering';