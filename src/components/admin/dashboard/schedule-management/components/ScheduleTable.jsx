// src/components/admin/dashboard/schedule-management/components/ScheduleTable.jsx
import React from 'react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, X, Eye, EyeOff, Clock, Users, GraduationCap, MapPin, Plus } from 'lucide-react';
import { getDayName } from '../hooks/useScheduleManagement';

const ScheduleTable = ({ 
  schedules, 
  grade, 
  onEdit, 
  onDelete, 
  onToggleActive, 
  onAdd 
}) => {
  if (schedules.length === 0) {
    return (
      <div className="text-center py-8">
        <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-medium">등록된 시간표가 없습니다</p>
        <p className="text-muted-foreground mb-4">{grade} 시간표를 추가해보세요.</p>
        <Button onClick={() => onAdd(grade)}>
          <Plus className="h-4 w-4 mr-2" />
          시간표 추가
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>요일</TableHead>
          <TableHead>시간</TableHead>
          <TableHead>과목</TableHead>
          <TableHead>강사</TableHead>
          <TableHead>강의실</TableHead>
          <TableHead>수강인원</TableHead>
          <TableHead>수업료</TableHead>
          <TableHead>상태</TableHead>
          <TableHead>관리</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {schedules.map((schedule) => (
          <TableRow 
            key={schedule.id}
            className={!schedule.is_active ? 'opacity-60' : ''}
          >
            <TableCell className="font-medium">
              {getDayName(schedule.day_of_week)}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                {schedule.time_slot}
              </div>
            </TableCell>
            <TableCell>
              <div>
                <p className="font-medium">{schedule.subject}</p>
                {schedule.description && (
                  <p className="text-xs text-muted-foreground">{schedule.description}</p>
                )}
              </div>
            </TableCell>
            <TableCell>
              {schedule.teacher_name && (
                <div className="flex items-center gap-1">
                  <GraduationCap className="h-3 w-3 text-muted-foreground" />
                  {schedule.teacher_name}
                </div>
              )}
            </TableCell>
            <TableCell>
              {schedule.classroom && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  {schedule.classroom}
                </div>
              )}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className={
                  (schedule.current_students || 0) >= (schedule.max_students || 30) 
                    ? 'text-red-600 font-medium' : ''
                }>
                  {schedule.current_students || 0}/{schedule.max_students || 30}
                </span>
              </div>
            </TableCell>
            <TableCell>
              {schedule.price > 0 ? (
                <div className="text-sm">
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
            </TableCell>
            <TableCell>
              <Badge variant={schedule.is_active ? "default" : "secondary"}>
                {schedule.is_active ? "활성" : "비활성"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onToggleActive(schedule)}
                  title={schedule.is_active ? "비활성화" : "활성화"}
                >
                  {schedule.is_active ? (
                    <Eye className="h-3 w-3" />
                  ) : (
                    <EyeOff className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit(schedule)}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <button
                  type="button"
                  className="ml-1 p-0 bg-transparent border-none cursor-pointer hover:text-red-500 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(schedule);
                  }}
                  aria-label="시간표 삭제"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ScheduleTable;
