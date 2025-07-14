'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function AdminDashboard() {
  const { isAuthenticated, loading, hasRole, roleLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && roleLoaded) {
      if (!isAuthenticated) {
        router.push('/signin');
        return;
      }

      if (!hasRole('admin')) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [isAuthenticated, loading, hasRole, roleLoaded, router]);

  if (loading || !roleLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !hasRole('admin')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">접근 권한이 없습니다</h2>
          <p className="text-muted-foreground">관리자 권한이 필요합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">관리자 대시보드</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">사용자 관리</h3>
          <p className="text-muted-foreground">시스템 사용자를 관리합니다.</p>
        </div>
        
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">강의 관리</h3>
          <p className="text-muted-foreground">강의와 콘텐츠를 관리합니다.</p>
        </div>
        
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">시스템 설정</h3>
          <p className="text-muted-foreground">시스템 설정을 관리합니다.</p>
        </div>
      </div>
    </div>
  );
}
