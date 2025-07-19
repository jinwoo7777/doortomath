'use client';

import { useState, useCallback } from 'react';

/**
 * 학생 모달들 간의 상태 동기화를 관리하는 훅
 */
export default function useStudentModalSync() {
  // 학생 데이터 상태
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentData, setStudentData] = useState({
    examScores: [],
    examSessions: [],
    publicSettings: null,
    lastUpdated: null
  });

  // 모달 상태
  const [modalStates, setModalStates] = useState({
    examScores: { isOpen: false },
    publicScores: { isOpen: false },
    memo: { isOpen: false },
    courses: { isOpen: false },
    enrollment: { isOpen: false }
  });

  // 학생 선택 및 데이터 초기화
  const selectStudent = useCallback((student) => {
    setSelectedStudent(student);
    // 새로운 학생 선택 시 데이터 초기화
    setStudentData({
      examScores: [],
      examSessions: [],
      publicSettings: null,
      lastUpdated: new Date()
    });
  }, []);

  // 특정 모달 열기
  const openModal = useCallback((modalType, student = null) => {
    if (student) {
      selectStudent(student);
    }
    
    setModalStates(prev => ({
      ...prev,
      [modalType]: { isOpen: true }
    }));
  }, [selectStudent]);

  // 특정 모달 닫기
  const closeModal = useCallback((modalType) => {
    setModalStates(prev => ({
      ...prev,
      [modalType]: { isOpen: false }
    }));
  }, []);

  // 모든 모달 닫기
  const closeAllModals = useCallback(() => {
    setModalStates({
      examScores: { isOpen: false },
      publicScores: { isOpen: false },
      memo: { isOpen: false },
      courses: { isOpen: false },
      enrollment: { isOpen: false }
    });
    setSelectedStudent(null);
  }, []);

  // 학생 데이터 업데이트
  const updateStudentData = useCallback((updates) => {
    setStudentData(prev => ({
      ...prev,
      ...updates,
      lastUpdated: new Date()
    }));
  }, []);

  // 공개 설정 업데이트
  const updatePublicSettings = useCallback((publicSettings) => {
    updateStudentData({ publicSettings });
  }, [updateStudentData]);

  // 성적 데이터 업데이트
  const updateExamData = useCallback((examScores, examSessions) => {
    updateStudentData({ examScores, examSessions });
  }, [updateStudentData]);

  // 특정 모달이 열려있는지 확인
  const isModalOpen = useCallback((modalType) => {
    return modalStates[modalType]?.isOpen || false;
  }, [modalStates]);

  // 데이터 새로고침 필요 여부 확인
  const needsRefresh = useCallback((lastCheck) => {
    return !lastCheck || !studentData.lastUpdated || 
           new Date(studentData.lastUpdated) > new Date(lastCheck);
  }, [studentData.lastUpdated]);

  return {
    // 상태
    selectedStudent,
    studentData,
    modalStates,
    
    // 학생 관리
    selectStudent,
    
    // 모달 관리
    openModal,
    closeModal,
    closeAllModals,
    isModalOpen,
    
    // 데이터 관리
    updateStudentData,
    updatePublicSettings,
    updateExamData,
    needsRefresh,
    
    // 편의 함수들
    openExamScoresModal: (student) => openModal('examScores', student),
    openPublicScoresModal: (student) => openModal('publicScores', student),
    openMemoModal: (student) => openModal('memo', student),
    openCoursesModal: (student) => openModal('courses', student),
    openEnrollmentModal: (student) => openModal('enrollment', student),
    
    closeExamScoresModal: () => closeModal('examScores'),
    closePublicScoresModal: () => closeModal('publicScores'),
    closeMemoModal: () => closeModal('memo'),
    closeCoursesModal: () => closeModal('courses'),
    closeEnrollmentModal: () => closeModal('enrollment'),
    
    isExamScoresModalOpen: isModalOpen('examScores'),
    isPublicScoresModalOpen: isModalOpen('publicScores'),
    isMemoModalOpen: isModalOpen('memo'),
    isCoursesModalOpen: isModalOpen('courses'),
    isEnrollmentModalOpen: isModalOpen('enrollment')
  };
}