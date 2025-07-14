"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase/supabaseClientBrowser';

import { getErrorMessage } from '@/lib/auth/helpers';
import { validateLoginForm } from '@/lib/auth/helpers';
import { useAuth } from '@/hooks/useAuth';

// 클라이언트 사이드에서만 로드
const LoginForm = dynamic(() => import('./components/LoginForm'), { ssr: false });
const LoginImage = dynamic(() => import('./components/LoginImage'), { ssr: false });

// 로그인 시도 제한 시간 (밀리초)
const LOGIN_ATTEMPT_DELAY = 2000;
// 최대 로그인 시도 횟수
const MAX_LOGIN_ATTEMPTS = 5;

// useSearchParams를 사용하는 컴포넌트를 분리
function SigninContent() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 클라이언트 사이드에서만 실행
  useEffect(() => {
    setIsClient(true);
    
    // 페이지 로드 시 이전 세션 초기화 (자동 로그아웃)
    const clearPreviousSession = async () => {
      try {
        console.log('로그인 페이지 접근: 이전 세션 초기화 중...');
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('세션 초기화 중 오류 발생:', error.message);
        } else {
          console.log('이전 세션이 성공적으로 초기화되었습니다.');
        }
      } catch (err) {
        console.error('세션 초기화 중 예외 발생:', err);
      }
    };
    
    clearPreviousSession();
  }, [signIn]);

  // 잠금 시간 타이머
  useEffect(() => {
    if (!isLocked) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const diff = lockTime - now;
      
      if (diff <= 0) {
        setIsLocked(false);
        setLoginAttempts(0);
        setError('');
        clearInterval(timer);
      } else {
        setRemainingTime(Math.ceil(diff / 1000));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isLocked, lockTime]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (error) setError('');
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const validateForm = () => {
    const { isValid, errors } = validateLoginForm(formData);
    if (!isValid) {
      setError(Object.values(errors)[0]);
      return false;
    }
    return true;
  };

  const getLoginButtonText = () => {
    if (isLocked) return `잠시 후 다시 시도해주세요 (${remainingTime}초)`;
    if (loading) return '로그인 중...';
    return '로그인';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // 이전 에러 메시지 초기화

    // 이미 제출 중이거나 로딩 중이면 중복 요청 방지
    if (loading || isSubmitting) {
      console.log('이미 로그인 처리 중입니다. 중복 요청을 무시합니다.');
      return;
    }

    setLoading(true); // Signin 컴포넌트의 로딩 상태 시작
    setIsSubmitting(true); // 제출 상태 시작

    const { isValid, errors } = validateLoginForm(formData);

    if (!isValid) {
      setError(Object.values(errors).join(' '));
      setLoading(false); // 유효성 검사 실패 시 로딩 상태 종료
      setIsSubmitting(false); // 유효성 검사 실패 시 제출 상태 종료
      return;
    }

    if (isLocked) {
      setError(`로그인 시도가 너무 많습니다. ${remainingTime}초 후 다시 시도해주세요.`);
      setLoading(false); // 잠금 상태 시 로딩 상태 종료
      setIsSubmitting(false); // 잠금 상태 시 제출 상태 종료
      return;
    }

    // 로그인 시도 횟수 증가 (try 블록 진입 전에 처리)
    const currentAttempts = loginAttempts + 1;
    setLoginAttempts(currentAttempts);
    console.log('로그인 시도 횟수:', `${currentAttempts}/${MAX_LOGIN_ATTEMPTS}`);

    try {
      console.log('로그인 시도 중...', { email: formData.email });
      const result = await signIn(
        formData.email.trim(),
        formData.password
      );
      
      if (!result || !result.success) {
        // signIn 함수에서 success: false를 반환하는 경우 (예: 이미 처리 중인 요청)
        throw new Error(result?.error || '로그인에 실패했습니다.');
      }
      // 리다이렉트는 signIn 훅에서 처리되므로 여기서는 추가적인 리다이렉트 로직은 필요 없음
    } catch (signInError) {
      console.error('로그인 오류:', signInError);
      if (signInError.message.includes('Invalid login credentials') || 
          signInError.originalError?.message?.includes('Invalid login credentials')) {
        const errorMsg = `이메일 또는 비밀번호가 올바르지 않습니다. (${currentAttempts}/${MAX_LOGIN_ATTEMPTS}회 시도)`;
        console.error(errorMsg);
        setError(errorMsg);
        // 점진적인 지연 추가
        const delay = Math.min(1000 * Math.pow(2, currentAttempts - 1), 10000);
        console.log(`재시도까지 ${delay}ms 대기`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        const errorMsg = getErrorMessage(signInError);
        console.error('인증 오류:', errorMsg);
        setError(errorMsg);
      }
    } finally {
      setLoading(false); // Signin 컴포넌트의 로딩 상태 종료
      setIsSubmitting(false); // 제출 상태 종료
    }
  };

  if (!isClient) {
    return null; // 서버 사이드에서는 렌더링하지 않음
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f8ff] px-4">
      {/* 카드 */}
      <div className="relative flex flex-col lg:flex-row w-full max-w-5xl bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Close button */}
        <button 
          onClick={() => router.push('/')} 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none z-10"
          aria-label="닫기"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button> 
        {/* 왼쪽 영역: 이미지 및 문구 */}
        <LoginImage />
        {/* 오른쪽 영역: 로그인 폼 */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            <LoginForm 
              formData={formData}
              error={error}
              loading={loading}
              isLocked={isLocked}
              showPassword={showPassword}
              handleChange={handleChange}
              togglePasswordVisibility={togglePasswordVisibility}
              handleSubmit={handleSubmit}
              getLoginButtonText={getLoginButtonText}
              emailConfirmationSent={searchParams.get('email_confirmation_sent') === 'true'}
              email={formData.email}
            />
          </div>
        </div>
      </div>
      
      {/* 하단 문의 정보 */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-sm text-gray-500">
        <p>솔루션 개발은 CodeBoost가 도와드립니다.</p>
        <p>codeboost@naver.com / Tel: 010-5682-7859</p>
      </div>
    </div>
  );
}

export default function Signin() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SigninContent />
    </Suspense>
  );
}
