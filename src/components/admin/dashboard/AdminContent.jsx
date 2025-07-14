"use client";

import React from 'react';

/**
 * 관리자 대시보드 컨텐츠 영역 컴포넌트
 * AdminDashboardLayout에서 분리된 컨텐츠 영역을 렌더링합니다.
 */
const AdminContent = ({ children }) => {
  return (
    <main className="flex-1 overflow-y-auto bg-muted/40 p-4 md:p-6">
      {children}
    </main>
  );
};

export default AdminContent;
