'use client';

import React from 'react';
import { TableHead } from '@/components/ui/table';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * 정렬 가능한 테이블 헤더 컴포넌트
 * @param {string} column - 컬럼 식별자
 * @param {string} label - 표시할 레이블
 * @param {string|null} sortColumn - 현재 정렬 중인 컬럼
 * @param {string|null} sortDirection - 현재 정렬 방향 ('asc', 'desc', null)
 * @param {Function} onSort - 정렬 이벤트 핸들러
 * @param {Object} props - 추가 props
 * @returns {JSX.Element} 정렬 가능한 테이블 헤더 컴포넌트
 */
const SortableTableHeader = ({ 
  column, 
  label, 
  sortColumn, 
  sortDirection, 
  onSort,
  className,
  ...props 
}) => {
  // 현재 컬럼이 정렬 중인지 확인
  const isActive = sortColumn === column;
  const isSortable = !!column; // column이 제공되면 정렬 가능
  
  // 정렬 아이콘 선택
  const renderSortIcon = () => {
    if (!isSortable) return null;
    
    if (!isActive) {
      return <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />;
    }
    
    if (sortDirection === 'asc') {
      return <ArrowUp className="ml-1 h-4 w-4 text-primary" />;
    }
    
    if (sortDirection === 'desc') {
      return <ArrowDown className="ml-1 h-4 w-4 text-primary" />;
    }
    
    return <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />;
  };

  // 정렬 방향에 따른 설명 텍스트
  const getSortDescription = () => {
    if (!isSortable) return '';
    
    if (!isActive) {
      return `${label} 기준으로 정렬하려면 클릭하세요`;
    }
    
    if (sortDirection === 'asc') {
      return `${label} 기준으로 오름차순 정렬됨. 내림차순으로 변경하려면 클릭하세요`;
    }
    
    if (sortDirection === 'desc') {
      return `${label} 기준으로 내림차순 정렬됨. 정렬을 해제하려면 클릭하세요`;
    }
    
    return `${label} 기준으로 정렬하려면 클릭하세요`;
  };
  
  // 키보드 이벤트 처리
  const handleKeyDown = (e) => {
    if (!isSortable) return;
    
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSort(column);
    }
  };
  
  return (
    <TableHead 
      className={cn(
        isSortable && "cursor-pointer select-none",
        isActive && "text-primary font-medium",
        className
      )}
      onClick={isSortable ? () => onSort(column) : undefined}
      onKeyDown={isSortable ? handleKeyDown : undefined}
      tabIndex={isSortable ? 0 : undefined}
      role={isSortable ? "button" : undefined}
      aria-sort={
        !isSortable || !isActive ? "none" : 
        sortDirection === 'asc' ? "ascending" : 
        sortDirection === 'desc' ? "descending" : "none"
      }
      aria-label={isSortable ? getSortDescription() : undefined}
      {...props}
    >
      <div className="flex items-center">
        {label}
        {renderSortIcon()}
      </div>
    </TableHead>
  );
};

export default SortableTableHeader;