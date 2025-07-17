// components/InstructorSection.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User } from 'lucide-react';
import { ListEditor } from './ListEditor';

export const InstructorSection = ({ formData, handleChange, addListItem, removeListItem }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          강사진 소개
        </CardTitle>
        <p className="text-sm text-muted-foreground">학원 강사진의 경력과 전문성을 소개하세요</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="instructor_bio">강사 소개</Label>
          <Textarea
            id="instructor_bio"
            value={formData.instructor_bio}
            onChange={(e) => handleChange('instructor_bio', e.target.value)}
            placeholder="예: 서울대학교 수학교육과 출신으로 15년간 대치동에서 수학을 가르쳐온 전문 강사입니다..."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instructor_experience">교육 경력</Label>
          <Textarea
            id="instructor_experience"
            value={formData.instructor_experience}
            onChange={(e) => handleChange('instructor_experience', e.target.value)}
            placeholder="예: 대치동 수학학원 15년 근무, 수능 1등급 배출 500명 이상, 서울대/연세대/고려대 합격자 다수 배출..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instructor_education">학력 및 자격</Label>
          <Textarea
            id="instructor_education"
            value={formData.instructor_education}
            onChange={(e) => handleChange('instructor_education', e.target.value)}
            placeholder="예: 서울대학교 수학교육과 졸업, 중등학교 정교사 자격증, 수학 교육학 석사..."
            rows={2}
          />
        </div>

        <ListEditor
          title="교육 전문 분야"
          items={formData.instructor_specialization}
          onAdd={(value) => addListItem('instructor_specialization', value)}
          onRemove={(index) => removeListItem('instructor_specialization', index)}
          placeholder="예: 수능 수학, 내신 수학, 심화 수학, 수학 올림피아드"
        />
      </CardContent>
    </Card>
  );
};
