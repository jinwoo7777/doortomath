// src/components/admin/dashboard/instructor-management/components/TeacherSchedules.jsx
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, X } from 'lucide-react';
import { getDayName, getBranchName } from '../utils/formatUtils';

const TeacherSchedules = ({ teacher, schedules, onUnassign }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          담당 수업 ({schedules.length}개)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {schedules.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">담당 중인 수업이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{schedule.subject}</p>
                    <p className="text-sm text-muted-foreground">
                      {getDayName(schedule.day_of_week)}요일 {schedule.time_slot}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {schedule.grade} | {schedule.classroom} | {getBranchName(schedule.branch)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {schedule.current_students || 0}/{schedule.max_students || 30}명
                    </Badge>
                    <button
                      type="button"
                      className="ml-1 p-1 bg-transparent border-none cursor-pointer hover:text-red-500 transition-colors text-sm flex items-center gap-1"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onUnassign(schedule);
                      }}
                      aria-label="강사 배정 취소"
                      title="강사 배정 취소"
                    >
                      <X className="h-3 w-3" />
                      수업취소
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeacherSchedules;
