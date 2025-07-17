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

import { formatCurrency } from '../../utils/formatters';

/**
 * 수업 상세 정보 컴포넌트
 * @param {object} props - 컴포넌트 속성
 * @param {object} props.classInfo - 수업 정보
 * @returns {React.ReactElement} 수업 상세 정보 컴포넌트
 */
const ClassDetailView = ({ classInfo }) => {
  if (!classInfo) return null;

  return (
    <div className="space-y-6">
      {/* 수업 정보 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">수강생 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classInfo.enrollmentCount}명</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">예상 매출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(classInfo.totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">실제 수금</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(classInfo.paidAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">수금률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              classInfo.paymentRate >= 80 ? 'text-green-600' : 
              classInfo.paymentRate >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {classInfo.paymentRate}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 수강생 목록 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">수강생 목록</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>학생명</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead>시작일</TableHead>
                <TableHead>월 수업료</TableHead>
                <TableHead>결제 상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classInfo.students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">
                    {student.student?.full_name}
                  </TableCell>
                  <TableCell>
                    {student.student?.phone || student.student?.email}
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

export default ClassDetailView;