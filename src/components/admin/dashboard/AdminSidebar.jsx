"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from "next-themes";
import { cn } from '@/lib/utils';
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
  Users,
  BookOpen,
  Home,
  Bookmark,
  Clock,
  GraduationCap,
  MessageSquare,
  BarChart2,
  Shield,
  FileText,
  CreditCard,
  LayoutTemplate,
  Palette,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AdminSidebar = ({
  collapsed,
  toggleSidebar,
  isMobileOpen,
  setIsMobileOpen,
  navItems,
  user,
  handleSignOut,
  isActive,
  theme,
  setTheme,
  router
}) => {
  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 border-r bg-background transition-transform duration-300 md:relative md:translate-x-0',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        collapsed && 'w-20',
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!collapsed && (
            <h1 className="text-xl font-bold text-primary">EDUCVVE</h1>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* 프로필 영역 */}
        <div className="flex items-center gap-3 border-b p-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
            <AvatarFallback>
              {user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate font-medium">
                {user.user_metadata?.full_name || user.email}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                관리자
              </p>
            </div>
          )}
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-2">
          {navItems.map((item) => (
            <div key={item.href || item.title} className="space-y-1">
              <Button
                variant={isActive(item.href) ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  collapsed ? 'px-2' : 'px-4',
                  'group'
                )}
                onClick={() => {
                  if (item.href) {
                    router.push(item.href);
                    setIsMobileOpen(false);
                  }
                }}
              >
                <span className="mr-3">{item.icon}</span>
                {!collapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>{item.title}</span>
                    {item.subItems && (
                      <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                    )}
                  </div>
                )}
              </Button>
              
              {/* 서브메뉴 */}
              {!collapsed && item.subItems && (
                <div className="ml-8 space-y-1 mt-1">
                  {item.subItems.map((subItem) => (
                    <Button
                      key={subItem.href}
                      variant={isActive(subItem.href) ? 'secondary' : 'ghost'}
                      className="w-full justify-start pl-4"
                      onClick={() => {
                        router.push(subItem.href);
                        setIsMobileOpen(false);
                      }}
                    >
                      {subItem.icon && <span className="mr-3">{subItem.icon}</span>}
                      <span>{subItem.title}</span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* 하단 설정 및 로그아웃 */}
        <div className="border-t p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start',
                  collapsed ? 'px-2' : 'px-4'
                )}
              >
                <Settings className="mr-3 h-5 w-5" />
                {!collapsed && <span>설정</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel>계정 설정</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>프로필</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                {theme === 'light' ? (
                  <>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>다크 모드</span>
                  </>
                ) : (
                  <>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>라이트 모드</span>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>로그아웃</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
