'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, Loader2, Calendar, User, MapPin } from 'lucide-react';
import { getBranchName, getDayName } from '@/components/admin/dashboard/student-management/utils/formatters';

// 개별 강의 행 컴포넌트 - 메모이제이션 적용
const CourseRow = React.memo(({ course }) => {
  return (
    <TableRow>
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
  );
});

CourseRow.displayName = 'CourseRow';

export default function StudentCoursesSection({ supabase, studentId }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 메모이제이션을 위한 참조 저장
  const studentIdRef = React.useRef(studentId);
  
  // 데이터 캐싱을 위한 상태 추가
  const [dataCache, setDataCache] = useState({
    lastFetch: null,
    expiryTime: 5 * 60 * 1000, // 5분 캐시
    courseCount: 0 // 강의 수 캐싱
  });
  
  // 학생 ID가 변경되면 참조 업데이트
  useEffect(() => {
    if (studentIdRef.current !== studentId) {
      studentIdRef.current = studentId;
      // 학생 ID가 변경되면 캐시 무효화
      setDataCache(prev => ({
        ...prev,
        lastFetch: null
      }));
    }
  }, [studentId]);

  // fetchCourses 함수를 useCallback으로 메모이제이션
  const fetchCourses = useCallback(async () => {
    if (!studentId || !supabase) return;
    
    try {
      setLoading(true);
      setError('');

      // 캐시 만료 확인
      const now = Date.now();
      const isCacheValid = dataCache.lastFetch && (now - dataCache.lastFetch < dataCache.expiryTime);
      
      // 캐시가 유효하고 강의가 있으면 API 호출 건너뛰기
      if (isCacheValid && courses.length > 0) {
        setLoading(false);
        return;
      }

      // 학생이 수강 중인 과목 정보 조회 - 필요한 필드만 선택하여 성능 향상
      // 먼저 student_enrollments 테이블 조회 시도
      let { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('student_enrollments')
        .select(`
          id,
          schedules (
            id,
            grade,
            day_of_week,
            time_slot,
            subject,
            teacher_name,
            classroom,
            branch
          )
        `)
        .eq('student_id', studentId)
        .eq('status', 'active');

      // student_enrollments에서 데이터를 찾지 못한 경우 student_schedules 테이블 조회
      if ((!enrollmentsData || enrollmentsData.length === 0) && !enrollmentsError) {
        console.log('student_enrollments에서 데이터를 찾지 못했습니다. student_schedules 테이블 조회 시도...');
        
        const { data: schedulesData, error: schedulesError } = await supabase
          .from('student_schedules')
          .select(`
            id,
            schedule:schedule_id (
              id,
              grade,
              day_of_week,
              time_slot,
              subject,
              teacher_name,
              classroom,
              branch
            )
          `)
          .eq('student_id', studentId)
          .eq('status', 'active');
          
        if (schedulesError) {
          console.error('student_schedules 조회 오류:', schedulesError);
        } else if (schedulesData && schedulesData.length > 0) {
          // student_schedules 데이터를 student_enrollments 형식으로 변환
          enrollmentsData = schedulesData.map(item => ({
            id: item.id,
            schedules: item.schedule
          }));
        }
      }

      if (enrollmentsError) {
        throw enrollmentsError;
      }

      // 데이터 캐시 업데이트
      setDataCache({
        ...dataCache,
        lastFetch: now,
        courseCount: enrollmentsData?.length || 0
      });
      
      setCourses(enrollmentsData || []);
    } catch (error) {
      console.error('수강 과목 조회 오류:', error);
      setError(`수강 중인 과목을 불러올 수 없습니다: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  }, [studentId, dataCache, courses.length, supabase]);

  // 강의 로딩
  useEffect(() => {
    if (studentId && supabase) {
      fetchCourses();
    }
  }, [studentId, supabase, fetchCourses]);

  // 렌더링 최적화를 위한 메모이제이션
  const courseRows = useMemo(() => {
    return courses.map(course => (
      <CourseRow key={course.id} course={course} />
    ));
  }, [courses]);

  // 로딩 상태 UI
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

  // 에러 상태 UI
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

  // 강의 없음 상태 UI
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

  // 강의 목록 UI
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
              {courseRows}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}