'use client';

import { Button } from '@/components/ui/button';

/**
 * 공통 로딩 스피너 컴포넌트
 * @param {Object} props
 * @param {string} [props.message="로딩 중입니다..."] - 표시할 로딩 메시지
 * @param {string} [props.size="md"] - 스피너 크기 (sm, md, lg)
 * @param {boolean} [props.showReload=true] - 새로고침 버튼 표시 여부
 * @returns {JSX.Element}
 */
export function LoadingSpinner({ 
  message = "로딩 중입니다...", 
  size = "md",
  showReload = true 
}) {
  const sizeClasses = {
    sm: {
      container: 'h-12 w-12',
      outer: 'h-10 w-10 border-3',
      inner: 'h-6 w-6 border-2',
      text: 'text-sm'
    },
    md: {
      container: 'h-16 w-16',
      outer: 'h-12 w-12 border-4',
      inner: 'h-8 w-8 border-2',
      text: 'text-base'
    },
    lg: {
      container: 'h-20 w-20',
      outer: 'h-16 w-16 border-[5px]',
      inner: 'h-10 w-10 border-3',
      text: 'text-lg'
    }
  };

  const sizes = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="flex flex-col items-center space-y-4 p-8 text-center">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-transparent border-primary"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="h-8 w-8 animate-spin rounded-full border-2 border-b-transparent border-primary opacity-75" 
            style={{ animationDirection: 'reverse' }}
          ></div>
        </div>
      </div>
      
      {/* 로딩 메시지 */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">대시보드 로드 중</h2>
        <p className="text-sm text-muted-foreground">
          {message}
        </p>
      </div>
      
      {/* 새로고침 버튼 */}
      {showReload && (
        <div className="pt-2">
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
            size={size === 'sm' ? 'sm' : 'default'}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="h-4 w-4"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
              <path d="M16 16h5v5"></path>
            </svg>
            <span>새로고침</span>
          </Button>
        </div>
      )}
    </div>
  );
}
