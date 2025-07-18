-- Create student_comments table
CREATE TABLE IF NOT EXISTS student_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  course_id UUID REFERENCES courses(id),
  instructor_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_student_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER student_comments_updated_at
BEFORE UPDATE ON student_comments
FOR EACH ROW
EXECUTE FUNCTION update_student_comments_updated_at();

-- Enable Row Level Security
ALTER TABLE student_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Admin policy: Administrators can perform all operations
CREATE POLICY admin_all ON student_comments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Instructor policy: Instructors can view and manage comments for students in their courses
CREATE POLICY instructor_own_courses ON student_comments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN courses c ON c.instructor_id = p.id
      WHERE p.id = auth.uid() 
      AND p.role = 'instructor'
      AND c.id = student_comments.course_id
    )
  );

-- Create index for faster queries
CREATE INDEX idx_student_comments_student_id ON student_comments(student_id);
CREATE INDEX idx_student_comments_course_id ON student_comments(course_id);
CREATE INDEX idx_student_comments_instructor_id ON student_comments(instructor_id);