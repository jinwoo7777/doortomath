'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/supabaseClientBrowser';

/**
 * 채점 관련 데이터를 가져오는 커스텀 훅
 * @returns {Object} 채점 관련 데이터 및 함수
 */
export const useGradingData = () => {
  const [answerKeys, setAnswerKeys] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 답안 키 데이터 조회
      const { data: answerKeysData, error: answerKeysError } = await supabase
        .from('exam_answer_keys')
        .select('*')
        .order('exam_date', { ascending: false });

      if (answerKeysError) {
        throw answerKeysError;
      }

      // 강사 데이터 조회
      const { data: teachersData, error: teachersError } = await supabase
        .from('teachers')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (teachersError) {
        throw teachersError;
      }

      // 스케줄 데이터 조회
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('schedules')
        .select('*')
        .eq('is_active', true)
        .order('subject');

      if (schedulesError) {
        throw schedulesError;
      }

      // 답안 키 데이터에 강사 정보 추가
      const enrichedAnswerKeys = (answerKeysData || []).map(key => ({
        ...key,
        teachers: teachersData?.find(t => t.id === key.teacher_id) || null,
        schedules: schedulesData?.find(s => s.id === key.schedule_id) || null
      }));

      setAnswerKeys(enrichedAnswerKeys);
      setTeachers(teachersData || []);
      setSchedules(schedulesData || []);
    } catch (err) {
      console.error('데이터 로딩 중 오류:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteAnswerKey = async (id) => {
    try {
      const { error } = await supabase
        .from('exam_answer_keys')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // 삭제 성공 시 목록에서도 제거
      setAnswerKeys(prev => prev.filter(key => key.id !== id));
      return { success: true };
    } catch (err) {
      console.error('답안 키 삭제 중 오류:', err);
      return { success: false, error: err };
    }
  };

  const addAnswerKey = (newAnswerKey) => {
    setAnswerKeys(prev => [newAnswerKey, ...prev]);
  };

  // 초기 데이터 로딩
  useEffect(() => {
    fetchData();
  }, []);

  return {
    answerKeys,
    teachers,
    schedules,
    loading,
    error,
    fetchData,
    deleteAnswerKey,
    addAnswerKey
  };
};
