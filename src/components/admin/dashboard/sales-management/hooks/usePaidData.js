"use client";

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

/**
 * 입금자 데이터를 가져오는 커스텀 훅
 * @param {string} branch - 지점 (all, daechi, bukwirye, namwirye)
 * @returns {object} 입금자 데이터 및 로딩 상태
 */
export const usePaidData = (branch = 'all') => {
  const [paidStudents, setPaidStudents] = useState([]);
  const [paidStats, setPaidStats] = useState({
    total: 0,
    totalAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  const fetchPaidStudents = async () => {
    try {
      setLoading(true);
      // 2025년 3월 데이터를 조회하도록 고정 (목업 데이터용)
      const currentMonth = '2025-03';
      
      // 이번달 결제 기록 조회
      let query = supabase
        .from('payments')
        .select(`
          *,
          students (id, full_name, email, phone, grade, branch),
          schedules (id, subject, teacher_name, grade, branch)
        `)
        .gte('payment_date', `${currentMonth}-01`)
        .lte('payment_date', `${currentMonth}-31`);
        
      // 지점별 필터링
      if (branch !== 'all') {
        query = query.eq('branch', branch);
      }
      
      const { data: payments, error } = await query;

      if (error) throw error;

      let paidList = payments?.map(payment => ({
        ...payment,
        student: payment.students,
        schedule: payment.schedules
      })) || [];

      const stats = {
        total: paidList.length,
        totalAmount: paidList.reduce((sum, payment) => sum + (payment.amount || 0), 0)
      };

      setPaidStudents(paidList);
      setPaidStats(stats);
    } catch (error) {
      console.error('입금자 데이터 조회 오류:', error);
      toast.error('입금자 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaidStudents();
  }, [branch]);

  return { paidStudents, paidStats, loading, refetch: fetchPaidStudents };
};