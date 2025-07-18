import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET handler for fetching student courses with instructor information
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

    // Fetch student schedules with instructor information
    const { data: studentEnrollments, error } = await supabase
      .from('student_enrollments')
      .select(`
        id,
        schedule:schedule_id(
          id,
          subject,
          teacher_name
        )
      `)
      .eq('student_id', studentId);

    if (error) {
      console.error('Error fetching student courses:', error);
      return NextResponse.json(
        { error: 'Failed to fetch student courses' },
        { status: 500 }
      );
    }

    // Extract and format course and instructor information
    const courses = studentEnrollments
      .filter(item => item.schedule)
      .map(item => ({
        id: item.schedule.id,
        title: item.schedule.subject,
        instructor_id: null, // We don't have instructor IDs in this schema
        instructor_name: item.schedule.teacher_name || '강사 정보 없음'
      }));

    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Unexpected error in student courses API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}