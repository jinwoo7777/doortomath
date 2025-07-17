'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { BookOpen, FileText } from 'lucide-react';
import { formatDate } from '../utils/formatters';

/**
 * 수동 입력 성적 테이블 컴포넌트
 */
const ManualScoreTable = ({ filteredScores, loading, getScoreBadge, getExamTypeBadge }) => {
  if (loading) {
    return <LoadingSpinner text="데이터 로딩 중..." />;
  }

  if (filteredScores.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">수동 입력 성적이 없습니다.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>시험 날짜</TableHead>
          <TableHead>과목</TableHead>
          <TableHead>담당 강사</TableHead>
          <TableHead>시험 유형</TableHead>
          <TableHead>점수</TableHead>
          <TableHead>등급</TableHead>
          <TableHead>비고</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredScores.map((score, index) => (
          <TableRow key={index}>
            <TableCell>{formatDate(score.exam_date)}</TableCell>
            <TableCell>
              <div className="flex items-center">
                <BookOpen className="w-4 h-4 mr-1 text-gray-500" />
                {score.schedules?.subject || '-'}
              </div>
            </TableCell>
            <TableCell>{score.schedules?.teacher_name || '-'}</TableCell>
            <TableCell>{getExamTypeBadge(score.exam_type)}</TableCell>
            <TableCell>
              <div className="font-medium">{score.score || 0}점</div>
              <div className="text-sm text-gray-500">
                {Math.round(((score.score || 0) / (score.max_score || 100)) * 100)}%
              </div>
            </TableCell>
            <TableCell>{getScoreBadge(score.score, score.max_score)}</TableCell>
            <TableCell>
              <span className="text-sm text-gray-600">{score.notes || '-'}</span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ManualScoreTable;