"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

/**
 * 연체 데이터를 가져오는 커스텀 훅
 * @param {string} branch - 지점 (all, daechi, north_wirye, south_wirye)
 * @returns {object} 연체 데이터 및 로딩 상태
 */
export const useOverdueData = (branch = 'all') => {
  const [overdueStudents, setOverdueStudents] = useState([]);
  const [overdueStats, setOverdueStats] = useState({
    total: 0,
    oneMonth: 0,
    twoMonth: 0,
    threeMonthPlus: 0,
    totalAmount: 0,
    unpaidCount: 0
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  const fetchOverdueData = useCallback(async () => {
    try {
      setLoading(true);
      // 학생 등록 정보와 결제 정보를 가져와서 연체 상태 계산
      const { data: enrollments, error } = await supabase
        .from('student_enrollments')
        .select(`
          *,
          students (id, full_name, email, phone, grade, branch),
          schedules (id, subject, teacher_name, grade, day_of_week, time_slot, branch)
        `)
        .eq('status', 'active');

      if (error) throw error;

      // 지점별 필터링
      let filteredEnrollments = enrollments;
      if (branch !== 'all') {
        filteredEnrollments = enrollments.filter(enrollment => {
          // 학생과 수업 모두 지점 정보가 있는 경우 둘 중 하나라도 일치하면 포함
          if (enrollment.schedules?.branch && enrollment.students?.branch) {
            return enrollment.schedules.branch === branch || enrollment.students.branch === branch;
          }
          // 수업 지점 정보만 있는 경우
          else if (enrollment.schedules?.branch) {
            return enrollment.schedules.branch === branch;
          }
          // 학생 지점 정보만 있는 경우
          else if (enrollment.students?.branch) {
            return enrollment.students.branch === branch;
          }
          // 둘 다 없는 경우는 제외
          return false;
        });
      }

      // 모든 결제 기록을 한 번에 가져오기 (성능 최적화)
      const studentIds = filteredEnrollments.map(e => e.student_id);
      const scheduleIds = filteredEnrollments.map(e => e.schedule_id);

      let paymentsQuery = supabase
        .from('payments')
        .select('*')
        .in('student_id', studentIds)
        .in('schedule_id', scheduleIds);

      if (branch !== 'all') {
        paymentsQuery = paymentsQuery.eq('branch', branch);
      }

      const { data: allPayments, error: paymentsError } = await paymentsQuery;

      if (paymentsError) throw paymentsError;

      // 각 등록에 대해 연체 상태 계산
      const overdueList = [];
      let stats = { total: 0, oneMonth: 0, twoMonth: 0, threeMonthPlus: 0, totalAmount: 0, unpaidCount: 0 };

      for (const enrollment of filteredEnrollments) {
        const startDate = new Date(enrollment.start_date);
        const currentDate = new Date();

        // 수강 시작일부터 현재까지의 개월 수 계산 (최소 1개월)
        const monthsElapsed = Math.max(1, Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24 * 30)));

        // 결제 기록 필터링 (개별 쿼리 대신 메모리에서 필터링)
        const payments = allPayments.filter(
          p => p.student_id === enrollment.student_id && p.schedule_id === enrollment.schedule_id
        );

        const paidMonths = payments?.length || 0;
        const overdueMonths = Math.max(0, monthsElapsed - paidMonths);

        // 미입금자 (결제 기록이 없는 학생)와 연체자 (일부 결제했지만 부족한 학생) 모두 포함
        if (overdueMonths > 0 || paidMonths === 0) {
          const actualOverdueMonths = Math.max(1, overdueMonths); // 최소 1개월 연체로 처리
          const overdueAmount = actualOverdueMonths * (enrollment.monthly_fee || 0);

          const overdueStudent = {
            ...enrollment,
            student: enrollment.students,
            schedule: enrollment.schedules,
            overdueMonths: actualOverdueMonths,
            overdueAmount,
            paidMonths,
            isUnpaid: paidMonths === 0, // 미입금자 여부 표시
            lastPaymentDate: payments?.length > 0 ?
              new Date(Math.max(...payments.map(p => new Date(p.payment_date).getTime()))) : null
          };

          overdueList.push(overdueStudent);
          stats.total += 1;
          stats.totalAmount += overdueAmount;

          if (paidMonths === 0) stats.unpaidCount += 1; // 미입금자 카운트

          if (actualOverdueMonths === 1) stats.oneMonth += 1;
          else if (actualOverdueMonths === 2) stats.twoMonth += 1;
          else if (actualOverdueMonths >= 3) stats.threeMonthPlus += 1;
        }
      }

      // 연체 금액 기준으로 내림차순 정렬
      const sortedOverdueList = overdueList.sort((a, b) => b.overdueAmount - a.overdueAmount);

      setOverdueStudents(sortedOverdueList);
      setOverdueStats(stats);
    } catch (error) {
      console.error('연체 데이터 조회 오류:', error);
      toast.error('연체 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [branch, supabase]);

  useEffect(() => {
    fetchOverdueData();
  }, [fetchOverdueData]);

  return { overdueStudents, overdueStats, loading, refetch: fetchOverdueData };
};