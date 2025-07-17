'use client';

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAvailableSchoolGrades } from '../utils/formatters';

/**
 * 학생 정보 입력/수정 폼 컴포넌트
 */
const StudentForm = ({ 
  isOpen, 
  onClose, 
  studentForm, 
  handleInputChange, 
  handleSelectChange, 
  handleSaveStudent, 
  currentStudent,
  session
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{currentStudent ? '학원생 정보 수정' : '새 학원생 추가'}</DialogTitle>
          <DialogDescription>
            {currentStudent 
              ? '학원생의 정보를 수정하세요.' 
              : '새로운 학원생의 정보를 입력하세요.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">이름 *</Label>
              <Input
                id="full_name"
                name="full_name"
                value={studentForm.full_name}
                onChange={handleInputChange}
                placeholder="학생 이름"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">이메일 *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={studentForm.email}
                onChange={handleInputChange}
                placeholder="이메일 주소"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">학생 연락처</Label>
              <Input
                id="phone"
                name="phone"
                value={studentForm.phone}
                onChange={handleInputChange}
                placeholder="학생 전화번호"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parent_phone">학부모 연락처</Label>
              <Input
                id="parent_phone"
                name="parent_phone"
                value={studentForm.parent_phone}
                onChange={handleInputChange}
                placeholder="학부모 전화번호"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birth_date">생년월일</Label>
              <Input
                id="birth_date"
                name="birth_date"
                type="date"
                value={studentForm.birth_date}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school">학교</Label>
              <Input
                id="school"
                name="school"
                value={studentForm.school}
                onChange={handleInputChange}
                placeholder="학교 이름"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="branch">지점</Label>
              <Select 
                value={studentForm.branch} 
                onValueChange={(value) => handleSelectChange('branch', value)}
              >
                <SelectTrigger id="branch">
                  <SelectValue placeholder="지점 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daechi">대치</SelectItem>
                  <SelectItem value="bukwirye">북위례</SelectItem>
                  <SelectItem value="namwirye">남위례</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">학년 구분</Label>
              <Select 
                value={studentForm.grade} 
                onValueChange={(value) => handleSelectChange('grade', value)}
              >
                <SelectTrigger id="grade">
                  <SelectValue placeholder="학년 구분 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="초등부">초등부</SelectItem>
                  <SelectItem value="중등부">중등부</SelectItem>
                  <SelectItem value="고등부">고등부</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="school_grade">세부 학년</Label>
              <Select 
                value={studentForm.school_grade} 
                onValueChange={(value) => handleSelectChange('school_grade', value)}
                disabled={!studentForm.grade}
              >
                <SelectTrigger id="school_grade">
                  <SelectValue placeholder="세부 학년 선택" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableSchoolGrades(studentForm.grade).map(grade => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">메모</Label>
            <Textarea
              id="notes"
              name="notes"
              value={studentForm.notes}
              onChange={handleInputChange}
              placeholder="학생에 대한 메모"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_priority"
                name="is_priority"
                checked={studentForm.is_priority}
                onCheckedChange={(checked) => handleSelectChange('is_priority', checked)}
              />
              <Label htmlFor="is_priority">관심 관리 대상</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">상태</Label>
              <Select 
                value={studentForm.status} 
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">활성</SelectItem>
                  <SelectItem value="inactive">비활성</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={() => handleSaveStudent(session)}>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StudentForm;