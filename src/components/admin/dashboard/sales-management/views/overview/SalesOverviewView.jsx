"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DollarSign,
  TrendingUp,
  Users,
  BookOpen
} from 'lucide-react';

import { useSalesData } from '../../hooks/useSalesData';
import { formatCurrency } from '../../utils/formatters';
import MetricCard from '../../components/cards/MetricCard';
import SalesTrendChart from '../../components/charts/SalesTrendChart';
import { useBranch } from '../../context/BranchContext';

/**
 * 매출 개요 컴포넌트
 * @returns {React.ReactElement} 매출 개요 컴포넌트
 */
const SalesOverviewView = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const { selectedBranch } = useBranch();
  const { salesData, loading } = useSalesData(selectedPeriod, selectedBranch);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">매출 현황</h2>
          <p className="text-gray-600">학원 매출 현황 및 분석을 확인할 수 있습니다.</p>
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="기간 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current_month">이번 달</SelectItem>
            <SelectItem value="last_month">지난 달</SelectItem>
            <SelectItem value="current_year">올해</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 매출 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="총 매출 (예상)"
          value={formatCurrency(salesData.totalRevenue)}
          description="월별 수업료 합계"
          icon={<DollarSign className="h-4 w-4" />}
        />
        
        <MetricCard
          title="실제 수금"
          value={formatCurrency(salesData.monthlyRevenue)}
          description="이번 달 결제 완료"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        
        <MetricCard
          title="총 수강생"
          value={`${salesData.totalStudents}명`}
          description="활성 상태 수강생"
          icon={<Users className="h-4 w-4" />}
        />
        
        <MetricCard
          title="개설 수업"
          value={`${salesData.activeClasses}개`}
          description="수강생이 있는 수업"
          icon={<BookOpen className="h-4 w-4" />}
        />
      </div>

      {/* 추가 차트 및 데이터 시각화 컴포넌트는 여기에 구현 */}
      <Card>
        <CardHeader>
          <CardTitle>매출 추이</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesTrendChart data={salesData.monthlyTrend} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesOverviewView;