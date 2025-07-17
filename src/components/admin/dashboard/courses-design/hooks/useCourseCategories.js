// hooks/useCourseCategories.js
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/supabaseClientBrowser.js';

export const useCourseCategories = (session, userRole) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log('🔄 카테고리 목록 로딩 시작');
        
        const { data, error } = await supabase
          .from('course_menu')
          .select('name')
          .eq('is_active', true)
          .order('order');

        if (error) {
          console.error('💥 카테고리 로딩 오류:', error);
          // 기본 카테고리 사용
          setCategories(['시험대비', '학습분석', '내신,모의 기출분석', '선행수업', '개별오답관리']);
          return;
        }

        const categoryNames = data?.map(item => item.name) || [];
        console.log('✅ 카테고리 로딩 성공:', categoryNames);
        setCategories(categoryNames);
        
      } catch (err) {
        console.error('💥 카테고리 로딩 실패:', err);
        // 기본 카테고리 사용
        setCategories(['시험대비', '학습분석', '내신,모의 기출분석', '선행수업', '개별오답관리']);
      }
    };

    if (session && userRole === 'admin') {
      loadCategories();
    }
  }, [session?.user?.id, userRole]);

  return categories;
};
