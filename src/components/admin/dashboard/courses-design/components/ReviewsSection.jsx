// components/ReviewsSection.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListEditor } from './ListEditor';

export const ReviewsSection = ({ reviews, addListItem, removeListItem }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>학원 성과 및 후기</CardTitle>
        <p className="text-sm text-muted-foreground">학원생들의 성과와 후기를 관리하세요</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <ListEditor
          title="학원생 후기"
          items={reviews}
          onAdd={(value) => addListItem('reviews', value)}
          onRemove={(index) => removeListItem('reviews', index)}
          placeholder="예: 내신 1등급 달성했습니다! 개별관리 덕분에 약점을 극복했어요 - 김○○ 학생"
        />
      </CardContent>
    </Card>
  );
};
