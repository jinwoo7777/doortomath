"use client";

import React from 'react';
import { Clock } from 'lucide-react';

const DashboardHeader = () => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">관리자 대시보드</h1>
        <p className="text-gray-600 mt-2">수학의문 학원 통합 관리 시스템</p>
      </div>
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <Clock className="h-4 w-4" />
        <span>마지막 업데이트: {new Date().toLocaleString('ko-KR')}</span>
      </div>
    </div>
  );
};

export default DashboardHeader;