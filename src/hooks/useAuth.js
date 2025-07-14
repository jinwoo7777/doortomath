/**
 * @file 통합 인증 상태 관리 훅
 * @description 인증 상태, 역할, 로그인/로그아웃을 관리하는 단일 훅
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/auth/client.js';
import { ROLES, DEFAULT_REDIRECTS, ERROR_MESSAGES } from '../lib/auth/constants.js';
import { fetchUserProfile } from '../lib/auth/profile.js';
import { isSessionTimedOut, needsRefresh } from '../lib/auth/session.js';
import { logDebug, logError, logWarn } from '../utils/logger.js';

// 세션 체크 주기
const SESSION_CHECK_INTERVAL = 60000; // 1분

/**
 * 에러 메시지를 사용자 친화적으로 변환
 */
const getErrorMessage = (error) => {
  if (!error) return ERROR_MESSAGES.default;
  
  const message = error.message || String(error);
  const errorKey = Object.keys(ERROR_MESSAGES).find(key => 
    message.toLowerCase().includes(key.toLowerCase())
  );
  
  return ERROR_MESSAGES[errorKey] || message || ERROR_MESSAGES.default;
};

/**
 * 통합 인증 상태 관리 훅
 */
export function useAuth() {
  // 기본 상태
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [error, setError] = useState(null);
  const [lastActivity, setLastActivity] = useState(null);
  const [roleLoaded, setRoleLoaded] = useState(false);
  
  const router = useRouter();
  const sessionTimerRef = useRef(null);
  const profileFetchRef = useRef({ isFetching: false, lastUserId: null });

  // 상태 업데이트 헬퍼
  const updateState = useCallback((updates) => {
    Object.entries(updates).forEach(([key, value]) => {
      switch (key) {
        case 'session':
          setSession(value);
          break;
        case 'loading':
          setLoading(value);
          break;
        case 'userRole':
          setUserRole(value);
          break;
        case 'error':
          setError(value);
          break;
        case 'lastActivity':
          setLastActivity(value);
          break;
        case 'roleLoaded':
          setRoleLoaded(value);
          break;
      }
    });
  }, []);

  // 로딩 상태 직접 설정 (레거시 호환)
  const setLoadingState = useCallback((loading) => {
    setLoading(loading);
  }, []);

  // 역할 기반 접근 제어
  const hasRole = useCallback((...roles) => {
    if (!session || !userRole) return false;
    return roles.some(role => userRole === role);
  }, [session, userRole]);

  // 대시보드 경로 가져오기
  const getDashboardPath = useCallback(() => {
    if (!userRole) return '/dashboard';
    return DEFAULT_REDIRECTS[userRole] || '/dashboard';
  }, [userRole]);

  // 프로필 로드
  const loadUserProfile = useCallback(async (userId) => {
    console.log('[useAuth] loadUserProfile 시작:', userId);
    
    if (!userId) {
      console.log('[useAuth] userId 없음 - null 반환');
      updateState({ 
        userRole: null, 
        loading: false, 
        roleLoaded: true 
      });
      return { role: null };
    }

    // 중복 요청 방지
    if (profileFetchRef.current.isFetching && profileFetchRef.current.lastUserId === userId) {
      console.log('[useAuth] 중복 요청 방지 - 기존 promise 반환');
      return profileFetchRef.current.promise;
    }

    console.log('[useAuth] 새로운 프로필 요청 시작');
    profileFetchRef.current.isFetching = true;
    profileFetchRef.current.lastUserId = userId;

    const promise = (async () => {
      try {
        console.log('[useAuth] 메타데이터에서 역할 확인 중...');
        
        // getUser() 호출에 타임아웃 추가
        const getUserWithTimeout = async () => {
          return Promise.race([
            supabase.auth.getUser(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('getUser 타임아웃')), 3000)
            )
          ]);
        };

        // 메타데이터에서 역할 확인
        const { data: { user } } = await getUserWithTimeout();
        const roleFromMetadata = user?.user_metadata?.role;
        console.log('[useAuth] 메타데이터 역할:', roleFromMetadata);

        if (roleFromMetadata) {
          logDebug('[Auth] 메타데이터에서 역할 로드:', roleFromMetadata);
          console.log('[useAuth] 메타데이터 역할 사용 - 상태 업데이트');
          updateState({ 
            userRole: roleFromMetadata, 
            loading: false, 
            roleLoaded: true 
          });
          return { role: roleFromMetadata };
        }

        console.log('[useAuth] 메타데이터 역할 없음 - 프로필 테이블 조회');
        // 프로필 테이블에서 역할 조회
        const profile = await fetchUserProfile(userId);
        const role = profile?.role || null;
        console.log('[useAuth] 프로필 테이블 결과:', { role, profile });
        
        logDebug('[Auth] 프로필 로드 완료:', { role });
        console.log('[useAuth] 프로필 기반 역할 사용 - 상태 업데이트');
        updateState({ 
          userRole: role, 
          loading: false, 
          roleLoaded: true 
        });
        return { role };
      } catch (error) {
        console.error('[useAuth] loadUserProfile 에러:', error);
        
        // 타임아웃이나 다른 에러인 경우 기본값 사용
        if (error.message.includes('타임아웃') || error.message.includes('timeout')) {
          console.warn('[useAuth] 타임아웃으로 인해 기본 역할 사용');
          
          // 관리자 계정인 경우 특별 처리
          if (userId === 'ec53ade3-5d2d-49b6-b939-4ba2b1d952db') {
            updateState({ 
              userRole: 'admin', 
              loading: false, 
              roleLoaded: true 
            });
            return { role: 'admin' };
          }
        }
        
        logError('[Auth] 프로필 로드 오류:', error);
        updateState({ 
          userRole: 'student', // 기본값으로 student 사용
          loading: false, 
          roleLoaded: true 
        });
        return { role: 'student' };
      } finally {
        console.log('[useAuth] loadUserProfile finally 블록');
        profileFetchRef.current.isFetching = false;
        profileFetchRef.current.lastUserId = null;
        profileFetchRef.current.promise = null;
      }
    })();

    profileFetchRef.current.promise = promise;
    return promise;
  }, [updateState]);

  // 로그인
  const signIn = useCallback(async (email, password) => {
    try {
      updateState({ loading: true, error: null });
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (authError) throw authError;
      if (!data?.user) throw new Error('사용자 데이터가 없습니다.');

      console.log('[useAuth] 로그인 성공 - 사용자 정보:', { 
        userId: data.user.id, 
        email: data.user.email,
        metadata: data.user.user_metadata 
      });

      // 로그인 직후에는 반환된 데이터에서 직접 역할 확인
      const roleFromMetadata = data.user.user_metadata?.role;
      console.log('[useAuth] 로그인 직후 메타데이터 역할:', roleFromMetadata);

      // 세션 상태 업데이트
      updateState({
        session: data.session,
        userRole: roleFromMetadata || 'student', // 메타데이터 역할 또는 기본값
        loading: false,
        roleLoaded: true,
        lastActivity: new Date().toISOString()
      });

      console.log('[useAuth] 로그인 완료 - 최종 역할:', roleFromMetadata || 'student');

      // 역할에 따른 리다이렉트
      const finalRole = roleFromMetadata || 'student';
      const redirectPath = DEFAULT_REDIRECTS[finalRole] || DEFAULT_REDIRECTS.student;
      
      console.log('[useAuth] 리다이렉트 시작:', { role: finalRole, path: redirectPath });
      
      // 짧은 지연 후 리다이렉트 (상태 업데이트 완료 대기)
      setTimeout(() => {
        router.push(redirectPath);
        console.log('[useAuth] 리다이렉트 실행됨:', redirectPath);
      }, 100);

      return { success: true };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      logError('[Auth] 로그인 오류:', error);
      updateState({ error: errorMessage, loading: false, roleLoaded: true });
      return { success: false, error: errorMessage };
    }
  }, [updateState, router]);

  // 로그아웃
  const signOut = useCallback(async (redirectTo = '/signin') => {
    try {
      updateState({ loading: true });
      
      // 타이머 정리
      if (sessionTimerRef.current) {
        clearTimeout(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }

      // Supabase 로그아웃
      await supabase.auth.signOut();
      
      // 상태 초기화
      updateState({
        session: null,
        userRole: null,
        loading: false,
        error: null,
        lastActivity: null,
        roleLoaded: false
      });
      
      // 리다이렉트
      if (redirectTo) {
        router.push(redirectTo);
      }
      
      return { success: true };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      logError('[Auth] 로그아웃 오류:', error);
      updateState({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  }, [router, updateState]);

  // 세션 갱신
  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      updateState({
        session: data.session,
        lastActivity: new Date().toISOString()
      });
    } catch (error) {
      logError('[Auth] 세션 갱신 오류:', error);
    }
  }, [updateState]);

  // 비밀번호 업데이트
  const updatePassword = useCallback(async (newPassword) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      setLoading(false);
      return { success: true };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      logError('[Auth] 비밀번호 업데이트 오류:', error);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  }, []);

  // 비밀번호 재설정
  const resetPassword = useCallback(async (email) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      
      if (error) throw error;
      
      setLoading(false);
      return { success: true };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      logError('[Auth] 비밀번호 재설정 오류:', error);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  }, []);

  // 인증 상태 업데이트 (레거시 호환)
  const updateAuthState = useCallback((updates) => {
    updateState(updates);
  }, [updateState]);

  // 초기 세션 로드 및 인증 상태 감지
  useEffect(() => {
    let timeoutId;
    
    const loadSession = async () => {
      try {
        console.log('[useAuth] loadSession 시작');
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('[useAuth] 세션 조회 완료:', { hasSession: !!currentSession, userId: currentSession?.user?.id });
        
        if (currentSession?.user) {
          console.log('[useAuth] 세션 있음 - 메타데이터에서 역할 확인');
          const roleFromMetadata = currentSession.user.user_metadata?.role;
          console.log('[useAuth] loadSession 메타데이터 역할:', roleFromMetadata);
          
          updateState({
            session: currentSession,
            userRole: roleFromMetadata || 'student',
            loading: false,
            roleLoaded: true,
            lastActivity: new Date().toISOString()
          });
          console.log('[useAuth] 상태 업데이트 완료 - 세션 있음');
        } else {
          console.log('[useAuth] 세션 없음 - 로딩 해제');
          updateState({ 
            loading: false, 
            roleLoaded: true 
          });
          console.log('[useAuth] 상태 업데이트 완료 - 세션 없음');
        }
      } catch (error) {
        console.error('[useAuth] loadSession 오류:', error);
        logError('[Auth] 세션 로드 오류:', error);
        updateState({ 
          loading: false, 
          roleLoaded: true, 
          error: getErrorMessage(error) 
        });
        console.log('[useAuth] 에러 발생으로 로딩 해제');
      }
    };

    // 5초 후 강제로 로딩 해제 (무한 로딩 방지)
    timeoutId = setTimeout(() => {
      console.warn('[useAuth] 타임아웃! 강제로 로딩 해제');
      updateState({ 
        loading: false, 
        roleLoaded: true 
      });
    }, 5000);

    console.log('[useAuth] useEffect 실행 - loadSession 호출');
    loadSession().finally(() => {
      // loadSession 완료시 타임아웃 해제
      if (timeoutId) {
        clearTimeout(timeoutId);
        console.log('[useAuth] 타임아웃 해제됨');
      }
    });

    // 인증 상태 변화 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[useAuth] 인증 상태 변화:', event, { userId: session?.user?.id });
        logDebug('[Auth] 인증 상태 변화:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            console.log('[useAuth] SIGNED_IN 이벤트 - 메타데이터 직접 사용');
            const roleFromMetadata = session.user.user_metadata?.role;
            console.log('[useAuth] SIGNED_IN 메타데이터 역할:', roleFromMetadata);
            
            updateState({
              session: session,
              userRole: roleFromMetadata || 'student',
              loading: false,
              roleLoaded: true,
              lastActivity: new Date().toISOString()
            });
            
            console.log('[useAuth] SIGNED_IN 상태 업데이트 완료');
          } catch (error) {
            console.error('[useAuth] SIGNED_IN 처리 오류:', error);
            logError('[Auth] 로그인 시 프로필 로드 오류:', error);
            updateState({
              session: session,
              userRole: 'student',
              loading: false,
              roleLoaded: true,
              lastActivity: new Date().toISOString()
            });
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('[useAuth] SIGNED_OUT 이벤트');
          updateState({
            session: null,
            userRole: null,
            loading: false,
            roleLoaded: false,
            lastActivity: null
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      // 타임아웃 정리
      if (timeoutId) {
        clearTimeout(timeoutId);
        console.log('[useAuth] useEffect cleanup - 타임아웃 정리됨');
      }
    };
  }, [loadUserProfile, updateState]);

  // 세션 체크 주기적 실행
  useEffect(() => {
    if (!session) return;

    const checkSession = async () => {
      try {
        if (isSessionTimedOut(session, lastActivity)) {
          logWarn('[Auth] 세션 타임아웃으로 로그아웃');
          await signOut();
          return;
        }

        if (needsRefresh(session.expires_at)) {
          logDebug('[Auth] 세션 갱신 필요');
          await refreshSession();
        }
      } catch (error) {
        logError('[Auth] 세션 체크 오류:', error);
      }
    };

    const intervalId = setInterval(checkSession, SESSION_CHECK_INTERVAL);
    return () => clearInterval(intervalId);
  }, [session, lastActivity, signOut, refreshSession]);

  // 메모이제이션된 반환값
  return useMemo(() => ({
    // 기본 상태
    session,
    loading,
    error,
    userRole,
    lastActivity,
    roleLoaded,
    isAuthenticated: !!session,

    // 레거시 호환 필드
    user: session?.user || null,
    role: userRole, // userRole의 alias

    // 메서드
    hasRole,
    signIn,
    signOut,
    refreshSession,
    updatePassword,
    resetPassword,
    getDashboardPath,
    updateAuthState,
    
    // 레거시 호환 메서드
    setLoading: setLoadingState,
    
    // 역할 상수
    ROLES
  }), [
    session,
    loading,
    error,
    userRole,
    lastActivity,
    roleLoaded,
    hasRole,
    signIn,
    signOut,
    refreshSession,
    updatePassword,
    resetPassword,
    getDashboardPath,
    updateAuthState,
    setLoadingState
  ]);
} 