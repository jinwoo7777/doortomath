-- Add parent_phone field to students table for enhanced security
-- This field will be used for password reset verification

-- Add parent_phone column to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS parent_phone VARCHAR(20);

-- Add comment explaining the field
COMMENT ON COLUMN students.parent_phone IS 'Parent or guardian phone number for account verification and password reset';

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_students_parent_phone ON students(parent_phone);

-- Update RLS policies to include parent_phone in allowed columns
-- Note: Ensure that parent_phone is handled securely in existing policies