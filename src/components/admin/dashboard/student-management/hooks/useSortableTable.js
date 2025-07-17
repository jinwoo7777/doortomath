'use client';

import { useState, useEffect, useCallback } from 'react';
import { getNestedValue, compareValues } from '../utils/sortUtils';

/**
 * 테이블 정렬 기능을 위한 커스텀 훅
 * @param {string} tableId - 테이블 식별자 (로컬 스토리지 키로 사용)
 * @param {string|null} defaultSortColumn - 기본 정렬 컬럼 (없으면 null)
 * @param {string} defaultSortDirection - 기본 정렬 방향 ('asc' 또는 'desc')
 * @returns {Object} 정렬 관련 상태 및 함수
 */
const useSortableTable = (
  tableId,
  defaultSortColumn = null,
  defaultSortDirection = 'asc'
) => {
  // 로컬 스토리지에서 정렬 상태 불러오기
  const loadSortState = useCallback(() => {
    if (typeof window === 'undefined') return { column: defaultSortColumn, direction: defaultSortDirection };
    
    try {
      const savedState = localStorage.getItem(`table_sort_${tableId}`);
      return savedState ? JSON.parse(savedState) : { column: defaultSortColumn, direction: defaultSortDirection };
    } catch (error) {
      console.error('정렬 상태 로드 오류:', error);
      return { column: defaultSortColumn, direction: defaultSortDirection };
    }
  }, [tableId, defaultSortColumn, defaultSortDirection]);

  // 정렬 상태
  const [sortState, setSortState] = useState(() => loadSortState());
  
  // 정렬 상태 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`table_sort_${tableId}`, JSON.stringify(sortState));
    }
  }, [sortState, tableId]);

  /**
   * 정렬 컬럼 변경 처리 함수
   * @param {string} column - 정렬할 컬럼 이름
   */
  const handleSort = useCallback((column) => {
    setSortState(prevState => {
      // 같은 컬럼을 클릭한 경우 정렬 방향 순환: asc -> desc -> null -> asc
      if (prevState.column === column) {
        if (prevState.direction === 'asc') {
          return { column, direction: 'desc' };
        } else if (prevState.direction === 'desc') {
          return { column: null, direction: null };
        } else {
          return { column, direction: 'asc' };
        }
      }
      // 다른 컬럼을 클릭한 경우 해당 컬럼 오름차순 정렬
      return { column, direction: 'asc' };
    });
  }, []);

  /**
   * 데이터 정렬 함수
   * @param {Array} data - 정렬할 데이터 배열
   * @returns {Array} 정렬된 데이터 배열
   */
  const sortData = useCallback((data) => {
    const { column, direction } = sortState;
    
    // 정렬 컬럼이 없거나 방향이 없으면 원본 데이터 반환
    if (!column || !direction || !data || data.length === 0) {
      return data;
    }

    // 데이터 복사 후 정렬
    return [...data].sort((a, b) => {
      const valueA = getNestedValue(a, column);
      const valueB = getNestedValue(b, column);
      
      return compareValues(valueA, valueB, direction);
    });
  }, [sortState]);

  return {
    sortColumn: sortState.column,
    sortDirection: sortState.direction,
    handleSort,
    sortData
  };
};

export default useSortableTable;