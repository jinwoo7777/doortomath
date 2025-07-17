// src/components/admin/dashboard/instructor-management/components/TeacherForm.jsx
import React from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TeacherForm = ({
  isOpen,
  onClose,
  currentTeacher,
  teacherForm,
  specializationInput,
  handleInputChange,
  addSpecialization,
  removeSpecialization,
  handleSpecializationKeyPress,
  setTeacherForm,
  setSpecializationInput,
  onSave
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {currentTeacher ? '강사 정보 수정' : '새 강사 추가'}
          </DialogTitle>
          <DialogDescription>
            강사의 기본 정보와 전문 분야를 입력해주세요.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* 기본 정보 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              이름 *
            </Label>
            <Input
              id="name"
              name="name"
              value={teacherForm.name}
              onChange={handleInputChange}
              className="col-span-3"
              placeholder="강사 이름"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              이메일
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={teacherForm.email}
              onChange={handleInputChange}
              className="col-span-3"
              placeholder="example@email.com"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              연락처
            </Label>
            <Input
              id="phone"
              name="phone"
              value={teacherForm.phone}
              onChange={handleInputChange}
              className="col-span-3"
              placeholder="010-1234-5678"
            />
          </div>

          {/* 전문 분야 */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">전문 분야</Label>
            <div className="col-span-3 space-y-2">
              <div className="flex gap-2">
                <Input
                  value={specializationInput}
                  onChange={(e) => setSpecializationInput(e.target.value)}
                  onKeyPress={handleSpecializationKeyPress}
                  placeholder="예: 수학, 물리"
                  className="flex-1"
                />
                <Button type="button" onClick={addSpecialization} variant="outline">
                  추가
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(teacherForm.specialization) ? teacherForm.specialization : []).map((spec, index) => (
                  <Badge key={`spec-${spec}-${index}`} variant="secondary" className="flex items-center gap-1 pr-1 text-white">
                    <span>{spec}</span>
                    <button
                      type="button"
                      className="ml-1 p-0 bg-transparent border-none cursor-pointer hover:text-red-500 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeSpecialization(spec);
                      }}
                      aria-label={`${spec} 전문분야 삭제`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* 경력 및 기타 정보 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="experience_years" className="text-right">
              경력 (년)
            </Label>
            <Input
              id="experience_years"
              name="experience_years"
              type="number"
              value={teacherForm.experience_years}
              onChange={handleInputChange}
              className="col-span-3"
              placeholder="0"
              min="0"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="hire_date" className="text-right">
              입사일
            </Label>
            <Input
              id="hire_date"
              name="hire_date"
              type="date"
              value={teacherForm.hire_date}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>

          {/* 지점 선택 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="branch" className="text-right">
              지점 *
            </Label>
            <Select 
              value={teacherForm.branch} 
              onValueChange={(value) => setTeacherForm({ ...teacherForm, branch: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="지점을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daechi">대치</SelectItem>
                <SelectItem value="bukwirye">북위례</SelectItem>
                <SelectItem value="namwirye">남위례</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="education" className="text-right pt-2">
              학력
            </Label>
            <Textarea
              id="education"
              name="education"
              value={teacherForm.education}
              onChange={handleInputChange}
              className="col-span-3"
              placeholder="예: OO대학교 수학과 졸업"
              rows="2"
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="bio" className="text-right pt-2">
              소개
            </Label>
            <Textarea
              id="bio"
              name="bio"
              value={teacherForm.bio}
              onChange={handleInputChange}
              className="col-span-3"
              placeholder="강사 소개"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="profile_image_url" className="text-right">
              프로필 이미지
            </Label>
            <Input
              id="profile_image_url"
              name="profile_image_url"
              value={teacherForm.profile_image_url}
              onChange={handleInputChange}
              className="col-span-3"
              placeholder="이미지 URL"
            />
          </div>

          {/* 활성 상태 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="is_active" className="text-right">
              활성 상태
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={teacherForm.is_active}
                onCheckedChange={(checked) => 
                  setTeacherForm({ ...teacherForm, is_active: checked })
                }
              />
              <Label htmlFor="is_active" className="text-sm">
                {teacherForm.is_active ? '활성' : '비활성'}
              </Label>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={onSave}>
            {currentTeacher ? '수정' : '추가'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherForm;
