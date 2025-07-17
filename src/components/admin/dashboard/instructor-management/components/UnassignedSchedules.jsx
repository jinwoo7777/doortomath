// src/components/admin/dashboard/instructor-management/components/UnassignedSchedules.jsx
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus } from 'lucide-react';
import { getDayName, getBranchName } from '../utils/formatUtils';

const UnassignedSchedules = ({ schedules, teacher, onAssign }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-600" />
          미배정 수업 ({schedules.length}개)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {schedules.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">해당 지점의 모든 수업이 배정되었습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.slice(0, 10).map((schedule) => (
              <div key={schedule.id} className="p-3 border rounded-lg bg-orange-50">
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
                  {teacher && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onAssign(schedule, teacher)}
                      className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      배정하기
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {schedules.length > 10 && (
              <p className="text-sm text-muted-foreground text-center">
                외 {schedules.length - 10}개 더...
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UnassignedSchedules;
