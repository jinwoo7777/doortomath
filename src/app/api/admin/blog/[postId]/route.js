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

export async function GET(request, { params }) {
  console.log('=== 관리자 개별 블로그 포스트 조회 API 시작 ===');
  
  try {
    const { postId } = params;
    
    if (!postId) {
      console.log('❌ postId 파라미터 없음');
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    console.log('📋 조회할 포스트 ID:', postId);

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

    // 서비스 역할로 개별 블로그 포스트 조회
    console.log('📋 블로그 포스트 조회 중...');
    const { data: blogPost, error: fetchError } = await supabaseAdmin
      .from('blog_posts')
      .select(`
        *,
        profiles!blog_posts_author_id_fkey (
          full_name,
          email
        )
      `)
      .eq('id', postId)
      .neq('status', 'deleted') // 삭제된 포스트 제외
      .single();

    if (fetchError) {
      console.error('❌ 블로그 포스트 조회 실패:', fetchError);
      
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Blog post not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch blog post' },
        { status: 500 }
      );
    }

    if (!blogPost) {
      console.log('❌ 블로그 포스트 없음');
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    console.log('✅ 블로그 포스트 조회 성공:', {
      제목: blogPost.title,
      상태: blogPost.status,
      작성자: blogPost.author_id
    });

    return NextResponse.json({
      success: true,
      data: blogPost
    });

  } catch (error) {
    console.error('❌ API 처리 중 오류:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 