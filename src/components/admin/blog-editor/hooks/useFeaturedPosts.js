import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import {
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { arrayMove } from '@dnd-kit/sortable';

/**
 * 메인페이지 표시 포스트 관리를 위한 커스텀 훅
 * 포스트 추가, 제거, 순서 변경 기능 제공
 */
export function useFeaturedPosts({ blogPosts, fetchBlogPosts }) {
  const { session, userRole, loading, roleLoaded } = useAuth();
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [availablePosts, setAvailablePosts] = useState([]);
  const [updatingPosts, setUpdatingPosts] = useState(new Set());

  // DnD Kit 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 메인페이지 표시 포스트 목록 불러오기
  const fetchFeaturedPosts = async () => {
    if (loading || !roleLoaded || !session || userRole !== 'admin') {
      console.log('🚫 fetchFeaturedPosts 스킵:', { loading, roleLoaded, hasSession: !!session, userRole });
      return;
    }
    
    console.log('📋 fetchFeaturedPosts 시작...');
    
    try {
      const supabase = createClientComponentClient();
      
      // featured 포스트들을 featured_order 순서로 가져오기
      console.log('🔍 featured 포스트 조회 중...');
      const { data: featured, error: featuredError } = await supabase
        .from('blog_posts')
        .select(`
          *,
          profiles!blog_posts_author_id_fkey (
            full_name,
            email
          )
        `)
        .eq('status', 'published')
        .eq('featured', true)
        .order('featured_order', { ascending: true });

      if (featuredError) {
        console.error('❌ featured 포스트 조회 오류:', featuredError);
        throw featuredError;
      }

      console.log('✅ featured 포스트 조회 결과:', {
        count: featured?.length || 0,
        posts: featured?.map((p, i) => ({ 
          index: i,
          id: p.id, 
          title: p.title, 
          featured_order: p.featured_order 
        })) || []
      });

      // 선택 가능한 발행된 포스트들 가져오기 (featured가 아닌 포스트들)
      console.log('🔍 선택 가능한 포스트 조회 중...');
      const { data: available, error: availableError } = await supabase
        .from('blog_posts')
        .select(`
          *,
          profiles!blog_posts_author_id_fkey (
            full_name,
            email
          )
        `)
        .eq('status', 'published')
        .eq('featured', false)
        .order('published_at', { ascending: false });

      if (availableError) {
        console.error('❌ 선택 가능한 포스트 조회 오류:', availableError);
        throw availableError;
      }

      console.log('✅ 선택 가능한 포스트 조회 결과:', {
        count: available?.length || 0
      });

      setFeaturedPosts([...(featured || [])]);
      setAvailablePosts([...(available || [])]);

      console.log('🎯 상태 업데이트 완료:', {
        featuredCount: featured?.length || 0,
        availableCount: available?.length || 0
      });

    } catch (err) {
      console.error('❌ 메인페이지 포스트 목록 불러오기 오류:', err);
      toast.error('메인페이지 포스트 목록을 불러오는 중 오류가 발생했습니다.');
    }
  };

  // 포스트를 메인페이지에 추가
  const addToFeatured = async (postId) => {
    if (featuredPosts.length >= 3) {
      toast.error('메인페이지에는 최대 3개의 포스트만 표시할 수 있습니다.');
      return;
    }

    console.log('➕ 메인페이지에 포스트 추가 시작:', postId);
    setUpdatingPosts(prev => new Set(prev).add(postId));

    try {
      // 인증된 세션이 있는 Supabase 클라이언트 사용
      const authenticatedSupabase = createClientComponentClient();
      
      // 세션 토큰으로 명시적 인증
      if (session?.access_token) {
        console.log('🔐 포스트 추가 - 세션 토큰으로 인증 시도');
        await authenticatedSupabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        });
      }

      const newOrder = featuredPosts.length + 1;
      
      const { error } = await authenticatedSupabase
        .from('blog_posts')
        .update({ 
          featured: true,
          featured_order: newOrder,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId);

      if (error) {
        console.error('❌ 메인페이지 포스트 추가 실패:', error);
        throw error;
      }

      console.log('✅ 메인페이지 포스트 추가 성공');
      await fetchFeaturedPosts();
      await fetchBlogPosts();
      toast.success('메인페이지에 포스트가 추가되었습니다.');

    } catch (err) {
      console.error('❌ 메인페이지 포스트 추가 오류:', err);
      
      // RLS 관련 오류인 경우 구체적인 메시지
      if (err.message?.includes('RLS') || err.message?.includes('policy') || err.code === '42501') {
        toast.error('권한이 없습니다. 관리자로 로그인했는지 확인해주세요.');
      } else {
        toast.error('메인페이지 포스트 추가에 실패했습니다.');
      }
    } finally {
      setUpdatingPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  // 포스트를 메인페이지에서 제거
  const removeFromFeatured = async (postId) => {
    console.log('➖ 메인페이지에서 포스트 제거 시작:', postId);
    setUpdatingPosts(prev => new Set(prev).add(postId));

    try {
      // 인증된 세션이 있는 Supabase 클라이언트 사용
      const authenticatedSupabase = createClientComponentClient();
      
      // 세션 토큰으로 명시적 인증
      if (session?.access_token) {
        console.log('🔐 포스트 제거 - 세션 토큰으로 인증 시도');
        await authenticatedSupabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        });
      }

      const { error } = await authenticatedSupabase
        .from('blog_posts')
        .update({ 
          featured: false,
          featured_order: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId);

      if (error) {
        console.error('❌ 메인페이지 포스트 제거 실패:', error);
        throw error;
      }

      console.log('✅ 메인페이지 포스트 제거 성공');

      // 순서 재정렬
      await reorderFeaturedPostsRLS(authenticatedSupabase);
      await fetchFeaturedPosts();
      await fetchBlogPosts();
      toast.success('메인페이지에서 포스트가 제거되었습니다.');

    } catch (err) {
      console.error('❌ 메인페이지 포스트 제거 오류:', err);
      
      // RLS 관련 오류인 경우 구체적인 메시지
      if (err.message?.includes('RLS') || err.message?.includes('policy') || err.code === '42501') {
        toast.error('권한이 없습니다. 관리자로 로그인했는지 확인해주세요.');
      } else {
        toast.error('메인페이지 포스트 제거에 실패했습니다.');
      }
    } finally {
      setUpdatingPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  // featured 포스트들의 순서를 재정렬 - RLS 방식
  const reorderFeaturedPostsRLS = async (authenticatedSupabase) => {
    try {
      console.log('🔄 featured 포스트 순서 재정렬 시작');
      
      const { data: currentFeatured, error: fetchError } = await authenticatedSupabase
        .from('blog_posts')
        .select('id')
        .eq('featured', true)
        .order('featured_order', { ascending: true });

      if (fetchError) {
        console.error('❌ featured 포스트 조회 실패:', fetchError);
        throw fetchError;
      }

      console.log('📋 재정렬할 포스트들:', currentFeatured);

      // 순서 재정렬
      for (let i = 0; i < currentFeatured.length; i++) {
        const { error } = await authenticatedSupabase
          .from('blog_posts')
          .update({ featured_order: i + 1 })
          .eq('id', currentFeatured[i].id);

        if (error) {
          console.error(`❌ 포스트 ${currentFeatured[i].id} 순서 재정렬 실패:`, error);
          throw error;
        }
      }

      console.log('✅ featured 포스트 순서 재정렬 완료');

    } catch (err) {
      console.error('❌ 순서 재정렬 오류:', err);
      throw err;
    }
  };

  // 포스트 순서 변경 (화살표 버튼용)
  const movePost = async (postId, direction) => {
    console.log('🔄 movePost 호출됨:', { postId, direction, featuredPostsCount: featuredPosts.length });
    
    const currentIndex = featuredPosts.findIndex(post => post.id === postId);
    if (currentIndex === -1) {
      console.log('❌ 포스트를 찾을 수 없음:', postId);
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= featuredPosts.length) {
      console.log('❌ 유효하지 않은 인덱스:', { currentIndex, newIndex, direction });
      return;
    }

    console.log('✅ 순서 변경 시작:', { currentIndex, newIndex, direction });
    setUpdatingPosts(prev => new Set(prev).add(postId));

    try {
      // 인증된 세션이 있는 Supabase 클라이언트 사용
      const authenticatedSupabase = createClientComponentClient();
      
      // 세션 토큰으로 명시적 인증
      if (session?.access_token) {
        console.log('🔐 화살표 순서 변경 - 세션 토큰으로 인증 시도');
        await authenticatedSupabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        });
      }

      // 두 포스트의 순서만 교체
      const currentPost = featuredPosts[currentIndex];
      const targetPost = featuredPosts[newIndex];
      const currentOrder = currentPost.featured_order;
      const targetOrder = targetPost.featured_order;

      console.log('🔄 순서 교체:', { 
        current: { id: currentPost.id, order: currentOrder }, 
        target: { id: targetPost.id, order: targetOrder } 
      });

      // 첫 번째 포스트 순서 업데이트
      const { error: error1 } = await authenticatedSupabase
        .from('blog_posts')
        .update({ 
          featured_order: targetOrder,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentPost.id);

      if (error1) {
        console.error('❌ 첫 번째 포스트 순서 변경 실패:', error1);
        throw error1;
      }

      // 두 번째 포스트 순서 업데이트
      const { error: error2 } = await authenticatedSupabase
        .from('blog_posts')
        .update({ 
          featured_order: currentOrder,
          updated_at: new Date().toISOString()
        })
        .eq('id', targetPost.id);

      if (error2) {
        console.error('❌ 두 번째 포스트 순서 변경 실패:', error2);
        throw error2;
      }

      console.log('✅ 순서 교체 완료');

      // 성공 후 데이터 다시 로드
      await fetchFeaturedPosts();
      toast.success('포스트 순서가 변경되었습니다.');

    } catch (err) {
      console.error('❌ 포스트 순서 변경 오류:', err);
      
      // RLS 관련 오류인 경우 구체적인 메시지
      if (err.message?.includes('RLS') || err.message?.includes('policy') || err.code === '42501') {
        toast.error('권한이 없습니다. 관리자로 로그인했는지 확인해주세요.');
      } else {
        toast.error('포스트 순서 변경에 실패했습니다.');
      }
    } finally {
      setUpdatingPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  // 드래그로 포스트 순서 변경
  const reorderPostsByDrag = async (oldIndex, newIndex) => {
    console.log('🎯 드래그 순서 변경 시작:', { oldIndex, newIndex });
    console.log('📋 변경 전 포스트 순서:', featuredPosts.map((p, i) => ({ index: i, id: p.id, title: p.title, order: p.featured_order })));
    
    setUpdatingPosts(prev => new Set([...prev, ...featuredPosts.map(p => p.id)]));

    try {
      // 로컬 상태에서 먼저 순서 변경 (계산용)
      const newFeaturedPosts = arrayMove(featuredPosts, oldIndex, newIndex);
      console.log('📋 변경 후 예상 순서:', newFeaturedPosts.map((p, i) => ({ index: i, id: p.id, title: p.title })));

      // 인증된 세션이 있는 Supabase 클라이언트 사용
      const authenticatedSupabase = createClientComponentClient();
      
      // 세션 토큰으로 명시적 인증
      if (session?.access_token) {
        console.log('🔐 드래그 순서 변경 - 세션 토큰으로 인증 시도');
        await authenticatedSupabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        });
      }

      // 각 포스트의 순서를 순차적으로 업데이트
      console.log('📝 순서 업데이트 시작...');
      for (let i = 0; i < newFeaturedPosts.length; i++) {
        const post = newFeaturedPosts[i];
        const newOrder = i + 1;
        
        console.log(`📝 포스트 ${post.id} (${post.title}) 순서 업데이트: ${newOrder}`);
        
        const { error } = await authenticatedSupabase
          .from('blog_posts')
          .update({ 
            featured_order: newOrder,
            updated_at: new Date().toISOString()
          })
          .eq('id', post.id);

        if (error) {
          console.error(`❌ 포스트 ${post.id} 순서 업데이트 실패:`, error);
          throw error;
        }
      }
      
      console.log('✅ 모든 포스트 순서 업데이트 완료');
      
      // 성공 후 데이터 다시 로드
      await fetchFeaturedPosts();
      toast.success('포스트 순서가 변경되었습니다.');

    } catch (err) {
      console.error('❌ 드래그 순서 변경 오류:', err);
      
      // RLS 관련 오류인 경우 구체적인 메시지
      if (err.message?.includes('RLS') || err.message?.includes('policy') || err.code === '42501') {
        toast.error('권한이 없습니다. 관리자로 로그인했는지 확인해주세요.');
      } else {
        toast.error('포스트 순서 변경에 실패했습니다.');
      }
      
      // 오류 시 원래 데이터로 복원
      await fetchFeaturedPosts();
    } finally {
      setUpdatingPosts(new Set());
      console.log('🎯 드래그 순서 변경 완료');
    }
  };

  // 드래그앤드롭 종료 핸들러
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    console.log('🎯 드래그 종료:', { 
      activeId: active.id, 
      overId: over?.id,
      hasSameId: active.id === over?.id
    });

    if (active.id !== over?.id) {
      const oldIndex = featuredPosts.findIndex(post => post.id === active.id);
      const newIndex = featuredPosts.findIndex(post => post.id === over.id);

      console.log('📊 인덱스 계산:', { 
        activeId: active.id,
        overId: over.id,
        oldIndex, 
        newIndex,
        featuredPostsCount: featuredPosts.length
      });

      if (oldIndex !== -1 && newIndex !== -1) {
        console.log('✅ 드래그 순서 변경 실행');
        await reorderPostsByDrag(oldIndex, newIndex);
      } else {
        console.log('❌ 유효하지 않은 인덱스로 드래그 취소');
      }
    } else {
      console.log('🚫 같은 위치로 드래그 - 변경 없음');
    }
  };

  // 포스트 목록이 변경될 때 featured 포스트 목록 업데이트
  useEffect(() => {
    fetchFeaturedPosts();
  }, [blogPosts]);

  return {
    featuredPosts,
    availablePosts,
    updatingPosts,
    sensors,
    addToFeatured,
    removeFromFeatured,
    movePost,
    handleDragEnd,
    fetchFeaturedPosts
  };
}