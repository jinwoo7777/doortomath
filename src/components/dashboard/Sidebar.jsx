"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  BookOpen, 
  BarChart2, 
  Users, 
  FileText, 
  User, 
  Settings, 
  HelpCircle, 
  Bell, 
  Mail, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  ClipboardCheck,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const Sidebar = ({ 
  collapsed = false, 
  onToggle = () => {}, 
  onNavigate = () => {},
  onClose = () => {},
  onSignOut = async () => {},
  role = 'student', // 기본값은 학생
  className,
  customMenuItems, // 사용자 정의 메뉴 아이템
  ...props 
}) => {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 기본 메뉴 아이템 (사용자 정의 메뉴가 없을 때 사용)
  const defaultMenuItems = [
    { 
      path: role === 'instructor' ? '/dashboard/instructor' : '/dashboard',
      label: '대시보드', 
      icon: <Home className="h-5 w-5" />,
    },
    { 
      path: role === 'instructor' ? '/dashboard/instructor/courses' : '/dashboard/courses', 
      label: role === 'instructor' ? '강의 관리' : '학습 노트', 
      icon: <BookOpen className="h-5 w-5" />,
    },
    { 
      path: role === 'instructor' ? '/dashboard/instructor/students' : '/dashboard/progress', 
      label: role === 'instructor' ? '학생 관리' : '학습 현황', 
      icon: <Users className="h-5 w-5" />,
    },
    { 
      path: role === 'instructor' ? '/dashboard/instructor/assignments' : '/dashboard/assignments', 
      label: role === 'instructor' ? '과제 관리' : '과제 제출', 
      icon: <FileText className="h-5 w-5" />,
    },
    { 
      path: role === 'instructor' ? '/dashboard/instructor/analytics' : '/dashboard/analytics', 
      label: '분석', 
      icon: <BarChart2 className="h-5 w-5" />,
    },
    ...(role === 'instructor' ? [
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
    ] : [
      { 
        path: '/dashboard/community', 
        label: '커뮤니티', 
        icon: <MessageSquare className="h-5 w-5" />,
      },
    ])
  ];



  // 프로필 및 설정 메뉴
  // 프로필 및 설정 메뉴
  const profileMenuItems = [
    { 
      path: role === 'instructor' ? '/dashboard/instructor/profile' : '/dashboard/profile', 
      label: '내 정보', 
      icon: <User className="h-5 w-5" />,
    },
    { 
      path: role === 'instructor' ? '/dashboard/instructor/settings' : '/dashboard/settings', 
      label: '설정', 
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  // 사용자 정의 메뉴가 있으면 사용, 없으면 기본 메뉴 사용
  // 프로필 메뉴(profileMenuItems)를 포함하여 최종 메뉴 배열을 구성합니다.
  const menuItems = (customMenuItems || defaultMenuItems).concat([
    { type: 'divider' },
    ...profileMenuItems,
  ]);

  const bottomMenuItems = [
    { 
      path: role === 'instructor' ? '/dashboard/instructor/help' : '/dashboard/help', 
      label: '도움말', 
      icon: <HelpCircle className="h-5 w-5" />,
    },
    { 
      path: role === 'instructor' ? '/dashboard/instructor/notifications' : '/dashboard/notifications', 
      label: '알림', 
      icon: <Bell className="h-5 w-5" />,
      badge: '3',
    },
    { 
      path: '/dashboard/messages', 
      label: '메시지', 
      icon: <Mail className="h-5 w-5" />,
      badge: '5',
    },
  ];

  const handleItemClick = (path, e) => {
    e.preventDefault();
    onNavigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const renderNavItem = (item, index) => {
    // Handle divider
    if (item.type === 'divider') {
      return (
        <div 
          key={`divider-${index}`}
          className={cn(
            'h-px mx-3 my-2',
            'bg-gray-200 dark:bg-gray-700',
            collapsed ? 'w-8' : 'w-auto'
          )}
          aria-hidden="true"
        />
      );
    }

    const isActive = pathname.startsWith(item.path);
    
    const itemContent = (
      <div 
        className={cn(
          'group flex items-center py-2.5 px-3 rounded-lg transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          isActive 
            ? 'bg-primary/10 text-primary font-medium' 
            : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground',
          collapsed ? 'justify-center' : ''
        )}
        onClick={(e) => handleItemClick(item.path, e)}
        role="menuitem"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleItemClick(item.path, e)}
      >
        <div className="relative">
          {React.cloneElement(item.icon, {
            className: cn(
              'h-5 w-5 transition-transform group-hover:scale-110',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )
          })}
          {item.badge && (
            <span className="absolute -top-1.5 -right-1.5 h-4 min-w-4 flex items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {item.badge}
            </span>
          )}
        </div>
        {!collapsed && (
          <span className="ml-3 flex-1 truncate text-sm">
            {item.label}
          </span>
        )}
      </div>
    );

    if (collapsed) {
      return (
        <TooltipProvider key={index}>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Link
                href={item.path}
                aria-label={item.label}
                className="block w-full"
              >
                {itemContent}
              </Link>
            </TooltipTrigger>
            <TooltipContent 
              side="right" 
              sideOffset={10}
              className="text-xs font-medium bg-popover text-popover-foreground shadow-md border border-border"
            >
              <p>{item.label}</p>
              {item.badge && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                  {item.badge}
                </span>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <Link 
        key={index} 
        href={item.path}
        className="block"
        aria-current={isActive ? 'page' : undefined}
      >
        {itemContent}
      </Link>
    );
  };

  const renderMenuItem = (item, index) => {
    const isActive = pathname === item.href || (item.subItems && item.subItems.some(subItem => subItem.href === pathname));
    const Icon = item.icon;
    const [isExpanded, setIsExpanded] = useState(isActive);

    useEffect(() => {
      setIsExpanded(isActive);
    }, [isActive]);

    const toggleExpand = (e) => {
      if (item.subItems) {
        e.preventDefault();
        setIsExpanded(!isExpanded);
      }
    };

    return (
      <div key={index} className="space-y-1">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={item.href || '#'}
                className={cn(
                  'flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  collapsed ? 'justify-center' : 'justify-between',
                  'group'
                )}
                onClick={toggleExpand}
              >
                <div className="flex items-center">
                  <Icon className={cn('h-5 w-5', !collapsed && 'mr-3')} />
                  {!collapsed && <span>{item.title}</span>}
                </div>
                {!collapsed && item.subItems && (
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 transition-transform',
                      isExpanded && 'rotate-90'
                    )}
                  />
                )}
              </Link>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">
                <p>{item.title}</p>
                {item.description && (
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                )}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        {/* Submenu items */}
        {!collapsed && item.subItems && isExpanded && (
          <div className="ml-6 space-y-1 mt-1">
            {item.subItems.map((subItem, subIndex) => {
              const isSubItemActive = pathname === subItem.href;
              const SubIcon = subItem.icon;
              
              return (
                <TooltipProvider key={subIndex} delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={subItem.href}
                        className={cn(
                          'flex items-center px-4 py-2 text-sm rounded-md transition-colors',
                          isSubItemActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                          'group'
                        )}
                        onClick={handleItemClick}
                      >
                        {SubIcon && <SubIcon className="h-4 w-4 mr-3" />}
                        <span>{subItem.title}</span>
                      </Link>
                    </TooltipTrigger>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className={cn(
        "flex h-full flex-col bg-background transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-72",
        className
      )}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      {...props}
    >
      {/* Logo & Toggle */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link 
          href={menuItems[0]?.path || (role === 'instructor' ? '/dashboard/instructor' : '/dashboard')}
          className="flex items-center space-x-2"
          onClick={onClose}
        >
          {!collapsed ? (
            <div className="flex flex-col items-center">
              <img 
                src="/logo_small.svg" 
                alt="대치수학의문 로고" 
                className="h-7 w-auto"
              />
            </div>
          ) : (
            <img 
              src="/logo_v2.svg" 
              alt="EQ" 
              className="h-8 w-auto"
            />
          )}
        </Link>

        {/* Close Button (Mobile) */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={onClose}
          aria-label="사이드바 닫기"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Toggle Button (Desktop) */}
        <div className="hidden md:block">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggle}
            className="h-8 w-8 rounded-full"
            aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* 스크롤 영역 전체 컨테이너 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 스크롤 가능한 컨텐츠 */}
        <div className="flex-1 overflow-y-auto py-4 px-2">
          {/* Main Menu */}
          <nav className="space-y-1.5 px-1.5">
            {menuItems.map(renderNavItem)}
          </nav>
        </div>

        {/* 하단 고정 영역 - 스크롤되지 않음 */}
        <div className="border-t p-3 bg-background">
          <div className="space-y-1.5 px-1.5">
            {bottomMenuItems.map(renderNavItem)}
          </div>

          <Button 
            variant="outline" 
            className="mt-4 w-full justify-start gap-2"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              await onSignOut();
            }}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>로그아웃</span>}
          </Button>

          {!collapsed && (
            <div className="mt-4 text-center text-xs text-muted-foreground">
              <div>버전 1.0.0</div>
              <div className="mt-1">© 2025 대치수학의문</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
