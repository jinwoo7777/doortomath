/*
 * @file 서버 컴포넌트·미들웨어용 인증 유틸
 * @description App Router(Next.js 14) 환경에서 서버 측 세션 확인 및 보호 미들웨어를 제공합니다.
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { ROLES } from '../constants.js';

// Supabase 클라이언트 생성 함수 (요청마다 새로운 인스턴스 생성)
function createSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `cookies().set()` method can only be called from a Server Component or an Edge API Route.
            // We're ignoring this error on purpose because it means the user is probably on a Client Component
            // or we're testing this on a browser.
            console.warn('Failed to set cookie from server client:', error);
          }
        },
        remove: (name, options) => {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            console.warn('Failed to remove cookie from server client:', error);
          }
        },
      },
      auth: {
        persistSession: false,
      },
    }
  );
}

/**
 * 서버 측 세션을 가져옵니다.
 * @param {import('next').NextRequest} req
 * @returns {Promise<import('@supabase/supabase-js').Session|null>}
 */
export async function getServerSession() {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session || null;
  } catch (e) {
    console.error('Error getting server session:', e);
    return null;
  }
}

/**
 * 인증이 필요한 라우트 보호 미들웨어
 * @param {Object} opts
 * @param {string[]} [opts.allowedRoles]  허용된 역할
 * @param {string} [opts.redirectTo='/signin'] 인증 실패 시 리다이렉트 경로
 */
export function requireAuth({ allowedRoles = [], redirectTo = '/signin' } = {}) {
  return async function middleware(req) {
    const session = await getServerSession(req);
    if (!session) {
      return NextResponse.redirect(new URL(redirectTo, req.nextUrl.origin));
    }

    if (allowedRoles.length > 0) {
      const { role } = session.user.user_metadata || {};
      if (!allowedRoles.includes(role)) {
        return NextResponse.redirect(new URL(redirectTo, req.nextUrl.origin));
      }
    }

    // 세션·역할 검증 통과 → 다음 단계로
    return NextResponse.next();
  };
}

/**
 * 역할별 대시보드 기본 경로 반환 (서버 환경용)
 * @param {string} role
 * @returns {string}
 */
export function getDashboardPathSSR(role) {
  switch (role) {
    case ROLES.ADMIN:
      return '/dashboard2/admin';
    case ROLES.INSTRUCTOR:
      return '/dashboard2/instructor';
    case ROLES.STUDENT:
    default:
      return '/dashboard2/student';
  }
}
