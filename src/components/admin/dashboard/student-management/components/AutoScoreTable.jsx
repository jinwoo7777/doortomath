'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/ui/spinner';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';
import { formatDate, formatDateTime, formatDuration } from '../utils/formatters';

/**
 * 자동 채점 결과 테이블 컴포넌트
 */
const AutoScoreTable = ({ filteredSessions, loading, getScoreBadge, getExamTypeBadge }) => {
  if (loading) {
    return <LoadingSpinner text="데이터 로딩 중..." />;
  }

  if (filteredSessions.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">자동 채점 결과가 없습니다.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>시험 제목</TableHead>
          <TableHead>과목</TableHead>
          <TableHead>시험 날짜</TableHead>
          <TableHead>담당 강사</TableHead>
          <TableHead>제출 시간</TableHead>
          <TableHead>소요 시간</TableHead>
          <TableHead>점수</TableHead>
          <TableHead>등급</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredSessions.map((session, index) => (
          <TableRow key={index}>
            <TableCell>
              <div className="font-medium">{session.exam_answer_keys?.exam_title || '시험 제목 없음'}</div>
              <div className="text-sm text-gray-500">
                {getExamTypeBadge(session.exam_answer_keys?.exam_type)}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center">
                <BookOpen className="w-4 h-4 mr-1 text-gray-500" />
                {session.exam_answer_keys?.subject || '-'}
              </div>
            </TableCell>
            <TableCell>{formatDate(session.exam_answer_keys?.exam_date)}</TableCell>
            <TableCell>{session.exam_answer_keys?.teachers?.name || '-'}</TableCell>
            <TableCell>{formatDateTime(session.submitted_at)}</TableCell>
            <TableCell>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1 text-gray-500" />
                {formatDuration(session.duration_seconds)}
              </div>
            </TableCell>
            <TableCell>
              <div className="font-medium">{session.total_score || 0}점</div>
              <div className="text-sm text-gray-500">
                {Math.round(((session.total_score || 0) / (session.exam_answer_keys?.total_score || 100)) * 100)}%
              </div>
            </TableCell>
            <TableCell>
              {getScoreBadge(session.total_score, session.exam_answer_keys?.total_score)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AutoScoreTable;