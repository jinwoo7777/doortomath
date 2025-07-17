'use client';

import { useMemo } from 'react';

/**
 * 학생 통계 정보를 계산하는 커스텀 훅
 * @param {Array} students - 학생 목록
 * @param {Array} studentSchedules - 학생 수업 연결 정보
 * @param {Array} studentGrades - 학생 성적 정보
 * @returns {Object} 학생 통계 정보
 */
export const useStudentStats = (students, studentSchedules, studentGrades) => {
  
  // 학생 통계 정보 계산
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === 'active').length;
    const priorityStudents = students.filter(s => s.is_priority).length;

    const gradeStats = {
      초등부: students.filter(s => s.grade === '초등부').length,
      중등부: students.filter(s => s.grade === '중등부').length,
      고등부: students.filter(s => s.grade === '고등부').length
    };

    const branchStats = {
      daechi: students.filter(s => s.branch === 'daechi').length,
      bukwirye: students.filter(s => s.branch === 'bukwirye').length,
      namwirye: students.filter(s => s.branch === 'namwirye').length
    };

    return {
      totalStudents,
      activeStudents,
      priorityStudents,
      gradeStats,
      branchStats
    };
  }, [students]);

  // 학생별 수업 정보 조회
  const getStudentSchedules = (studentId) => {
    return studentSchedules.filter(ss => ss.student_id === studentId && ss.status === 'active');
  };

  // 학생별 성적 평균 계산
  const getStudentGradeAverage = (studentId) => {
    const studentGradeRecords = studentGrades.filter(sg => sg.student_id === studentId);
    if (studentGradeRecords.length === 0) return null;

    const totalScore = studentGradeRecords.reduce((sum, record) => sum + parseFloat(record.score || 0), 0);
    return Math.round(totalScore / studentGradeRecords.length);
  };

  // 강사별 학생 목록 조회
  const getStudentsByTeacher = (teacherName) => {
    if (!teacherName || teacherName === 'all') return [];

    const teacherSchedules = studentSchedules.filter(ss =>
      ss.schedules?.teacher_name === teacherName && ss.status === 'active'
    );

    const studentIds = [...new Set(teacherSchedules.map(ss => ss.student_id))];
    return students.filter(student => studentIds.includes(student.id));
  };

  // 학년별 학생 목록 조회
  const getStudentsByGrade = (grade) => {
    return students.filter(student => student.grade === grade);
  };

  return {
    stats,
    getStudentSchedules,
    getStudentGradeAverage,
    getStudentsByTeacher,
    getStudentsByGrade
  };
};

export default useStudentStats;