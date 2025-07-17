"use client";

import React, { useState, useEffect } from 'react';
import { fetchAllSchedules } from '@/lib/supabase/fetchSchedules';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Users, 
  GraduationCap, 
  MapPin,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

export default function DaechiSchedulePage() {
  const [schedules, setSchedules] = useState({
    '초등부': [],
    '중등부': [],
    '고등부': []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('초등부');
  const branchName = '대치';
  const branch = 'daechi';

  useEffect(() => {
    const fetchScheduleData = async () => {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [DaechiSchedulePage] 시간표 데이터 요청 시작:');
      console.log('  - branch:', branch);
      
      try {
        // 지점별 시간표 데이터 가져오기
        const allData = await fetchAllSchedules(null, branch);
        
        console.log('✅ [DaechiSchedulePage] 시간표 데이터 로드 성공:');
        console.log('  - 총 시간표 수:', allData.length);
        
        // 학년별로 데이터 분류
        const gradeData = {
          '초등부': allData.filter(s => s.grade === '초등부').sort((a, b) => {
            if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
            return a.time_slot.localeCompare(b.time_slot);
          }),
          '중등부': allData.filter(s => s.grade === '중등부').sort((a, b) => {
            if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
            return a.time_slot.localeCompare(b.time_slot);
          }),
          '고등부': allData.filter(s => s.grade === '고등부').sort((a, b) => {
            if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
            return a.time_slot.localeCompare(b.time_slot);
          })
        };
        
        setSchedules(gradeData);
        console.log(`📊 [DaechiSchedulePage] ${branchName} 시간표 렌더링 준비 완료:`, {
          '초등부': gradeData['초등부'].length,
          '중등부': gradeData['중등부'].length,
          '고등부': gradeData['고등부'].length
        });
      } catch (err) {
        console.error('❌ [DaechiSchedulePage] 시간표 불러오기 오류:', err);
        console.error('  - 오류 상세:', err.message);
        setError('시간표를 불러오는 데 실패했습니다.');
      }
      
      setLoading(false);
    };

    fetchScheduleData();
  }, []);

  // 모든 시간대 추출하고 정렬
  const getAllTimeSlots = (grade) => {
    const timeSlots = [...new Set(schedules[grade].map(s => s.time_slot))];
    return timeSlots.sort();
  };

  const getAvailabilityColor = (current, max) => {
    const ratio = current / max;
    if (ratio >= 1) return 'text-red-600';
    if (ratio >= 0.8) return 'text-orange-500';
    return 'text-green-600';
  };

  const getAvailabilityText = (current, max) => {
    if (current >= max) return '정원마감';
    const remaining = max - current;
    return `${remaining}명 가능`;
  };

  // 특정 요일과 시간대의 수업 찾기
  const findSchedule = (grade, dayOfWeek, timeSlot) => {
    return schedules[grade].find(s => s.day_of_week === dayOfWeek && s.time_slot === timeSlot);
  };

  const renderScheduleCell = (schedule) => {
    if (!schedule) {
      return <div className="text-center text-gray-400 text-sm">-</div>;
    }

    return (
      <div className="space-y-2 p-2">
        <div className="font-medium text-sm">{schedule.subject}</div>
        
        {schedule.teacher_name && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <GraduationCap className="h-3 w-3" />
            <span>{schedule.teacher_name}</span>
          </div>
        )}
        
        {schedule.classroom && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <MapPin className="h-3 w-3" />
            <span>{schedule.classroom}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs">
            <Users className="h-3 w-3 text-gray-500" />
            <span className={getAvailabilityColor(schedule.current_students, schedule.max_students)}>
              {schedule.current_students}/{schedule.max_students}
            </span>
          </div>
          
          <Badge 
            variant={
              schedule.current_students >= schedule.max_students 
                ? "destructive" 
                : "default"
            }
            className="text-xs"
          >
            {getAvailabilityText(schedule.current_students, schedule.max_students)}
          </Badge>
        </div>
        
        {schedule.description && (
          <div className="text-xs text-gray-500 mt-1">
            {schedule.description}
          </div>
        )}
      </div>
    );
  };

  const renderGradeSchedule = (grade) => {
    const timeSlots = getAllTimeSlots(grade);

    if (schedules[grade].length === 0) {
      return (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            등록된 시간표가 없습니다
          </h3>
          <p className="text-gray-500">
            {branchName} 지점 {grade} 시간표가 준비 중입니다. 잠시 후 다시 확인해주세요.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* 시간표 테이블 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {branchName} 지점 {grade} 주간 시간표
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24 text-center">시간</TableHead>
                    <TableHead className="text-center">월요일</TableHead>
                    <TableHead className="text-center">화요일</TableHead>
                    <TableHead className="text-center">수요일</TableHead>
                    <TableHead className="text-center">목요일</TableHead>
                    <TableHead className="text-center">금요일</TableHead>
                    <TableHead className="text-center">토요일</TableHead>
                    <TableHead className="text-center">일요일</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeSlots.map((timeSlot) => (
                    <TableRow key={timeSlot} className="min-h-[120px]">
                      <TableCell className="font-medium text-center border-r bg-gray-50">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="h-3 w-3 text-gray-500" />
                          <span className="text-sm">{timeSlot}</span>
                        </div>
                      </TableCell>
                      {[1, 2, 3, 4, 5, 6, 7].map((dayOfWeek) => {
                        const schedule = findSchedule(grade, dayOfWeek, timeSlot);
                        return (
                          <TableCell 
                            key={dayOfWeek} 
                            className="border-r border-gray-200 align-top min-w-[200px]"
                          >
                            {renderScheduleCell(schedule)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="mt-2 text-sm text-muted-foreground">시간표를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {branchName} 지점 수업시간표
          </h1>
          <p className="text-gray-600">
            수학의 문 {branchName} 지점 수업 일정을 확인하세요
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <Button variant="default">
              대치
            </Button>
            <Link href="/schedules/north-wirye">
              <Button variant="outline">
                북위례
              </Button>
            </Link>
            <Link href="/schedules/south-wirye">
              <Button variant="outline">
                남위례
              </Button>
            </Link>
          </div>
        </div>

        {/* 학년별 탭 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="초등부">초등부</TabsTrigger>
            <TabsTrigger value="중등부">중등부</TabsTrigger>
            <TabsTrigger value="고등부">고등부</TabsTrigger>
          </TabsList>

          <TabsContent value="초등부" className="mt-6">
            {renderGradeSchedule('초등부')}
          </TabsContent>

          <TabsContent value="중등부" className="mt-6">
            {renderGradeSchedule('중등부')}
          </TabsContent>

          <TabsContent value="고등부" className="mt-6">
            {renderGradeSchedule('고등부')}
          </TabsContent>
        </Tabs>

        {/* 범례 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">시간표 안내</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs">5명 가능</Badge>
                <span className="text-sm text-gray-600">수강 신청 가능</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="text-xs">정원마감</Badge>
                <span className="text-sm text-gray-600">수강 신청 마감</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">담당 강사</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">강의실</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">현재인원/정원</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 안내 사항 */}
        <div className="mt-12 bg-white rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-4">수강 신청 안내</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">📞 전화 문의</h4>
              <p className="text-sm text-gray-600">
                수강 신청 및 문의: <strong>02-0000-0000</strong>
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">🕐 상담 시간</h4>
              <p className="text-sm text-gray-600">
                평일 오전 9시 ~ 오후 9시<br />
                토요일 오전 9시 ~ 오후 6시
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}