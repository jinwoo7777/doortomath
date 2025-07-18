import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// DELETE handler for removing a student comment
export async function DELETE(request, { params }) {
  try {
    const commentId = params.id;
    
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

    // For instructors, verify they can delete this comment (either they created it or it's for their course)
    if (profile.role === 'instructor') {
      const { data: comment, error: commentError } = await supabase
        .from('student_comments')
        .select('*')
        .eq('id', commentId)
        .single();
      
      if (commentError) {
        return NextResponse.json(
          { error: 'Failed to fetch comment details' },
          { status: 500 }
        );
      }
      
      // Check if instructor created the comment or is assigned to the course
      const isCreator = comment.created_by === user.id;
      const isInstructor = comment.instructor_id === user.id;
      
      if (!isCreator && !isInstructor) {
        return NextResponse.json(
          { error: 'Permission denied: You can only delete your own comments or comments for your courses' },
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in delete student comment API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}