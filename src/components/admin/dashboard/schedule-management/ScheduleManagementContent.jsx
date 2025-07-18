// src/components/admin/dashboard/schedule-management/ScheduleManagementContent.jsx
"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, ExternalLink, Upload } from 'lucide-react';

import { useScheduleManagement } from './hooks/useScheduleManagement';
import { useTeachers } from './hooks/useTeachers';
import { useExcelUpload } from './hooks/useExcelUpload';
import { getBranchName, getStats } from './utils/scheduleUtils';
import ScheduleStats from './components/ScheduleStats';
import ScheduleTable from './components/ScheduleTable';
import ScheduleForm from './components/ScheduleForm';
import GradeSection from './components/GradeSection';
import SchedulePageView from './components/SchedulePageView';
import BranchScheduleView from './components/BranchScheduleView';
import ExcelUpload from './components/ExcelUpload';

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
    openEditDialog,
    refreshSchedules
  } = useScheduleManagement(branch);

  const { teachers } = useTeachers();
  const { uploadSchedules } = useExcelUpload();
  const [isExcelUploadOpen, setIsExcelUploadOpen] = useState(false);
  const searchParams = useSearchParams();
  const selectedGrade = searchParams.get('grade');
  // 뷰 모드 상태 제거

  // URL 파라미터 변경 시 activeTab 업데이트
  useEffect(() => {
    const initialGrade = searchParams.get('grade');
    if (initialGrade && ['초등부', '중등부', '고등부'].includes(initialGrade)) {
      setActiveTab(initialGrade);
    }
  }, [searchParams, setActiveTab]);

  // 엑셀 업로드 성공 핸들러
  const handleExcelUploadSuccess = async (scheduleData) => {
    try {
      const result = await uploadSchedules(scheduleData);
      if (result.success) {
        // 업로드 성공 시 데이터 새로고침
        await refreshSchedules();
      }
      return result;
    } catch (error) {
      console.error('엑셀 업로드 오류:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
        <div className="flex items-center gap-2">
          {branch === 'daechi' && (
            <Button 
              variant="outline" 
              onClick={() => window.open('/schedules/elementary', '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">시간표 페이지 새창보기</span>
            </Button>
          )}
          {branch === 'bukwirye' && (
            <Button 
              variant="outline" 
              onClick={() => window.open('/schedules/north-wirye', '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">시간표 페이지 새창보기</span>
            </Button>
          )}
          {branch === 'namwirye' && (
            <Button 
              variant="outline" 
              onClick={() => window.open('/schedules/south-wirye', '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">시간표 페이지 새창보기</span>
            </Button>
          )}
          <Button 
            variant="outline"
            onClick={() => setIsExcelUploadOpen(true)} 
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">엑셀 업로드</span>
          </Button>
          <Button onClick={() => openAddDialog()} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">새 시간표 추가</span>
          </Button>
        </div>
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

      {/* 엑셀 업로드 다이얼로그 */}
      <ExcelUpload
        isOpen={isExcelUploadOpen}
        onClose={() => setIsExcelUploadOpen(false)}
        branch={branch}
        onUploadSuccess={handleExcelUploadSuccess}
        getBranchName={getBranchName}
      />
    </div>
  );
};

export default ScheduleManagementContent;
