"use client";

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth.js';
import { ThemeProvider } from 'next-themes';
import { cn } from '@/lib/utils.js';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Bell, 
  Menu, 
  Moon, 
  Sun, 
  Settings,
  LogOut,
  User,
  BookOpen,
  Users,
  Home,
  FileText,
  BarChart2,
  Calendar,
  ClipboardCheck
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { LoadingSpinner } from '@/components/common/LoadingSpinner.jsx';

// Dynamic imports (SSR 방지)
const Sidebar = dynamic(() => import('@/components/dashboard/Sidebar'), { ssr: false });

/**
 * 강사 전용 대시보드 레이아웃 컴포넌트
 * 강사 사용자를 위한 대시보드 레이아웃을 제공합니다.
 */
const InstructorDashboardLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading, signOut, role } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  // 작은 화면(<1024px)에서만 브라우저 스크롤을 숨겨 이중 스크롤을 방지합니다.
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    // 대시보드에서는 브라우저 스크롤을 항상 숨기고, 컨텐츠(main)만 스크롤합니다.
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, []);

  // 페이지 변경 시 모바일 메뉴 닫기
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // 인증 상태 확인 및 역할 검증 함수
  const verifyAuthAndRole = useCallback((currentUser, currentRole) => {
    // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
    if (!currentUser) {
      console.log('인증되지 않은 사용자 - 로그인 페이지로 이동');
      // 이미 리다이렉트 중인 경우 중복 실행 방지
      if (!isRedirecting) {
        setIsRedirecting(true);
        router.push('/signin?redirectedFrom=' + encodeURIComponent(pathname));
      }
      return false;
    }
    
    // 강사 또는 관리자가 아닌 경우 해당 역할의 대시보드로 리다이렉트
    if (currentRole !== 'instructor' && currentRole !== 'admin') {
      console.log('강사/관리자 권한이 없는 사용자 - 역할에 맞는 대시보드로 이동:', currentRole || 'none');
      
      if (!isRedirecting) {
        setIsRedirecting(true);
        if (currentRole === 'student') {
          router.push('/dashboard');
        } else {
          // 역할이 없는 경우 기본적으로 학생 대시보드로 이동
          router.push('/dashboard');
        }
      }
      return false;
    }
    
    // 권한이 확인된 경우
    console.log('강사/관리자 권한 확인됨 - 대시보드 표시');
    return true;
  }, [pathname, router, isRedirecting]);
  
  // 인증 및 역할 검증
  useEffect(() => {
    if (authLoading) return;
    
    let timeoutId;
    const AUTH_TIMEOUT = 10000; // 10초 타임아웃
    
    // 사용자 데이터가 로드된 경우에만 검증 수행
    if (user !== undefined) {
      const isAuthorized = verifyAuthAndRole(user, role);
      
      // 권한이 확인되면 리다이렉트 상태 해제
      if (isAuthorized) {
        setIsRedirecting(false);
      }
      
      // 로딩이 너무 오래 걸리는 경우를 대비하여 타임아웃 설정
      timeoutId = setTimeout(() => {
        console.warn('인증 확인 시간 초과 - 기본 상태로 전환합니다.');
        if (!user) {
          router.push('/signin?redirectedFrom=' + encodeURIComponent(pathname) + '&timeout=true');
        }
      }, AUTH_TIMEOUT);
    }
    
    // 클린업 함수
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [user, role, authLoading, pathname, verifyAuthAndRole]);
  
  // 로딩 중이거나 리다이렉트 중인 경우 로딩 표시
  if (authLoading || isRedirecting) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="mx-auto flex max-w-[320px] flex-col items-center justify-center space-y-4 p-6 text-center">
          <LoadingSpinner 
            message="사용자 정보를 확인하고 있습니다. 잠시만 기다려 주세요..."
            size="md"
            showReload={true}
          />
        </div>
      </div>
    );
  }
  
  // 사용자 데이터가 없으면 로딩 상태 유지 (SSR 대응)
  if (user === undefined) {
    return null;
  }


  // 강사 전용 사이드바 메뉴 아이템
  const menuItems = [
    { 
      path: '/dashboard/instructor',
      label: '대시보드', 
      icon: <Home className="h-5 w-5" />,
    },
    { 
      path: '/dashboard/instructor/courses', 
      label: '강의 관리', 
      icon: <BookOpen className="h-5 w-5" />,
    },
    { 
      path: '/dashboard/instructor/students', 
      label: '학생 관리', 
      icon: <Users className="h-5 w-5" />,
    },
    { 
      path: '/dashboard/instructor/assignments', 
      label: '과제 관리', 
      icon: <FileText className="h-5 w-5" />,
    },
    { 
      path: '/dashboard/instructor/analytics', 
      label: '분석', 
      icon: <BarChart2 className="h-5 w-5" />,
    },
    { 
      path: '/dashboard/instructor/schedule', 
      label: '일정 관리', 
      icon: <Calendar className="h-5 w-5" />,
    },
    { 
      path: '/dashboard/instructor/attendance', 
      label: '출석 관리', 
      icon: <ClipboardCheck className="h-5 w-5" />,
    },
  ];

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <div className="dashboard-scope flex flex-col md:flex-row h-screen bg-background overflow-hidden">
        {/* 사이드바 - 데스크탑 */}
        <aside
          className={cn(
            "hidden md:block h-full overflow-y-auto overflow-x-hidden border-r shadow-sm bg-card transition-all duration-300 ease-in-out",
            sidebarCollapsed ? "w-20" : "w-72"
          )}
        >
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            onSignOut={signOut}
            role="instructor"
            className="h-full"
            customMenuItems={menuItems}
          />
        </aside>

        {/* 모바일 오버레이 */}
        {isMobileOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* 모바일 사이드바 */}
        <div 
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-72 transform bg-card shadow-lg transition-transform duration-300 ease-in-out lg:hidden",
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <Sidebar
            collapsed={false}
            onToggle={() => setIsMobileOpen(false)}
            onSignOut={signOut}
            role="instructor"
            className="h-full"
            customMenuItems={menuItems}
          />
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 헤더 */}
          <header className="flex h-16 items-center justify-between border-b bg-background px-4 shadow-sm">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 lg:hidden"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">메뉴 토글</span>
              </Button>
              <h1 className="text-lg font-semibold">강사 대시보드</h1>
            </div>
            <div className="flex items-center space-x-2">
              <ModeToggle />
              <UserNav signOut={signOut} user={user} />
            </div>
          </header>

          {/* 컨텐츠 */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

// 사용자 프로필 드롭다운
function UserNav({ signOut, user }) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/dashboard/instructor/profile')}>
          <User className="mr-2 h-4 w-4" />
          <span>프로필</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/dashboard/instructor/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>설정</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>로그아웃</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// 테마 전환 버튼
function ModeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">테마 전환</span>
    </Button>
  );
}

export default InstructorDashboardLayout;
