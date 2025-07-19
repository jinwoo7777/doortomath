-- Check student_comments table structure and data
-- Execute this in Supabase SQL Editor to debug

-- 1. Check if table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'student_comments' 
ORDER BY ordinal_position;

-- 2. Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity 
FROM pg_tables 
WHERE tablename = 'student_comments';

-- 3. Check existing policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'student_comments';

-- 4. Count total records in student_comments
SELECT COUNT(*) as total_comments FROM student_comments;

-- 5. Show sample data (if any)
SELECT 
    id,
    student_id,
    instructor_id,
    course_id,
    content,
    created_at
FROM student_comments 
LIMIT 5;

-- 6. Check if the specific student has comments
SELECT 
    COUNT(*) as student_comments_count
FROM student_comments 
WHERE student_id = '696a9fbf-a79b-4e29-b0b6-9967f3e0a088';