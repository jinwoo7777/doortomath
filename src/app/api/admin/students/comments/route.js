import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET handler for fetching student comments
export async function GET(request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const studentId = searchParams.get('studentId');
    
    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });
    
    // Check user authentication and role
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    // 병렬로 데이터 가져오기 (Promise.all 사용)
    const [commentsResult, coursesResult, teachersResult] = await Promise.all([
      // 1. 코멘트 데이터 가져오기
      supabase
        .from('student_comments')
        .select(`
          *,
          instructor:instructor_id(id, full_name, email),
          schedule:schedule_id(id, subject)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false }),
      
      // 2. 학생 강의 정보 가져오기
      supabase
        .from('student_enrollments')
        .select(`
          id,
          schedule:schedule_id(
            id,
            subject,
            teacher_name
          )
        `)
        .eq('student_id', studentId),
      
      // 3. 강사 정보 가져오기
      supabase
        .from('teachers')
        .select('id, name, profile_image_url')
    ]);

    // 에러 처리
    if (commentsResult.error) {
      console.error('Error fetching student comments:', commentsResult.error);
      return NextResponse.json(
        { error: 'Failed to fetch student comments' },
        { status: 500 }
      );
    }

    // 강의 정보 추출
    const courses = coursesResult.data
      ?.filter(item => item.schedule)
      .map(item => ({
        id: item.schedule.id,
        title: item.schedule.subject,
        instructor_name: item.schedule.teacher_name || '강사 정보 없음'
      })) || [];

    // 강사 정보 추출
    const teachers = teachersResult.data || [];

    // 코멘트 데이터에 강사 정보 보완
    const enhancedComments = commentsResult.data?.map(comment => {
      // 해당 코멘트의 강의 ID와 일치하는 강의 찾기
      const relatedCourse = courses.find(course => 
        course.id === comment.schedule_id || 
        course.id === comment.course_id
      );
      
      // 강사 정보와 강의 정보 업데이트
      if (relatedCourse) {
        // 강사 이름으로 teachers 테이블에서 강사 정보 찾기
        const teacherInfo = teachers.find(teacher => 
          teacher.name === relatedCourse.instructor_name
        );
        
        // 강사 정보 업데이트
        if (comment.instructor) {
          comment.instructor.full_name = relatedCourse.instructor_name;
          if (teacherInfo && teacherInfo.profile_image_url) {
            comment.instructor.avatar_url = teacherInfo.profile_image_url;
          }
        } else {
          comment.instructor = {
            full_name: relatedCourse.instructor_name,
            ...(teacherInfo && { avatar_url: teacherInfo.profile_image_url })
          };
        }
        
        // 강의 정보 업데이트
        if (!comment.schedule) {
          comment.schedule = {
            id: relatedCourse.id,
            subject: relatedCourse.title
          };
        }
      }
      
      return comment;
    }) || [];

    return NextResponse.json({ 
      comments: enhancedComments,
      courses,
      teachers
    });
  } catch (error) {
    console.error('Unexpected error in student comments API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST handler for adding a new student comment
export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check user authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    // Only allow admin and instructor roles
    if (profile.role !== 'admin' && profile.role !== 'instructor') {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Parse request body
    const { studentId, content, scheduleId, instructorId } = await request.json();
    
    // Validate required fields
    if (!studentId || !content) {
      return NextResponse.json(
        { error: 'Student ID and content are required' },
        { status: 400 }
      );
    }

    // Validate content length
    if (content.length > 1000) {
      return NextResponse.json(
        { error: 'Comment content cannot exceed 1000 characters' },
        { status: 400 }
      );
    }

    // Insert new comment
    const { data: comment, error } = await supabase
      .from('student_comments')
      .insert([
        {
          student_id: studentId,
          content,
          schedule_id: scheduleId || null,
          instructor_id: instructorId || null,
          created_by: user.id
        }
      ])
      .select(`
        *,
        instructor:instructor_id(id, full_name, email),
        schedule:schedule_id(id, subject)
      `);

    if (error) {
      console.error('Error adding student comment:', error);
      return NextResponse.json(
        { error: 'Failed to add student comment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ comment: comment[0] });
  } catch (error) {
    console.error('Unexpected error in add student comment API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE handler for removing a student comment
export async function DELETE(request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const commentId = searchParams.get('id');
    
    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });
    
    // Check user authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    // Only allow admin and instructor roles
    if (profile.role !== 'admin' && profile.role !== 'instructor') {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    // If user is instructor, check if they have permission to delete this comment
    if (profile.role === 'instructor') {
      // Get the comment to check if it belongs to a course taught by this instructor
      const { data: comment, error: commentError } = await supabase
        .from('student_comments')
        .select(`
          id,
          schedule_id,
          instructor_id,
          created_by
        `)
        .eq('id', commentId)
        .single();

      if (commentError) {
        console.error('Error fetching comment for permission check:', commentError);
        return NextResponse.json(
          { error: 'Failed to fetch comment for permission check' },
          { status: 500 }
        );
      }

      // Check if instructor created this comment or is assigned to the course
      const isCreator = comment.created_by === user.id;
      const isInstructor = comment.instructor_id === user.id;
      
      if (!isCreator && !isInstructor) {
        return NextResponse.json(
          { error: 'You do not have permission to delete this comment' },
          { status: 403 }
        );
      }
    }

    // Delete the comment
    const { error } = await supabase
      .from('student_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Error deleting student comment:', error);
      return NextResponse.json(
        { error: 'Failed to delete student comment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: '코멘트가 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('Unexpected error in delete student comment API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}