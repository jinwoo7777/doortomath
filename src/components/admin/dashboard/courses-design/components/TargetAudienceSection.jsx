// components/TargetAudienceSection.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { ListEditor } from './ListEditor';

export const TargetAudienceSection = ({ formData, addListItem, removeListItem }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          수업 대상 및 특징
        </CardTitle>
        <p className="text-sm text-muted-foreground">학원 수업의 대상과 특징을 소개하세요</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <ListEditor
          title="수업 대상"
          items={formData.target_audience}
          onAdd={(value) => addListItem('target_audience', value)}
          onRemove={(index) => removeListItem('target_audience', index)}
          placeholder="예: 중학교 3학년~고등학교 2학년, 수학 기초 실력 향상이 필요한 학생"
        />

        <ListEditor
          title="수업 목표"
          items={formData.learning_objectives}
          onAdd={(value) => addListItem('learning_objectives', value)}
          onRemove={(index) => removeListItem('learning_objectives', index)}
          placeholder="예: 내신 1등급 달성, 수능 수학 90점 이상, 수학적 사고력 향상"
        />

        <ListEditor
          title="수업 방식"
          items={formData.assessment_methods}
          onAdd={(value) => addListItem('assessment_methods', value)}
          onRemove={(index) => removeListItem('assessment_methods', index)}
          placeholder="예: 개별 맞춤 진도, 주 2회 테스트, 오답노트 작성, 1:1 질의응답"
        />
      </CardContent>
    </Card>
  );
};
