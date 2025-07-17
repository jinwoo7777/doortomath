// src/components/admin/dashboard/instructor-management/hooks/useTeachers.js
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/supabaseClientBrowser.js';
import { toast } from 'sonner';

export const useTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: [],
    bio: '',
    education: '',
    experience_years: 0,
    profile_image_url: '',
    is_active: true,
    hire_date: '',
    branch: 'daechi'
  });
  const [specializationInput, setSpecializationInput] = useState('');

  // 디버깅용: teacherForm.specialization 변경 감지
  useEffect(() => {
    console.log('🔥 teacherForm.specialization이 변경됨:', teacherForm.specialization);
  }, [teacherForm.specialization]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      console.log('🔄 강사 목록 로드 시작');

      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('✅ 강사 목록 로드 성공:', data?.length || 0);
      setTeachers(data || []);
    } catch (error) {
      console.error('❌ 강사 목록 불러오기 오류:', error);
      
      if (error.message?.includes('RLS') || error.message?.includes('policy') || error.code === '42501') {
        toast.error('권한이 없습니다. 관리자로 로그인했는지 확인해주세요.');
      } else {
        toast.error('강사 목록을 불러오는 데 실패했습니다.');
      }
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTeacherForm({
      ...teacherForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const addSpecialization = () => {
    const newSpec = specializationInput.trim();
    if (!newSpec) return;
    
    // specialization이 배열인지 확인
    const currentSpecializations = Array.isArray(teacherForm.specialization) 
      ? teacherForm.specialization 
      : [];
    
    // 중복 체크
    if (currentSpecializations.includes(newSpec)) {
      toast.error('이미 추가된 전문분야입니다.');
      return;
    }
    
    console.log('🔄 전문분야 추가:', newSpec);
    
    setTeacherForm({
      ...teacherForm,
      specialization: [...currentSpecializations, newSpec]
    });
    setSpecializationInput('');
  };

  const removeSpecialization = (spec) => {
    console.log('🔥 removeSpecialization 함수 호출됨!');
    console.log('🔥 삭제하려는 항목:', spec, typeof spec);
    console.log('🔥 현재 teacherForm:', teacherForm);
    console.log('🔥 현재 specialization:', teacherForm.specialization, 'Type:', typeof teacherForm.specialization);
    
    // specialization이 배열인지 확인
    const currentSpecializations = Array.isArray(teacherForm.specialization) 
      ? teacherForm.specialization 
      : [];
    
    console.log('🔥 현재 배열:', currentSpecializations);
    console.log('🔥 배열 길이:', currentSpecializations.length);
    
    const updatedSpecializations = currentSpecializations.filter(s => {
      const isEqual = s === spec;
      const shouldKeep = s !== spec;
      console.log(`🔥 비교중: "${s}" === "${spec}" = ${isEqual}, 유지여부: ${shouldKeep}`);
      return shouldKeep;
    });
    
    console.log('🔥 삭제 후 배열:', updatedSpecializations);
    console.log('🔥 삭제 후 배열 길이:', updatedSpecializations.length);
    
    // React의 함수형 업데이트를 사용하여 최신 상태를 보장
    setTeacherForm(prevForm => {
      const newForm = {
        ...prevForm,
        specialization: updatedSpecializations
      };
      console.log('🔥 setTeacherForm 호출 - 이전 form:', prevForm);
      console.log('🔥 setTeacherForm 호출 - 새로운 form:', newForm);
      return newForm;
    });
    
    // 상태 변경 확인을 위한 약간의 지연 후 로그
    setTimeout(() => {
      console.log('🔥 1초 후 콜백 확인 - 삭제 완료되었는지 확인');
    }, 1000);
  };

  const handleSpecializationKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSpecialization();
    }
  };

  const saveTeacher = async () => {
    if (!teacherForm.name.trim()) {
      toast.error('강사 이름을 입력해주세요.');
      return false;
    }

    try {
      const teacherData = {
        name: teacherForm.name.trim(),
        email: teacherForm.email.trim() || null,
        phone: teacherForm.phone.trim() || null,
        specialization: teacherForm.specialization,
        bio: teacherForm.bio.trim() || null,
        education: teacherForm.education.trim() || null,
        experience_years: parseInt(teacherForm.experience_years) || 0,
        profile_image_url: teacherForm.profile_image_url.trim() || null,
        is_active: teacherForm.is_active,
        hire_date: teacherForm.hire_date || null,
        branch: teacherForm.branch || 'daechi'
      };

      console.log('🔄 강사 데이터 저장 시작:', currentTeacher ? '수정' : '추가');

      if (currentTeacher) {
        // 수정
        const { data, error } = await supabase
          .from('teachers')
          .update(teacherData)
          .eq('id', currentTeacher.id)
          .select()
          .single();

        if (error) throw error;

        setTeachers(prev => prev.map(teacher => 
          teacher.id === currentTeacher.id ? data : teacher
        ));

        console.log('✅ 강사 정보 수정 성공:', data);
        toast.success('강사 정보가 업데이트되었습니다.');
      } else {
        // 추가
        const { data, error } = await supabase
          .from('teachers')
          .insert([teacherData])
          .select()
          .single();

        if (error) throw error;

        setTeachers(prev => [data, ...prev]);
        console.log('✅ 새 강사 추가 성공:', data);
        toast.success('새 강사가 추가되었습니다.');
      }

      return true;
    } catch (error) {
      console.error('❌ 강사 저장 오류:', error);
      
      if (error.code === '23505') {
        toast.error('이미 등록된 이메일입니다.');
      } else if (error.message?.includes('RLS') || error.message?.includes('policy') || error.code === '42501') {
        toast.error('권한이 없습니다. 관리자로 로그인했는지 확인해주세요.');
      } else {
        toast.error(`강사 저장에 실패했습니다: ${error.message}`);
      }
      return false;
    }
  };

  const deleteTeacher = async (teacher) => {
    try {
      console.log('🔄 강사 삭제 시작:', teacher.name);

      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', teacher.id);

      if (error) throw error;

      setTeachers(prev => prev.filter(t => t.id !== teacher.id));
      console.log('✅ 강사 삭제 성공:', teacher.name);
      toast.success('강사가 삭제되었습니다.');
      return true;
    } catch (error) {
      console.error('❌ 강사 삭제 오류:', error);
      
      if (error.message?.includes('RLS') || error.message?.includes('policy') || error.code === '42501') {
        toast.error('권한이 없습니다. 관리자로 로그인했는지 확인해주세요.');
      } else {
        toast.error('강사 삭제에 실패했습니다.');
      }
      return false;
    }
  };

  const toggleActive = async (teacher) => {
    try {
      const newStatus = !teacher.is_active;
      console.log('🔄 강사 상태 변경 시작:', teacher.name, newStatus ? '활성화' : '비활성화');

      const { data, error } = await supabase
        .from('teachers')
        .update({ 
          is_active: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', teacher.id)
        .select()
        .single();

      if (error) throw error;

      setTeachers(prev => prev.map(t => t.id === teacher.id ? data : t));
      console.log('✅ 강사 상태 변경 성공:', teacher.name, newStatus ? '활성화' : '비활성화');
      toast.success(`강사가 ${newStatus ? '활성화' : '비활성화'}되었습니다.`);
      return true;
    } catch (error) {
      console.error('❌ 강사 상태 변경 오류:', error);
      
      if (error.message?.includes('RLS') || error.message?.includes('policy') || error.code === '42501') {
        toast.error('권한이 없습니다. 관리자로 로그인했는지 확인해주세요.');
      } else {
        toast.error('상태 변경에 실패했습니다.');
      }
      return false;
    }
  };

  const resetForm = () => {
    setTeacherForm({
      name: '',
      email: '',
      phone: '',
      specialization: [],
      bio: '',
      education: '',
      experience_years: 0,
      profile_image_url: '',
      is_active: true,
      hire_date: '',
      branch: 'daechi'
    });
    setSpecializationInput('');
    setCurrentTeacher(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (teacher) => {
    console.log('🔄 강사 수정 모달 열기:', teacher);
    console.log('강사 specialization:', teacher.specialization, typeof teacher.specialization);
    
    setCurrentTeacher(teacher);
    setTeacherForm({
      name: teacher.name || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      specialization: Array.isArray(teacher.specialization) ? teacher.specialization : [],
      bio: teacher.bio || '',
      education: teacher.education || '',
      experience_years: teacher.experience_years || 0,
      profile_image_url: teacher.profile_image_url || '',
      is_active: teacher.is_active !== false,
      hire_date: teacher.hire_date || '',
      branch: teacher.branch || 'daechi'
    });
    setIsDialogOpen(true);
  };

  return {
    teachers,
    loading,
    currentTeacher,
    teacherForm,
    specializationInput,
    isDialogOpen,
    fetchTeachers,
    handleInputChange,
    addSpecialization,
    removeSpecialization,
    handleSpecializationKeyPress,
    saveTeacher,
    deleteTeacher,
    toggleActive,
    resetForm,
    openAddDialog,
    openEditDialog,
    setIsDialogOpen,
    setSpecializationInput,
    setTeacherForm
  };
};
