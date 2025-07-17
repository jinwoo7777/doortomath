// src/components/admin/dashboard/instructor-management/InstructorManagementContent.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { User, BookOpen } from 'lucide-react';

import { useTeachers } from './hooks/useTeachers';
import { useSchedules } from './hooks/useSchedules';
import BranchFilter from './components/BranchFilter';
import StatisticsCards from './components/StatisticsCards';
import TeachersList from './components/TeachersList';
import TeacherForm from './components/TeacherForm';
import SchedulesView from './components/SchedulesView';

const InstructorManagementContent = () => {
  const { session, userRole, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'list');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  
  // Custom hooks
  const { 
    teachers, 
    loading: teachersLoading, 
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
    openAddDialog,
    openEditDialog,
    setIsDialogOpen,
    setSpecializationInput,
    setTeacherForm
  } = useTeachers();

  const {
    schedules,
    loading: schedulesLoading,
    fetchSchedules,
    unassignSchedule,
    assignSchedule,
    getTeacherSchedules
  } = useSchedules();

  // URL 파라미터 변경 시 activeTab 업데이트
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && (tab === 'list' || tab === 'schedules')) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // 세션 및 권한 확인 후 데이터 로드
  useEffect(() => {
    if (session?.user?.id && userRole === 'admin') {
      fetchTeachers();
      fetchSchedules();
    } else if (session?.user?.id && userRole && userRole !== 'admin') {
      toast.error('관리자 권한이 필요합니다.');
    }
  }, [session?.user?.id, userRole]);

  const handleSaveTeacher = async () => {
    const success = await saveTeacher();
    if (success) {
      setIsDialogOpen(false);
    }
  };

  const handleDeleteTeacher = async (teacher) => {
    // 담당 수업이 있는지 확인
    const teacherSchedules = getTeacherSchedules(teacher.name, teacher.branch);
    
    if (teacherSchedules.length > 0) {
      const confirmMessage = `${teacher.name} 강사는 현재 ${teacherSchedules.length}개의 수업을 담당하고 있습니다.\n정말로 삭제하시겠습니까?`;
      if (!confirm(confirmMessage)) return;
    } else {
      if (!confirm(`${teacher.name} 강사를 정말 삭제하시겠습니까?`)) return;
    }

    await deleteTeacher(teacher);
  };

  const handleUnassignSchedule = async (schedule) => {
    if (!confirm(`"${schedule.subject} (${getDayName(schedule.day_of_week)} ${schedule.time_slot})" 수업에서 강사 배정을 취소하시겠습니까?`)) {
      return;
    }
    
    const success = await unassignSchedule(schedule);
    if (success) {
      fetchSchedules();
    }
  };

  const handleAssignSchedule = async (schedule, teacher) => {
    // 지점 일치 확인
    if (schedule.branch !== teacher.branch) {
      toast.error(`강사(${getBranchName(teacher.branch)})와 수업(${getBranchName(schedule.branch)})의 지점이 다릅니다.`);
      return;
    }
    
    if (!confirm(`"${schedule.subject} (${getDayName(schedule.day_of_week)} ${schedule.time_slot})" 수업을 ${teacher.name} 강사에게 배정하시겠습니까?`)) {
      return;
    }

    const success = await assignSchedule(schedule, teacher);
    if (success) {
      fetchSchedules();
    }
  };

  const getStats = () => {
    const filteredTeachers = selectedBranch === 'all' 
      ? teachers 
      : teachers.filter(t => t.branch === selectedBranch);
    
    const activeTeachers = filteredTeachers.filter(t => t.is_active).length;
    
    const branchSchedules = selectedBranch === 'all' 
      ? schedules.filter(s => s.is_active)
      : schedules.filter(s => s.is_active && s.branch === selectedBranch);
    
    const totalSchedules = branchSchedules.length;
    const assignedSchedules = branchSchedules.filter(s => s.teacher_name).length;
    
    return {
      total: filteredTeachers.length,
      active: activeTeachers,
      totalSchedules,
      assignedSchedules,
      unassignedSchedules: totalSchedules - assignedSchedules
    };
  };

  const getDayName = (dayOfWeek) => {
    const days = ['', '월', '화', '수', '목', '금', '토', '일'];
    return days[dayOfWeek] || '';
  };

  const getBranchName = (branch) => {
    switch(branch) {
      case 'bukwirye': return '북위례';
      case 'namwirye': return '남위례';
      case 'daechi': return '대치';
      default: return '대치';
    }
  };

  // 인증 로딩 중이면 로딩 표시
  if (authLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }
  
  if (!session || userRole !== 'admin') {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <p className="text-muted-foreground">
            관리자 권한이 필요합니다. 
            {userRole && `(현재 역할: ${userRole})`}
          </p>
          {!session && <p className="text-xs text-gray-400 mt-2">세션이 없습니다.</p>}
        </div>
      </div>
    );
  }

  const filteredTeachers = selectedBranch === 'all' 
    ? teachers 
    : teachers.filter(t => t.branch === selectedBranch);

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold">강사 관리</h1>
        <p className="text-muted-foreground">강사 정보를 관리하고 수업을 배정합니다.</p>
      </div>

      {/* 탭 메뉴 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            강사 목록
          </TabsTrigger>
          <TabsTrigger value="schedules" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            수업 배정
          </TabsTrigger>
        </TabsList>

        {/* 지점 필터 */}
        <BranchFilter 
          selectedBranch={selectedBranch} 
          setSelectedBranch={setSelectedBranch}
        />

        <TabsContent value="list" className="space-y-4 mt-6">
          {/* 통계 카드 */}
          <StatisticsCards stats={getStats()} />
          
          {/* 강사 목록 */}
          <TeachersList 
            teachers={teachers}
            loading={teachersLoading}
            filteredTeachers={filteredTeachers}
            getTeacherSchedules={getTeacherSchedules}
            onAddClick={openAddDialog}
            onEditClick={openEditDialog}
            onToggleActive={toggleActive}
            onDeleteClick={handleDeleteTeacher}
            onViewSchedules={(teacher) => {
              setSelectedTeacher(teacher);
              setActiveTab('schedules');
            }}
          />
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4 mt-6">
          <SchedulesView 
            teacher={selectedTeacher}
            teachers={teachers}
            schedules={schedules}
            selectedBranch={selectedBranch}
            getTeacherSchedules={getTeacherSchedules}
            onSelectTeacher={setSelectedTeacher}
            onUnassignSchedule={handleUnassignSchedule}
            onAssignSchedule={handleAssignSchedule}
            onClearTeacher={() => setSelectedTeacher(null)}
          />
        </TabsContent>
      </Tabs>

      {/* 강사 추가/편집 다이얼로그 */}
      <TeacherForm 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        currentTeacher={currentTeacher}
        teacherForm={teacherForm}
        specializationInput={specializationInput}
        handleInputChange={handleInputChange}
        addSpecialization={addSpecialization}
        removeSpecialization={removeSpecialization}
        handleSpecializationKeyPress={handleSpecializationKeyPress}
        setTeacherForm={setTeacherForm}
        setSpecializationInput={setSpecializationInput}
        onSave={handleSaveTeacher}
      />
    </div>
  );
};

export default InstructorManagementContent;

