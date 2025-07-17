// src/components/admin/dashboard/schedule-management/hooks/useTeachers.js
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const useTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      console.log('🔄 강사 목록 로드 시작');

      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      
      console.log('✅ 강사 목록 로드 성공:', data?.length || 0);
      setTeachers(data || []);
    } catch (error) {
      console.error('❌ 강사 목록 불러오기 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  return { teachers, loading };
};
