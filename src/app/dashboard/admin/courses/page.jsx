'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CourseList from '@/components/admin/dashboard/courses-design/CourseList';
import MenuManagementContent from '@/components/admin/dashboard/menu-management/MenuManagementContent';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function AdminCoursesRoutePage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-4">
      {/* 이전 위치 알림 */}
      <Card className="mb-6 border-orange-200 bg-orange-50">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-orange-800">강의 관리 페이지가 이동했습니다!</h3>
              <p className="text-orange-700 mt-1">모든 강의 관리 기능이 새로운 위치로 통합되었습니다.</p>
            </div>
            <Button 
              onClick={() => router.push('/dashboard2/admin/class-description')}
              className="flex items-center gap-2"
            >
              새 페이지로 이동
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <h1 className="text-2xl font-bold mb-4">메뉴 관리</h1>
      <Card className="shadow-sm mb-8">
        <div className="p-6">
          <MenuManagementContent />
        </div>
      </Card>
      <h1 className="text-2xl font-bold mb-4">강의 관리</h1>
      <CourseList />
    </div>
  );
}
