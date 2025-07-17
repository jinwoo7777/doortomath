"use client";

import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

/**
 * 지표를 표시하는 카드 컴포넌트
 * @param {object} props - 컴포넌트 속성
 * @param {string} props.title - 카드 제목
 * @param {React.ReactNode} props.value - 표시할 값
 * @param {string} props.description - 추가 설명
 * @param {React.ReactNode} props.icon - 표시할 아이콘
 * @returns {React.ReactElement} 지표 카드 컴포넌트
 */
const MetricCard = ({ title, value, description, icon }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;