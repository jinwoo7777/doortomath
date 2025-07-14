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

export async function DELETE(request) {
  console.log('=== 관리자 블로그 포스트 삭제 API 시작 ===');
  
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

    // URL에서 포스트 ID 추출
    const url = new URL(request.url);
    const postId = url.searchParams.get('postId');

    if (!postId) {
      console.log('❌ 포스트 ID 누락');
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    console.log('🗑️ 포스트 삭제 시작:', postId);

    // 먼저 삭제할 포스트 정보 조회 (로깅용)
    const { data: postToDelete, error: fetchError } = await supabaseAdmin
      .from('blog_posts')
      .select('id, title, status, author_id')
      .eq('id', postId)
      .neq('status', 'deleted') // 이미 삭제된 포스트는 제외
      .single();

    if (fetchError || !postToDelete) {
      console.log('❌ 삭제할 포스트 조회 실패:', fetchError);
      return NextResponse.json(
        { error: 'Blog post not found or already deleted' },
        { status: 404 }
      );
    }

    console.log('📋 삭제할 포스트 정보:', {
      ID: postToDelete.id,
      제목: postToDelete.title,
      상태: postToDelete.status,
      작성자: postToDelete.author_id
    });

    // 서비스 역할로 포스트 삭제 (물리적 삭제)
    const { error: deleteError } = await supabaseAdmin
      .from('blog_posts')
      .delete()
      .eq('id', postId)
      .neq('status', 'deleted'); // 이미 삭제된 포스트는 제외

    if (deleteError) {
      console.error('❌ 포스트 삭제 실패:', deleteError);
      
      if (deleteError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Blog post not found or already deleted' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to delete blog post' },
        { status: 500 }
      );
    }

    console.log('✅ 포스트 삭제 성공:', {
      삭제된포스트ID: postId,
      제목: postToDelete.title,
      삭제시간: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: `블로그 포스트 "${postToDelete.title}"가 성공적으로 삭제되었습니다.`,
      data: {
        deletedPostId: postId,
        deletedPostTitle: postToDelete.title
      }
    });

  } catch (error) {
    console.error('❌ API 처리 중 오류:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 