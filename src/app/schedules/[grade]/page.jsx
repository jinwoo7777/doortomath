"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { fetchAllSchedules, getDayName } from '@/lib/supabase/fetchSchedules';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Users, 
  GraduationCap, 
  MapPin,
  BookOpen,
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
import Link from 'next/link';

export default function PublicSchedulePage() {
  const { grade } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const gradeNames = {
    'elementary': '초등부',
    'middle': '중등부', 
    'high': '고등부'
  };

  const gradeName = gradeNames[grade] || '초등부';

  useEffect(() => {
    const fetchScheduleData = async () => {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [PublicSchedulePage] 시간표 데이터 요청 시작:');
      console.log('  - grade (URL):', grade);
      console.log('  - gradeName (한글):', gradeName);
      
      try {
        const data = await fetchAllSchedules(gradeName);
        
        console.log('✅ [PublicSchedulePage] 시간표 데이터 로드 성공:');
        console.log('  - 총 시간표 수:', data.length);
        console.log('  - 데이터 미리보기:', data.slice(0, 3));
        
        // 요일과 시간으로 정렬
        const sortedData = data.sort((a, b) => {
          if (a.day_of_week !== b.day_of_week) {
            return a.day_of_week - b.day_of_week;
          }
          return a.time_slot.localeCompare(b.time_slot);
        });
        
        setSchedules(sortedData);
        console.log(`📊 [PublicSchedulePage] ${gradeName} 시간표 렌더링 준비 완료:`, sortedData.length, '개');
      } catch (err) {
        console.error('❌ [PublicSchedulePage] 시간표 불러오기 오류:', err);
        console.error('  - 오류 상세:', err.message);
        setError('시간표를 불러오는 데 실패했습니다.');
      }
      
      setLoading(false);
    };

    fetchScheduleData();
  }, [grade, gradeName]);

  // 요일별로 그룹화
  const schedulesByDay = schedules.reduce((acc, schedule) => {
    const day = schedule.day_of_week;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(schedule);
    return acc;
  }, {});

  // 모든 시간대 추출하고 정렬
  const getAllTimeSlots = () => {
    const timeSlots = [...new Set(schedules.map(s => s.time_slot))];
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
  const findSchedule = (dayOfWeek, timeSlot) => {
    return schedules.find(s => s.day_of_week === dayOfWeek && s.time_slot === timeSlot);
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

  const timeSlots = getAllTimeSlots();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {gradeName} 수업시간표
          </h1>
          <p className="text-gray-600">
            수학의 문 {gradeName} 수업 일정을 확인하세요
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <Link href="/schedules/elementary">
              <Button variant={grade === 'elementary' ? 'default' : 'outline'}>
                초등부
              </Button>
            </Link>
            <Link href="/schedules/middle">
              <Button variant={grade === 'middle' ? 'default' : 'outline'}>
                중등부
              </Button>
            </Link>
            <Link href="/schedules/high">
              <Button variant={grade === 'high' ? 'default' : 'outline'}>
                고등부
              </Button>
            </Link>
          </div>
        </div>

        {schedules.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              등록된 시간표가 없습니다
            </h3>
            <p className="text-gray-500">
              {gradeName} 시간표가 준비 중입니다. 잠시 후 다시 확인해주세요.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 시간표 테이블 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {gradeName} 주간 시간표
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
                            const schedule = findSchedule(dayOfWeek, timeSlot);
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

            {/* 범례 */}
            <Card>
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
          </div>
        )}

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