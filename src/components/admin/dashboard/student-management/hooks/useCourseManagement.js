'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

/**
 * 학생 수강 강의 관리를 위한 커스텀 훅
 * @param {Object} student - 학생 정보
 * @param {Function} onUpdate - 업데이트 후 호출할 콜백 함수
 * @returns {Object} 수강 강의 관리 관련 상태 및 함수
 */
const useCourseManagement = (student, onUpdate) => {
  const [studentCourses, setStudentCourses] = useState([]);
  const [availableSchedules, setAvailableSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [enrollmentNotes, setEnrollmentNotes] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (student) {
      fetchStudentCourses();
      // 학생의 지점을 기본값으로 설정
      if (student.branch) {
        setSelectedBranch(student.branch);
      }
    }
  }, [student]);

  useEffect(() => {
    if (selectedBranch) {
      fetchAvailableSchedules(selectedBranch);
    }
  }, [selectedBranch]);

  const handleBranchChange = (branch) => {
    setSelectedBranch(branch);
    setSelectedSchedule(''); // 지점 변경 시 선택된 강의 초기화
  };

  const fetchStudentCourses = async () => {
    if (!student?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
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
            max_students,
            current_students,
            branch
          )
        `)
        .eq('student_id', student.id)
        .eq('status', 'active');

      if (error) throw error;
      setStudentCourses(data || []);
    } catch (error) {
      console.error('Error fetching student courses:', error);
      toast.error('수강 중인 강의 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSchedules = async (branch = null) => {
    try {
      // 비활성화된 수업도 포함하여 모든 수업을 가져옵니다
      let query = supabase
        .from('schedules')
        .select('*');
      
      if (branch) {
        query = query.eq('branch', branch);
      }
      
      const { data, error } = await query
        .order('is_active', { ascending: false }) // 활성화된 수업을 먼저 표시
        .order('grade', { ascending: true })
        .order('day_of_week', { ascending: true })
        .order('time_slot', { ascending: true });

      if (error) throw error;
      setAvailableSchedules(data || []);
    } catch (error) {
      console.error('Error fetching available schedules:', error);
      toast.error('이용 가능한 강의 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleAddCourse = async () => {
    if (!selectedSchedule) {
      toast.error('강의를 선택해주세요.');
      return;
    }

    try {
      setLoading(true);
      
      // 이미 수강 중인 강의인지 확인
      const existingCourse = studentCourses.find(
        course => course.schedule_id === selectedSchedule
      );
      
      if (existingCourse) {
        toast.error('이미 수강 중인 강의입니다.');
        return;
      }

      const { error } = await supabase
        .from('student_enrollments')
        .insert({
          student_id: student.id,
          schedule_id: selectedSchedule,
          start_date: new Date().toISOString().split('T')[0],
          enrollment_date: new Date().toISOString().split('T')[0],
          status: 'active',
          payment_status: 'pending',
          monthly_fee: 350000, // 기본 수강료 설정
          notes: enrollmentNotes || null
        });

      if (error) throw error;

      // 스케줄의 현재 학생 수 증가
      const schedule = availableSchedules.find(s => s.id === selectedSchedule);
      if (schedule) {
        await supabase
          .from('schedules')
          .update({ current_students: schedule.current_students + 1 })
          .eq('id', selectedSchedule);
      }

      toast.success('강의가 성공적으로 추가되었습니다.');
      setIsAddingCourse(false);
      setSelectedSchedule('');
      setEnrollmentNotes('');
      fetchStudentCourses();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error adding course:', error);
      toast.error('강의 추가에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCourse = async (courseId, scheduleId) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('student_enrollments')
        .delete()
        .eq('id', courseId);

      if (error) throw error;

      // 스케줄의 현재 학생 수 감소
      const schedule = availableSchedules.find(s => s.id === scheduleId);
      if (schedule && schedule.current_students > 0) {
        await supabase
          .from('schedules')
          .update({ current_students: schedule.current_students - 1 })
          .eq('id', scheduleId);
      }

      toast.success('강의가 성공적으로 제거되었습니다.');
      fetchStudentCourses();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error removing course:', error);
      toast.error('강의 제거에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourseStatus = async (courseId, newStatus) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('student_enrollments')
        .update({ status: newStatus })
        .eq('id', courseId);

      if (error) throw error;

      toast.success('강의 상태가 성공적으로 업데이트되었습니다.');
      fetchStudentCourses();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating course status:', error);
      toast.error('강의 상태 업데이트에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourseNotes = async (courseId, notes) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('student_enrollments')
        .update({ notes: notes })
        .eq('id', courseId);

      if (error) throw error;

      toast.success('수강 메모가 성공적으로 업데이트되었습니다.');
      fetchStudentCourses();
      setEditingCourse(null);
    } catch (error) {
      console.error('Error updating course notes:', error);
      toast.error('수강 메모 업데이트에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 이미 수강 중인 강의는 제외한 필터링된 강의 목록
  const filteredAvailableSchedules = availableSchedules.filter(schedule => {
    return !studentCourses.some(course => course.schedule_id === schedule.id);
  });

  return {
    studentCourses,
    setStudentCourses,
    availableSchedules,
    loading,
    editingCourse,
    setEditingCourse,
    isAddingCourse,
    setIsAddingCourse,
    selectedSchedule,
    setSelectedSchedule,
    enrollmentNotes,
    setEnrollmentNotes,
    selectedBranch,
    handleBranchChange,
    fetchStudentCourses,
    fetchAvailableSchedules,
    handleAddCourse,
    handleRemoveCourse,
    handleUpdateCourseStatus,
    handleUpdateCourseNotes,
    filteredAvailableSchedules
  };
};

export default useCourseManagement;