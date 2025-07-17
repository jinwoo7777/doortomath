"use client"

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth.js';
import { LoadingSpinner } from '@/components/ui/spinner';
import { supabase } from '@/lib/supabase/supabaseClientBrowser';
import { toast } from 'sonner';

/**
 * 어드민 레이아웃 컴포넌트
 * 
 * 미들웨어에서 1차 세션 검증 후 레이아웃에서 2차 역할 검증 수행
 * 모든 어드민 하위 페이지에 공통으로 적용되는 인증 및 권한 체크 로직
 */
export default function AdminLayout({ children }) {
  // useAuth 훅 사용
  const { session, userRole, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const supabase = createClientComponentClient(); // 이미 임포트된 supabase 사용

  useEffect(() => {
    // 인증 상태가 로딩 중이면 대기
    if (authLoading) return;
    
    console.log('어드민 레이아웃 - 인증 상태:', { session, userRole, authLoading });
    
    const checkAuth = async () => {
      try {
        // 1. 세션 확인 (미들웨어에서 이미 확인했지만 추가 안전장치)
        if (!session) {
          console.log('세션 없음, 로그인 페이지로 이동');
          router.push('/signin');
          return;
        }

        // 2. 관리자 권한 확인 - 디버깅 로그 추가 및 권한 확인 로직 강화
        console.log('현재 사용자 역할 (raw):', userRole);
        console.log('역할 타입:', typeof userRole);
        console.log('역할 확인 결과:', userRole === 'admin' ? '정확히 일치' : '불일치');
        console.log('역할 확인 결과 (toLowerCase):', userRole?.toLowerCase() === 'admin' ? '정확히 일치' : '불일치');
        
        // 역할 확인 조건 강화 - 대소문자 구분 없이 비교 + 추가 안전장치
        const isAdmin = userRole === 'admin' || 
                      (typeof userRole === 'string' && userRole.toLowerCase() === 'admin') ||
                      (typeof userRole === 'string' && userRole.toLowerCase().includes('admin'));
        
        console.log('관리자 권한 확인 결과:', isAdmin ? '관리자 맞음' : '관리자 아님');
        
        if (!isAdmin) {
          console.log('관리자 권한 없음, 학생 대시보드로 이동');
          router.push('/dashboard/student');
          return;
        }

        // 페이지 로딩 완료
        setLoading(false);
        
      } catch (err) {
        console.error('인증 확인 오류:', err);
        setError(err.message || '인증 확인 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };

    checkAuth();
  }, [authLoading, session, userRole, router]);

  if (authLoading || loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner 
          size="xl" 
          text={authLoading ? '사용자 정보 확인 중...' : '대시보드 데이터를 불러오는 중...'}
        />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive font-medium">{error}</p>
          <button 
            onClick={() => router.push('/signin')} 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            로그인 페이지로 이동
          </button>
        </div>
      </div>
    );
  }

  // 인증 및 권한 검증 통과 시 자식 컴포넌트 렌더링
  return children;
}
