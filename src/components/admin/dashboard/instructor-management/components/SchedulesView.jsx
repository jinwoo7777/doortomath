// src/components/admin/dashboard/instructor-management/components/SchedulesView.jsx
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, BookOpen, User, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import TeacherSchedules from './TeacherSchedules';
import UnassignedSchedules from './UnassignedSchedules';
import { getBranchName } from '../utils/formatUtils';

const SchedulesView = ({ 
  teacher, 
  teachers, 
  schedules, 
  selectedBranch,
  getTeacherSchedules,
  onSelectTeacher,
  onUnassignSchedule,
  onAssignSchedule,
  onClearTeacher
}) => {
  // 지점별 미배정 수업 필터링
  const branchSchedules = selectedBranch === 'all' 
    ? schedules.filter(s => s.is_active)
    : schedules.filter(s => s.is_active && s.branch === selectedBranch);
  
  const unassignedSchedules = branchSchedules.filter(s => 
    !s.teacher_name || s.teacher_name.trim() === ''
  );

  if (!teacher) {
    // 강사가 선택되지 않았을 때: 전체 배정 현황과 강사 선택 뷰
    return (
      <div className="space-y-6">
        {/* 전체 배정 현황 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 수업</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{branchSchedules.length}</div>
              <p className="text-xs text-muted-foreground">활성 수업</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">배정된 수업</CardTitle>
              <User className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {branchSchedules.filter(s => s.teacher_name).length}
              </div>
              <p className="text-xs text-muted-foreground">강사 배정 완료</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">미배정 수업</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{unassignedSchedules.length}</div>
              <p className="text-xs text-muted-foreground">배정 필요</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 강사 선택 카드 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                강사 선택
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                강사를 선택하여 담당 수업과 배정 가능한 수업을 확인하세요.
              </p>
            </CardHeader>
            <CardContent>
              {teachers.filter(t => t.is_active).length === 0 ? (
                <div className="text-center py-8">
                  <GraduationCap className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">활성 강사가 없습니다.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {teachers.filter(t => t.is_active && (selectedBranch === 'all' || t.branch === selectedBranch)).map((teacher) => {
                    const teacherSchedules = getTeacherSchedules(teacher.name, teacher.branch);
                    return (
                      <div 
                        key={teacher.id}
                        className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => onSelectTeacher(teacher)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">
                                {teacher.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{teacher.name}</p>
                              <p className="text-xs text-muted-foreground">
                                경력 {teacher.experience_years}년
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{teacherSchedules.length}개</p>
                            <p className="text-xs text-muted-foreground">담당 수업</p>
                          </div>
                        </div>
                        {teacher.specialization && teacher.specialization.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {teacher.specialization.slice(0, 3).map((spec, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                            {teacher.specialization.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{teacher.specialization.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 미배정 수업 목록 */}
          <UnassignedSchedules 
            schedules={unassignedSchedules} 
            teacher={null}
            onAssign={null}
          />
        </div>
      </div>
    );
  }

  // 강사가 선택되었을 때
  const teacherSchedules = getTeacherSchedules(teacher.name, teacher.branch);
  
  // 선택된 강사와 같은 지점의 미배정 수업만 필터링
  const sameBranchUnassignedSchedules = unassignedSchedules.filter(s => 
    s.branch === teacher.branch
  );

  return (
    <div className="space-y-6">
      {/* 선택된 강사 정보 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-lg">
                  {teacher.name.charAt(0)}
                </span>
              </div>
              <div>
                <CardTitle>{teacher.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  경력 {teacher.experience_years}년 | 담당 수업 {teacherSchedules.length}개 | {getBranchName(teacher.branch)}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={onClearTeacher}
            >
              전체 현황 보기
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 담당 수업 */}
        <TeacherSchedules 
          teacher={teacher} 
          schedules={teacherSchedules} 
          onUnassign={onUnassignSchedule} 
        />

        {/* 미배정 수업 */}
        <UnassignedSchedules 
          schedules={sameBranchUnassignedSchedules} 
          teacher={teacher}
          onAssign={onAssignSchedule}
        />
      </div>
    </div>
  );
};

export default SchedulesView;
