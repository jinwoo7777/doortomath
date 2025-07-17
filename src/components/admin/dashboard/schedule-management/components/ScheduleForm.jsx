// src/components/admin/dashboard/schedule-management/components/ScheduleForm.jsx
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ScheduleForm = ({ 
  isOpen, 
  onClose, 
  currentSchedule, 
  scheduleForm, 
  teachers,
  onInputChange, 
  onSelectChange,
  onSubmit 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {currentSchedule ? '시간표 수정' : '새 시간표 추가'}
          </DialogTitle>
          <DialogDescription>
            수업시간표 정보를 입력하세요.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="grade" className="text-right">
              학년 *
            </Label>
            <Select 
              value={scheduleForm.grade} 
              onValueChange={(value) => onSelectChange('grade', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="초등부">초등부</SelectItem>
                <SelectItem value="중등부">중등부</SelectItem>
                <SelectItem value="고등부">고등부</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="day_of_week" className="text-right">
              요일 *
            </Label>
            <Select 
              value={scheduleForm.day_of_week.toString()} 
              onValueChange={(value) => onSelectChange('day_of_week', parseInt(value))}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">월요일</SelectItem>
                <SelectItem value="2">화요일</SelectItem>
                <SelectItem value="3">수요일</SelectItem>
                <SelectItem value="4">목요일</SelectItem>
                <SelectItem value="5">금요일</SelectItem>
                <SelectItem value="6">토요일</SelectItem>
                <SelectItem value="7">일요일</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time_slot" className="text-right">
              시간 *
            </Label>
            <Input
              id="time_slot"
              name="time_slot"
              value={scheduleForm.time_slot}
              onChange={onInputChange}
              className="col-span-3"
              placeholder="예: 09:00-10:00"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subject" className="text-right">
              과목 *
            </Label>
            <Input
              id="subject"
              name="subject"
              value={scheduleForm.subject}
              onChange={onInputChange}
              className="col-span-3"
              placeholder="예: 중1수학"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="teacher_name" className="text-right">
              강사
            </Label>
            <Select 
              value={scheduleForm.teacher_name} 
              onValueChange={(value) => onSelectChange('teacher_name', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="강사를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">미배정</SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.name}>
                    <div className="flex items-center gap-2">
                      <span>{teacher.name}</span>
                      {teacher.specialization && teacher.specialization.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ({teacher.specialization.slice(0, 2).join(', ')})
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="classroom" className="text-right">
              강의실
            </Label>
            <Input
              id="classroom"
              name="classroom"
              value={scheduleForm.classroom}
              onChange={onInputChange}
              className="col-span-3"
              placeholder="예: A101"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="max_students" className="text-right">
              최대 인원
            </Label>
            <Input
              id="max_students"
              name="max_students"
              type="number"
              value={scheduleForm.max_students}
              onChange={onInputChange}
              className="col-span-1"
              min="1"
            />
            <Label htmlFor="current_students" className="text-right">
              현재 인원
            </Label>
            <Input
              id="current_students"
              name="current_students"
              type="number"
              value={scheduleForm.current_students}
              onChange={onInputChange}
              className="col-span-1"
              min="0"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              수업료
            </Label>
            <Input
              id="price"
              name="price"
              type="number"
              value={scheduleForm.price}
              onChange={onInputChange}
              className="col-span-1"
              min="0"
              step="1000"
              placeholder="0"
            />
            <Label htmlFor="price_period" className="text-right">
              결제 주기
            </Label>
            <Select
              value={scheduleForm.price_period}
              onValueChange={(value) => onSelectChange('price_period', value)}
            >
              <SelectTrigger className="col-span-1">
                <SelectValue placeholder="주기 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">월 단위</SelectItem>
                <SelectItem value="weekly">주 단위</SelectItem>
                <SelectItem value="per_class">회당</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">
              설명
            </Label>
            <Textarea
              id="description"
              name="description"
              value={scheduleForm.description}
              onChange={onInputChange}
              className="col-span-3"
              placeholder="수업에 대한 추가 설명"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="is_active" className="text-right">
              활성화
            </Label>
            <div className="col-span-3">
              <Switch
                id="is_active"
                name="is_active"
                checked={scheduleForm.is_active}
                onCheckedChange={(checked) => {
                  const event = {
                    target: {
                      name: 'is_active',
                      type: 'checkbox',
                      checked
                    }
                  };
                  onInputChange(event);
                }}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={onSubmit}>
            {currentSchedule ? '수정' : '추가'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleForm;
