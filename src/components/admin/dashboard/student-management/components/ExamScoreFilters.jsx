'use client';

import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

/**
 * 시험 성적 필터링 컴포넌트
 */
const ExamScoreFilters = ({
  selectedSubject,
  setSelectedSubject,
  selectedPeriod,
  setSelectedPeriod,
  getSubjects,
  studentId // 학생 ID를 직접 전달받을 수 있도록 추가
}) => {
  // 과목 목록 상태
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // 컴포넌트 마운트 시 과목 목록 설정
  useEffect(() => {
    // 수강 중인 과목 목록 가져오기
    const fetchEnrolledSubjects = async () => {
      try {
        setLoading(true);

        // 1. getSubjects 함수가 있으면 먼저 시도
        const dynamicSubjects = getSubjects && typeof getSubjects === 'function' ? getSubjects() : [];

        if (dynamicSubjects.length > 0) {
          console.log('Found subjects from getSubjects:', dynamicSubjects);
          setSubjects(dynamicSubjects.sort());
          setLoading(false);
          return;
        }

        // 2. 직접 Supabase에서 수강 중인 과목 가져오기
        const supabase = createClientComponentClient();

        // 학생 ID가 전달된 경우 해당 학생의 수강 과목 가져오기
        if (studentId) {
          console.log('Fetching subjects for student ID:', studentId);

          // 먼저 student_enrollments 테이블 조회 시도
          const { data: enrollments, error: enrollmentsError } = await supabase
            .from('student_enrollments')
            .select(`
              schedules (
                subject
              )
            `)
            .eq('student_id', studentId)
            .eq('status', 'active');

          if (!enrollmentsError && enrollments && enrollments.length > 0) {
            const enrolledSubjects = enrollments
              .filter(item => item.schedules?.subject)
              .map(item => item.schedules.subject);

            // 중복 제거 및 정렬
            const uniqueSubjects = [...new Set(enrolledSubjects)];
            console.log('Found enrolled subjects:', uniqueSubjects);
            setSubjects(uniqueSubjects.sort());
            setLoading(false);
            return;
          }

          // student_enrollments에서 데이터를 찾지 못한 경우 student_schedules 테이블 조회
          const { data: schedules, error: schedulesError } = await supabase
            .from('student_schedules')
            .select(`
              schedule:schedule_id (
                subject
              )
            `)
            .eq('student_id', studentId)
            .eq('status', 'active');

          if (!schedulesError && schedules && schedules.length > 0) {
            const enrolledSubjects = schedules
              .filter(item => item.schedule?.subject)
              .map(item => item.schedule.subject);

            // 중복 제거 및 정렬
            const uniqueSubjects = [...new Set(enrolledSubjects)];
            console.log('Found enrolled subjects from schedules:', uniqueSubjects);
            setSubjects(uniqueSubjects.sort());
            setLoading(false);
            return;
          }
        }

        // 3. 학생 ID가 없는 경우 현재 로그인한 사용자의 정보 사용
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          console.log('No authenticated user found');
          setLoading(false);
          return;
        }

        // 사용자 프로필 정보 가져오기
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'student') {
          // 학생인 경우 자신의 수강 과목 가져오기
          const { data: enrollments } = await supabase
            .from('student_enrollments')
            .select(`
              schedules (
                subject
              )
            `)
            .eq('student_id', profile.id)
            .eq('status', 'active');

          if (enrollments && enrollments.length > 0) {
            const enrolledSubjects = enrollments
              .filter(item => item.schedules?.subject)
              .map(item => item.schedules.subject);

            // 중복 제거 및 정렬
            const uniqueSubjects = [...new Set(enrolledSubjects)];
            console.log('Found enrolled subjects for current user:', uniqueSubjects);
            setSubjects(uniqueSubjects.sort());
          }
        }
      } catch (error) {
        console.error('Error fetching enrolled subjects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledSubjects();
  }, [getSubjects, studentId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium mb-2 block">과목</label>
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger>
            <SelectValue placeholder="과목 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 과목</SelectItem>
            {subjects.map(subject => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">기간</label>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger>
            <SelectValue placeholder="기간 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 기간</SelectItem>
            <SelectItem value="1">최근 1개월</SelectItem>
            <SelectItem value="3">최근 3개월</SelectItem>
            <SelectItem value="6">최근 6개월</SelectItem>
            <SelectItem value="12">최근 1년</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ExamScoreFilters;