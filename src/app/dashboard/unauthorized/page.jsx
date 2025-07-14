'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { DEFAULT_REDIRECTS, ROLES } from '../../../lib/auth/constants.js';
import { logger } from '../../../utils/logger.js';

const supabase = createClientComponentClient();

export default function UnauthorizedPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (user) {
        // 사용자가 로그인되어 있으면 역할에 따라 대시보드로 리다이렉트
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        let redirectTo = DEFAULT_REDIRECTS[ROLES.STUDENT]; // 기본값은 학생 대시보드

        if (profileError) {
          logger.error('권한 없음 페이지에서 프로필 조회 오류:', profileError);
        } else if (profile?.role) {
          const userRole = profile.role.toLowerCase();
          redirectTo = DEFAULT_REDIRECTS[userRole] || DEFAULT_REDIRECTS[ROLES.STUDENT];
        }
        logger.debug(`권한 없음: 로그인된 사용자, ${redirectTo}로 리다이렉트`);
        router.push(redirectTo);
      } else {
        // 로그인되어 있지 않으면 로그인 페이지로 리다이렉트
        logger.debug('권한 없음: 로그인되지 않은 사용자, /signin으로 리다이렉트');
        router.push('/signin');
      }
    };

    const timer = setTimeout(() => {
      checkAuthAndRedirect();
    }, 3000); // 3초 후 자동 리다이렉트

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="bg-red-100 dark:bg-red-900/20 p-6 rounded-lg max-w-md w-full">
        <div className="text-red-600 dark:text-red-400 text-5xl font-bold mb-4">
          403
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          접근 권한이 없습니다
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          이 페이지에 접근할 수 있는 권한이 없습니다. 잠시 후 자동으로 이동합니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => router.push('/signin')}
            variant="default"
            className="w-full sm:w-auto"
          >
            로그인 페이지로 이동
          </Button>
        </div>
      </div>
    </div>
  );
}
