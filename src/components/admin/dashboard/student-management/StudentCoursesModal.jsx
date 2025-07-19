"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// 커스텀 훅 및 컴포넌트 가져오기
import useCourseManagement from './hooks/useCourseManagement';
import CourseList from './components/CourseList';
import CourseAddForm from './components/CourseAddForm';
import StudentCommentModal from './StudentCommentModal';
import StudentCommentsSection from '@/components/shared/student-views/StudentCommentsSection';

/**
 * 학생 수강 강의 관리 모달 컴포넌트
 */
const StudentCoursesModal = ({
  isOpen,
  onClose,
  student,
  onUpdate
}) => {
  const {
    studentCourses,
    setStudentCourses,
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
    handleAddCourse,
    handleRemoveCourse,
    handleUpdateCourseStatus,
    handleUpdateCourseNotes,
    filteredAvailableSchedules
  } = useCourseManagement(student, onUpdate);

  // Supabase 클라이언트 생성
  const supabase = createClientComponentClient();
  
  // 코멘트 모달 상태 관리
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  const handleCancelAddCourse = () => {
    setIsAddingCourse(false);
    setSelectedSchedule('');
    setEnrollmentNotes('');
    setSelectedBranch('');
  };
  
  // 코멘트 모달 열기
  const openCommentModal = () => {
    setIsCommentModalOpen(true);
  };
  
  // 코멘트 모달 닫기
  const closeCommentModal = () => {
    setIsCommentModalOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {student?.full_name} 학생의 수강 중인 강의
            </DialogTitle>
            <DialogDescription>
              학생의 수강 중인 강의 목록을 관리하고 새로운 강의를 추가할 수 있습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* 수강 중인 강의 목록 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">수강 중인 강의</h3>
                <Button
                  onClick={() => setIsAddingCourse(true)}
                  disabled={loading}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  강의 추가
                </Button>
              </div>

              <CourseList
                studentCourses={studentCourses}
                loading={loading}
                editingCourse={editingCourse}
                setEditingCourse={setEditingCourse}
                handleUpdateCourseStatus={handleUpdateCourseStatus}
                handleUpdateCourseNotes={handleUpdateCourseNotes}
                handleRemoveCourse={handleRemoveCourse}
                setStudentCourses={setStudentCourses}
              />
            </div>

            {/* 강의 추가 폼 */}
            {isAddingCourse && (
              <CourseAddForm
                selectedBranch={selectedBranch}
                handleBranchChange={handleBranchChange}
                selectedSchedule={selectedSchedule}
                setSelectedSchedule={setSelectedSchedule}
                enrollmentNotes={enrollmentNotes}
                setEnrollmentNotes={setEnrollmentNotes}
                filteredAvailableSchedules={filteredAvailableSchedules}
                handleAddCourse={handleAddCourse}
                loading={loading}
                onCancel={handleCancelAddCourse}
              />
            )}
            
            {/* 학생 코멘트 섹션 */}
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">강사 코멘트</h3>
              {student && (
                <div className="relative">
                  <StudentCommentsSection 
                    supabase={supabase}
                    studentId={student.id}
                  />
                  <div className="absolute top-4 right-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openCommentModal}
                    >
                      코멘트 관리
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 코멘트 관리 모달 */}
      {student && (
        <StudentCommentModal
          isOpen={isCommentModalOpen}
          onClose={closeCommentModal}
          student={student}
          onUpdate={() => {
            // 코멘트가 업데이트되면 코멘트 목록을 새로고침하기 위해
            // 모달을 닫고 다시 열기
            setIsCommentModalOpen(false);
            setTimeout(() => {
              if (isOpen) {
                setIsCommentModalOpen(true);
              }
            }, 100);
          }}
        />
      )}
    </>
  );
};

export default StudentCoursesModal;