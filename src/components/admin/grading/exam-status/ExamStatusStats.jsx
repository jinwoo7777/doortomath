'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CheckCircle, XCircle, BarChart3 } from 'lucide-react';

/**
 * 시험 응시 현황 통계 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {number} props.totalStudents - 전체 학생 수
 * @param {number} props.completedCount - 완료한 학생 수
 * @param {number} props.notCompletedCount - 완료하지 않은 학생 수
 * @param {number} props.averageScore - 평균 점수
 * @returns {JSX.Element} 시험 응시 현황 통계 컴포넌트
 */
const ExamStatusStats = ({ totalStudents, completedCount, notCompletedCount, averageScore }) => {
  const completionRate = totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">전체 학생</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalStudents}명</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">응시 완료</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedCount}명</div>
          <p className="text-xs text-muted-foreground">
            응시율: {completionRate}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">미응시</CardTitle>
          <XCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{notCompletedCount}명</div>
          <p className="text-xs text-muted-foreground">
            미응시율: {100 - completionRate}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">평균 점수</CardTitle>
          <BarChart3 className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isNaN(averageScore) ? '-' : `${averageScore.toFixed(1)}점`}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamStatusStats;
