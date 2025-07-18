"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { BranchProvider } from './context/BranchContext';
import BranchSelector from './components/BranchSelector';

// Views
import SalesOverviewView from './views/overview/SalesOverviewView';
import SalesByClassView from './views/by-class/SalesByClassView';
import SalesByInstructorView from './views/by-instructor/SalesByInstructorView';
import OverduePaymentsView from './views/overdue/OverduePaymentsView';
import PaidPaymentsView from './views/paid/PaidPaymentsView';

/**
 * 매출 관리 메인 컴포넌트
 * 탭 전환 및 전체 레이아웃을 관리합니다.
 * @returns {React.ReactElement} 매출 관리 컴포넌트
 */
const SalesManagementContent = () => {
  const { userRole } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');

  // URL 파라미터 변경 시 activeTab 업데이트
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'overdue', 'paid', 'by-class', 'by-instructor'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  if (userRole !== 'admin') {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <p className="text-center text-gray-500">관리자 권한이 필요합니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <BranchProvider>
      <div className="space-y-6 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">매출 관리</h1>
          <BranchSelector />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">매출 개요</TabsTrigger>
              <TabsTrigger value="overdue">연체 관리</TabsTrigger>
              <TabsTrigger value="paid">입금 관리</TabsTrigger>
              <TabsTrigger value="by-class">수업별 매출</TabsTrigger>
              <TabsTrigger value="by-instructor">강사별 매출</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4">
            <SalesOverviewView />
          </TabsContent>

          <TabsContent value="overdue" className="space-y-4">
            <OverduePaymentsView />
          </TabsContent>

          <TabsContent value="paid" className="space-y-4">
            <PaidPaymentsView />
          </TabsContent>

          <TabsContent value="by-class" className="space-y-4">
            <SalesByClassView />
          </TabsContent>

          <TabsContent value="by-instructor" className="space-y-4">
            <SalesByInstructorView />
          </TabsContent>
        </Tabs>
      </div>
    </BranchProvider>
  );
};

export default SalesManagementContent;