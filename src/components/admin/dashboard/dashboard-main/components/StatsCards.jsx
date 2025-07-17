"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, BookOpen, MessageSquare, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/dashboardUtils';

const StatsCards = ({ dashboardData, navigateToPage }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateToPage('/dashboard2/admin/student-management')}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">총 수강생</CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{dashboardData.totalStudents}명</div>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <TrendingUp className="h-3 w-3 mr-1" />
            전월 대비 +{dashboardData.monthlyTrend}%
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateToPage('/dashboard2/admin?path=/dashboard2/admin/sales-management')}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">이번달 매출</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(dashboardData.monthlyRevenue)}</div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center text-xs text-gray-500">
              <div className="flex items-center">
                <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                  <div className="bg-green-600 h-1.5 rounded-full" style={{width: `${dashboardData.paymentRate}%`}}></div>
                </div>
                수금률 {dashboardData.paymentRate}%
              </div>
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <TrendingUp className="h-3 w-3 mr-1" />
              평균 수업료 ₩375,455
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateToPage('/dashboard2/admin?path=/dashboard2/admin/schedule-management')}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">개설 수업</CardTitle>
          <BookOpen className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{dashboardData.totalClasses}개</div>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <CheckCircle className="h-3 w-3 mr-1" />
            평균 출석률 {dashboardData.attendanceRate}%
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateToPage('/dashboard2/admin?path=/dashboard2/admin/inquiry-management')}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">미처리 문의</CardTitle>
          <MessageSquare className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{dashboardData.pendingInquiries}건</div>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <AlertCircle className="h-3 w-3 mr-1" />
            빠른 답변 필요
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;