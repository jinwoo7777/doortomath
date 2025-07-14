import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { logger } from '@/utils/logger.js';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const dynamic = 'force-dynamic';

// Supabase 클라이언트 초기화
const createSupabaseClient = () => {
  cookies().getAll(); // This is a workaround for a Next.js bug
  return createRouteHandlerClient({
    cookies,
  });
};

export async function GET(request) {
  logger.debug('[design/main] GET called');
  const supabase = createSupabaseClient();

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      logger.error('인증 오류:', authError.message, authError.status, authError.name);
      return NextResponse.json({ error: '인증 오류', details: authError.message }, { status: authError.status || 500 });
    }

    if (!user) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    // Get user role from metadata or profiles table
    let userRole = user.user_metadata?.role;

    if (!userRole) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        logger.error('프로필 조회 오류:', profileError);
        return NextResponse.json({ error: '프로필 조회 오류' }, { status: 500 });
      }
      userRole = profile?.role || null;
    }
    logger.debug('Authenticated user ID:', user.id, 'Role:', userRole);

    if (userRole !== 'admin') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }
    
    // Fetch all main page content
    const { data, error } = await supabaseAdmin
      .from('main_page_content')
      .select('*');
    
    if (error) {
      logger.error('Supabase fetch error:', error);
      return NextResponse.json(
        { error: '데이터를 불러오는 데 실패했습니다.', details: error.message, error_code: error.code, error_hint: error.hint },
        { status: 500 }
      );
    }
    
    // Convert array to object with section_name as key
    const content = data.reduce((acc, item) => {
      acc[item.section_name] = item.content;
      return acc;
    }, {});
    
    return NextResponse.json({ content });
    
  } catch (error) {
    logger.error('Error fetching main page content:', error);
    return NextResponse.json(
      { error: '내용을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  logger.debug('[design/main] POST called');
  const supabase = createSupabaseClient();

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      logger.error('인증 오류:', authError.message, authError.status, authError.name);
      return NextResponse.json({ error: '인증 오류', details: authError.message }, { status: authError.status || 500 });
    }

    if (!user) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    // Get user role from metadata or profiles table
    let userRole = user.user_metadata?.role;

    if (!userRole) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        logger.error('프로필 조회 오류:', profileError);
        return NextResponse.json({ error: '프로필 조회 오류' }, { status: 500 });
      }
      userRole = profile?.role || null;
    }
    logger.debug('Authenticated user ID:', user.id, 'Role:', userRole);

    if (userRole !== 'admin') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const { section_name, content } = await request.json();
    logger.debug('Received content in API route:', content);

    if (!section_name || !content) {
      return NextResponse.json({ error: '섹션과 내용은 필수 항목입니다.' }, { status: 400 });
    }

    // Call RPC to upsert the content
    const { data, error: rpcError } = await supabaseAdmin.rpc('upsert_main_page_content', {
      p_section_name: section_name,
      p_content: content,
    });

    if (rpcError) {
      logger.error('Supabase RPC error:', rpcError);
      return NextResponse.json(
        { error: '내용을 저장하는 데 실패했습니다.', details: rpcError.message, error_code: rpcError.code, error_hint: rpcError.hint },
        { status: 500 }
      );
    }

    logger.debug('Supabase RPC data:', data);

    return NextResponse.json({
      success: true,
      message: '내용이 성공적으로 저장되었습니다.',
      data: data[0],
    });
  } catch (error) {
    logger.error('Error saving main page content:', error);
    return NextResponse.json(
      { error: '내용을 저장하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
