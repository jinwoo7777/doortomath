 'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ROLES } from '@/lib/auth/constants';
import StudentDashboardLayout from '@/layouts/StudentDashboardLayout';
import InstructorDashboardLayout from '@/layouts/InstructorDashboardLayout';
import AdminDashboardLayout from '@/layouts/AdminDashboardLayout';

export default function DashboardLayout({ children }) {
  const { isAuthenticated, loading, role, roleLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
    if (!loading && !isAuthenticated) {
      console.log('로그인되지 않음, 로그인 페이지로 리다이렉트');
      router.push('/signin');
      return;
    }

    // 로그인은 했지만 아직 역할이 로드되지 않았거나 로딩 중이면 무시
    if (loading || !roleLoaded || !isAuthenticated) return;

    const pathname = window.location.pathname;
    
    // 역할에 따른 올바른 경로 확인
    let targetPath = '/dashboard';
    if (role === ROLES.ADMIN) {
      targetPath = '/dashboard2/admin';
    } else if (role === ROLES.INSTRUCTOR) {
      targetPath = '/dashboard/instructor';
    } else {
      targetPath = '/dashboard/student';
    }

    // 현재 경로가 역할에 맞지 않는 경우에만 리다이렉트
    if (!pathname.startsWith(targetPath)) {
      console.log(`역할에 맞지 않는 경로: ${pathname} -> ${targetPath}로 리다이렉트`);
      router.replace(targetPath);
    }
  }, [isAuthenticated, loading, roleLoaded, router, role]);

  if (loading || !roleLoaded || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // 역할에 따라 다른 레이아웃 렌더링
  // 현재 경로에 따라 올바른 레이아웃을 렌더링하는지 확인
  const pathname = window.location.pathname;
  
  // 관리자 경로에 접근 시 관리자 역할 확인
  if (pathname.startsWith('/dashboard2/admin')) {
    if (role === ROLES.ADMIN) {
      return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
    } else {
      // 관리자 권한이 없으면 해당 역할의 대시보드로 리다이렉트
      // useEffect에서 역할에 맞는 경로로 이동하므로 여기서는 UI를 렌더링하지 않음
      return null;
    }
  }
  
  // 강사 경로에 접근 시 강사 역할 확인
  if (pathname.startsWith('/dashboard/instructor')) {
    if (role === ROLES.INSTRUCTOR) {
      return <InstructorDashboardLayout>{children}</InstructorDashboardLayout>;
    } else if (role === ROLES.ADMIN) {
      // 관리자는 강사 대시보드에 접근 가능하도록 설정 (필요에 따라 수정 가능)
      return <InstructorDashboardLayout>{children}</InstructorDashboardLayout>;
    } else {
      // useEffect에서 역할에 맞는 경로로 이동하므로 여기서는 UI를 렌더링하지 않음
      return null;
    }
  }

  // 루트 /dashboard 경로 또는 기타 경로
  if (role === ROLES.ADMIN) {
    return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
  }
  if (role === ROLES.INSTRUCTOR) {
    return <InstructorDashboardLayout>{children}</InstructorDashboardLayout>;
  }
  // 기본 학생 레이아웃
  return <StudentDashboardLayout>{children}</StudentDashboardLayout>;
}
