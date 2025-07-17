// src/components/admin/dashboard/schedule-management/components/GradeSection.jsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ScheduleTable from './ScheduleTable';

const GradeSection = ({ 
  grade, 
  schedules, 
  stats, 
  onAddClick, 
  onEditClick, 
  onDeleteClick, 
  onToggleActive 
}) => {
  return (
    <div className="space-y-4">
      {/* 학년별 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{grade} 시간표</h3>
          <p className="text-sm text-muted-foreground">
            총 {stats.total}개 수업 | 활성 {stats.active}개 | 수강생 {stats.totalStudents}명
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => onAddClick(grade)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {grade} 시간표 추가
        </Button>
      </div>

      {/* 시간표 테이블 */}
      <Card>
        <CardContent className="pt-6">
          <ScheduleTable
            schedules={schedules}
            grade={grade}
            onEdit={onEditClick}
            onDelete={onDeleteClick}
            onToggleActive={onToggleActive}
            onAdd={onAddClick}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default GradeSection;
