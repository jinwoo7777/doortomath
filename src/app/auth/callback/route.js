import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { DEFAULT_REDIRECTS, ROLES } from '../../../lib/auth/constants.js';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);

    // 세션 정보 가져오기
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    let redirectTo = requestUrl.origin + DEFAULT_REDIRECTS[ROLES.STUDENT]; // 기본값은 학생 대시보드

    if (user) {
      // 사용자 프로필에서 역할 가져오기
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('프로필 조회 오류:', profileError);
      } else if (profile?.role) {
        const userRole = profile.role.toLowerCase();
        redirectTo = requestUrl.origin + (DEFAULT_REDIRECTS[userRole] || DEFAULT_REDIRECTS[ROLES.STUDENT]);
      }
    }
    return NextResponse.redirect(redirectTo);
  }

  // 코드 없이 접근 시 기본 리다이렉트 (예: 로그인 페이지)
  return NextResponse.redirect(requestUrl.origin + '/signin');
}
