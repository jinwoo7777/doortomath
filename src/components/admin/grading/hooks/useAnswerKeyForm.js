'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/supabaseClientBrowser';

/**
 * 답안 키 폼 관리를 위한 커스텀 훅
 * @param {Object} initialData - 초기 데이터 (수정 시)
 * @param {Function} onSave - 저장 완료 후 콜백 함수
 * @param {Function} onBack - 뒤로 가기 콜백 함수
 * @returns {Object} 폼 관련 상태 및 함수
 */
export const useAnswerKeyForm = (initialData = null, onSave, onBack) => {
  const [formData, setFormData] = useState({
    exam_date: '',
    subject: '',
    teacher_id: '',
    schedule_id: '',
    exam_type: 'regular',
    exam_title: '',
    exam_description: '',
    total_score: 100,
    answers: []
  });

  const [teachers, setTeachers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 초기 데이터 설정 및 교사/스케줄 데이터 로딩
  useEffect(() => {
    fetchTeachersAndSchedules();
    if (initialData) {
      setFormData({
        ...initialData,
        exam_date: initialData.exam_date || '',
        subject: initialData.subject || '',
        teacher_id: initialData.teacher_id || '',
        schedule_id: initialData.schedule_id || '',
        exam_type: initialData.exam_type || 'regular',
        exam_title: initialData.exam_title || '',
        exam_description: initialData.exam_description || '',
        total_score: initialData.total_score || 100,
        answers: (initialData.answers || []).map(answer => ({
          ...answer,
          question: answer.question || 1,
          answer: answer.answer || '',
          score: answer.score || 5,
          description: answer.description || ''
        }))
      });
    }
  }, [initialData]);

  // 교사 및 스케줄 데이터 로딩
  const fetchTeachersAndSchedules = async () => {
    try {
      const [teachersResult, schedulesResult] = await Promise.all([
        supabase.from('teachers').select('*').eq('is_active', true).order('name'),
        supabase.from('schedules').select('*').eq('is_active', true).order('subject')
      ]);

      setTeachers(teachersResult.data || []);
      setSchedules(schedulesResult.data || []);
    } catch (error) {
      console.error('데이터 로딩 중 오류:', error);
    }
  };

  // 입력 필드 변경 처리
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === null ? '' : value
    }));
    
    // 에러 메시지 초기화
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // 답안 필드 변경 처리
  const handleAnswerChange = (index, field, value) => {
    const newAnswers = [...formData.answers];
    newAnswers[index] = {
      ...newAnswers[index],
      [field]: value === null ? '' : value
    };
    
    setFormData(prev => ({
      ...prev,
      answers: newAnswers
    }));
  };

  // 답안 추가
  const addAnswer = () => {
    setFormData(prev => ({
      ...prev,
      answers: [
        ...prev.answers,
        {
          question: prev.answers.length + 1,
          answer: '',
          score: 5,
          description: ''
        }
      ]
    }));
  };

  // 답안 제거
  const removeAnswer = (index) => {
    setFormData(prev => ({
      ...prev,
      answers: prev.answers.filter((_, i) => i !== index)
    }));
  };

  // 폼 유효성 검사
  const validateForm = () => {
    const newErrors = {};

    if (!formData.exam_date) newErrors.exam_date = '시험 날짜를 선택하세요';
    if (!formData.subject) newErrors.subject = '과목을 입력하세요';
    if (!formData.teacher_id) newErrors.teacher_id = '강사를 선택하세요';
    if (!formData.schedule_id) newErrors.schedule_id = '스케줄을 선택하세요';
    if (!formData.exam_title) newErrors.exam_title = '시험 제목을 입력하세요';
    if (formData.answers.length === 0) newErrors.answers = '최소 1개의 문제를 추가하세요';

    // 답안 유효성 검사
    const answerErrors = [];
    formData.answers.forEach((answer, index) => {
      if (!answer.answer.trim()) {
        answerErrors.push(`${index + 1}번 문제의 답을 입력하세요`);
      }
      if (answer.score <= 0) {
        answerErrors.push(`${index + 1}번 문제의 점수는 0보다 커야 합니다`);
      }
    });

    if (answerErrors.length > 0) {
      newErrors.answers = answerErrors.join(', ');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // 사용자 인증 확인
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      // 데이터 준비 (created_at과 updated_at 제거)
      const insertData = {
        exam_date: formData.exam_date,
        subject: formData.subject,
        teacher_id: formData.teacher_id,
        schedule_id: formData.schedule_id,
        exam_type: formData.exam_type,
        exam_title: formData.exam_title,
        exam_description: formData.exam_description,
        total_score: formData.total_score,
        answers: formData.answers
      };
      
      const { data, error } = await supabase
        .from('exam_answer_keys')
        .insert([insertData])
        .select();

      if (error) {
        throw new Error(error.message || '데이터베���스 오류가 발생했습니다.');
      }

      alert('답안 키가 성공적으로 저장되었습니다!');
      onSave?.(data[0]);
      onBack?.();
    } catch (error) {
      console.error('답안 키 저장 중 오류:', error);
      alert(error.message || '답안 키 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 엑셀 데이터 처리
  const handleExcelDataParsed = (excelData) => {
    const newAnswers = excelData.map((item) => ({
      question: item.question,
      answer: item.answer,
      score: item.score,
      description: item.description || ''
    }));
    
    // 기존 답안이 있다면 확인
    if (formData.answers.length > 0) {
      if (confirm('기존 답안을 모두 삭제하고 새로운 답안으로 대체하시겠습니까?')) {
        setFormData(prev => ({
          ...prev,
          answers: newAnswers,
          total_score: newAnswers.reduce((sum, answer) => sum + answer.score, 0)
        }));
      } else {
        // 기존 답안에 추가
        setFormData(prev => ({
          ...prev,
          answers: [...prev.answers, ...newAnswers],
          total_score: [...prev.answers, ...newAnswers].reduce((sum, answer) => sum + answer.score, 0)
        }));
      }
    } else {
      // 기존 답안이 없으면 바로 추가
      setFormData(prev => ({
        ...prev,
        answers: newAnswers,
        total_score: newAnswers.reduce((sum, answer) => sum + answer.score, 0)
      }));
    }
  };

  // 총점 계산
  const calculateTotalScore = () => {
    return formData.answers.reduce((sum, answer) => sum + (answer.score || 0), 0);
  };

  // 강사 ID에 따른 필터링된 스케줄 목록
  const filteredSchedules = schedules.filter(schedule => 
    !formData.teacher_id || schedule.teacher_name === teachers.find(t => t.id === formData.teacher_id)?.name
  );

  return {
    formData,
    teachers,
    schedules,
    filteredSchedules,
    loading,
    errors,
    handleInputChange,
    handleAnswerChange,
    addAnswer,
    removeAnswer,
    handleSubmit,
    handleExcelDataParsed,
    calculateTotalScore
  };
};
