'use client';

import CourseList from '@/components/admin/dashboard/courses-design/CourseList';
import MenuManagementContent from '@/components/admin/dashboard/menu-management/MenuManagementContent';
import { Card } from '@/components/ui/card';

export default function AdminCoursesRoutePage() {
  return (
    <div className="container mx-auto py-4">
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