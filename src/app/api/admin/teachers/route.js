import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET handler for fetching teachers with profile images
export async function GET(request) {
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

    // Fetch teachers with profile images
    const { data: teachers, error } = await supabase
      .from('teachers')
      .select('id, name, profile_image_url')
      .order('name');

    if (error) {
      console.error('Error fetching teachers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch teachers' },
        { status: 500 }
      );
    }

    return NextResponse.json({ teachers });
  } catch (error) {
    console.error('Unexpected error in teachers API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}