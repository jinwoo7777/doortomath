"use client";

import React from 'react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * 데이터 테이블 컴포넌트
 * @param {object} props - 컴포넌트 속성
 * @param {Array<object>} props.columns - 테이블 컬럼 정의
 * @param {Array<object>} props.data - 표시할 데이터
 * @param {boolean} props.loading - 로딩 상태
 * @param {string} props.emptyMessage - 데이터가 없을 때 표시할 메시지
 * @returns {React.ReactElement} 데이터 테이블 컴포넌트
 */
const DataTable = ({ columns, data, loading = false, emptyMessage = "데이터가 없습니다." }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={row.id || rowIndex}>
              {columns.map((column) => (
                <TableCell key={`${rowIndex}-${column.key}`} className={column.cellClassName}>
                  {column.cell ? column.cell(row) : row[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DataTable;