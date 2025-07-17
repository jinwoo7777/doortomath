"use client";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// 데이터 가져오기 함수
export const fetchDashboardData = async () => {
  const supabase = createClientComponentClient();
  
  try {
    // 병렬로 데이터 가져오기
    const [
      studentsData,
      enrollmentsData,
      schedulesData,
      paymentsData,
      inquiriesData
    ] = await Promise.all([
      supabase.from('students').select('*').eq('status', 'active'),
      supabase.from('student_enrollments').select(`
        *,
        students (id, full_name, email, phone, enrollment_date),
        schedules (id, subject, teacher_name, grade, day_of_week, time_slot)
      `).eq('status', 'active'),
      supabase.from('schedules').select('*').not('teacher_name', 'is', null),
      supabase.from('payments').select('*').gte('payment_date', (() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      })()),
      supabase.from('consultations').select('*').eq('status', 'pending')
    ]);

    // 주요 지표 계산
    const totalStudents = studentsData.data?.length || 0;
    const monthlyRevenue = paymentsData.data?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
    const totalClasses = schedulesData.data?.length || 0;
    const pendingInquiries = inquiriesData.data?.length || 0;

    // 최근 학생 (최근 7일 이내 등록)
    const recentStudents = studentsData.data?.filter(student => {
      const enrollmentDate = new Date(student.enrollment_date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return enrollmentDate >= weekAgo;
    }).slice(0, 5) || [];

    // 인기 수업 TOP 5
    const classEnrollmentCount = {};
    enrollmentsData.data?.forEach(enrollment => {
      if (enrollment.schedules) {
        const classKey = `${enrollment.schedules.grade}_${enrollment.schedules.subject}`;
        classEnrollmentCount[classKey] = (classEnrollmentCount[classKey] || 0) + 1;
      }
    });

    const topClasses = Object.entries(classEnrollmentCount)
      .map(([classKey, count]) => {
        const [grade, subject] = classKey.split('_');
        const schedule = schedulesData.data?.find(s => s.grade === grade && s.subject === subject);
        return {
          grade,
          subject,
          enrollmentCount: count,
          teacher: schedule?.teacher_name || '미배정'
        };
      })
      .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
      .slice(0, 5);

    // 최근 문의 (최근 5개)
    const recentInquiries = inquiriesData.data?.slice(0, 5) || [];

    // 출석률 계산 (임시 데이터)
    const attendanceRate = 92;

    // 결제율 계산
    const totalEnrollments = enrollmentsData.data?.length || 0;
    const paidEnrollments = enrollmentsData.data?.filter(e => e.payment_status === 'paid').length || 0;
    const paymentRate = totalEnrollments > 0 ? Math.round((paidEnrollments / totalEnrollments) * 100) : 0;

    return {
      totalStudents,
      monthlyRevenue,
      totalClasses,
      pendingInquiries,
      recentStudents,
      topClasses,
      recentInquiries,
      monthlyTrend: 12, // 임시 데이터
      attendanceRate,
      paymentRate
    };
  } catch (error) {
    console.error('대시보드 데이터 로딩 오류:', error);
    throw error;
  }
};

// 포맷팅 유틸리티 함수
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(amount);
};

export const getDayName = (dayNumber) => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[dayNumber] || '';
};