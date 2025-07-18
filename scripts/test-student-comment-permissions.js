/**
 * Script to test permissions for student comments feature
 * 
 * This script tests the Row Level Security (RLS) policies for the student_comments table
 * by simulating different user roles (admin, instructor, student) and attempting various operations.
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
dotenv.config();

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Test users (replace with actual test users from your database)
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'password';

const INSTRUCTOR_EMAIL = 'instructor@example.com';
const INSTRUCTOR_PASSWORD = 'password';

const STUDENT_EMAIL = 'student@example.com';
const STUDENT_PASSWORD = 'password';

// Test data
let testStudentId;
let testCourseId;
let testInstructorId;
let testCommentId;

/**
 * Run permission tests
 */
async function runPermissionTests() {
  try {
    console.log('🔒 Starting student comment permission tests...');
    
    // Setup test data
    await setupTestData();
    
    // Test admin permissions
    await testAdminPermissions();
    
    // Test instructor permissions
    await testInstructorPermissions();
    
    // Test student permissions
    await testStudentPermissions();
    
    // Cleanup test data
    await cleanupTestData();
    
    console.log('✅ All permission tests completed successfully!');
  } catch (error) {
    console.error('❌ Permission test failed:', error);
    process.exit(1);
  }
}

/**
 * Setup test data
 */
async function setupTestData() {
  console.log('📝 Setting up test data...');
  
  // Get a test student
  const { data: students, error: studentError } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'student')
    .limit(1);
  
  if (studentError || !students.length) {
    throw new Error('Failed to find test student: ' + (studentError?.message || 'No students found'));
  }
  
  testStudentId = students[0].id;
  
  // Get a test instructor
  const { data: instructors, error: instructorError } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'instructor')
    .limit(1);
  
  if (instructorError || !instructors.length) {
    throw new Error('Failed to find test instructor: ' + (instructorError?.message || 'No instructors found'));
  }
  
  testInstructorId = instructors[0].id;
  
  // Get a test course
  const { data: courses, error: courseError } = await supabase
    .from('courses')
    .select('id')
    .eq('instructor_id', testInstructorId)
    .limit(1);
  
  if (courseError || !courses.length) {
    throw new Error('Failed to find test course: ' + (courseError?.message || 'No courses found'));
  }
  
  testCourseId = courses[0].id;
  
  // Create a test comment using service role (bypassing RLS)
  const { data: comment, error: commentError } = await supabase
    .from('student_comments')
    .insert([
      {
        student_id: testStudentId,
        content: 'Test comment for permission testing',
        course_id: testCourseId,
        instructor_id: testInstructorId,
        created_by: testInstructorId
      }
    ])
    .select();
  
  if (commentError || !comment.length) {
    throw new Error('Failed to create test comment: ' + (commentError?.message || 'No comment created'));
  }
  
  testCommentId = comment[0].id;
  
  console.log('✅ Test data setup complete');
  console.log(`   - Test student ID: ${testStudentId}`);
  console.log(`   - Test instructor ID: ${testInstructorId}`);
  console.log(`   - Test course ID: ${testCourseId}`);
  console.log(`   - Test comment ID: ${testCommentId}`);
}

/**
 * Test admin permissions
 */
async function testAdminPermissions() {
  console.log('\n🧪 Testing admin permissions...');
  
  // Login as admin
  const { data: adminAuth, error: adminAuthError } = await supabase.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  
  if (adminAuthError) {
    throw new Error('Failed to login as admin: ' + adminAuthError.message);
  }
  
  // Create admin client
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      },
      global: {
        headers: {
          Authorization: `Bearer ${adminAuth.session.access_token}`
        }
      }
    }
  );
  
  // Test 1: Admin can read comments
  console.log('   Testing: Admin can read comments');
  const { data: readData, error: readError } = await adminClient
    .from('student_comments')
    .select()
    .eq('id', testCommentId);
  
  if (readError || !readData.length) {
    throw new Error('Admin failed to read comment: ' + (readError?.message || 'No data returned'));
  }
  console.log('   ✅ Admin can read comments');
  
  // Test 2: Admin can create comments
  console.log('   Testing: Admin can create comments');
  const { data: createData, error: createError } = await adminClient
    .from('student_comments')
    .insert([
      {
        student_id: testStudentId,
        content: 'Admin test comment',
        course_id: testCourseId,
        instructor_id: testInstructorId,
        created_by: adminAuth.user.id
      }
    ])
    .select();
  
  if (createError || !createData.length) {
    throw new Error('Admin failed to create comment: ' + (createError?.message || 'No data returned'));
  }
  console.log('   ✅ Admin can create comments');
  
  // Test 3: Admin can update comments
  console.log('   Testing: Admin can update comments');
  const { data: updateData, error: updateError } = await adminClient
    .from('student_comments')
    .update({ content: 'Updated admin test comment' })
    .eq('id', createData[0].id)
    .select();
  
  if (updateError || !updateData.length) {
    throw new Error('Admin failed to update comment: ' + (updateError?.message || 'No data returned'));
  }
  console.log('   ✅ Admin can update comments');
  
  // Test 4: Admin can delete comments
  console.log('   Testing: Admin can delete comments');
  const { error: deleteError } = await adminClient
    .from('student_comments')
    .delete()
    .eq('id', createData[0].id);
  
  if (deleteError) {
    throw new Error('Admin failed to delete comment: ' + deleteError.message);
  }
  console.log('   ✅ Admin can delete comments');
  
  // Logout admin
  await adminClient.auth.signOut();
  
  console.log('✅ Admin permission tests passed');
}

/**
 * Test instructor permissions
 */
async function testInstructorPermissions() {
  console.log('\n🧪 Testing instructor permissions...');
  
  // Login as instructor
  const { data: instructorAuth, error: instructorAuthError } = await supabase.auth.signInWithPassword({
    email: INSTRUCTOR_EMAIL,
    password: INSTRUCTOR_PASSWORD,
  });
  
  if (instructorAuthError) {
    throw new Error('Failed to login as instructor: ' + instructorAuthError.message);
  }
  
  // Create instructor client
  const instructorClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      },
      global: {
        headers: {
          Authorization: `Bearer ${instructorAuth.session.access_token}`
        }
      }
    }
  );
  
  // Test 1: Instructor can read comments for their courses
  console.log('   Testing: Instructor can read comments for their courses');
  const { data: readData, error: readError } = await instructorClient
    .from('student_comments')
    .select()
    .eq('course_id', testCourseId);
  
  if (readError) {
    throw new Error('Instructor failed to read course comments: ' + readError.message);
  }
  console.log('   ✅ Instructor can read comments for their courses');
  
  // Test 2: Instructor can create comments for their courses
  console.log('   Testing: Instructor can create comments for their courses');
  const { data: createData, error: createError } = await instructorClient
    .from('student_comments')
    .insert([
      {
        student_id: testStudentId,
        content: 'Instructor test comment',
        course_id: testCourseId,
        instructor_id: testInstructorId,
        created_by: instructorAuth.user.id
      }
    ])
    .select();
  
  if (createError || !createData.length) {
    throw new Error('Instructor failed to create comment: ' + (createError?.message || 'No data returned'));
  }
  console.log('   ✅ Instructor can create comments for their courses');
  
  // Test 3: Instructor can delete their own comments
  console.log('   Testing: Instructor can delete their own comments');
  const { error: deleteError } = await instructorClient
    .from('student_comments')
    .delete()
    .eq('id', createData[0].id);
  
  if (deleteError) {
    throw new Error('Instructor failed to delete own comment: ' + deleteError.message);
  }
  console.log('   ✅ Instructor can delete their own comments');
  
  // Test 4: Instructor cannot access comments for courses they don't teach
  console.log('   Testing: Instructor cannot access comments for courses they don\'t teach');
  
  // First, find a course not taught by this instructor
  const { data: otherCourses, error: otherCoursesError } = await supabase
    .from('courses')
    .select('id')
    .neq('instructor_id', testInstructorId)
    .limit(1);
  
  if (otherCoursesError || !otherCourses.length) {
    console.log('   ⚠️ Skipping test: Could not find a course not taught by this instructor');
  } else {
    const otherCourseId = otherCourses[0].id;
    
    // Create a comment for the other course using service role
    const { data: otherComment, error: otherCommentError } = await supabase
      .from('student_comments')
      .insert([
        {
          student_id: testStudentId,
          content: 'Comment for other course',
          course_id: otherCourseId,
          created_by: 'system'
        }
      ])
      .select();
    
    if (otherCommentError || !otherComment.length) {
      console.log('   ⚠️ Skipping test: Could not create comment for other course');
    } else {
      // Try to access the comment as the instructor
      const { data: accessData, error: accessError } = await instructorClient
        .from('student_comments')
        .select()
        .eq('id', otherComment[0].id);
      
      // Should either return an error or empty data
      if (accessError || !accessData || accessData.length === 0) {
        console.log('   ✅ Instructor cannot access comments for courses they don\'t teach');
      } else {
        throw new Error('Instructor could access comments for courses they don\'t teach');
      }
      
      // Clean up the other comment
      await supabase
        .from('student_comments')
        .delete()
        .eq('id', otherComment[0].id);
    }
  }
  
  // Logout instructor
  await instructorClient.auth.signOut();
  
  console.log('✅ Instructor permission tests passed');
}

/**
 * Test student permissions
 */
async function testStudentPermissions() {
  console.log('\n🧪 Testing student permissions...');
  
  // Login as student
  const { data: studentAuth, error: studentAuthError } = await supabase.auth.signInWithPassword({
    email: STUDENT_EMAIL,
    password: STUDENT_PASSWORD,
  });
  
  if (studentAuthError) {
    throw new Error('Failed to login as student: ' + studentAuthError.message);
  }
  
  // Create student client
  const studentClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      },
      global: {
        headers: {
          Authorization: `Bearer ${studentAuth.session.access_token}`
        }
      }
    }
  );
  
  // Test 1: Student cannot read comments
  console.log('   Testing: Student cannot read comments');
  const { data: readData, error: readError } = await studentClient
    .from('student_comments')
    .select();
  
  // Should either return an error or empty data
  if (readError || !readData || readData.length === 0) {
    console.log('   ✅ Student cannot read comments');
  } else {
    throw new Error('Student could read comments');
  }
  
  // Test 2: Student cannot create comments
  console.log('   Testing: Student cannot create comments');
  const { data: createData, error: createError } = await studentClient
    .from('student_comments')
    .insert([
      {
        student_id: testStudentId,
        content: 'Student test comment',
        course_id: testCourseId,
        created_by: studentAuth.user.id
      }
    ]);
  
  // Should return an error
  if (createError) {
    console.log('   ✅ Student cannot create comments');
  } else {
    throw new Error('Student could create comments');
  }
  
  // Test 3: Student cannot delete comments
  console.log('   Testing: Student cannot delete comments');
  const { error: deleteError } = await studentClient
    .from('student_comments')
    .delete()
    .eq('id', testCommentId);
  
  // Should return an error
  if (deleteError) {
    console.log('   ✅ Student cannot delete comments');
  } else {
    throw new Error('Student could delete comments');
  }
  
  // Logout student
  await studentClient.auth.signOut();
  
  console.log('✅ Student permission tests passed');
}

/**
 * Cleanup test data
 */
async function cleanupTestData() {
  console.log('\n🧹 Cleaning up test data...');
  
  // Delete the test comment
  const { error: deleteError } = await supabase
    .from('student_comments')
    .delete()
    .eq('id', testCommentId);
  
  if (deleteError) {
    console.warn('Warning: Failed to delete test comment:', deleteError.message);
  }
  
  console.log('✅ Cleanup complete');
}

// Run the tests
runPermissionTests();