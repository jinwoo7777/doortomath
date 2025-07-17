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

const StudentsTab = ({ recentStudents, navigateToPage }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">최근 등록 학생</h3>
        <Button variant="outline" size="sm" onClick={() => navigateToPage('/dashboard2/admin/student-management')}>
          전체 보기 <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
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