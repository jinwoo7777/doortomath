"use client";

import React from 'react';
import SalesByInstructorView from './views/by-instructor/SalesByInstructorView';

/**
 * 강사별 매출 분석 컴포넌트 (레거시 파일)
 * 새 구조의 SalesByInstructorView로 리다이렉트합니다.
 * @returns {React.ReactElement} 강사별 매출 분석 컴포넌트
 */
const SalesByInstructorContent = () => {
  return <SalesByInstructorView />;
};

export default SalesByInstructorContent;