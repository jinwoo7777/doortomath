'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar, User, MapPin, Edit2, Trash2 } from 'lucide-react';
import { getBranchName, getDayName } from '../utils/formatters';

/**
 * 학생이 수강 중인 강의 목록 컴포넌트
 */
const CourseList = ({ 
  studentCourses, 
  loading, 
  editingCourse, 
  setEditingCourse, 
  handleUpdateCourseStatus, 
  handleUpdateCourseNotes, 
  handleRemoveCourse,
  setStudentCourses
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (studentCourses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        수강 중인 강의가 없습니다.
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>지점</TableHead>
            <TableHead>과목</TableHead>
            <TableHead>요일/시간</TableHead>
            <TableHead>강사</TableHead>
            <TableHead>교실</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>수강 메모</TableHead>
            <TableHead>관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {studentCourses.map((course) => (
            <TableRow key={course.id}>
              <TableCell>
                <Badge variant="outline">
                  {getBranchName(course.schedules.branch)}
                </Badge>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{course.schedules.subject}</div>
                  <div className="text-sm text-muted-foreground">
                    {course.schedules.grade}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {getDayName(course.schedules.day_of_week)} {course.schedules.time_slot}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{course.schedules.teacher_name || '미정'}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{course.schedules.classroom || '미정'}</span>
                </div>
              </TableCell>
              <TableCell>
                <Select
                  value={course.status}
                  onValueChange={(value) => handleUpdateCourseStatus(course.id, value)}
                  disabled={loading}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">수강중</SelectItem>
                    <SelectItem value="inactive">휴강</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                {editingCourse === course.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={course.notes || ''}
                      onChange={(e) => {
                        const updatedCourses = studentCourses.map(c =>
                          c.id === course.id ? { ...c, notes: e.target.value } : c
                        );
                        setStudentCourses(updatedCourses);
                      }}
                      placeholder="수강 메모"
                      className="text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateCourseNotes(course.id, course.notes)}
                    >
                      저장
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingCourse(null)}
                    >
                      취소
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{course.notes || '메모 없음'}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingCourse(course.id)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveCourse(course.id, course.schedule_id)}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CourseList;