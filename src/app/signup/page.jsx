"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';

import { getErrorMessage, validateSignupForm } from '@/lib/auth/helpers';

// 동적 임포트 (클라이언트 사이드에서만 로드)
const SignupForm = dynamic(() => import('./components/SignupForm'), { ssr: false });
const LoginImage = dynamic(() => import('../signin/components/LoginImage'), { ssr: false });

export default function Signup() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    school: '',
    grade: '',
    parentPhone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 클라이언트 사이드에서만 실행
  useEffect(() => {
    setIsClient(true);
    
    // 이미 로그인된 사용자는 대시보드로 리다이렉션
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      }
    };
    
    checkUser();
  }, [router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // 에러가 있는 필드를 수정하면 해당 필드의 에러 메시지 제거
    if (error.field === name) {
      setError({});
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const validation = validateSignupForm(formData);
    if (!validation.isValid) {
      setError(validation.errors[0]);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || loading) return;
    
    setLoading(true);
    setIsSubmitting(true);
    setError({});

    // 토큰 초기화 (기존 세션 정리)
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.log('기존 세션 정리 중 오류:', err);
    }

    try {
      if (!validateForm()) return;

      // 1. 사용자 등록
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            phone: formData.phone,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) throw signUpError;

      // 2. 프로필 정보 저장
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          full_name: formData.name,
          phone: formData.phone,
          email: formData.email,
          school: formData.school,
          grade: formData.grade,
          parent_phone: formData.parentPhone,
          role: 'student',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (profileError) throw profileError;

      if (signUpError) {
        const authError = getErrorMessage(signUpError);
        setError(authError);
        return;
      }

      // 회원가입 성공 시 대시보드로 리다이렉션
      // 이메일 인증이 필요한 경우, Supabase에서 자동으로 인증 이메일 발송
      router.push('/dashboard');
    } catch (error) {
      console.error('회원가입 중 오류 발생:', error);
      setError({
        message: '회원가입 처리 중 오류가 발생했습니다. 다시 시도해주세요.'
      });
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-[#f6f8ff] px-2 sm:px-4 py-6">
      <div className="w-full flex items-center justify-center px-2 sm:px-4 flex-grow">
        {/* 카드 */}
        <div className="relative flex flex-col lg:flex-row w-full max-w-6xl bg-white rounded-2xl shadow-lg overflow-hidden">
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
          
          {/* 좌측 이미지 영역 (로그인 페이지와 동일) */}
          <LoginImage />
          
          {/* 우측 회원가입 폼 영역 */}
          <div className="w-full lg:w-5/6 flex items-center justify-center p-6 lg:p-12">
            <div className="w-full max-w-4xl">
              <SignupForm
                formData={formData}
                error={error}
                loading={loading}
                showPassword={showPassword}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                togglePasswordVisibility={togglePasswordVisibility}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* 하단 문의 정보 */}
      <div className="w-full mt-8 text-center text-sm text-gray-500">
        <p>솔루션 개발은 CodeBoost가 도와드립니다.</p>
        <p>codeboost@naver.com / Tel: 010-5682-7859</p>
      </div>
    </div>
  );
}
