'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, Loader2, Calendar, User, MapPin } from 'lucide-react';
import { getBranchName, getDayName } from '@/components/admin/dashboard/student-management/utils/formatters';

export default function StudentCoursesSection({ supabase, studentId }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (studentId) {
      fetchCourses();
    }
  }, [studentId]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('학생 수강 과목 조회 시작:', studentId);

      // 학생이 수강 중인 과목 정보 조회
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('student_enrollments')
        .select(`
          *,
          schedules (
            id,
            grade,
            day_of_week,
            time_slot,
            subject,
            teacher_name,
            classroom,
            description,
            branch
          )
        `)
        .eq('student_id', studentId)
        .eq('status', 'active');

      if (enrollmentsError) {
        console.error('학생 수강 정보 조회 오류:', enrollmentsError);
        throw enrollmentsError;
      }

      console.log('조회된 수강 과목 수:', enrollmentsData?.length || 0);
      setCourses(enrollmentsData || []);
    } catch (error) {
      console.error('수강 과목 조회 오류:', error);
      setError(`수강 중인 과목을 불러올 수 없습니다: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            <span>수강 중인 과목</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            <span>수강 중인 과목</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (courses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            <span>수강 중인 과목</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            현재 수강 중인 과목이 없습니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-blue-500" />
          <span>수강 중인 과목</span>
          <Badge variant="secondary" className="ml-2">
            {courses.length}개
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>지점</TableHead>
                <TableHead>과목</TableHead>
                <TableHead>요일/시간</TableHead>
                <TableHead>강사</TableHead>
                <TableHead>교실</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <Badge variant="outline">
                      {getBranchName(course.schedules?.branch)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{course.schedules?.subject}</div>
                      <div className="text-sm text-muted-foreground">
                        {course.schedules?.grade}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {getDayName(course.schedules?.day_of_week)} {course.schedules?.time_slot}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{course.schedules?.teacher_name || '미정'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{course.schedules?.classroom || '미정'}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}