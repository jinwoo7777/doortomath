// src/components/admin/dashboard/instructor-management/hooks/useSchedules.js
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/supabaseClientBrowser.js';
import { toast } from 'sonner';

export const useSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      console.log('🔄 시간표 데이터 로드 시작');

      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('day_of_week', { ascending: true });

      if (error) throw error;
      
      console.log('✅ 시간표 데이터 로드 성공:', data?.length || 0);
      setSchedules(data || []);
    } catch (error) {
      console.error('❌ 시간표 데이터 불러오기 오류:', error);
      toast.error('시간표 데이터를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const unassignSchedule = async (schedule) => {
    try {
      console.log('🔄 수업 강사 배정 취소 시작:', schedule.subject);

      const { data, error } = await supabase
        .from('schedules')
        .update({ 
          teacher_name: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', schedule.id)
        .select()
        .single();

      if (error) throw error;

      // 로컬 상태 업데이트
      setSchedules(prev => prev.map(s => s.id === schedule.id ? data : s));
      
      console.log('✅ 수업 강사 배정 취소 성공:', schedule.subject);
      toast.success('수업 강사 배정이 취소되었습니다.');
      return true;
    } catch (error) {
      console.error('❌ 수업 강사 배정 취소 오류:', error);
      
      if (error.message?.includes('RLS') || error.message?.includes('policy') || error.code === '42501') {
        toast.error('권한이 없습니다. 관리자로 로그인했는지 확인해주세요.');
      } else {
        toast.error('수업 강사 배정 취소에 실패했습니다.');
      }
      return false;
    }
  };

  const assignSchedule = async (schedule, teacher) => {
    try {
      console.log('🔄 수업 강사 배정 시작:', schedule.subject, '→', teacher.name);

      const { data, error } = await supabase
        .from('schedules')
        .update({ 
          teacher_name: teacher.name,
          updated_at: new Date().toISOString()
        })
        .eq('id', schedule.id)
        .select()
        .single();

      if (error) throw error;

      // 로컬 상태 업데이트
      setSchedules(prev => prev.map(s => s.id === schedule.id ? data : s));
      
      console.log('✅ 수업 강사 배정 성공:', schedule.subject, '→', teacher.name);
      toast.success(`${teacher.name} 강사에게 수업이 배정되었습니다.`);
      return true;
    } catch (error) {
      console.error('❌ 수업 강사 배정 오류:', error);
      
      if (error.message?.includes('RLS') || error.message?.includes('policy') || error.code === '42501') {
        toast.error('권한이 없습니다. 관리자로 로그인했는지 확인해주세요.');
      } else {
        toast.error('수업 강사 배정에 실패했습니다.');
      }
      return false;
    }
  };

  const getTeacherSchedules = (teacherName, teacherBranch) => {
    return schedules.filter(schedule => 
      schedule.teacher_name === teacherName && 
      schedule.is_active &&
      schedule.branch === teacherBranch
    );
  };

  return {
    schedules,
    loading,
    fetchSchedules,
    unassignSchedule,
    assignSchedule,
    getTeacherSchedules
  };
};
