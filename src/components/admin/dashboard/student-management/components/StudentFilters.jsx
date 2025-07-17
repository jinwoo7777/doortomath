'use client';

import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from 'lucide-react';

/**
 * 학생 목록 필터링 컴포넌트
 */
const StudentFilters = ({ 
  searchQuery, 
  setSearchQuery, 
  selectedGrade, 
  setSelectedGrade,
  selectedBranch,
  setSelectedBranch,
  selectedTeacher,
  setSelectedTeacher,
  teachers
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="학생 이름, 이메일, 학교 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedBranch} onValueChange={setSelectedBranch}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="지점 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 지점</SelectItem>
            <SelectItem value="daechi">대치</SelectItem>
            <SelectItem value="bukwirye">북위례</SelectItem>
            <SelectItem value="namwirye">남위례</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedGrade} onValueChange={setSelectedGrade}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="학년 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 학년</SelectItem>
            <SelectItem value="초등부">초등부</SelectItem>
            <SelectItem value="중등부">중등부</SelectItem>
            <SelectItem value="고등부">고등부</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* 강사 필터링 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select 
          value={selectedTeacher} 
          onValueChange={setSelectedTeacher}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="강사 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 강사</SelectItem>
            {teachers
              .filter(teacher => selectedBranch === 'all' || teacher.branch === selectedBranch)
              .map(teacher => (
                <SelectItem key={teacher.id} value={teacher.name}>
                  {teacher.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default StudentFilters;