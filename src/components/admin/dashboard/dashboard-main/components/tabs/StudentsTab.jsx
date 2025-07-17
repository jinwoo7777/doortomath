"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const StudentsTab = ({ recentStudents, navigateToPage, dashboardData }) => {
  // 전달 대비 학생 수 변화 계산 (임시 데이터)
  const previousMonthStudents = 18; // 전달 학생 수 (임시 데이터)
  const currentStudents = dashboardData?.totalStudents || 0;
  const studentChange = currentStudents - previousMonthStudents;
  const studentChangePercent = previousMonthStudents > 0 
    ? Math.round((studentChange / previousMonthStudents) * 100) 
    : 0;
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">최근 등록 학생</h3>
        <Button variant="outline" size="sm" onClick={() => navigateToPage('/dashboard2/admin/student-management')}>
          전체 보기 <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      {/* 학생 수 변화 표시 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 font-medium">전달 학생 수</div>
          <div className="text-2xl font-bold text-gray-700">{previousMonthStudents}명</div>
        </div>
        <div className={`p-4 ${studentChange >= 0 ? 'bg-green-50' : 'bg-red-50'} rounded-lg`}>
          <div className={`text-sm ${studentChange >= 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
            전달 대비 변화
          </div>
          <div className={`text-2xl font-bold ${studentChange >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {studentChange >= 0 ? '+' : ''}{studentChange}명 ({studentChange >= 0 ? '+' : ''}{studentChangePercent}%)
          </div>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>이름</TableHead>
            <TableHead>학년</TableHead>
            <TableHead>연락처</TableHead>
            <TableHead>등록일</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentStudents.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium">{student.full_name}</TableCell>
              <TableCell>{student.grade}</TableCell>
              <TableCell>{student.phone}</TableCell>
              <TableCell>{new Date(student.enrollment_date).toLocaleDateString('ko-KR')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StudentsTab;