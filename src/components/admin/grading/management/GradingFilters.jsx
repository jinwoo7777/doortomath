'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { SearchInput } from '@/components/ui/search-input';

/**
 * 채점 관리 필터 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {string} props.searchTerm - 검색어
 * @param {string} props.selectedTeacher - 선택된 강사 ID
 * @param {string} props.selectedSubject - 선택된 과목
 * @param {Array} props.teachers - 강사 목록
 * @param {Array} props.subjects - 과목 목록
 * @param {Function} props.onSearchChange - 검색어 변경 핸들러
 * @param {Function} props.onTeacherChange - 강사 변경 핸들러
 * @param {Function} props.onSubjectChange - 과목 변경 핸들러
 * @returns {JSX.Element} 채점 관리 필터 컴포넌트
 */
const GradingFilters = ({ 
  searchTerm, 
  selectedTeacher, 
  selectedSubject, 
  teachers, 
  subjects, 
  onSearchChange, 
  onTeacherChange, 
  onSubjectChange 
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search">검색</Label>
            <SearchInput
              id="search"
              placeholder="시험 제목 검색"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="teacher">강사 필터</Label>
            <Select
              value={selectedTeacher}
              onValueChange={onTeacherChange}
            >
              <SelectTrigger id="teacher">
                <SelectValue placeholder="전체 강사" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 강사</SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">과목 필터</Label>
            <Select
              value={selectedSubject}
              onValueChange={onSubjectChange}
            >
              <SelectTrigger id="subject">
                <SelectValue placeholder="전체 과목" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 과목</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
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

export default GradingFilters;
