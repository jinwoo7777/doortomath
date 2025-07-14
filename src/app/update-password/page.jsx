"use client";

// 동적 렌더링 설정 추가
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

import { Layout } from '@/layouts/Layout';
import Link from 'next/link';
import { getErrorMessage, validatePassword } from '@/lib/auth/helpers';
import { useAuth } from '@/hooks/useAuth';

export default function UpdatePassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [message, setMessage] = useState({ type: '', content: '' });
  const [session, setSession] = useState(null);
  const { loading, setLoading, updatePassword } = useAuth();

  useEffect(() => {
    const checkSession = async () => {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');

      if (accessToken && refreshToken) {
        try {
          const { data: { session: authSession }, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) throw error;
          setSession(authSession);
          
          // Update URL to remove tokens
          const cleanUrl = window.location.pathname + (type ? `?type=${type}` : '');
          window.history.replaceState({}, document.title, cleanUrl);
        } catch (error) {
          console.error('세션 설정 오류:', error);
          setMessage({ 
            type: 'error', 
            content: '유효하지 않은 링크이거나 만료되었습니다. 다시 시도해주세요.' 
          });
        }
      } else {
        // Check if user is already logged in
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession) {
          setSession(currentSession);
        }
      }
    };

    checkSession();
  }, [searchParams]);

  const validateForm = () => {
    const passwordValidation = validatePassword(password);
    const confirmPasswordValidation = password !== confirmPassword ? '비밀번호가 일치하지 않습니다.' : '';
    
    setPasswordError(passwordValidation.isValid ? '' : '비밀번호는 최소 6자 이상이어야 합니다.');
    setConfirmPasswordError(confirmPasswordValidation);
    
    return passwordValidation.isValid && !confirmPasswordValidation;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', content: '' });

    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const { error } = await updatePassword(password);
      
      if (error) throw error;
      
      setMessage({ 
        type: 'success', 
        content: '비밀번호가 성공적으로 변경되었습니다. 로그인 페이지로 이동합니다.' 
      });
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push('/signin');
      }, 3000);
      
    } catch (error) {
      console.error('비밀번호 업데이트 오류:', error);
      setMessage({ 
        type: 'error', 
        content: getErrorMessage(error) || '비밀번호 변경 중 오류가 발생했습니다.' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!session && message.type !== 'success') {
    return (
      <Layout breadcrumbTitle="세션 만료" breadcrumbSubtitle="세션이 만료되었습니다">
        <section>
          <div className="td_height_120 td_height_lg_80" />
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-6">
                <div className="td_form_card td_style_1 td_radius_10 td_gray_bg_5 p-5 text-center">
                  <div className="mb-4">
                    <i className="fas fa-exclamation-triangle text-warning" style={{ fontSize: '4rem' }}></i>
                  </div>
                  <h3 className="td_fs_24 td_mb_20">유효하지 않은 링크입니다</h3>
                  <p className="td_fs_18 td_mb_30">
                    비밀번호 재설정 링크가 만료되었거나 유효하지 않습니다. 
                    비밀번호 재설정을 다시 시도해주세요.
                  </p>
                  <Link href="/forgot-password" className="td_btn td_style_1 td_radius_10 td_medium">
                    <span className="td_btn_in td_white_color td_accent_bg">
                      <span>비밀번호 재설정</span>
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="td_height_120 td_height_lg_80" />
        </section>
      </Layout>
    );
  }

  return (
    <Layout breadcrumbTitle="비밀번호 재설정" breadcrumbSubtitle="새로운 비밀번호를 설정하세요">
      <section>
        <div className="td_height_120 td_height_lg_80" />
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="td_form_card td_style_1 td_radius_10 td_gray_bg_5 p-5">
                <h2 className="td_fs_36 td_mb_20 text-center">새 비밀번호 설정</h2>
                <hr className="td_mb_30" />
                
                {message.content && (
                  <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`} role="alert">
                    {message.content}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="password" className="form-label td_fs_18 td_medium">
                      새 비밀번호 <span className="text-danger">*</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      autoComplete="new-password"
                      className={`td_form_field td_medium td_white_bg w-100 ${passwordError ? 'is-invalid' : ''}`}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) setPasswordError(validatePassword(e.target.value));
                      }}
                      onBlur={() => setPasswordError(validatePassword(password))}
                      placeholder="영문, 숫자 조합 6자 이상"
                      minLength={6}
                      required
                      disabled={loading || message.type === 'success'}
                      aria-required="true"
                      aria-invalid={!!passwordError}
                      aria-describedby={passwordError ? 'passwordError' : 'passwordHelp'}
                    />
                    {passwordError ? (
                      <div id="passwordError" className="invalid-feedback d-block">
                        {passwordError}
                      </div>
                    ) : (
                      <div id="passwordHelp" className="form-text">
                        영문, 숫자 조합 6자 이상 입력해주세요.
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label td_fs_18 td_medium">
                      비밀번호 확인 <span className="text-danger">*</span>
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      autoComplete="new-password"
                      className={`td_form_field td_medium td_white_bg w-100 ${confirmPasswordError ? 'is-invalid' : ''}`}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (confirmPasswordError) setConfirmPasswordError(password !== e.target.value ? '비밀번호가 일치하지 않습니다.' : '');
                      }}
                      onBlur={() => setConfirmPasswordError(password !== confirmPassword ? '비밀번호가 일치하지 않습니다.' : '')}
                      placeholder="비밀번호를 다시 입력하세요"
                      minLength={6}
                      required
                      disabled={loading || message.type === 'success'}
                      aria-required="true"
                      aria-invalid={!!confirmPasswordError}
                      aria-describedby={confirmPasswordError ? 'confirmPasswordError' : undefined}
                    />
                    {confirmPasswordError && (
                      <div id="confirmPasswordError" className="invalid-feedback d-block">
                        {confirmPasswordError}
                      </div>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    className="td_btn td_style_1 td_radius_10 td_medium w-100"
                    disabled={loading || message.type === 'success'}
                    aria-busy={loading}
                    aria-live="polite"
                  >
                    <span className="td_btn_in td_white_color td_accent_bg">
                      <span>
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            <span>처리 중...</span>
                          </>
                        ) : message.type === 'success' ? (
                          '완료'
                        ) : (
                          '비밀번호 변경'
                        )}
                      </span>
                    </span>
                  </button>
                </form>
                
                <div className="text-center mt-4">
                  <Link 
                    href="/signin" 
                    className="td_accent_color td_medium"
                    aria-label="로그인 페이지로 돌아가기"
                  >
                    <i className="fas fa-arrow-left me-2" aria-hidden="true"></i>
                    <span>로그인 페이지로 돌아가기</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="td_height_120 td_height_lg_80" />
      </section>
    </Layout>
  );
}
