"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from "@/layouts/Layout";
import Link from "next/link";
import { supabase } from '@/lib/supabase';

import { getErrorMessage, extractAuthError } from '@/lib/auth/helpers';

// 접근성을 위한 유틸리티 스타일
const visuallyHidden = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0
};

export default function InstructorRegistration() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    major: '',
    career: '',
    bio: '',
    education: '',
    expertise: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    // 이름 유효성 검사
    if (!formData.name.trim()) {
      setError('이름을 입력해주세요.');
      document.getElementById('name')?.focus();
      return false;
    } else if (formData.name.trim().length < 2) {
      setError('이름은 2자 이상 입력해주세요.');
      document.getElementById('name')?.focus();
      return false;
    }

    // 전화번호 유효성 검사
    const phoneRegex = /^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$/;
    if (!formData.phone) {
      setError('전화번호를 입력해주세요. (예: 010-1234-5678)');
      document.getElementById('phone')?.focus();
      return false;
    } else if (!phoneRegex.test(formData.phone)) {
      setError('올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)');
      document.getElementById('phone')?.focus();
      return false;
    }

    // 이메일 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      setError('이메일 주소를 입력해주세요.');
      document.getElementById('email')?.focus();
      return false;
    } else if (!emailRegex.test(formData.email)) {
      setError('유효한 이메일 주소를 입력해주세요. (예: example@domain.com)');
      document.getElementById('email')?.focus();
      return false;
    }

    // 비밀번호 유효성 검사
    if (!formData.password) {
      setError('비밀번호를 입력해주세요.');
      document.getElementById('password')?.focus();
      return false;
    } else if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      document.getElementById('password')?.focus();
      return false;
    } else if (!/[A-Za-z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      setError('비밀번호는 영문과 숫자를 조합해주세요.');
      document.getElementById('password')?.focus();
      return false;
    }

    // 비밀번호 확인 검사
    if (!formData.confirmPassword) {
      setError('비밀번호 확인을 입력해주세요.');
      document.getElementById('confirmPassword')?.focus();
      return false;
    } else if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다. 다시 확인해주세요.');
      document.getElementById('confirmPassword')?.focus();
      return false;
    }

    // 전공 유효성 검사
    if (!formData.major.trim()) {
      setError('전공을 입력해주세요.');
      document.getElementById('major')?.focus();
      return false;
    } else if (formData.major.trim().length < 2) {
      setError('전공은 2자 이상 입력해주세요.');
      document.getElementById('major')?.focus();
      return false;
    }

    // 경력 유효성 검사
    if (!formData.career) {
      setError('경력을 입력해주세요.');
      document.getElementById('career')?.focus();
      return false;
    } else if (formData.career.length < 10) {
      setError('경력을 10자 이상 상세히 입력해주세요.');
      document.getElementById('career')?.focus();
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // 1. 사용자 등록
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            phone: formData.phone,
            role: 'instructor', // 여기에 역할 추가
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        // Supabase 오류 메시지 한글화
        let errorMessage = '회원가입 중 오류가 발생했습니다.';
        
        if (signUpError.message.includes('already registered')) {
          errorMessage = '이미 가입된 이메일 주소입니다. 로그인해주세요.';
        } else if (signUpError.message.includes('password')) {
          errorMessage = '비밀번호가 너무 짧거나 유효하지 않습니다. 6자 이상 입력해주세요.';
        } else if (signUpError.message.includes('email')) {
          errorMessage = '유효하지 않은 이메일 주소 형식입니다.';
        }
        
        throw new Error(errorMessage);
      }

      if (!authData.user) {
        throw new Error('사용자 정보를 가져오지 못했습니다.');
      }

      // 2. 강사 프로필 정보 저장
      const profileData = {
        id: authData.user.id,
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: 'instructor',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_verified: false, // 이메일 인증 전까지는 미인증 상태
      };
      const instructorProfileData = {
        id: authData.user.id,
        user_id: authData.user.id,
        major: formData.major,
        career: formData.career,
        bio: formData.bio || null,
        education: formData.education || null,
        expertise: formData.expertise ? formData.expertise.split(',').map(s => s.trim()) : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      console.log('프로필 저장 데이터:', JSON.stringify(profileData, null, 2));
      console.log('강사 프로필 저장 데이터:', JSON.stringify(instructorProfileData, null, 2));
      
      // profiles 테이블 저장
      const { data: profileResult, error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, { on_conflict: 'id' });
        
      if (profileError) {
        console.error('프로필 저장 오류:', profileError);
        // 사용자 계정은 이미 생성되었지만 프로필 저장에 실패한 경우
        // 관리자 권한 없이는 사용자를 삭제할 수 없으므로 오류만 표시
        throw new Error(`프로필 저장 중 오류가 발생했습니다: ${profileError.message}`);
      }
      
      // instructor_profiles 테이블 저장
      const { data: instructorResult, error: instructorError } = await supabase
        .from('instructor_profiles')
        .upsert(instructorProfileData, { on_conflict: 'id' });
        
      if (instructorError) {
        console.error('강사 프로필 저장 오류:', instructorError);
        throw new Error(`강사 프로필 저장 중 오류가 발생했습니다: ${instructorError.message}`);
      }

      // 3. 성공 메시지 표시 후 로그인 페이지로 리다이렉트
      const successMessage = `\n        회원가입이 완료되었습니다!\n        \n        ${formData.email} 로 인증 메일을 발송했습니다.\n        이메일의 인증 링크를 클릭하시면 회원가입이 완료됩니다.\n        \n        ※ 인증 메일이 보이지 않는다면 스팸함을 확인해주세요.
      `;
      
      if (window.confirm(successMessage)) {
        router.push('/signin');
      }
      
    } catch (error) {
      console.error('회원가입 오류:', error);
      // 더 자세한 오류 메시지 표시를 위해 extractAuthError 사용
      const errorMessage = extractAuthError(error) || 
                          getErrorMessage(error) || 
                          error.message || 
                          '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      breadcrumbTitle={"강사 회원가입"}
      breadcrumbSubtitle={"강사 회원가입"}
    >
      <section>
        <div className="td_height_120 td_height_lg_80" />
        <div className="container">
          <div className="row">
            <div className="col-lg-10 offset-lg-1">
              <form onSubmit={handleSubmit} className="td_form_card td_style_1 td_radius_10 td_gray_bg_5">
                <div className="td_form_card_in">
                  <h2 className="td_fs_36 td_mb_20">강사 회원가입</h2>
                  <p className="td_fs_18 td_heading_color td_opacity_7 td_mb_40">
                    필수 입력 사항을 모두 작성해주세요.
                  </p>
                  
                  {error && (
                    <div className="alert alert-danger" role="alert" aria-live="assertive">
                      {error}
                    </div>
                  )}

                  <fieldset className="row">
                    <legend className="visually-hidden">기본 정보</legend>
                    <div className="col-md-6">
                      <label htmlFor="name" className="td_medium td_heading_color td_mb_12">
                        이름 *
                      </label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="td_form_field td_mb_30 td_medium td_white_bg w-100"
                        placeholder="이름을 입력하세요"
                        aria-label="이름"
                        aria-required="true"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="phone" className="td_medium td_heading_color td_mb_12">
                        전화번호 *
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="td_form_field td_mb_30 td_medium td_white_bg w-100"
                        placeholder="010-1234-5678"
                        pattern="[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}"
                        aria-label="전화번호 (예: 010-1234-5678)"
                        aria-required="true"
                        required
                      />
                    </div>
                  </fieldset>

                  <fieldset className="row">
                    <legend className="visually-hidden">계정 정보</legend>
                    <div className="col-md-6">
                      <label htmlFor="email" className="td_medium td_heading_color td_mb_12">
                        이메일 *
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="td_form_field td_mb_30 td_medium td_white_bg w-100"
                        placeholder="example@example.com"
                        aria-label="이메일 주소"
                        aria-required="true"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="major" className="td_medium td_heading_color td_mb_12">
                        전공 *
                      </label>
                      <input
                        id="major"
                        type="text"
                        name="major"
                        value={formData.major}
                        onChange={handleChange}
                        className="td_form_field td_mb_30 td_medium td_white_bg w-100"
                        placeholder="전공을 입력하세요"
                        aria-label="전공"
                        aria-required="true"
                        required
                      />
                    </div>
                  </fieldset>

                  <fieldset className="row">
                    <legend className="visually-hidden">비밀번호 설정</legend>
                    <div className="col-md-6">
                      <label htmlFor="password" className="td_medium td_heading_color td_mb_12">
                        비밀번호 *
                      </label>
                      <input
                        id="password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="td_form_field td_mb_30 td_medium td_white_bg w-100"
                        placeholder="6자리 이상 입력해주세요"
                        aria-label="비밀번호 (최소 6자 이상)"
                        aria-required="true"
                        aria-describedby="passwordHelp"
                        required
                      />
                      <small id="passwordHelp" className="form-text text-muted">
                        비밀번호는 최소 6자 이상이어야 합니다.
                      </small>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="confirmPassword" className="td_medium td_heading_color td_mb_12">
                        비밀번호 확인 *
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="td_form_field td_mb_30 td_medium td_white_bg w-100"
                        placeholder="비밀번호를 다시 입력하세요"
                        aria-label="비밀번호 확인"
                        aria-required="true"
                        required
                      />
                    </div>
                  </fieldset>

                  <fieldset className="row">
                    <legend className="visually-hidden">강사 정보</legend>
                    <div className="col-12">
                      <label htmlFor="career" className="td_medium td_heading_color td_mb_12">
                        경력 *
                      </label>
                      <textarea
                        id="career"
                        name="career"
                        value={formData.career}
                        onChange={handleChange}
                        className="td_form_field td_mb_30 td_medium td_white_bg w-100"
                        placeholder="경력을 입력하세요"
                        style={{ height: '100px' }}
                        aria-label="경력"
                        aria-required="true"
                        required
                      ></textarea>
                    </div>
                  </fieldset>

                  <fieldset className="row">
                    <legend className="visually-hidden">추가 정보</legend>
                    <div className="col-md-6">
                      <label htmlFor="education" className="td_medium td_heading_color td_mb_12">
                        학력
                      </label>
                      <input
                        id="education"
                        type="text"
                        name="education"
                        value={formData.education}
                        onChange={handleChange}
                        className="td_form_field td_mb_30 td_medium td_white_bg w-100"
                        placeholder="학력을 입력하세요"
                        aria-label="학력 (선택사항)"
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="expertise" className="td_medium td_heading_color td_mb_12">
                        전문 분야
                      </label>
                      <input
                        id="expertise"
                        type="text"
                        name="expertise"
                        value={formData.expertise}
                        onChange={handleChange}
                        className="td_form_field td_mb_30 td_medium td_white_bg w-100"
                        placeholder="전문 분야를 입력하세요"
                        aria-label="전문 분야 (선택사항)"
                      />
                    </div>
                    <div className="col-12">
                      <label htmlFor="bio" className="td_medium td_heading_color td_mb_12">
                        자기소개
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        className="td_form_field td_mb_30 td_medium td_white_bg w-100"
                        placeholder="자기소개를 입력하세요"
                        style={{ height: '150px' }}
                        aria-label="자기소개 (선택사항)"
                      ></textarea>
                    </div>
                  </fieldset>

                  <div className="d-flex align-items-center justify-content-between td_mb_30">
                    <div className="form-check">
                      <input
                        id="termsCheck"
                        className="form-check-input"
                        type="checkbox"
                        required
                        aria-required="true"
                      />
                      <label className="form-check-label td_fs_14" htmlFor="termsCheck">
                        <Link href="/terms" className="td_primary_color">이용약관</Link> 및{' '}
                        <Link href="/privacy" className="td_primary_color">개인정보처리방침</Link>에 동의합니다.
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="td_btn td_style_1 td_radius_10 td_medium w-100 td_fs_20"
                    disabled={loading}
                    aria-busy={loading}
                  >
                    <span className="td_btn_in td_white_color td_accent_bg">
                      {loading ? '처리 중...' : '강사로 회원가입'}
                    </span>
                  </button>

                  <div className="text-center td_mt_20">
                    <span className="td_fs_16 td_heading_color">
                      이미 계정이 있으신가요?{' '}
                      <Link href="/signin" className="td_primary_color td_medium" aria-label="로그인 페이지로 이동">
                        로그인
                      </Link>
                    </span>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div className="td_height_120 td_height_lg_80" role="presentation" />
        </div>
      </section>
    </Layout>
  );
}
