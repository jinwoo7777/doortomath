'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';
import { FaPlus } from 'react-icons/fa';
import CourseTable from './CourseTable';

export default function CourseList({ courses = [], onEdit, onDelete }) {
  const [deletingId, setDeletingId] = useState(null);
  
  const handleDelete = async (courseId) => {
    setDeletingId(courseId);
    try {
      if (onDelete) {
        await onDelete(courseId);
      }
    } catch (err) {
      console.error('강의 삭제 중 오류 발생:', err);
      toast.error(`강의 삭제 중 오류가 발생했습니다: ${err.message || '알 수 없는 오류'}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container mx-auto py-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="mb-0">강의 관리</h2>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => window.location.href = '/dashboard2/admin/class-description?tab=form'}>
            <FaPlus className="me-2" /> 새 강의 생성 (통합)
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/dashboard2/admin/class-description/create'}
          >
            <FaPlus className="me-2" /> 새 강의 생성 (개별)
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <div className="p-6">
          <CourseTable 
            courses={courses} 
            handleDelete={handleDelete} 
            handleEdit={onEdit}
            deletingId={deletingId} 
          />
        </div>
      </Card>
    </div>
  );
}

