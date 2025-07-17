// components/CourseBenefitsSection.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ListEditor } from './ListEditor';

export const CourseBenefitsSection = ({ formData, handleChange, addListItem, removeListItem }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>학원 제공 혜택</CardTitle>
        <p className="text-sm text-muted-foreground">학원에서 제공하는 교육 자료와 시설을 소개하세요</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <ListEditor
          title="제공되는 교육 자료"
          items={formData.materials_provided}
          onAdd={(value) => addListItem('materials_provided', value)}
          onRemove={(index) => removeListItem('materials_provided', index)}
          placeholder="예: 자체 제작 교재, 기출문제집, 학원 학습 시스템, 개별 맞춤 문제집"
        />

        <ListEditor
          title="학원 시설 및 환경"
          items={formData.software_required}
          onAdd={(value) => addListItem('software_required', value)}
          onRemove={(index) => removeListItem('software_required', index)}
          placeholder="예: 최신 스마트 보드, 개별 학습 공간, 자습실, 1:1 상담실"
        />

        <div className="space-y-2">
          <Label htmlFor="course_outline">수업 운영 방침</Label>
          <Textarea
            id="course_outline"
            value={formData.course_outline}
            onChange={(e) => handleChange('course_outline', e.target.value)}
            placeholder="예: 소수 정예 수업, 개별 맞춤 진도, 정기 학부모 상담, 성적 향상 보장 시스템..."
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
};
