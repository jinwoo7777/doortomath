import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

/**
 * 블로그 카테고리 관리를 위한 커스텀 훅
 * 카테고리 목록 조회 및 이름 변환 기능 제공
 */
export function useCategories() {
  const { session, userRole, loading, roleLoaded } = useAuth();
  const [categories, setCategories] = useState([]);
  const supabase = createClientComponentClient();

  // 카테고리 목록 불러오기
  const fetchCategories = async () => {
    if (loading || !roleLoaded || !session || userRole !== 'admin') {
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('카테고리 목록 불러오기 오류:', err);
      toast.error('카테고리 목록을 불러오는 중 오류가 발생했습니다.');
    }
  };

  // 카테고리 슬러그를 한글 이름으로 변환하는 헬퍼 함수
  const getCategoryName = (categorySlug) => {
    const category = categories.find(cat => cat.slug === categorySlug);
    return category?.name || categorySlug;
  };

  // 초기 데이터 로드
  useEffect(() => {
    fetchCategories();
  }, [session, loading, roleLoaded, userRole]);

  return {
    categories,
    fetchCategories,
    getCategoryName
  };
}