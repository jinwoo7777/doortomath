'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit2,
  Trash2,
  Star,
  BookOpen,
  BarChart3,
  MessageSquare,
  CreditCard,
  UserCheck
} from 'lucide-react';
import { getBranchName } from '../utils/formatters';
import SortableTableHeader from './SortableTableHeader';

/**
 * 학생 목록 테이블 컴포넌트
 */
const StudentList = ({
  students,
  filteredStudents,
  loading,
  onEdit,
  onDelete,
  onTogglePriority,
  onViewCourses,
  onViewExamScores,
  onOpenMemo,
  onOpenPayment,
  onOpenEnrollment,
  getStudentSchedules,
  getStudentGradeAverage,
  session,
  // 정렬 관련 props
  sortColumn,
  sortDirection,
  onSort
}) => {
  // 학생 삭제 전 확인
  const handleDeleteClick = (student) => {
    // 수강 중인 수업이 있는지 확인
    const enrolledSchedules = getStudentSchedules(student.id);

    if (enrolledSchedules.length > 0) {
      const confirmMessage = `${student.full_name} 학원생은 현재 ${enrolledSchedules.length}개의 수업을 수강하고 있습니다.\n정말로 삭제하시겠습니까?`;
      if (!confirm(confirmMessage)) return;
    } else {
      if (!confirm(`${student.full_name} 학원생을 정말 삭제하시겠습니까?`)) return;
    }

    onDelete(student, session);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">학생 데이터 로딩 중...</div>
      </div>
    );
  }

  if (filteredStudents.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">검색 결과가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableTableHeader
              column="full_name"
              label="이름"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <SortableTableHeader
              column="grade"
              label="학년"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <SortableTableHeader
              column="branch"
              label="지점"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <SortableTableHeader
              column="phone"
              label="연락처"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <SortableTableHeader
              column="courses_count"
              label="수강 강의"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <SortableTableHeader
              column="average_grade"
              label="평균 성적"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <SortableTableHeader
              column="is_priority"
              label="관심 관리"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <SortableTableHeader
              label="관리"
              className="cursor-default"
            />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStudents.map((student) => {
            const studentSchedules = getStudentSchedules(student.id);
            const averageGrade = getStudentGradeAverage(student.id);

            return (
              <TableRow key={student.id}>
                <TableCell>
                  <div className="font-medium">{student.full_name}</div>
                  <div className="text-sm text-muted-foreground">{student.email}</div>
                </TableCell>
                <TableCell>
                  {student.grade && (
                    <Badge variant="outline">
                      {student.grade} {student.school_grade && `(${student.school_grade})`}
                    </Badge>
                  )}
                  <div className="text-sm text-muted-foreground mt-1">{student.school}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {getBranchName(student.branch)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>{student.phone || '-'}</div>
                  <div className="text-sm text-muted-foreground">
                    {student.parent_phone ? `(학부모) ${student.parent_phone}` : ''}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => onViewCourses(student)}
                    >
                      <BookOpen className="h-4 w-4 mr-1" />
                      {studentSchedules.length}개 강의
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => onViewExamScores(student)}
                  >
                    <BarChart3 className="h-4 w-4 mr-1" />
                    {averageGrade !== null ? `${averageGrade}점` : '성적 없음'}
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant={student.is_priority ? "default" : "outline"}
                    size="sm"
                    className={`h-8 px-2 ${student.is_priority ? 'bg-yellow-500 hover:bg-yellow-600' : ''}`}
                    onClick={() => onTogglePriority(student, session)}
                  >
                    <Star className={`h-4 w-4 ${student.is_priority ? 'text-white' : 'text-yellow-500'}`} />
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(student)}
                      className="h-8 w-8"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(student)}
                      className="h-8 w-8 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onOpenMemo(student)}
                      className="h-8 w-8"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onOpenPayment(student)}
                      className="h-8 w-8"
                    >
                      <CreditCard className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onOpenEnrollment(student)}
                      className="h-8 w-8"
                    >
                      <UserCheck className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default StudentList;