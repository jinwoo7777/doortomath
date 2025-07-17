// src/components/admin/dashboard/schedule-management/components/SchedulePageView.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, GraduationCap, MapPin, Clock } from 'lucide-react';
import { getDayName } from '../hooks/useScheduleManagement';

const SchedulePageView = ({ schedules, grade }) => {
  // 요일별로 시간표 그룹화
  const groupByDay = () => {
    const days = [1, 2, 3, 4, 5, 6, 7]; // 월화수목금토일
    const result = {};
    
    days.forEach(day => {
      const daySchedules = schedules.filter(s => s.day_of_week === day && s.is_active);
      if (daySchedules.length > 0) {
        result[day] = daySchedules.sort((a, b) => {
          // 시간대 기준으로 정렬
          const timeA = a.time_slot.split('-')[0];
          const timeB = b.time_slot.split('-')[0];
          return timeA.localeCompare(timeB);
        });
      }
    });
    
    return result;
  };

  const daySchedules = groupByDay();
  const dayNames = ['', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];

  if (Object.keys(daySchedules).length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-lg font-medium">활성화된 시간표가 없습니다</p>
        <p className="text-muted-foreground">시간표를 추가하거나 활성화해주세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(daySchedules).map(([day, scheduleList]) => (
        <Card key={day} className="overflow-hidden">
          <CardHeader className="bg-muted">
            <CardTitle>{dayNames[day]}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 divide-y">
              {scheduleList.map((schedule) => (
                <div key={schedule.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{schedule.subject}</h3>
                        <Badge variant="outline">{grade}</Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {schedule.time_slot}
                        </div>
                        
                        {schedule.teacher_name && (
                          <div className="flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" />
                            {schedule.teacher_name}
                          </div>
                        )}
                        
                        {schedule.classroom && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {schedule.classroom}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span className={
                            (schedule.current_students || 0) >= (schedule.max_students || 30) 
                              ? 'text-red-600 font-medium' : ''
                          }>
                            {schedule.current_students || 0}/{schedule.max_students || 30}
                          </span>
                        </div>
                      </div>
                      
                      {schedule.description && (
                        <p className="mt-2 text-sm">{schedule.description}</p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      {schedule.price > 0 ? (
                        <div>
                          <div className="font-medium">
                            {schedule.price.toLocaleString()}원
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {schedule.price_period === 'monthly' ? '월' : 
                             schedule.price_period === 'weekly' ? '주' : '회'} 단위
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">미설정</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SchedulePageView;