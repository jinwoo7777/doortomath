"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { TabsContent } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';

// 커스텀 훅 가져오기
import useStudentData from './hooks/useStudentData';
import useStudentForm from './hooks/useStudentForm';
import useStudentStats from './hooks/useStudentStats';
import useSortableTable from './hooks/useSortableTable';
import { getNestedValue, compareValues } from './utils/sortUtils';

// 컴포넌트 가져오기
import StudentForm from './components/StudentForm';
import StudentList from './components/StudentList';
import StudentFilters from './components/StudentFilters';
import StudentStats from './components/StudentStats';
import StudentTabs from './components/StudentTabs';
import StudentCoursesModal from './StudentCoursesModal';
import StudentExamScoresModal from './StudentExamScoresModal';
import StudentCommentModal from './StudentCommentModal';
import PublicScoresModal from './components/PublicScoresModal';

/**
 * 학생 관리 메인 컴포넌트
 */
const StudentManagementContent = () => {
  const { session, userRole } = useAuth();
  const searchParams = useSearchParams();

  // 상태 관리
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedTeacher, setSelectedTeacher] = useState('all');
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all');

  // 모달 관련 상태
  const [isCoursesModalOpen, setIsCoursesModalOpen] = useState(false);
  const [selectedStudentForCourses, setSelectedStudentForCourses] = useState(null);
  const [isExamScoresModalOpen, setIsExamScoresModalOpen] = useState(false);
  const [selectedStudentForScores, setSelectedStudentForScores] = useState(null);
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [selectedStudentForEnrollment, setSelectedStudentForEnrollment] = useState(null);
  const [isMemoModalOpen, setIsMemoModalOpen] = useState(false);
  const [selectedStudentForMemo, setSelectedStudentForMemo] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState(null);
  const [isPublicScoresModalOpen, setIsPublicScoresModalOpen] = useState(false);
  const [selectedStudentForPublicScores, setSelectedStudentForPublicScores] = useState(null);

  // 지점 선택 변경 시 강사 선택 초기화
  useEffect(() => {
    setSelectedTeacher('all');
  }, [selectedBranch]);

  // URL 파라미터 변경 시 activeTab 업데이트
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['all', 'by-teacher', 'by-grade', 'by-score', 'priority'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // 커스텀 훅 사용
  const {
    students,
    setStudents,
    schedules,
    teachers,
    studentSchedules,
    studentGrades,
    loading,
    fetchData,
    fetchStudentSchedules
  } = useStudentData(session, userRole);

  const {
    currentStudent,
    isDialogOpen,
    setIsDialogOpen,
    studentForm,
    handleInputChange,
    handleSelectChange,
    openAddDialog,
    openEditDialog,
    handleSaveStudent,
    handleDeleteStudent,
    handleTogglePriority
  } = useStudentForm(() => fetchData(), students, setStudents);

  const {
    stats,
    getStudentSchedules,
    getStudentGradeAverage,
    getStudentsByTeacher,
    getStudentsByGrade
  } = useStudentStats(students, studentSchedules, studentGrades);

  // 학생 필터링 함수
  const getFilteredStudents = () => {
    let filtered = [...students];

    // 검색어 필터링
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(student =>
        student.full_name?.toLowerCase().includes(query) ||
        student.email?.toLowerCase().includes(query) ||
        student.school?.toLowerCase().includes(query) ||
        student.notes?.toLowerCase().includes(query)
      );
    }

    // 학년 필터링
    if (selectedGrade !== 'all') {
      filtered = filtered.filter(student => student.grade === selectedGrade);
    }

    // 지점 필터링
    if (selectedBranch !== 'all') {
      filtered = filtered.filter(student => student.branch === selectedBranch);
    }

    // 강사 필터링 (모든 탭에 적용)
    if (selectedTeacher !== 'all') {
      const teacherStudents = getStudentsByTeacher(selectedTeacher);
      filtered = filtered.filter(student =>
        teacherStudents.some(ts => ts.id === student.id)
      );
    }

    // 탭별 필터링
    switch (activeTab) {
      case 'by-teacher':
        // 강사 필터링은 이미 위에서 적용됨
        break;
      case 'by-grade':
        // 이미 위에서 학년 필터링을 했으므로 추가 필터링 불필요
        break;
      case 'by-score':
        // 성적이 있는 학생만 필터링
        filtered = filtered.filter(student => getStudentGradeAverage(student.id) !== null);
        // 정렬은 sortData 함수에서 처리하므로 여기서는 제거
        break;
      case 'priority':
        filtered = filtered.filter(student => student.is_priority);
        break;
    }

    return filtered;
  };

  // 필터링된 학생 목록에 추가 정보 추가
  const getEnrichedStudents = (students) => {
    return students.map(student => ({
      ...student,
      // 정렬에 사용할 추가 속성
      courses_count: getStudentSchedules(student.id).length,
      average_grade: getStudentGradeAverage(student.id) || 0
    }));
  };

  // 정렬 기능 추가
  const { sortColumn, sortDirection, handleSort, sortData } = useSortableTable('student-management');

  // 필터링, 정보 추가, 정렬 적용
  const filteredStudents = useMemo(() => {
    // 1. 필터링
    const filteredData = getFilteredStudents();
    // 2. 정보 추가
    const enrichedData = getEnrichedStudents(filteredData);
    // 3. 정렬 (특별한 정렬 로직 적용)
    return sortData(enrichedData, {
      customSortFn: (data, column, direction) => {
        // 특별한 정렬 로직이 필요한 컬럼에 대한 처리
        if (column === 'average_grade') {
          // 성적 정렬 시 null 값은 항상 마지막에 배치
          return [...data].sort((a, b) => {
            const gradeA = getStudentGradeAverage(a.id);
            const gradeB = getStudentGradeAverage(b.id);

            // null 값 처리
            if (gradeA === null && gradeB === null) return 0;
            if (gradeA === null) return 1; // null 값은 항상 마지막에
            if (gradeB === null) return -1;

            // 숫자 비교
            return direction === 'asc' ? gradeA - gradeB : gradeB - gradeA;
          });
        }

        // 기본 정렬 로직 사용
        return [...data].sort((a, b) => {
          const valueA = getNestedValue(a, column);
          const valueB = getNestedValue(b, column);

          return compareValues(valueA, valueB, direction);
        });
      }
    });
  }, [students, searchQuery, selectedGrade, selectedBranch, selectedTeacher, activeTab, sortColumn, sortDirection, getStudentGradeAverage]);

  // 모달 관련 함수
  const openCoursesModal = (student) => {
    setSelectedStudentForCourses(student);
    setIsCoursesModalOpen(true);
  };

  const closeCoursesModal = () => {
    setIsCoursesModalOpen(false);
    setSelectedStudentForCourses(null);
  };

  const handleViewExamScores = (student) => {
    setSelectedStudentForScores(student);
    setIsExamScoresModalOpen(true);
  };

  const closeExamScoresModal = () => {
    setIsExamScoresModalOpen(false);
    setSelectedStudentForScores(null);
  };

  const openEnrollmentModal = (student) => {
    setSelectedStudentForEnrollment(student);
    setIsEnrollmentModalOpen(true);
  };

  const closeEnrollmentModal = () => {
    setIsEnrollmentModalOpen(false);
    setSelectedStudentForEnrollment(null);
  };

  const openMemoModal = (student) => {
    setSelectedStudentForMemo(student);
    setIsMemoModalOpen(true);
  };

  const closeMemoModal = () => {
    setIsMemoModalOpen(false);
    setSelectedStudentForMemo(null);
  };
  
  // Handle comment updates
  const handleCommentUpdate = () => {
    // Refresh data if needed
    fetchData();
  };

  const openPaymentModal = (student) => {
    setSelectedStudentForPayment(student);
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedStudentForPayment(null);
  };

  const openPublicScoresModal = (student) => {
    setSelectedStudentForPublicScores(student);
    setIsPublicScoresModalOpen(true);
  };

  const closePublicScoresModal = () => {
    setIsPublicScoresModalOpen(false);
    setSelectedStudentForPublicScores(null);
  };

  const handleCoursesUpdate = () => {
    fetchStudentSchedules();
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">학원생 관리</h2>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" /> 학원생 추가
        </Button>
      </div>

      {/* 통계 카드 */}
      <StudentStats stats={stats} />

      {/* 학생 관리 탭 */}
      <div className="relative">
        <StudentTabs activeTab={activeTab} setActiveTab={setActiveTab}>
          <TabsContent value="all" className="space-y-4 min-h-[600px]">
            <StudentFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedGrade={selectedGrade}
              setSelectedGrade={setSelectedGrade}
              selectedBranch={selectedBranch}
              setSelectedBranch={setSelectedBranch}
              selectedTeacher={selectedTeacher}
              setSelectedTeacher={setSelectedTeacher}
              teachers={teachers}
            />
            <div className="relative">
              <StudentList
                students={students}
                filteredStudents={filteredStudents}
                loading={loading}
                onEdit={openEditDialog}
                onDelete={handleDeleteStudent}
                onTogglePriority={handleTogglePriority}
                onViewCourses={openCoursesModal}
                onViewExamScores={handleViewExamScores}
                onOpenMemo={openMemoModal}
                onOpenPublicScores={openPublicScoresModal}
                onOpenEnrollment={openEnrollmentModal}
                getStudentSchedules={getStudentSchedules}
                getStudentGradeAverage={getStudentGradeAverage}
                session={session}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
            </div>
          </TabsContent>

          <TabsContent value="by-score" className="space-y-4 min-h-[600px]">
            <StudentFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedGrade={selectedGrade}
              setSelectedGrade={setSelectedGrade}
              selectedBranch={selectedBranch}
              setSelectedBranch={setSelectedBranch}
              selectedTeacher={selectedTeacher}
              setSelectedTeacher={setSelectedTeacher}
              teachers={teachers}
            />
            <div className="relative">
              <StudentList
                students={students}
                filteredStudents={filteredStudents}
                loading={loading}
                onEdit={openEditDialog}
                onDelete={handleDeleteStudent}
                onTogglePriority={handleTogglePriority}
                onViewCourses={openCoursesModal}
                onViewExamScores={handleViewExamScores}
                onOpenMemo={openMemoModal}
                onOpenPublicScores={openPublicScoresModal}
                onOpenEnrollment={openEnrollmentModal}
                getStudentSchedules={getStudentSchedules}
                getStudentGradeAverage={getStudentGradeAverage}
                session={session}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
            </div>
          </TabsContent>

          <TabsContent value="priority" className="space-y-4 min-h-[500px]">
            <StudentFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedGrade={selectedGrade}
              setSelectedGrade={setSelectedGrade}
              selectedBranch={selectedBranch}
              setSelectedBranch={setSelectedBranch}
              selectedTeacher={selectedTeacher}
              setSelectedTeacher={setSelectedTeacher}
              teachers={teachers}
            />
            <div className="relative">
              <StudentList
                students={students}
                filteredStudents={filteredStudents}
                loading={loading}
                onEdit={openEditDialog}
                onDelete={handleDeleteStudent}
                onTogglePriority={handleTogglePriority}
                onViewCourses={openCoursesModal}
                onViewExamScores={handleViewExamScores}
                onOpenMemo={openMemoModal}
                onOpenPublicScores={openPublicScoresModal}
                onOpenEnrollment={openEnrollmentModal}
                getStudentSchedules={getStudentSchedules}
                getStudentGradeAverage={getStudentGradeAverage}
                session={session}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
            </div>
          </TabsContent>
        </StudentTabs>
      </div>

      {/* 학생 추가/수정 모달 */}
      <StudentForm
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        studentForm={studentForm}
        handleInputChange={handleInputChange}
        handleSelectChange={handleSelectChange}
        handleSaveStudent={handleSaveStudent}
        currentStudent={currentStudent}
        session={session}
      />

      {/* 수강 강의 모달 */}
      <StudentCoursesModal
        isOpen={isCoursesModalOpen}
        onClose={closeCoursesModal}
        student={selectedStudentForCourses}
        onUpdate={handleCoursesUpdate}
      />

      {/* 시험 성적 모달 */}
      <StudentExamScoresModal
        isOpen={isExamScoresModalOpen}
        onClose={closeExamScoresModal}
        student={selectedStudentForScores}
      />

      {/* 학생 코멘트 모달 */}
      <StudentCommentModal
        isOpen={isMemoModalOpen}
        onClose={closeMemoModal}
        student={selectedStudentForMemo}
        onUpdate={handleCommentUpdate}
      />

      {/* 성적 공개 설정 모달 */}
      <PublicScoresModal
        isOpen={isPublicScoresModalOpen}
        onClose={closePublicScoresModal}
        student={selectedStudentForPublicScores}
      />

      {/* 추가 모달들은 필요에 따라 구현 */}
      {/* 수업 등록 모달, 결제 모달 등 */}
    </div>
  );
};

export default StudentManagementContent;