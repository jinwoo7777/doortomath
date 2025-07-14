import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import logger from './src/utils/logger.js'; // logger 임포트

// 역할 상수
const ROLES = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student'
};

// 기본 리다이렉션 경로
const DEFAULT_REDIRECTS = {
  [ROLES.ADMIN]: '/dashboard2/admin',
  [ROLES.INSTRUCTOR]: '/dashboard2/instructor',
  [ROLES.STUDENT]: '/dashboard2/student'
};

// 역할 기반 접근 제어 헬퍼 함수
const hasRequiredRole = (userRole, requiredRole) => {
  if (!userRole) return false;
  const lowerUserRole = userRole.toLowerCase();
  const lowerRequiredRole = requiredRole.toLowerCase();

  if (lowerRequiredRole === ROLES.ADMIN) return lowerUserRole === ROLES.ADMIN;
  if (lowerRequiredRole === ROLES.INSTRUCTOR) return [ROLES.ADMIN, ROLES.INSTRUCTOR].includes(lowerUserRole);
  return true; // 학생 역할은 기본값
};

// 사용자 역할 조회 함수
async function getUserRole(supabase, user) {
  if (!user) {
    logger.debug(`[Middleware] 사용자 객체 없음. 기본값 'student' 반환.`);
    return null;
  }
  try {
    const roleFromMetadata = user.user_metadata?.role;
    if (roleFromMetadata) {
      logger.debug(`[Middleware] 사용자 ${user.id}의 메타데이터 역할: ${roleFromMetadata}`);
      return roleFromMetadata.toLowerCase(); // 소문자로 변환하여 반환
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      logger.error('[Middleware] 프로필 조회 오류:', profileError);
      return null; // 오류 발생 시 기본값 반환
    }
    const roleFromProfile = profile?.role || null;
    if (roleFromProfile) {
      logger.debug(`[Middleware] 사용자 ${user.id}의 프로필 역할: ${roleFromProfile}`);
      return roleFromProfile.toLowerCase();
    }

    logger.debug(`[Middleware] 사용자 ${user.id}의 역할 정보 없음. 기본값 'student' 반환.`);
    return null; // 기본값 반환
  } catch (error) {
    logger.error('[Middleware] 역할 조회 중 예외 발생:', error);
    return null; // 예외 발생 시 기본값 반환
  }
}

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // 세션 확인
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  
  // 사용자 역할 가져오기
  let userRole = null; // 기본값은 null
  if (user) {
    userRole = await getUserRole(supabase, user);
  }

  // 로그인/회원가입 페이지 접근 제어
  if (req.nextUrl.pathname.startsWith('/signin') || req.nextUrl.pathname.startsWith('/signup')) {
    // 로그인/회원가입 페이지는 세션 체크를 건너뛰고 항상 접근 허용
    // 클라이언트 측에서 페이지 로드 시 세션을 초기화하도록 수정함
    return res;
  }

  // 보호된 라우트 정의
  const protectedRoutes = [
    // /dashboard 경로를 /dashboard2로 통일
    // { 
    //   path: '/dashboard',
    //   requiredRole: ROLES.STUDENT,
    //   denyRoles: [ROLES.INSTRUCTOR, ROLES.ADMIN],
    //   redirectPath: (role) => {
    //     if (role === ROLES.INSTRUCTOR) return DEFAULT_REDIRECTS[ROLES.INSTRUCTOR];
    //     if (role === ROLES.ADMIN) return DEFAULT_REDIRECTS[ROLES.ADMIN];
    //     return '/';
    //   },
    //   message: '학생 대시보드에 접근할 수 없습니다.'
    // },
    {
      path: '/dashboard/student',
      requiredRole: ROLES.STUDENT,
      denyRoles: [ROLES.INSTRUCTOR, ROLES.ADMIN],
      redirectPath: (role) => {
        if (role === ROLES.INSTRUCTOR) return '/dashboard/instructor';
        if (role === ROLES.ADMIN) return '/dashboard2/admin';
        return '/';
      },
      message: '학생 대시보드에 접근할 수 없습니다.'
    },

    {
      path: '/dashboard/instructor',
      requiredRole: ROLES.INSTRUCTOR,
      denyRoles: [ROLES.STUDENT],
      redirectPath: (role) => {
        if (role === ROLES.STUDENT) return '/dashboard/student';
        if (role === ROLES.ADMIN) return '/dashboard2/admin';
        return '/';
      },
      message: '강사 대시보드에 접근할 수 없습니다.'
    },

    {
      path: '/dashboard2/admin',
      requiredRole: ROLES.ADMIN,
      denyRoles: [ROLES.STUDENT, ROLES.INSTRUCTOR],
      redirectPath: (role) => {
        if (role === ROLES.STUDENT) return '/dashboard/student';
        if (role === ROLES.INSTRUCTOR) return '/dashboard/instructor';
        return '/';
      },
      message: '관리자 권한이 필요합니다.'
    }
  ];

  // 현재 경로에 대한 접근 제어 확인
  for (const route of protectedRoutes) {
    if (req.nextUrl.pathname === route.path || req.nextUrl.pathname.startsWith(`${route.path}/`)) {
      // 1. 로그인 여부 확인
      if (!user) {
        const redirectUrl = new URL('/signin', req.url);
        redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }

      // 2. 접근 거부 역할 확인
      if (route.denyRoles?.includes(userRole)) {
        const redirectUrl = new URL(route.redirectPath(userRole), req.url);
        redirectUrl.searchParams.set('error', 'access_denied');
        redirectUrl.searchParams.set('message', encodeURIComponent(route.message));
        return NextResponse.redirect(redirectUrl);
      }

      // 3. 필요한 역할 확인
      if (!hasRequiredRole(userRole, route.requiredRole)) {
        const redirectUrl = new URL(route.redirectPath(userRole), req.url);
        redirectUrl.searchParams.set('error', 'unauthorized');
        redirectUrl.searchParams.set('message', encodeURIComponent('접근 권한이 없습니다.'));
        return NextResponse.redirect(redirectUrl);
      }
      
      break;
    }
  }
  return res;
}

// 미들웨어가 실행될 경로 패턴 정의
export const config = {
  matcher: [
    /*
     * 다음 경로들을 제외한 모든 요청에 미들웨어 실행:
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화)
     * - favicon.ico (파비콘)
     * - api/auth (인증 API)
     * - public 폴더의 정적 파일
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)',
  ],
};
