'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

/**
 * 학생 시험 성적 관리를 위한 커스텀 훅
 * @param {Object} student - 학생 정보
 * @param {boolean} isOpen - 모달 열림 상태
 * @param {Object} externalData - 외부에서 공유되는 데이터
 * @param {Function} onDataUpdate - 데이터 업데이트 콜백
 * @returns {Object} 시험 성적 관련 상태 및 함수
 */
export const useExamScores = (student, isOpen, externalData = null, onDataUpdate = null) => {
  const [examScores, setExamScores] = useState([]);
  const [examSessions, setExamSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [activeTab, setActiveTab] = useState('scores');
  const [mounted, setMounted] = useState(false);
  const supabase = createClientComponentClient();

  // 컴포넌트가 마운트되었는지 확인
  useEffect(() => {
    setMounted(true);
  }, []);

  // 외부 데이터 동기화
  useEffect(() => {
    if (externalData && externalData.examScores && externalData.examSessions) {
      setExamScores(externalData.examScores);
      setExamSessions(externalData.examSessions);
      setLoading(false);
    } else if (isOpen && student && mounted) {
      fetchExamData();
    }
  }, [isOpen, student, mounted, externalData]);

  const fetchExamData = async () => {
    if (!student?.id) {
      console.error('학생 ID가 없습니다.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // 1. 기존 성적 데이터 조회 (student_grades) - 스케줄과 조인
      const { data: gradesData, error: gradesError } = await supabase
        .from('student_grades')
        .select(`
          *,
          schedules (
            subject,
            teacher_name,
            grade,
            time_slot
          )
        `)
        .eq('student_id', student.id)
        .order('exam_date', { ascending: false });

      if (gradesError) {
        console.error('성적 데이터 조회 오류:', gradesError);
        throw gradesError;
      }

      // 2. 자동 채점 시스템 결과 조회 (student_answer_submissions) - exam_answer_keys와 조인
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('student_answer_submissions')
        .select(`
          *,
          exam_answer_keys (
            exam_title,
            exam_type,
            exam_date,
            subject,
            total_score,
            teacher_id,
            teachers (
              name
            )
          )
        `)
        .eq('student_id', student.id)
        .order('submitted_at', { ascending: false });

      if (submissionsError) {
        console.error('자동 채점 데이터 조회 오류:', submissionsError);
        throw submissionsError;
      }

      // 3. 시험 세션 데이터 조회 (완료되지 않은 시험 포함) - exam_answer_keys와 조인
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('student_answer_sessions')
        .select(`
          *,
          exam_answer_keys (
            exam_title,
            exam_type,
            exam_date,
            subject,
            total_score,
            teacher_id,
            teachers (
              name
            )
          )
        `)
        .eq('student_id', student.id)
        .order('started_at', { ascending: false });

      if (sessionsError) {
        console.error('시험 세션 데이터 조회 오류:', sessionsError);
        throw sessionsError;
      }

      // 데이터 설정 및 로깅
      const newExamScores = gradesData || [];
      const newExamSessions = submissionsData || [];
      
      setExamScores(newExamScores);
      setExamSessions(newExamSessions);
      
      // 외부에 데이터 업데이트 알림
      if (onDataUpdate) {
        onDataUpdate(newExamScores, newExamSessions);
      }
      
      console.log('데이터 로딩 성공:', {
        gradesCount: gradesData?.length || 0,
        submissionsCount: submissionsData?.length || 0,
        sessionsCount: sessionsData?.length || 0,
        studentId: student.id
      });
      
    } catch (error) {
      console.error('시험 데이터 로딩 오류:', error);
      toast.error(`시험 데이터를 불러오는 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  const getSubjects = () => {
    const subjects = new Set();
    examScores.forEach(score => {
      if (score.schedules?.subject) {
        subjects.add(score.schedules.subject);
      }
    });
    examSessions.forEach(session => {
      if (session.exam_answer_keys?.subject) {
        subjects.add(session.exam_answer_keys.subject);
      }
    });
    return Array.from(subjects);
  };

  const filteredScores = examScores.filter(score => {
    if (selectedSubject !== 'all' && score.schedules?.subject !== selectedSubject) return false;
    if (selectedPeriod !== 'all') {
      const examDate = new Date(score.exam_date);
      const now = new Date();
      const monthsAgo = parseInt(selectedPeriod);
      const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
      if (examDate < cutoffDate) return false;
    }
    return true;
  });

  const filteredSessions = examSessions.filter(session => {
    if (selectedSubject !== 'all' && session.exam_answer_keys?.subject !== selectedSubject) return false;
    if (selectedPeriod !== 'all') {
      const examDate = new Date(session.exam_answer_keys?.exam_date);
      const now = new Date();
      const monthsAgo = parseInt(selectedPeriod);
      const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
      if (examDate < cutoffDate) return false;
    }
    return true;
  });

  const getAverageScore = () => {
    if (!mounted || filteredScores.length === 0) return 0;
    const total = filteredScores.reduce((sum, score) => sum + (score.score || 0), 0);
    return Math.round(total / filteredScores.length);
  };

  const getRecentTrend = () => {
    if (!mounted || filteredScores.length < 2) return null;
    const recent = filteredScores.slice(0, 2);
    const current = recent[0]?.score || 0;
    const previous = recent[1]?.score || 0;
    const diff = current - previous;
    return { current, previous, diff };
  };

  return {
    examScores,
    examSessions,
    loading,
    selectedSubject,
    setSelectedSubject,
    selectedPeriod,
    setSelectedPeriod,
    activeTab,
    setActiveTab,
    mounted,
    getSubjects,
    filteredScores,
    filteredSessions,
    getAverageScore,
    getRecentTrend
  };
};

export default useExamScores;