"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { logger } from '../../../utils/logger.js';

const supabase = createClientComponentClient();

import { Layout } from "@/layouts/Layout";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('처리 중...');
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // URL에서 토큰 파라미터 추출
        const token = searchParams.get('token');
        
        if (!token) {
          setError('유효하지 않은 인증 링크입니다.');
          return;
        }

        // 이메일 인증 처리
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'email',
        });

        if (error) throw error;

        // 인증 성공
        setStatus('이메일 인증이 완료되었습니다.');
        
        // 로그인 페이지로 리다이렉트
        setTimeout(() => {
          router.push('/signin?email_verified=true');
        }, 2000);
      } catch (err) {
        logger.error('이메일 인증 중 오류 발생:', err);
        setError('이메일 인증 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    };

    verifyEmail();
  }, [router, searchParams]);

  return (
    <Layout breadcrumbTitle={"이메일 인증"} breadcrumbSubtitle={"이메일 인증"}>
      <section>
        <div className="td_height_120 td_height_lg_80" />
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="td_form_card td_style_1 td_radius_10 td_gray_bg_5">
                <div className="td_form_card_in text-center">
                  <h2 className="td_fs_36 td_mb_20">이메일 인증</h2>
                  <hr />
                  <div className="td_height_30 td_height_lg_30" />
                  
                  {error ? (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  ) : (
                    <div className="alert alert-info" role="alert">
                      {status}
                    </div>
                  )}
                  
                  {!error && (
                    <div className="spinner-border text-primary mt-3" role="status">
                      <span className="visually-hidden">로딩 중...</span>
                    </div>
                  )}
                  
                  <div className="td_height_30 td_height_lg_30" />
                  <p className="td_form_card_text td_fs_20 td_medium td_heading_color mb-0">
                    <a href="/signin" className="td_accent_color">로그인 페이지로 돌아가기</a>
                  </p>
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

export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <Layout breadcrumbTitle={"이메일 인증"} breadcrumbSubtitle={"이메일 인증"}>
        <section>
          <div className="td_height_120 td_height_lg_80" />
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-6">
                <div className="td_form_card td_style_1 td_radius_10 td_gray_bg_5">
                  <div className="td_form_card_in text-center">
                    <h2 className="td_fs_36 td_mb_20">이메일 인증</h2>
                    <hr />
                    <div className="td_height_30 td_height_lg_30" />
                    <div className="alert alert-info" role="alert">
                      처리 중...
                    </div>
                    <div className="spinner-border text-primary mt-3" role="status">
                      <span className="visually-hidden">로딩 중...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
