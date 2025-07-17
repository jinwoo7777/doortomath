'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/**
 * 시험 성적 필터링 컴포넌트
 */
const ExamScoreFilters = ({ 
  selectedSubject, 
  setSelectedSubject, 
  selectedPeriod, 
  setSelectedPeriod,
  getSubjects
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium mb-2 block">과목</label>
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger>
            <SelectValue placeholder="과목 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 과목</SelectItem>
            {getSubjects().map(subject => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="text-sm font-medium mb-2 block">기간</label>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger>
            <SelectValue placeholder="기간 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 기간</SelectItem>
            <SelectItem value="1">최근 1개월</SelectItem>
            <SelectItem value="3">최근 3개월</SelectItem>
            <SelectItem value="6">최근 6개월</SelectItem>
            <SelectItem value="12">최근 1년</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ExamScoreFilters;