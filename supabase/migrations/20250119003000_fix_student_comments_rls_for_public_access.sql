-- Fix RLS policies for student_comments to allow public access
-- This allows the public score pages to access student comments

-- Drop existing public policy that might be too restrictive
DROP POLICY IF EXISTS public_view_student_comments ON student_comments;

-- Create a more permissive policy for public access
-- This allows anonymous users to view student comments
-- The application will handle filtering by student_id
CREATE POLICY allow_public_access_student_comments ON student_comments
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Also ensure the existing student view policy works correctly
DROP POLICY IF EXISTS student_view_own_comments ON student_comments;

-- Recreate student view policy (for authenticated users)
CREATE POLICY student_view_own_comments ON student_comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = student_comments.student_id
    )
  );

-- Add helpful comments
COMMENT ON POLICY allow_public_access_student_comments ON student_comments IS 'Allow public access for student score pages - application handles student filtering';
COMMENT ON POLICY student_view_own_comments ON student_comments IS 'Allow authenticated users to view student comments';