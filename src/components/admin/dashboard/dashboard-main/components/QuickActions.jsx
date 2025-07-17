"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, AlertCircle, Clock, Calendar } from 'lucide-react';

const QuickActions = ({ dashboardData, navigateToPage }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          오늘의 할 일
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm">미처리 문의</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">{dashboardData.pendingInquiries}건</Badge>
              <Button size="sm" variant="outline" onClick={() => navigateToPage('/dashboard2/admin?path=/dashboard2/admin/inquiry-management')}>
                확인
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">연체 학생 관리</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">확인 필요</Badge>
              <Button size="sm" variant="outline" onClick={() => navigateToPage('/dashboard2/admin?path=/dashboard2/admin/sales-management&tab=overdue')}>
                보기
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="text-sm">오늘 수업 일정</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">정상</Badge>
              <Button size="sm" variant="outline" onClick={() => navigateToPage('/dashboard2/admin?path=/dashboard2/admin/schedule-management')}>
                확인
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;