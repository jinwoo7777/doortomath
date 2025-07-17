"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp } from 'lucide-react';

const RealTimeStatus = ({ dashboardData }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          실시간 현황
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">오늘 출석률</span>
            <div className="flex items-center gap-2">
              <Progress value={dashboardData.attendanceRate} className="w-20" />
              <span className="text-sm font-medium">{dashboardData.attendanceRate}%</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">이번주 신규 등록</span>
            <span className="text-sm font-medium text-green-600">{dashboardData.recentStudents.length}명</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">수업료 수금률</span>
            <div className="flex items-center gap-2">
              <Progress value={dashboardData.paymentRate} className="w-20" />
              <span className="text-sm font-medium">{dashboardData.paymentRate}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">활성 수업 수</span>
            <span className="text-sm font-medium text-blue-600">{dashboardData.totalClasses}개</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealTimeStatus;