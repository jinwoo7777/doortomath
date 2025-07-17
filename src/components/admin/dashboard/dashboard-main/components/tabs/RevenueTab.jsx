"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/dashboardUtils';

const RevenueTab = ({ dashboardData, navigateToPage }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">매출 요약</h3>
        <Button variant="outline" size="sm" onClick={() => navigateToPage('/dashboard2/admin?path=/dashboard2/admin/sales-management')}>
          전체 보기 <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="text-sm text-green-600 font-medium">이번달 매출</div>
          <div className="text-2xl font-bold text-green-700">{formatCurrency(dashboardData.monthlyRevenue)}</div>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-600 font-medium">평균 수업료</div>
          <div className="text-2xl font-bold text-blue-700">
            ₩375,455
          </div>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="text-sm text-purple-600 font-medium">수금률</div>
          <div className="text-2xl font-bold text-purple-700">{dashboardData.paymentRate}%</div>
        </div>
      </div>
    </div>
  );
};

export default RevenueTab;