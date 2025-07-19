'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, FileText, Award, TrendingUp } from 'lucide-react';

/**
 * 시험 성적 통계 카드 컴포넌트
 */
const ExamScoreStats = ({ 
  getAverageScore, 
  filteredScores, 
  filteredSessions, 
  getRecentTrend,
  mounted
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">평균 점수</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getAverageScore()}점</div>
          <p className="text-xs text-muted-foreground">전체 시험 평균</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">응시 횟수</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{filteredScores.length + filteredSessions.length}</div>
          <p className="text-xs text-muted-foreground">총 응시 횟수</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">최고 점수</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {mounted && (filteredScores.length > 0 || filteredSessions.length > 0) ? 
              Math.max(
                ...filteredScores.map(s => s.score || 0),
                ...filteredSessions.map(s => s.total_score || 0),
                0
              ) : 0}점
          </div>
          <p className="text-xs text-muted-foreground">최고 기록</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">학습 성실도</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {mounted ? (() => {
            const trend = getRecentTrend();
            if (!trend) return <div className="text-sm text-gray-500">데이터 부족</div>;
            return (
              <div className="text-2xl font-bold">
                {trend.diff > 0 ? '+' : ''}{trend.diff}점
                <p className="text-xs text-muted-foreground">이전 시험 대비</p>
              </div>
            );
          })() : <div className="text-sm text-gray-500">로딩 중...</div>}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamScoreStats;