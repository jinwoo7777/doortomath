'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from 'lucide-react';
import { getDayName } from '../utils/formatters';

/**
 * 새 강의 추가 폼 컴포넌트
 */
const CourseAddForm = ({
  selectedBranch,
  handleBranchChange,
  selectedSchedule,
  setSelectedSchedule,
  enrollmentNotes,
  setEnrollmentNotes,
  filteredAvailableSchedules,
  handleAddCourse,
  loading,
  onCancel
}) => {
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">새 강의 추가</h4>
        <button
          type="button"
          className="ml-1 p-0 bg-transparent border-none cursor-pointer hover:text-red-500 transition-colors"
          onClick={onCancel}
          aria-label="강의 추가 폼 닫기"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="branch">지점 선택</Label>
          <Select value={selectedBranch} onValueChange={handleBranchChange}>
            <SelectTrigger>
              <SelectValue placeholder="지점을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daechi">대치</SelectItem>
              <SelectItem value="bukwirye">북위례</SelectItem>
              <SelectItem value="namwirye">남위례</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="schedule">강의 선택</Label>
          <Select 
            value={selectedSchedule} 
            onValueChange={setSelectedSchedule}
            disabled={!selectedBranch}
          >
            <SelectTrigger>
              <SelectValue placeholder={selectedBranch ? "강의를 선택하세요" : "먼저 지점을 선택하세요"} />
            </SelectTrigger>
            <SelectContent>
              {filteredAvailableSchedules.map((schedule) => (
                <SelectItem key={schedule.id} value={schedule.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>
                      {schedule.subject} ({schedule.grade}) - {getDayName(schedule.day_of_week)} {schedule.time_slot}
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {schedule.teacher_name || '미정'}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="notes">수강 메모</Label>
          <Input
            id="notes"
            value={enrollmentNotes}
            onChange={(e) => setEnrollmentNotes(e.target.value)}
            placeholder="수강 관련 메모 (선택사항)"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
        >
          취소
        </Button>
        <Button
          onClick={handleAddCourse}
          disabled={!selectedSchedule || loading}
        >
          추가
        </Button>
      </div>
    </div>
  );
};

export default CourseAddForm;