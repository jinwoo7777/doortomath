"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MiddleSchedulePage() {
  const router = useRouter();

  useEffect(() => {
    // 대치 지점 페이지로 리디렉션
    router.replace('/schedules/elementary');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-2 text-sm text-muted-foreground">페이지 이동 중...</p>
          </div>
        </div>
      </div>
    </div>
  );
}