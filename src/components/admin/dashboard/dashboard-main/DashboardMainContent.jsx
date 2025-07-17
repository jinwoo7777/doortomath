"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

// Import components
import DashboardHeader from './components/DashboardHeader';
import StatsCards from './components/StatsCards';
import QuickActions from './components/QuickActions';
import RealTimeStatus from './components/RealTimeStatus';
import DetailedTabs from './components/DetailedTabs';

// Import utilities
import { fetchDashboardData } from './utils/dashboardUtils';

const DashboardMainContent = () => {
  const { userRole } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    monthlyRevenue: 0,
    totalClasses: 0,
    pendingInquiries: 0,
    recentStudents: [],
    topClasses: [],
    recentInquiries: [],
    monthlyTrend: 0,
    attendanceRate: 0,
    paymentRate: 0,
    averageTuition: 0
  });

  useEffect(() => {
    if (userRole === 'admin') {
      loadDashboardData();
    }
  }, [userRole]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await fetchDashboardData();
      console.log('대시보드 데이터 로드 완료:', data);
      console.log('평균 수업료:', data.averageTuition);
      setDashboardData(data);
    } catch (error) {
      console.error('대시보드 데이터 로딩 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToPage = (path) => {
    router.push(path);
  };

  if (userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-center text-gray-500">관리자 권한이 필요합니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <DashboardHeader />

      {/* 주요 지표 카드 */}
      <StatsCards dashboardData={dashboardData} navigateToPage={navigateToPage} />

      {/* 빠른 액션 & 실시간 현황 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions dashboardData={dashboardData} navigateToPage={navigateToPage} />
        <RealTimeStatus dashboardData={dashboardData} />
      </div>

      {/* 상세 정보 탭 */}
      <DetailedTabs dashboardData={dashboardData} navigateToPage={navigateToPage} />
    </div>
  );
};

export default DashboardMainContent;