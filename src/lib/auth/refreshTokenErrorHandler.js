/**
 * 리프레시 토큰 오류 처리 유틸리티
 */

import { supabase } from '../supabase/supabaseClientBrowser';

/**
 * 리프레시 토큰 오류인지 확인
 */
export const isRefreshTokenError = (error) => {
  if (!error) return false;
  
  const errorMessage = error.message || String(error);
  return (
    errorMessage.includes('Invalid Refresh Token') ||
    errorMessage.includes('refresh_token') ||
    errorMessage.includes('Already Used') ||
    errorMessage.includes('expired')
  );
};

/**
 * 리프레시 토큰 오류 처리
 */
export const handleRefreshTokenError = async (error) => {
  console.warn('[Auth] 리프레시 토큰 오류 감지:', error.message);
  
  try {
    // 세션 정리
    await supabase.auth.signOut();
    
    // 로컬 스토리지 정리
    if (typeof window !== 'undefined') {
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token');
    }
    
    // 페이지 새로고침으로 상태 초기화
    if (typeof window !== 'undefined') {
      window.location.href = '/signin?reason=session_expired';
    }
  } catch (cleanupError) {
    console.error('[Auth] 세션 정리 중 오류:', cleanupError);
    
    // 강제 페이지 새로고침
    if (typeof window !== 'undefined') {
      window.location.href = '/signin?reason=session_expired';
    }
  }
};

/**
 * API 호출 래퍼 (리프레시 토큰 오류 자동 처리)
 */
export const withRefreshTokenErrorHandling = async (apiCall) => {
  try {
    return await apiCall();
  } catch (error) {
    if (isRefreshTokenError(error)) {
      await handleRefreshTokenError(error);
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw error;
  }
};

/**
 * 전역 오류 처리기 설정
 */
export const setupGlobalErrorHandler = () => {
  if (typeof window === 'undefined') return;
  
  // 전역 오류 처리
  window.addEventListener('error', (event) => {
    if (isRefreshTokenError(event.error)) {
      handleRefreshTokenError(event.error);
    }
  });
  
  // Promise rejection 처리
  window.addEventListener('unhandledrejection', (event) => {
    if (isRefreshTokenError(event.reason)) {
      handleRefreshTokenError(event.reason);
    }
  });
  
  console.log('[Auth] 전역 리프레시 토큰 오류 처리기 설정 완료');
};