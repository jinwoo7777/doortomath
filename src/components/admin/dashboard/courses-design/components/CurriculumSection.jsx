// components/CurriculumSection.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListEditor } from './ListEditor';

export const CurriculumSection = ({ curriculum, addListItem, removeListItem }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>커리큘럼</CardTitle>
        <p className="text-sm text-muted-foreground">주차별 수업 내용을 작성하세요. 각 항목은 디테일 페이지에서 아코디언으로 표시됩니다.</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <ListEditor
          title="주차별 커리큘럼"
          items={curriculum}
          onAdd={(value) => addListItem('curriculum', value)}
          onRemove={(index) => removeListItem('curriculum', index)}
          placeholder="예: 1주차: 기본 개념 정립 및 기초 문제 풀이"
        />
      </CardContent>
    </Card>
  );
};
