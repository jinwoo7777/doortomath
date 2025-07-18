'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { SearchInput } from '@/components/ui/search-input';

/**
 * 시험 응시 현황 필터 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {string} props.searchTerm - 검색어
 * @param {string} props.selectedGrade - 선택된 학년
 * @param {Array} props.availableGrades - 사용 가능한 학년 목록
 * @param {Function} props.onSearchChange - 검색어 변경 핸들러
 * @param {Function} props.onGradeChange - 학년 변경 핸들러
 * @returns {JSX.Element} 시험 응시 현황 필터 컴포넌트
 */
const ExamStatusFilters = ({ 
  searchTerm, 
  selectedGrade, 
  availableGrades, 
  onSearchChange, 
  onGradeChange 
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search">학생 검색</Label>
            <SearchInput
              id="search"
              placeholder="이름 또는 학번으로 검색"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="grade">학년 필터</Label>
            <Select
              value={selectedGrade}
              onValueChange={onGradeChange}
            >
              <SelectTrigger id="grade">
                <SelectValue placeholder="전체 학년" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 학년</SelectItem>
                {availableGrades.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}학년
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExamStatusFilters;
