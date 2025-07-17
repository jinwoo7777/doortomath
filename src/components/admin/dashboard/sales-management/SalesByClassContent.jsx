"use client";

import React from 'react';
import SalesByClassView from './views/by-class/SalesByClassView';

/**
 * 수업별 매출 분석 컴포넌트 (레거시 파일)
 * 새 구조의 SalesByClassView로 리다이렉트합니다.
 * @returns {React.ReactElement} 수업별 매출 분석 컴포넌트
 */
const SalesByClassContent = () => {
  return <SalesByClassView />;
};

export default SalesByClassContent;