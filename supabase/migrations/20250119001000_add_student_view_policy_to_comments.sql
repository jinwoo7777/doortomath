-- Add RLS policy for students to view their own comments
-- Students should be able to view comments about themselves

-- Student policy: Students can view comments about themselves
CREATE POLICY student_view_own_comments ON student_comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'student'
      AND p.id = student_comments.student_id
    )
  );

-- Also add policy for public access without authentication (for public score pages)
-- This will allow the public score page to access comments for the specific student
CREATE POLICY public_view_student_comments ON student_comments
  FOR SELECT
  TO anon
  USING (true);  -- We'll handle the specific student filtering in the application logic

-- Add comment to explain the policy
COMMENT ON POLICY student_view_own_comments ON student_comments IS 'Allow students to view comments about themselves';
COMMENT ON POLICY public_view_student_comments ON student_comments IS 'Allow public access for student score pages with proper filtering';