// src/components/admin/dashboard/schedule-management/hooks/useScheduleManagement.js
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  fetchAllSchedulesForAdmin,
  addSchedule,
  updateSchedule,
  deleteSchedule,
  toggleScheduleActive
} from '@/lib/supabase/fetchSchedules';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const useScheduleManagement = (branch = 'daechi') => {
  const [schedules, setSchedules] = useState({
    초등부: [],
    중등부: [],
    고등부: []
  });
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [activeTab, setActiveTab] = useState('초등부');
  const [scheduleForm, setScheduleForm] = useState({
    grade: '초등부',
    day_of_week: 1,
    time_slot: '',
    subject: '',
    teacher_name: '',
    classroom: '',
    description: '',
    max_students: 30,
    current_students: 0,
    is_active: true,
    price: 0,
    price_period: 'monthly',
    branch: branch
  });
  
  const supabase = createClientComponentClient();

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      console.log('🔄 시간표 로드 시작:', { branch });
      
      // 직접 Supabase 쿼리로 테스트
      const testQuery = await supabase
        .from('schedules')
        .select('*')
        .eq('branch', branch);
      
      console.log('🧪 직접 쿼리 테스트:', {
        branch,
        testDataLength: testQuery.data?.length || 0,
        testError: testQuery.error?.message || null,
        testSample: testQuery.data?.slice(0, 3) || []
      });
      
      const [elementary, middle, high] = await Promise.all([
        fetchAllSchedulesForAdmin('초등부', branch),
        fetchAllSchedulesForAdmin('중등부', branch),
        fetchAllSchedulesForAdmin('고등부', branch)
      ]);

      console.log('📊 Raw 데이터:', {
        elementary: elementary?.length || 0,
        middle: middle?.length || 0,
        high: high?.length || 0,
        elementaryData: elementary,
        middleData: middle,
        highData: high
      });

      setSchedules({
        초등부: elementary || [],
        중등부: middle || [],
        고등부: high || []
      });
      
      console.log('✅ 시간표 로드 성공:', {
        초등부: elementary?.length || 0,
        중등부: middle?.length || 0,
        고등부: high?.length || 0,
        지점: branch
      });
    } catch (error) {
      console.error('❌ 시간표 불러오기 오류:', error);
      toast.error('시간표를 불러오는 데 실패했습니다.');
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setScheduleForm({
      ...scheduleForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSelectChange = (name, value) => {
    setScheduleForm({
      ...scheduleForm,
      [name]: value
    });
  };

  const handleAddEditSchedule = async () => {
    if (!scheduleForm.subject.trim() || !scheduleForm.time_slot.trim()) {
      toast.error('과목명과 시간을 입력해주세요.');
      return;
    }

    try {
      const teacherName = scheduleForm.teacher_name === 'unassigned' ? null : scheduleForm.teacher_name.trim();

      if (currentSchedule) {
        // 수정
        const updated = await updateSchedule(currentSchedule.id, {
          grade: scheduleForm.grade,
          day_of_week: scheduleForm.day_of_week,
          time_slot: scheduleForm.time_slot.trim(),
          subject: scheduleForm.subject.trim(),
          teacher_name: teacherName,
          classroom: scheduleForm.classroom.trim() || null,
          description: scheduleForm.description.trim() || null,
          max_students: parseInt(scheduleForm.max_students) || 30,
          current_students: parseInt(scheduleForm.current_students) || 0,
          is_active: scheduleForm.is_active,
          price: parseFloat(scheduleForm.price) || 0,
          price_period: scheduleForm.price_period,
          branch: scheduleForm.branch
        });

        setSchedules(prev => ({
          ...prev,
          [scheduleForm.grade]: prev[scheduleForm.grade].map(item => 
            item.id === currentSchedule.id ? updated : item
          )
        }));

        toast.success('시간표가 업데이트되었습니다.');
      } else {
        // 추가
        const newSchedule = await addSchedule({
          grade: scheduleForm.grade,
          day_of_week: scheduleForm.day_of_week,
          time_slot: scheduleForm.time_slot.trim(),
          subject: scheduleForm.subject.trim(),
          teacher_name: teacherName,
          classroom: scheduleForm.classroom.trim() || null,
          description: scheduleForm.description.trim() || null,
          max_students: parseInt(scheduleForm.max_students) || 30,
          current_students: parseInt(scheduleForm.current_students) || 0,
          is_active: scheduleForm.is_active,
          price: parseFloat(scheduleForm.price) || 0,
          price_period: scheduleForm.price_period,
          branch: scheduleForm.branch
        });

        setSchedules(prev => ({
          ...prev,
          [scheduleForm.grade]: [...prev[scheduleForm.grade], newSchedule]
            .sort((a, b) => {
              if (a.day_of_week !== b.day_of_week) {
                return a.day_of_week - b.day_of_week;
              }
              return a.time_slot.localeCompare(b.time_slot);
            })
        }));

        toast.success('새 시간표가 추가되었습니다.');
      }

      setIsDialogOpen(false);
      resetForm();
      return true;
    } catch (error) {
      console.error('❌ 시간표 저장 오류:', error);
      toast.error(`시간표 저장에 실패했습니다: ${error.message}`);
      return false;
    }
  };

  const resetForm = () => {
    setScheduleForm({
      grade: activeTab,
      day_of_week: 1,
      time_slot: '',
      subject: '',
      teacher_name: 'unassigned',
      classroom: '',
      description: '',
      max_students: 30,
      current_students: 0,
      is_active: true,
      price: 0,
      price_period: 'monthly',
      branch: branch
    });
    setCurrentSchedule(null);
  };

  const handleDeleteSchedule = async (schedule) => {
    if (!confirm(`"${schedule.subject} (${getDayName(schedule.day_of_week)} ${schedule.time_slot})" 시간표를 정말 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteSchedule(schedule.id);
      
      setSchedules(prev => ({
        ...prev,
        [schedule.grade]: prev[schedule.grade].filter(item => item.id !== schedule.id)
      }));

      toast.success('시간표가 삭제되었습니다.');
    } catch (error) {
      console.error('❌ 시간표 삭제 오류:', error);
      toast.error('시간표 삭제에 실패했습니다.');
    }
  };

  const handleToggleActive = async (schedule) => {
    try {
      const updated = await toggleScheduleActive(schedule.id, !schedule.is_active);
      
      setSchedules(prev => ({
        ...prev,
        [schedule.grade]: prev[schedule.grade].map(item => 
          item.id === schedule.id ? updated : item
        )
      }));

      toast.success(`시간표가 ${!schedule.is_active ? '활성화' : '비활성화'}되었습니다.`);
    } catch (error) {
      console.error('❌ 시간표 활성화 토글 오류:', error);
      toast.error('상태 변경에 실패했습니다.');
    }
  };

  const openAddDialog = (grade = activeTab) => {
    resetForm();
    setScheduleForm(prev => ({ ...prev, grade, branch }));
    setIsDialogOpen(true);
  };

  const openEditDialog = (schedule) => {
    setCurrentSchedule(schedule);
    setScheduleForm({
      grade: schedule.grade,
      day_of_week: schedule.day_of_week,
      time_slot: schedule.time_slot || '',
      subject: schedule.subject || '',
      teacher_name: schedule.teacher_name || 'unassigned',
      classroom: schedule.classroom || '',
      description: schedule.description || '',
      max_students: schedule.max_students || 30,
      current_students: schedule.current_students || 0,
      is_active: schedule.is_active !== false,
      price: schedule.price || 0,
      price_period: schedule.price_period || 'monthly',
      branch: schedule.branch || branch
    });
    setIsDialogOpen(true);
  };

  useEffect(() => {
    fetchSchedules();
  }, [branch]);

  // 외부에서 호출할 수 있는 새로고침 함수
  const refreshSchedules = () => {
    fetchSchedules();
  };

  return {
    schedules,
    loading,
    isDialogOpen,
    currentSchedule,
    activeTab,
    scheduleForm,
    setActiveTab,
    setIsDialogOpen,
    handleInputChange,
    handleSelectChange,
    handleAddEditSchedule,
    handleDeleteSchedule,
    handleToggleActive,
    openAddDialog,
    openEditDialog,
    resetForm,
    refreshSchedules
  };
};

export const getDayName = (dayOfWeek) => {
  const days = ['', '월', '화', '수', '목', '금', '토', '일'];
  return days[dayOfWeek] || '';
};
