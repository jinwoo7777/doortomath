'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

/**
 * 학생 관리에 필요한 데이터를 가져오는 커스텀 훅
 * @param {Object} session - 사용자 세션 객체
 * @param {string} userRole - 사용자 역할
 * @returns {Object} 학생 관리 데이터 및 상태
 */
export const useStudentData = (session, userRole) => {
  const [students, setStudents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [studentSchedules, setStudentSchedules] = useState([]);
  const [studentGrades, setStudentGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (session?.user?.id && userRole === 'admin') {
      fetchData();
    }
  }, [session?.user?.id, userRole]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStudents(),
        fetchSchedules(),
        fetchTeachers(),
        fetchStudentSchedules(),
        fetchStudentGrades()
      ]);
    } catch (error) {
      console.error('❌ 데이터 로드 오류:', error);
      toast.error('데이터를 불러오는 데 실패했습니다.');
    }
    setLoading(false);
  };

  const fetchStudents = async () => {
    try {
      console.log('🔄 학원생 목록 로드 시작');
      console.log('🔐 세션 인증 확인:', {
        hasSession: !!session,
        userId: session?.user?.id,
        userRole
      });

      // 세션이 없으면 에러
      if (!session?.access_token) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      }

      // 현재 Supabase 세션 상태 확인
      const { data: currentSession } = await supabase.auth.getSession();
      console.log('🔍 현재 Supabase 세션:', {
        hasCurrentSession: !!currentSession?.session,
        userId: currentSession?.session?.user?.id,
        accessToken: currentSession?.session?.access_token ? '존재함' : '없음'
      });

      // 세션이 없으면 명시적으로 설정
      if (!currentSession?.session && session?.access_token && session?.refresh_token) {
        console.log('🔧 세션 설정 시도 중...');
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        });

        if (sessionError) {
          console.error('❌ 세션 설정 실패:', sessionError);
        } else {
          console.log('✅ 세션 설정 성공');
        }
      }

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('✅ 학원생 목록 로드 성공:', data?.length || 0);
      setStudents(data || []);
    } catch (error) {
      console.error('❌ 학원생 목록 불러오기 오류:', error);

      if (error.message?.includes('RLS') || error.message?.includes('policy') || error.code === '42501') {
        toast.error('권한이 없습니다. 관리자로 로그인했는지 확인해주세요.');
      } else if (error.code === 'PGRST116') {
        toast.error('데이터를 찾을 수 없습니다.');
      } else {
        toast.error(`학원생 목록을 불러오는 데 실패했습니다: ${error.message}`);
      }
    }
  };

  const fetchSchedules = async () => {
    try {
      console.log('🔄 시간표 데이터 로드 시작');
      console.log('🔐 세션 인증 확인:', {
        hasSession: !!session,
        userId: session?.user?.id
      });

      // 세션이 없으면 에러
      if (!session?.access_token) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      }

      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('is_active', true)
        .order('grade', { ascending: true });

      if (error) throw error;

      console.log('✅ 시간표 데이터 로드 성공:', data?.length || 0);
      setSchedules(data || []);
    } catch (error) {
      console.error('❌ 시간표 데이터 불러오기 오류:', error);

      if (error.message?.includes('RLS') || error.message?.includes('policy') || error.code === '42501') {
        toast.error('권한이 없습니다. 관리자로 로그인했는지 확인해주세요.');
      } else {
        toast.error(`시간표 데이터를 불러오는 데 실패했습니다: ${error.message}`);
      }
    }
  };

  const fetchTeachers = async () => {
    try {
      console.log('🔄 강사 목록 로드 시작');
      console.log('🔐 세션 인증 확인:', {
        hasSession: !!session,
        userId: session?.user?.id
      });

      // 세션이 없으면 에러
      if (!session?.access_token) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      }

      // 현재 Supabase 세션 상태 확인
      const { data: currentSession } = await supabase.auth.getSession();
      console.log('🔍 현재 Supabase 세션 (강사):', {
        hasCurrentSession: !!currentSession?.session,
        userId: currentSession?.session?.user?.id
      });

      // 세션이 없으면 명시적으로 설정
      if (!currentSession?.session && session?.access_token && session?.refresh_token) {
        console.log('🔧 세션 설정 시도 중 (강사)...');
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        });
      }

      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;

      console.log('✅ 강사 목록 로드 성공:', data?.length || 0);
      setTeachers(data || []);
    } catch (error) {
      console.error('❌ 강사 목록 불러오기 오류:', error);

      if (error.message?.includes('RLS') || error.message?.includes('policy') || error.code === '42501') {
        toast.error('권한이 없습니다. 관리자로 로그인했는지 확인해주세요.');
      } else {
        toast.error(`강사 목록을 불러오는 데 실패했습니다: ${error.message}`);
      }
    }
  };

  const fetchStudentSchedules = async () => {
    try {
      console.log('🔄 학원생 수업 연결 데이터 로드 시작');
      console.log('🔐 세션 인증 확인:', {
        hasSession: !!session,
        userId: session?.user?.id
      });

      // 세션이 없으면 에러
      if (!session?.access_token) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      }

      // 현재 Supabase 세션 상태 확인
      const { data: currentSession } = await supabase.auth.getSession();
      console.log('🔍 현재 Supabase 세션 (학원생 수업):', {
        hasCurrentSession: !!currentSession?.session,
        userId: currentSession?.session?.user?.id
      });

      // 세션이 없으면 명시적으로 설정
      if (!currentSession?.session && session?.access_token && session?.refresh_token) {
        console.log('🔧 세션 설정 시도 중 (학원생 수업)...');
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        });
      }

      // student_enrollments 테이블에서 데이터 가져오기 (student_schedules 대신)
      const { data, error } = await supabase
        .from('student_enrollments')
        .select(`
          *,
          students:student_id(id, full_name, grade),
          schedules:schedule_id(id, subject, teacher_name, grade, day_of_week, time_slot)
        `)
        .eq('status', 'active');

      if (error) throw error;

      console.log('✅ 학원생 수업 연결 데이터 로드 성공:', data?.length || 0);
      setStudentSchedules(data || []);
    } catch (error) {
      console.error('❌ 학원생 수업 연결 데이터 불러오기 오류:', error);

      if (error.message?.includes('RLS') || error.message?.includes('policy') || error.code === '42501') {
        toast.error('권한이 없습니다. 관리자로 로그인했는지 확인해주세요.');
      } else {
        toast.error(`학원생 수업 연결 데이터를 불러오는 데 실패했습니다: ${error.message}`);
      }
    }
  };

  const fetchStudentGrades = async () => {
    try {
      console.log('🔄 학원생 성적 데이터 로드 시작');
      console.log('🔐 세션 인증 확인:', {
        hasSession: !!session,
        userId: session?.user?.id
      });

      // 세션이 없으면 에러
      if (!session?.access_token) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      }

      // 현재 Supabase 세션 상태 확인
      const { data: currentSession } = await supabase.auth.getSession();
      console.log('🔍 현재 Supabase 세션 (성적):', {
        hasCurrentSession: !!currentSession?.session,
        userId: currentSession?.session?.user?.id
      });

      // 세션이 없으면 명시적으로 설정
      if (!currentSession?.session && session?.access_token && session?.refresh_token) {
        console.log('🔧 세션 설정 시도 중 (성적)...');
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        });
      }

      const { data, error } = await supabase
        .from('student_grades')
        .select(`
          *,
          students:student_id(id, full_name, grade),
          schedules:schedule_id(id, subject, teacher_name, grade)
        `)
        .order('exam_date', { ascending: false });

      if (error) throw error;

      console.log('✅ 학원생 성적 데이터 로드 성공:', data?.length || 0);
      setStudentGrades(data || []);
    } catch (error) {
      console.error('❌ 학원생 성적 데이터 불러오기 오류:', error);

      if (error.message?.includes('RLS') || error.message?.includes('policy') || error.code === '42501') {
        toast.error('권한이 없습니다. 관리자로 로그인했는지 확인해주세요.');
      } else {
        toast.error(`학원생 성적 데이터를 불러오는 데 실패했습니다: ${error.message}`);
      }
    }
  };

  return {
    students,
    setStudents,
    schedules,
    teachers,
    studentSchedules,
    studentGrades,
    loading,
    fetchData,
    fetchStudents,
    fetchSchedules,
    fetchTeachers,
    fetchStudentSchedules,
    fetchStudentGrades
  };
};

export default useStudentData;