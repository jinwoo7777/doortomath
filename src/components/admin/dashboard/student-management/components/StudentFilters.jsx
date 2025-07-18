'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchInput } from "@/components/ui/search-input";

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
    <div className="flex flex-col md:flex-row gap-4 mb-6 layout-shift-fix">
      <div className="flex-1">
        <SearchInput
          placeholder="학생 이름, 이메일, 학교 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 min-h-[40px]">
        <div className="relative select-no-shift">
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-[180px] h-10">
              <SelectValue placeholder="지점 선택" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4} className="w-[180px] min-w-[180px]">
              <SelectItem value="all">전체 지점</SelectItem>
              <SelectItem value="daechi">대치</SelectItem>
              <SelectItem value="bukwirye">북위례</SelectItem>
              <SelectItem value="namwirye">남위례</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative select-no-shift">
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger className="w-[180px] h-10">
              <SelectValue placeholder="학년 선택" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4} className="w-[180px] min-w-[180px]">
              <SelectItem value="all">전체 학년</SelectItem>
              <SelectItem value="초등부">초등부</SelectItem>
              <SelectItem value="중등부">중등부</SelectItem>
              <SelectItem value="고등부">고등부</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* 강사 필터링 */}
      <div className="flex flex-col sm:flex-row gap-4 min-h-[40px]">
        <div className="relative select-no-shift">
          <Select 
            value={selectedTeacher} 
            onValueChange={setSelectedTeacher}
          >
            <SelectTrigger className="w-[180px] h-10">
              <SelectValue placeholder="강사 선택" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4} className="w-[180px] min-w-[180px]">
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
    </div>
  );
};

export default StudentFilters;