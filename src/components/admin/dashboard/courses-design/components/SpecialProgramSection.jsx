// components/SpecialProgramSection.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const SpecialProgramSection = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>학원 특별 프로그램</CardTitle>
        <p className="text-sm text-muted-foreground">학원만의 특별한 프로그램과 관리 시스템을 소개하세요</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 향후 확장을 위한 빈 컨텐츠 */}
      </CardContent>
    </Card>
  );
};
