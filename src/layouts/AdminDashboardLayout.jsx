"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth.js';

const AdminDashboardLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading, signOut, role } = useAuth();
  const router = useRouter();

  // 인증 및 권한 확인
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/signin');
        return;
      }
      
      if (role !== 'admin') {
        router.push('/unauthorized');
        return;
      }
      
      setLoading(false);
    }
  }, [user, role, authLoading, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/signin');
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || role !== 'admin') {
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
    <div className="min-h-screen bg-background">
      {/* 관리자 전용 레이아웃 */}
      <div className="flex">
        {/* 사이드바 */}
        <aside className={`bg-card border-r border-border transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}>
          <div className="p-4">
            <h2 className={`font-bold ${sidebarCollapsed ? 'text-center' : 'text-xl'}`}>
              {sidebarCollapsed ? 'A' : '관리자 대시보드'}
            </h2>
          </div>
          
          <nav className="mt-8">
            <div className="px-4 space-y-2">
              <a
                href="/dashboard2/admin"
                className="flex items-center px-4 py-2 text-sm font-medium rounded-lg hover:bg-accent"
              >
                <span className={sidebarCollapsed ? 'sr-only' : ''}>대시보드</span>
              </a>
              <a
                href="/dashboard2/admin/users"
                className="flex items-center px-4 py-2 text-sm font-medium rounded-lg hover:bg-accent"
              >
                <span className={sidebarCollapsed ? 'sr-only' : ''}>사용자 관리</span>
              </a>
              <a
                href="/dashboard2/admin/settings"
                className="flex items-center px-4 py-2 text-sm font-medium rounded-lg hover:bg-accent"
              >
                <span className={sidebarCollapsed ? 'sr-only' : ''}>설정</span>
              </a>
            </div>
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2 text-sm font-medium text-left rounded-lg hover:bg-accent"
            >
              <span className={sidebarCollapsed ? 'sr-only' : ''}>로그아웃</span>
            </button>
          </div>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="flex-1">
          <header className="bg-card border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">관리자 대시보드</h1>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  {user?.email}
                </span>
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-2 rounded-lg hover:bg-accent"
                >
                  ☰
                </button>
              </div>
            </div>
          </header>

          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
