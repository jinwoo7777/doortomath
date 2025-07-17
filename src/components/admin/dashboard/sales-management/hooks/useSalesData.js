"use client";

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

/**
 * 매출 데이터를 가져오는 커스텀 훅
 * @param {string} period - 조회 기간 (current_month, last_month, current_year)
 * @param {string} branch - 지점 (all, daechi, north_wirye, south_wirye)
 * @returns {object} 매출 데이터 및 로딩 상태
 */
export const useSalesData = (period = 'current_month', branch = 'all') => {
  const [salesData, setSalesData] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalStudents: 0,
    activeClasses: 0,
    revenueByClass: [],
    revenueByInstructor: [],
    monthlyTrend: []
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchSalesData();
  }, [period, branch]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);

      // 현재 월 설정
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      
      // 기간에 따른 날짜 범위 설정
      let startDate, endDate, trendMonths;
      
      if (period === 'current_month') {
        startDate = new Date(currentYear, currentMonth - 1, 1);
        endDate = new Date(currentYear, currentMonth, 0);
        // 최근 6개월 데이터 조회
        trendMonths = 6;
      } else if (period === 'last_month') {
        startDate = new Date(currentYear, currentMonth - 2, 1);
        endDate = new Date(currentYear, currentMonth - 1, 0);
        // 최근 6개월 데이터 조회
        trendMonths = 6;
      } else if (period === 'current_year') {
        startDate = new Date(currentYear, 0, 1);
        endDate = new Date(currentYear, 11, 31);
        // 12개월 데이터 조회
        trendMonths = 12;
      } else {
        // 기본값
        startDate = new Date(currentYear, currentMonth - 1, 1);
        endDate = new Date(currentYear, currentMonth, 0);
        trendMonths = 6;
      }

      // 1. 전체 매출 데이터
      let query = supabase
        .from('student_enrollments')
        .select(`
          *,
          schedules (
            id,
            subject,
            teacher_name,
            grade,
            day_of_week,
            time_slot,
            price,
            price_period,
            branch
          ),
          students (
            id,
            full_name,
            branch
          )
        `)
        .eq('status', 'active');
        
      // 지점별 필터링
      const { data: enrollments, error: enrollmentsError } = await query;

      if (enrollmentsError) throw enrollmentsError;

      // 2. 결제 데이터
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .gte('payment_date', startDate.toISOString().split('T')[0])
        .lte('payment_date', endDate.toISOString().split('T')[0]);

      if (paymentsError) throw paymentsError;
      
      // 3. 매출 추이 데이터 조회
      // 최근 N개월 데이터 조회를 위한 날짜 계산
      const trendStartDate = new Date(currentYear, currentMonth - trendMonths, 1);
      const trendEndDate = new Date(currentYear, currentMonth, 0);
      
      // 월별 결제 데이터 조회
      const { data: trendPayments, error: trendPaymentsError } = await supabase
        .from('payments')
        .select('*')
        .gte('payment_date', trendStartDate.toISOString().split('T')[0])
        .lte('payment_date', trendEndDate.toISOString().split('T')[0]);
        
      if (trendPaymentsError) throw trendPaymentsError;

      // 지점별 필터링
      let filteredEnrollments = enrollments;
      if (branch !== 'all') {
        filteredEnrollments = enrollments.filter(enrollment => 
          enrollment.schedules?.branch === branch || enrollment.students?.branch === branch
        );
      }

      // 3. 데이터 분석
      const totalRevenue = filteredEnrollments.reduce((sum, enrollment) => {
        return sum + (enrollment.monthly_fee || 0);
      }, 0);

      // 지점별 결제 데이터 필터링
      let filteredPayments = payments;
      if (branch !== 'all') {
        // 결제 데이터에 지점 정보가 있는 경우 필터링
        // 결제 데이터에 직접 지점 정보가 없는 경우, 학생 ID로 연결하여 필터링
        filteredPayments = payments.filter(payment => {
          // 결제 데이터에 직접 branch 필드가 있는 경우
          if (payment.branch) {
            return payment.branch === branch;
          }
          
          // 학생 ID로 연결된 경우
          const studentEnrollment = filteredEnrollments.find(
            enrollment => enrollment.student_id === payment.student_id
          );
          return !!studentEnrollment;
        });
      }

      const monthlyRevenue = filteredPayments.reduce((sum, payment) => {
        return sum + (payment.amount || 0);
      }, 0);

      // 수업별 매출 분석
      const revenueByClass = {};
      enrollments.forEach(enrollment => {
        if (enrollment.schedules) {
          const classKey = `${enrollment.schedules.grade}_${enrollment.schedules.subject}_${enrollment.schedules.day_of_week}_${enrollment.schedules.time_slot}`;
          if (!revenueByClass[classKey]) {
            revenueByClass[classKey] = {
              ...enrollment.schedules,
              students: 0,
              totalRevenue: 0,
              averageFee: 0
            };
          }
          revenueByClass[classKey].students += 1;
          revenueByClass[classKey].totalRevenue += enrollment.monthly_fee || 0;
        }
      });

      // 강사별 매출 분석
      const revenueByInstructor = {};
      enrollments.forEach(enrollment => {
        if (enrollment.schedules?.teacher_name) {
          const instructor = enrollment.schedules.teacher_name;
          if (!revenueByInstructor[instructor]) {
            revenueByInstructor[instructor] = {
              name: instructor,
              students: 0,
              classes: new Set(),
              totalRevenue: 0
            };
          }
          revenueByInstructor[instructor].students += 1;
          revenueByInstructor[instructor].classes.add(
            `${enrollment.schedules.grade}_${enrollment.schedules.subject}`
          );
          revenueByInstructor[instructor].totalRevenue += enrollment.monthly_fee || 0;
        }
      });

      // 평균 수업료 계산
      Object.values(revenueByClass).forEach(classData => {
        classData.averageFee = classData.students > 0 ? 
          Math.round(classData.totalRevenue / classData.students) : 0;
      });

      // Set에서 Array로 변환
      Object.values(revenueByInstructor).forEach(instructorData => {
        instructorData.classCount = instructorData.classes.size;
        delete instructorData.classes;
      });

      // 월별 매출 추이 데이터 생성
      const monthlyTrend = [];
      
      // 최근 N개월 데이터 생성
      for (let i = 0; i < trendMonths; i++) {
        const trendMonth = new Date(currentYear, currentMonth - trendMonths + i, 1);
        const trendMonthYear = trendMonth.getFullYear();
        const trendMonthNum = trendMonth.getMonth() + 1;
        
        // 해당 월의 첫날과 마지막날
        const monthStart = new Date(trendMonthYear, trendMonthNum - 1, 1);
        const monthEnd = new Date(trendMonthYear, trendMonthNum, 0);
        
        // 해당 월의 결제 데이터 필터링 (지점별 필터링 적용)
        let monthPayments = trendPayments.filter(payment => {
          const paymentDate = new Date(payment.payment_date);
          return paymentDate >= monthStart && paymentDate <= monthEnd;
        });
        
        // 지점별 필터링 적용
        if (branch !== 'all') {
          monthPayments = monthPayments.filter(payment => {
            // 결제 데이터에 직접 branch 필드가 있는 경우
            if (payment.branch) {
              return payment.branch === branch;
            }
            
            // 학생 ID로 연결된 경우
            const studentEnrollment = filteredEnrollments.find(
              enrollment => enrollment.student_id === payment.student_id
            );
            return !!studentEnrollment;
          });
        }
        
        // 해당 월의 총 결제 금액
        const monthRevenue = monthPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        
        // 해당 월의 예상 매출 (등록된 모든 학생의 월 수업료)
        // 필터링된 등록 데이터를 기반으로 계산
        const expectedRevenue = totalRevenue;
        
        // 월 이름 포맷 (예: '1월', '2월')
        const monthName = `${trendMonthNum}월`;
        
        monthlyTrend.push({
          month: monthName,
          revenue: expectedRevenue,
          collected: monthRevenue,
          year: trendMonthYear,
          monthNum: trendMonthNum
        });
      }
      
      setSalesData({
        totalRevenue,
        monthlyRevenue,
        totalStudents: enrollments.length,
        activeClasses: Object.keys(revenueByClass).length,
        revenueByClass: Object.values(revenueByClass)
          .sort((a, b) => b.totalRevenue - a.totalRevenue),
        revenueByInstructor: Object.values(revenueByInstructor)
          .sort((a, b) => b.totalRevenue - a.totalRevenue),
        monthlyTrend
      });

    } catch (error) {
      console.error('Error fetching sales data:', error);
      toast.error('매출 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return { salesData, loading, refetch: fetchSalesData };
};