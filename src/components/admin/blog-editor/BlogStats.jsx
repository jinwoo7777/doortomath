"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

/**
 * 블로그 통계 카드 컴포넌트
 * 포스트 수, 상태별 통계 등을 표시
 */
export default function BlogStats({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">총 포스트</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">전체 블로그 포스트</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">발행됨</CardTitle>
          <Badge variant="default" className="h-4 w-4 p-0 text-xs">P</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.published}</div>
          <p className="text-xs text-muted-foreground">현재 발행 중</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">초안</CardTitle>
          <Badge variant="secondary" className="h-4 w-4 p-0 text-xs">D</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.draft}</div>
          <p className="text-xs text-muted-foreground">작성 중인 포스트</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">메인페이지 표시</CardTitle>
          <Badge variant="outline" className="h-4 w-4 p-0 text-xs">★</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.featured || 0}</div>
          <p className="text-xs text-muted-foreground">최대 3개까지</p>
        </CardContent>
      </Card>
    </div>
  );
}