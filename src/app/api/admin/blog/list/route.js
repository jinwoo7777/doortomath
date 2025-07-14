import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 서비스 역할 키로 Supabase 클라이언트 생성 (RLS 우회)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// 일반 클라이언트 (인증 확인용)
const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
  console.log('=== 관리자 블로그 포스트 목록 조회 API 시작 ===');
  
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ 인증 토큰 없음');
      return NextResponse.json(
        { error: 'Auth session missing!' },
        { status: 401 }
      );
    }

    console.log('🔍 사용자 인증 확인 중...');
    
    // 토큰으로 사용자 확인
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !user) {
      console.log('❌ 사용자 인증 실패:', authError);
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    console.log('✅ 사용자 확인됨:', user.id);

    // 사용자 역할 확인
    console.log('🔍 사용자 역할 확인 중...');
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.log('❌ 프로필 조회 실패:', profileError);
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    if (profile.role !== 'admin') {
      console.log('❌ 관리자 권한 없음:', profile.role);
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    console.log('✅ 관리자 권한 확인됨');

    // 서비스 역할로 모든 블로그 포스트 조회
    console.log('📋 모든 블로그 포스트 조회 중...');
    const { data: blogPosts, error: fetchError } = await supabaseAdmin
      .from('blog_posts')
      .select(`
        *,
        profiles!blog_posts_author_id_fkey (
          full_name,
          email
        )
      `)
      .neq('status', 'deleted') // 삭제된 포스트 제외
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ 블로그 포스트 조회 실패:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch blog posts' },
        { status: 500 }
      );
    }

    console.log('✅ 블로그 포스트 조회 성공:', {
      총개수: blogPosts?.length || 0,
      상태별개수: {
        draft: blogPosts?.filter(p => p.status === 'draft').length || 0,
        published: blogPosts?.filter(p => p.status === 'published').length || 0,
        archived: blogPosts?.filter(p => p.status === 'archived').length || 0
      }
    });

    return NextResponse.json({
      success: true,
      data: blogPosts || []
    });

  } catch (error) {
    console.error('❌ API 처리 중 오류:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 