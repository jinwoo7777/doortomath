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

export async function PATCH(request) {
  console.log('=== 관리자 블로그 포스트 상태 변경 API 시작 ===');
  
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

    // 요청 본문에서 데이터 추출
    const { postId, newStatus } = await request.json();

    if (!postId || !newStatus) {
      console.log('❌ 필수 파라미터 누락:', { postId, newStatus });
      return NextResponse.json(
        { error: 'Post ID and new status are required' },
        { status: 400 }
      );
    }

    // 상태 값 검증
    const validStatuses = ['draft', 'published', 'archived'];
    if (!validStatuses.includes(newStatus)) {
      console.log('❌ 잘못된 상태 값:', newStatus);
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    console.log('📝 포스트 상태 변경 중:', { postId, newStatus });

    // 업데이트할 데이터 준비
    const updateData = {
      status: newStatus,
      updated_at: new Date().toISOString()
    };

    // 발행 상태로 변경하는 경우 발행 시간 설정
    if (newStatus === 'published') {
      updateData.published_at = new Date().toISOString();
      console.log('📅 발행 시간 설정:', updateData.published_at);
    }

    // 서비스 역할로 포스트 상태 업데이트
    const { data: updatedPost, error: updateError } = await supabaseAdmin
      .from('blog_posts')
      .update(updateData)
      .eq('id', postId)
      .neq('status', 'deleted') // 삭제된 포스트는 업데이트하지 않음
      .select('*')
      .single();

    if (updateError) {
      console.error('❌ 포스트 상태 업데이트 실패:', updateError);
      
      if (updateError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Blog post not found or already deleted' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to update blog post status' },
        { status: 500 }
      );
    }

    if (!updatedPost) {
      console.log('❌ 업데이트된 포스트 없음');
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    console.log('✅ 포스트 상태 변경 성공:', {
      제목: updatedPost.title,
      이전상태: '(알 수 없음)',
      새상태: updatedPost.status,
      업데이트시간: updatedPost.updated_at
    });

    // 상태 변경 성공 메시지
    const statusMessages = {
      'draft': '초안으로 변경',
      'published': '발행',
      'archived': '보관'
    };

    return NextResponse.json({
      success: true,
      message: `블로그 포스트가 ${statusMessages[newStatus]}되었습니다.`,
      data: updatedPost
    });

  } catch (error) {
    console.error('❌ API 처리 중 오류:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 