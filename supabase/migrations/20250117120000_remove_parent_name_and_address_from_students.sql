-- Remove parent_name and address columns from students table
-- These fields are being removed to simplify student management

-- Remove parent_name column
ALTER TABLE students DROP COLUMN IF EXISTS parent_name;

-- Remove address column  
ALTER TABLE students DROP COLUMN IF EXISTS address;

-- Update any existing constraints or indexes that might reference these columns
-- (Add specific constraint/index removals here if any exist)

-- Add comment about the change
COMMENT ON TABLE students IS 'Student information table - parent_name and address fields removed for simplified management';