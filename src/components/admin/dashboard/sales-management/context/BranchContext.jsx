"use client";

import React, { createContext, useContext, useState } from 'react';

// 지점 정보 컨텍스트 생성
const BranchContext = createContext();

/**
 * 지점 정보 제공자 컴포넌트
 * 매출 관리 페이지 전체에서 선택된 지점 정보를 공유합니다.
 */
export const BranchProvider = ({ children }) => {
  const [selectedBranch, setSelectedBranch] = useState('all'); // 기본값: 전체 지점

  // 지점 목록
  const branches = [
    { id: 'all', name: '전체 지점' },
    { id: 'daechi', name: '대치점' },
    { id: 'bukwirye', name: '북위례점' },
    { id: 'namwirye', name: '남위례점' }
  ];

  return (
    <BranchContext.Provider value={{ selectedBranch, setSelectedBranch, branches }}>
      {children}
    </BranchContext.Provider>
  );
};

/**
 * 지점 정보 컨텍스트 사용 훅
 * @returns {object} 선택된 지점 정보 및 지점 목록
 */
export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
};