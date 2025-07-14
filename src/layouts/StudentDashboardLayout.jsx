"use client";

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.js';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const StudentDashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, loading, signOut, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // 인증 확인
  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push('/signin');
    }
  }, [mounted, loading, user, router]);

  // 학생 권한 확인
  useEffect(() => {
    if (mounted && !loading && user && role && role !== 'student') {
      router.push('/unauthorized');
    }
  }, [mounted, loading, user, role, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/signin');
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">로그인이 필요합니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-full bg-card border-r border-border z-50 transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b">
          {!sidebarCollapsed && (
            <h2 className="text-lg font-semibold">학생 대시보드</h2>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCollapse}
              className="hidden lg:flex"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <a 
                href="/dashboard/student" 
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-accent"
              >
                <div className="w-5 h-5 bg-primary/20 rounded"></div>
                {!sidebarCollapsed && <span>대시보드</span>}
              </a>
            </li>
            <li>
              <a 
                href="/dashboard/student/courses" 
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-accent"
              >
                <div className="w-5 h-5 bg-primary/20 rounded"></div>
                {!sidebarCollapsed && <span>내 강의</span>}
              </a>
            </li>
            <li>
              <a 
                href="/dashboard/student/profile" 
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-accent"
              >
                <div className="w-5 h-5 bg-primary/20 rounded"></div>
                {!sidebarCollapsed && <span>프로필</span>}
              </a>
            </li>
          </ul>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start"
          >
            {!sidebarCollapsed && <span>로그아웃</span>}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main 
        className={cn(
          "transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        )}
      >
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-semibold">학생 대시보드</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.email}
            </span>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboardLayout;
