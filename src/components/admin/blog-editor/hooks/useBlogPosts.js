import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

/**
 * 블로그 포스트 관리를 위한 커스텀 훅
 * 포스트 목록 조회, 삭제, 상태 변경, 필터링 기능 제공
 */
export function useBlogPosts() {
  const { session, userRole, loading, roleLoaded } = useAuth();
  const [blogPosts, setBlogPosts] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [updatingPosts, setUpdatingPosts] = useState(new Set()); // 상태 변경 중인 포스트 ID들
  const supabase = createClientComponentClient();

  // 블로그 포스트 목록 불러오기
  const fetchBlogPosts = async (forceRefresh = false) => {
    if (loading || !roleLoaded || !session || userRole !== 'admin') {
      console.log('📋 fetchBlogPosts 스킵:', { loading, roleLoaded, hasSession: !!session, userRole });
      return;
    }
    
    console.log('📋 블로그 포스트 목록 불러오기 시작', { forceRefresh, currentPostsCount: blogPosts.length });
    setPageLoading(true);
    
    try {
      // 관리자는 API 엔드포인트를 통해 서비스 역할로 모든 포스트 조회
      const response = await fetch('/api/admin/blog/list', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        credentials: 'same-origin'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const { data } = await response.json();
      
      console.log('📋 API에서 가져온 포스트:', {
        총개수: data?.length || 0,
        상태별개수: {
          draft: data?.filter(p => p.status === 'draft').length || 0,
          published: data?.filter(p => p.status === 'published').length || 0,
          archived: data?.filter(p => p.status === 'archived').length || 0
        },
        최신포스트: data?.[0] ? {
          제목: data[0].title,
          상태: data[0].status,
          생성시간: data[0].created_at
        } : null
      });
      
      setBlogPosts(data || []);
      console.log('📋 상태 업데이트 완료:', data?.length || 0, '개 포스트');
      
    } catch (err) {
      console.error('❌ 블로그 포스트 목록 불러오기 오류:', err);
      
      // API 실패시 폴백으로 기존 Supabase 클라이언트 사용
      console.log('🔄 폴백: Supabase 클라이언트로 재시도');
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select(`
            *,
            profiles!blog_posts_author_id_fkey (
              full_name,
              email
            )
          `)
          .neq('status', 'deleted') // 삭제된 포스트 제외
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        console.log('📋 폴백 - 데이터베이스에서 가져온 포스트:', {
          총개수: data?.length || 0,
          상태별개수: {
            draft: data?.filter(p => p.status === 'draft').length || 0,
            published: data?.filter(p => p.status === 'published').length || 0,
            archived: data?.filter(p => p.status === 'archived').length || 0
          }
        });
        
        setBlogPosts(data || []);
      } catch (fallbackErr) {
        console.error('❌ 폴백도 실패:', fallbackErr);
        toast.error('블로그 포스트 목록을 불러오는 중 오류가 발생했습니다.');
      }
    } finally {
      setPageLoading(false);
      console.log('📋 fetchBlogPosts 완료');
    }
  };

  // 블로그 포스트 삭제
  const handleDeletePost = async (postId) => {
    if (!confirm('정말로 이 블로그 포스트를 삭제하시겠습니까?')) {
      return;
    }

    console.log('🗑️ 포스트 삭제 시작:', postId);
    
    // 삭제 중인 포스트를 로딩 상태로 설정
    setUpdatingPosts(prev => new Set([...prev, postId]));

    try {
      // 관리자 API를 통해 삭제 시도
      console.log('🌐 API를 통한 포스트 삭제 시도...');
      const response = await fetch(`/api/admin/blog/delete?postId=${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        credentials: 'same-origin'
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ API를 통한 삭제 성공:', result);
        
        // 로컬 상태에서 삭제된 포스트 제거
        setBlogPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        
        toast.success(result.message || '블로그 포스트가 성공적으로 삭제되었습니다.');
        return; // 성공했으므로 여기서 종료
      } else {
        const errorData = await response.json();
        console.log('❌ API 삭제 실패, 폴백 시도:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
    } catch (apiError) {
      console.log('🔄 API 실패, Supabase 클라이언트로 폴백:', apiError.message);
      
      try {
        // 폴백: 기존 Supabase 클라이언트 사용
        console.log('💾 Supabase를 통한 삭제 시도...');
        
        const { error } = await supabase
          .from('blog_posts')
          .delete()
          .eq('id', postId);

        if (error) {
          console.error('❌ Supabase 삭제 실패:', error);
          throw error;
        }

        console.log('✅ Supabase를 통한 삭제 성공');
        
        // 로컬 상태에서 삭제된 포스트 제거
        setBlogPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        
        toast.success('블로그 포스트가 성공적으로 삭제되었습니다.');
      } catch (supabaseError) {
        console.error('❌ Supabase 삭제도 실패:', supabaseError);
        
        const errorDetails = {
          message: supabaseError.message || '알 수 없는 오류',
          code: supabaseError.code || 'UNKNOWN'
        };
        
        console.error('🔍 삭제 에러 상세 정보:', errorDetails);
        
        // 구체적인 에러 메시지 표시
        if (errorDetails.code === '42501') {
          toast.error('삭제 권한이 없습니다. 관리자에게 문의하세요.');
        } else if (errorDetails.code === 'PGRST116') {
          toast.error('포스트를 찾을 수 없습니다.');
        } else if (errorDetails.message.includes('RLS')) {
          toast.error('데이터베이스 접근 권한 문제가 발생했습니다.');
        } else {
          toast.error(`블로그 포스트 삭제 중 오류가 발생했습니다: ${errorDetails.message}`);
        }
      }
    } finally {
      // 로딩 상태 해제
      setUpdatingPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  // 블로그 포스트 상태 변경
  const handleStatusChange = async (postId, newStatus) => {
    console.log('🔄 포스트 상태 변경 시작:', { postId, newStatus });
    
    // 이미 업데이트 중인 포스트인지 확인
    if (updatingPosts.has(postId)) {
      console.log('⚠️ 이미 업데이트 중인 포스트:', postId);
      toast.warning('이미 상태 변경이 진행 중입니다. 잠시 기다려주세요.');
      return;
    }

    // 로딩 상태 시작
    setUpdatingPosts(prev => new Set([...prev, postId]));
    
    try {
      // 관리자 API를 통해 상태 변경 시도
      console.log('🌐 API를 통한 상태 변경 시도...');
      const response = await fetch('/api/admin/blog/update-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          postId,
          newStatus
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ API를 통한 상태 변경 성공:', result);
        
        // 로컬 상태 업데이트
        setBlogPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? { ...post, ...result.data }
              : post
          )
        );

        toast.success(result.message || `블로그 포스트 상태가 ${newStatus}로 변경되었습니다.`);
        return; // 성공했으므로 여기서 종료
      } else {
        const errorData = await response.json();
        console.log('❌ API 상태 변경 실패, 폴백 시도:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
    } catch (apiError) {
      console.log('🔄 API 실패, Supabase 클라이언트로 폴백:', apiError.message);
      
      try {
        // 폴백: 기존 Supabase 클라이언트 사용
        console.log('💾 Supabase를 통한 상태 변경 시도...');
        
        const updateData = {
          status: newStatus,
          updated_at: new Date().toISOString()
        };

        if (newStatus === 'published') {
          updateData.published_at = new Date().toISOString();
        }

        const { error } = await supabase
          .from('blog_posts')
          .update(updateData)
          .eq('id', postId);

        if (error) {
          console.error('❌ Supabase 상태 변경 실패:', error);
          throw error;
        }

        console.log('✅ Supabase를 통한 상태 변경 성공');
        
        // 로컬 상태 업데이트
        setBlogPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? { ...post, ...updateData }
              : post
          )
        );

        const statusMessages = {
          'draft': '초안으로 변경',
          'published': '발행',
          'archived': '보관'
        };

        toast.success(`블로그 포스트가 ${statusMessages[newStatus]}되었습니다.`);
      } catch (supabaseError) {
        console.error('❌ Supabase 상태 변경도 실패:', supabaseError);
        
        const errorDetails = {
          message: supabaseError.message || '알 수 없는 오류',
          code: supabaseError.code || 'UNKNOWN'
        };
        
        console.error('🔍 에러 상세 정보:', errorDetails);
        
        // 구체적인 에러 메시지 표시
        if (errorDetails.code === '42501') {
          toast.error('상태 변경 권한이 없습니다. 관리자에게 문의하세요.');
        } else if (errorDetails.code === 'PGRST116') {
          toast.error('포스트를 찾을 수 없습니다.');
        } else if (errorDetails.message.includes('RLS')) {
          toast.error('데이터베이스 접근 권한 문제가 발생했습니다.');
        } else {
          toast.error(`블로그 포스트 상태 변경 중 오류가 발생했습니다: ${errorDetails.message}`);
        }
      }
    } finally {
      // 로딩 상태 해제
      setUpdatingPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  // 메인페이지 표시 토글 함수
  const handleToggleFeatured = async (postId, currentFeatured) => {
    if (updatingPosts.has(postId)) {
      toast.error('이미 처리 중입니다. 잠시 기다려주세요.');
      return;
    }

    // featured를 true로 설정하려는 경우, 현재 featured 포스트 수 확인
    if (!currentFeatured) {
      const currentFeaturedCount = blogPosts.filter(post => post.featured).length;
      if (currentFeaturedCount >= 3) {
        toast.error('메인페이지에는 최대 3개의 포스트만 표시할 수 있습니다.');
        return;
      }
    }

    console.log('🌟 Featured 상태 변경 시작:', { postId, currentFeatured, session: !!session });
    setUpdatingPosts(prev => new Set(prev).add(postId));

    try {
      // 인증된 세션이 있는 Supabase 클라이언트 사용
      const authenticatedSupabase = createClientComponentClient();
      
      // 세션 토큰으로 명시적 인증
      if (session?.access_token) {
        console.log('🔐 세션 토큰으로 인증 시도');
        await authenticatedSupabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        });
      }

      let updateData = { 
        featured: !currentFeatured,
        updated_at: new Date().toISOString()
      };

      // featured로 설정할 때 순서도 설정
      if (!currentFeatured) {
        const nextOrder = Math.max(...blogPosts.filter(p => p.featured).map(p => p.featured_order || 0), 0) + 1;
        updateData.featured_order = nextOrder;
      } else {
        // featured 해제할 때 순서 초기화
        updateData.featured_order = 0;
      }

      console.log('📝 업데이트 데이터:', updateData);

      const { error } = await authenticatedSupabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', postId);

      if (error) {
        console.error('❌ Featured 상태 변경 오류:', error);
        throw error;
      }

      console.log('✅ Featured 상태 변경 성공');

      // 로컬 상태 업데이트
      setBlogPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, ...updateData }
          : post
      ));

      toast.success(
        !currentFeatured 
          ? '메인페이지에 표시되도록 설정했습니다.' 
          : '메인페이지 표시를 해제했습니다.'
      );

    } catch (err) {
      console.error('❌ Featured 상태 변경 실패:', err);
      
      // RLS 관련 오류인 경우 구체적인 메시지
      if (err.message?.includes('RLS') || err.message?.includes('policy') || err.code === '42501') {
        toast.error('권한이 없습니다. 관리자로 로그인했는지 확인해주세요.');
      } else if (err.code === 'PGRST116') {
        toast.error('포스트를 찾을 수 없습니다.');
      } else {
        toast.error(`메인페이지 표시 설정 변경에 실패했습니다: ${err.message}`);
      }
      
      // 오류 시 원래 상태로 복원
      await fetchBlogPosts();
    } finally {
      setUpdatingPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  // 초기 데이터 로드
  useEffect(() => {
    fetchBlogPosts();
  }, [session, loading, roleLoaded, userRole]);

  // 필터링된 블로그 포스트
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // 상태별 통계
  const stats = {
    total: blogPosts.length,
    published: blogPosts.filter(post => post.status === 'published').length,
    draft: blogPosts.filter(post => post.status === 'draft').length,
    archived: blogPosts.filter(post => post.status === 'archived').length,
    featured: blogPosts.filter(post => post.featured).length
  };

  return {
    blogPosts,
    loading: pageLoading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    filteredPosts,
    stats,
    updatingPosts,
    handleDeletePost,
    handleStatusChange,
    handleToggleFeatured,
    fetchBlogPosts,
    formatDate
  };
}