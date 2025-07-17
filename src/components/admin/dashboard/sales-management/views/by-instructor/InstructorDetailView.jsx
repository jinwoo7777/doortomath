"use client";

import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users } from 'lucide-react';

import { formatCurrency, getDayName } from '../../utils/formatters';

/**
 * 강사 상세 정보 컴포넌트
 * @param {object} props - 컴포넌트 속성
 * @param {object} props.instructor - 강사 정보
 * @returns {React.ReactElement} 강사 상세 정보 컴포넌트
 */
const InstructorDetailView = ({ instructor }) => {
  if (!instructor) return null;

  return (
    <div className="space-y-6">
      {/* 강사 정보 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">담당 수업</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{instructor.classCount}개</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">수강생 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{instructor.studentCount}명</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">총 매출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(instructor.totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">예상 수입</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(instructor.instructorRevenue)}</div>
            <div className="text-xs text-muted-foreground">
              기본급 + {instructor.revenuePercentage}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">실제 수입</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(instructor.actualInstructorRevenue)}</div>
            <div className="text-xs text-muted-foreground">
              실제 결제 기준
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 담당 수업 목록 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">담당 수업 목록</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>수업 정보</TableHead>
                <TableHead>수강생</TableHead>
                <TableHead>수업 매출</TableHead>
                <TableHead>강사 수입</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instructor.classesArray.map((classInfo) => (
                <TableRow key={classInfo.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {classInfo.grade} {classInfo.subject}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {getDayName(classInfo.day_of_week)} {classInfo.time_slot}
                      </div>
                      {classInfo.classroom && (
                        <div className="text-xs text-muted-foreground">
                          {classInfo.classroom}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      {classInfo.students.length}명
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(classInfo.classRevenue)}
                  </TableCell>
                  <TableCell className="font-medium text-blue-600">
                    {formatCurrency(classInfo.classRevenue * instructor.revenuePercentage / 100)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 수강생 목록 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">담당 수강생 목록</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>학생명</TableHead>
                <TableHead>수업</TableHead>
                <TableHead>시작일</TableHead>
                <TableHead>월 수업료</TableHead>
                <TableHead>결제 상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instructor.students.map((student) => (
                <TableRow key={`${student.student_id}-${student.schedule_id}`}>
                  <TableCell className="font-medium">
                    {student.student?.full_name}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm font-medium">
                        {student.class?.grade} {student.class?.subject}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getDayName(student.class?.day_of_week)} {student.class?.time_slot}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(student.start_date).toLocaleDateString('ko-KR')}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(student.monthly_fee || 0)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      student.payment_status === 'paid' ? 'default' : 
                      student.payment_status === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {student.payment_status === 'paid' ? '완료' : 
                       student.payment_status === 'pending' ? '대기' : '연체'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default InstructorDetailView;