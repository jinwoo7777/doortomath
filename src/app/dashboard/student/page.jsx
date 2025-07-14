'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ROLES } from '@/lib/auth/constants';

export default function StudentDashboard() {
  const { isAuthenticated, loading, hasRole } = useAuth();
  const router = useRouter();
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/signin');
      return;
    }

    if (!loading && isAuthenticated && hasRole(ROLES.INSTRUCTOR)) {
      router.push('/dashboard/instructor');
      return;
    }

    // 데이터 로딩 시뮬레이션
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, loading, hasRole, router]);

  if (loading || !isAuthenticated || isPageLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div 
            className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" 
            role="status" 
            aria-busy="true"
          >
            <span className="sr-only">로딩 중...</span>
          </div>
          <p className="mt-4 text-muted-foreground">
            {loading ? '사용자 정보 확인 중...' : '대시보드 데이터를 불러오는 중...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">학생 대시보드</h1>
      <div className="grid gap-6">
        {/* 학생 대시보드 콘텐츠 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">내 강의 현황</h2>
          <p>여기에 학생용 대시보드 콘텐츠가 표시됩니다.</p>
        </div>
      </div>
    </div>
  );
}
