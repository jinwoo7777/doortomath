-- Fix student_comments table to reference students and teachers tables instead of profiles
-- The student_comments table should reference the correct tables for student_id and instructor_id

-- First, drop the existing foreign key constraints
ALTER TABLE student_comments DROP CONSTRAINT IF EXISTS student_comments_student_id_fkey;
ALTER TABLE student_comments DROP CONSTRAINT IF EXISTS student_comments_instructor_id_fkey;

-- Add new foreign key constraint to reference students table
ALTER TABLE student_comments 
ADD CONSTRAINT student_comments_student_id_fkey 
FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;

-- Add new foreign key constraint to reference teachers table
ALTER TABLE student_comments 
ADD CONSTRAINT student_comments_instructor_id_fkey 
FOREIGN KEY (instructor_id) REFERENCES teachers(id) ON DELETE SET NULL;

-- Update the RLS policies to work with students table
DROP POLICY IF EXISTS student_view_own_comments ON student_comments;

-- Create new policy for students to view their own comments
CREATE POLICY student_view_own_comments ON student_comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN profiles p ON p.id = s.user_id
      WHERE p.id = auth.uid() 
      AND p.role = 'student'
      AND s.id = student_comments.student_id
    )
  );

-- Update comments
COMMENT ON CONSTRAINT student_comments_student_id_fkey ON student_comments IS 'References students table for proper student identification';
COMMENT ON CONSTRAINT student_comments_instructor_id_fkey ON student_comments IS 'References teachers table for instructor information';