// src/components/admin/dashboard/schedule-management/ScheduleManagementContent.jsx
"use client";

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';

import { useScheduleManagement } from './hooks/useScheduleManagement';
import { useTeachers } from './hooks/useTeachers';
import { getBranchName, getStats } from './utils/scheduleUtils';
import ScheduleStats from './components/ScheduleStats';
import ScheduleTable from './components/ScheduleTable';
import ScheduleForm from './components/ScheduleForm';
import GradeSection from './components/GradeSection';

const ScheduleManagementContent = ({ branch = 'daechi' }) => {
  const {
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
    openEditDialog
  } = useScheduleManagement(branch);

  const { teachers } = useTeachers();
  const searchParams = useSearchParams();
  const selectedGrade = searchParams.get('grade');

  // URL 파라미터 변경 시 activeTab 업데이트
  useEffect(() => {
    const initialGrade = searchParams.get('grade');
    if (initialGrade && ['초등부', '중등부', '고등부'].includes(initialGrade)) {
      setActiveTab(initialGrade);
    }
  }, [searchParams, setActiveTab]);

  const renderTabView = () => {
    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="초등부">초등부</TabsTrigger>
          <TabsTrigger value="중등부">중등부</TabsTrigger>
          <TabsTrigger value="고등부">고등부</TabsTrigger>
        </TabsList>

        {['초등부', '중등부', '고등부'].map((grade) => {
          const gradeStats = getStats(schedules[grade]);
          
          return (
            <TabsContent key={grade} value={grade} className="space-y-4">
              {/* 통계 카드 */}
              <ScheduleStats stats={gradeStats} />

              {/* 시간표 테이블 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{grade} 시간표</CardTitle>
                    <Button 
                      variant="outline" 
                      onClick={() => openAddDialog(grade)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      시간표 추가
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScheduleTable
                    schedules={schedules[grade]}
                    grade={grade}
                    onEdit={openEditDialog}
                    onDelete={handleDeleteSchedule}
                    onToggleActive={handleToggleActive}
                    onAdd={openAddDialog}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    );
  };

  const renderAllGradesView = () => {
    return (
      <div className="space-y-8">
        {['초등부', '중등부', '고등부'].map((grade) => {
          const gradeStats = getStats(schedules[grade]);
          
          return (
            <GradeSection
              key={grade}
              grade={grade}
              schedules={schedules[grade]}
              stats={gradeStats}
              onAddClick={openAddDialog}
              onEditClick={openEditDialog}
              onDeleteClick={handleDeleteSchedule}
              onToggleActive={handleToggleActive}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {selectedGrade ? `${getBranchName(branch)} ${selectedGrade} 시간표 관리` : `${getBranchName(branch)} 수업시간표 관리`}
          </h2>
          <p className="text-muted-foreground">
            {selectedGrade 
              ? `${getBranchName(branch)} 지점 ${selectedGrade} 수업시간표를 생성, 편집, 관리합니다.`
              : `${getBranchName(branch)} 지점의 학년별 수업시간표를 생성, 편집, 관리합니다.`
            }
          </p>
        </div>
        <Button onClick={() => openAddDialog()} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          새 시간표 추가
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner text="시간표를 불러오는 중..." />
      ) : selectedGrade ? renderTabView() : renderAllGradesView()}

      {/* 추가/편집 다이얼로그 */}
      <ScheduleForm
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        currentSchedule={currentSchedule}
        scheduleForm={scheduleForm}
        teachers={teachers}
        onInputChange={handleInputChange}
        onSelectChange={handleSelectChange}
        onSubmit={handleAddEditSchedule}
      />
    </div>
  );
};

export default ScheduleManagementContent;
