'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

/**
 * 학생 폼 관리를 위한 커스텀 훅
 * @param {Function} onSuccess - 성공 시 호출할 콜백 함수
 * @param {Array} students - 학생 목록
 * @param {Function} setStudents - 학생 목록 업데이트 함수
 * @returns {Object} 학생 폼 관련 상태 및 함수
 */
export const useStudentForm = (onSuccess, students, setStudents) => {
  const [currentStudent, setCurrentStudent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [studentForm, setStudentForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    parent_phone: '',
    birth_date: '',
    school: '',
    grade: '',
    school_grade: '',
    notes: '',
    is_priority: false,
    status: 'active',
    branch: 'daechi'
  });
  
  const supabase = createClientComponentClient();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStudentForm({
      ...studentForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSelectChange = (name, value) => {
    setStudentForm({
      ...studentForm,
      [name]: value
    });
  };

  const resetForm = () => {
    setStudentForm({
      full_name: '',
      email: '',
      phone: '',
      parent_phone: '',
      birth_date: '',
      school: '',
      grade: '',
      school_grade: '',
      notes: '',
      is_priority: false,
      status: 'active',
      branch: 'daechi'
    });
    setCurrentStudent(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (student) => {
    setCurrentStudent(student);
    setStudentForm({
      full_name: student.full_name || '',
      email: student.email || '',
      phone: student.phone || '',
      parent_phone: student.parent_phone || '',
      birth_date: student.birth_date || '',
      school: student.school || '',
      grade: student.grade || '',
      school_grade: student.school_grade || '',
      notes: student.notes || '',
      is_priority: student.is_priority || false,
      status: student.status || 'active',
      branch: student.branch || 'daechi'
    });
    setIsDialogOpen(true);
  };

  const handleSaveStudent = async (session) => {
    if (!studentForm.full_name.trim() || !studentForm.email.trim()) {
      toast.error('이름과 이메일을 입력해주세요.');
      return;
    }

    try {
      console.log('🔄 학원생 데이터 저장 시작:', currentStudent ? '수정' : '추가');
      console.log('🔐 세션 인증 확인:', {
        hasSession: !!session,
        userId: session?.user?.id
      });

      // 세션이 없으면 에러
      if (!session?.access_token) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      }

      const studentData = {
        full_name: studentForm.full_name.trim(),
        email: studentForm.email.trim(),
        phone: studentForm.phone.trim() || null,
        parent_phone: studentForm.parent_phone.trim() || null,
        birth_date: studentForm.birth_date || null,
        school: studentForm.school.trim() || null,
        grade: studentForm.grade || null,
        school_grade: studentForm.school_grade || null,
        notes: studentForm.notes.trim() || null,
        is_priority: studentForm.is_priority,
        status: studentForm.status,
        branch: studentForm.branch
      };

      if (currentStudent) {
        // 수정
        const { data, error } = await supabase
          .from('students')
          .update(studentData)
          .eq('id', currentStudent.id)
          .select()
          .single();

        if (error) throw error;

        setStudents(prev => prev.map(student =>
          student.id === currentStudent.id ? data : student
        ));

        console.log('✅ 학원생 정보 수정 성공:', data);
        toast.success('학원생 정보가 업데이트되었습니다.');
      } else {
        // 추가
        const { data, error } = await supabase
          .from('students')
          .insert([studentData])
          .select()
          .single();

        if (error) throw error;

        setStudents(prev => [data, ...prev]);
        console.log('✅ 새 학원생 추가 성공:', data);
        toast.success('새 학원생이 추가되었습니다.');
      }

      setIsDialogOpen(false);
      resetForm();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('❌ 학원생 저장 오류:', error);

      if (error.code === '23505') {
        toast.error('이미 등록된 이메일입니다.');
      } else if (error.message?.includes('RLS') || error.message?.includes('policy') || error.code === '42501') {
        toast.error('권한이 없습니다. 관리자로 로그인했는지 확인해주세요.');
      } else {
        toast.error(`학원생 저장에 실패했습니다: ${error.message}`);
      }
    }
  };

  const handleDeleteStudent = async (student, session) => {
    try {
      console.log('🔄 학원생 삭제 시작:', student.full_name);
      console.log('🔐 세션 인증 확인:', {
        hasSession: !!session,
        userId: session?.user?.id
      });

      // 세션이 없으면 에러
      if (!session?.access_token) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      }

      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', student.id);

      if (error) throw error;

      setStudents(prev => prev.filter(s => s.id !== student.id));
      console.log('✅ 학원생 삭제 성공:', student.full_name);
      toast.success('학원생이 삭제되었습니다.');
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('❌ 학원생 삭제 오류:', error);

      if (error.message?.includes('RLS') || error.message?.includes('policy') || error.code === '42501') {
        toast.error('권한이 없습니다. 관리자로 로그인했는지 확인해주세요.');
      } else {
        toast.error(`학원생 삭제에 실패했습니다: ${error.message}`);
      }
    }
  };

  const handleTogglePriority = async (student, session) => {
    try {
      const newStatus = !student.is_priority;
      console.log('🔄 학원생 관심관리 상태 변경 시작:', student.full_name, newStatus ? '추가' : '제거');
      console.log('🔐 세션 인증 확인:', {
        hasSession: !!session,
        userId: session?.user?.id
      });

      // 세션이 없으면 에러
      if (!session?.access_token) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      }

      const { data, error } = await supabase
        .from('students')
        .update({
          is_priority: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', student.id)
        .select()
        .single();

      if (error) throw error;

      setStudents(prev => prev.map(s => s.id === student.id ? data : s));
      console.log('✅ 학원생 관심관리 상태 변경 성공:', student.full_name, newStatus ? '추가' : '제거');
      toast.success(`${student.full_name} 학원생이 관심관리 대상에서 ${newStatus ? '추가' : '제거'}되었습니다.`);
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('❌ 학원생 관심관리 상태 변경 오류:', error);

      if (error.message?.includes('RLS') || error.message?.includes('policy') || error.code === '42501') {
        toast.error('권한이 없습니다. 관리자로 로그인했는지 확인해주세요.');
      } else {
        toast.error(`상태 변경에 실패했습니다: ${error.message}`);
      }
    }
  };

  return {
    currentStudent,
    isDialogOpen,
    setIsDialogOpen,
    studentForm,
    handleInputChange,
    handleSelectChange,
    resetForm,
    openAddDialog,
    openEditDialog,
    handleSaveStudent,
    handleDeleteStudent,
    handleTogglePriority
  };
};

export default useStudentForm;