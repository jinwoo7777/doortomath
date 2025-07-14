"use client"

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

// DnD Kit imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Settings, List, Eye, Edit, Trash2, Search, Star, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { BlogPostEditor } from '@/components/admin/BlogPostEditor';
import { AppSidebar } from "@/components/admin/shadcn-dashborard/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

// 드래그 가능한 포스트 아이템 컴포넌트
function SortablePostItem({ post, index, onMoveUp, onMoveDown, onRemove, isFirst, isLast, isUpdating }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: post.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-4 border rounded-lg bg-yellow-50 border-yellow-200 ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div 
          className="flex items-center gap-1 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            {index + 1}
          </Badge>
        </div>
        <div>
          <h4 className="font-medium">{post.title}</h4>
          <p className="text-sm text-muted-foreground">
            {post.profiles?.full_name || '관리자'} • {new Date(post.published_at).toLocaleDateString('ko-KR')}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            console.log('🔼 위로 이동 버튼 클릭:', post.id, post.title);
            onMoveUp(post.id);
          }}
          disabled={isFirst || isUpdating}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            console.log('🔽 아래로 이동 버튼 클릭:', post.id, post.title);
            onMoveDown(post.id);
          }}
          disabled={isLast || isUpdating}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onRemove(post.id)}
          disabled={isUpdating}
        >
          제거
        </Button>
      </div>
    </div>
  );
}

export default function BlogEditorPage({ initialTab }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, userRole, loading, roleLoaded } = useAuth();
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('list');
  const [blogPosts, setBlogPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [updatingPosts, setUpdatingPosts] = useState(new Set()); // 상태 변경 중인 포스트 ID들
  const [featuredPosts, setFeaturedPosts] = useState([]); // 메인페이지 표시 포스트들
  const [availablePosts, setAvailablePosts] = useState([]); // 선택 가능한 포스트들
  const supabase = createClientComponentClient();

  // 드래그앤드롭 센서 설정
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

  // 드래그로 포스트 순서 변경 - RLS 방식으로 변경
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
      console.log('🔄 fetchFeaturedPosts 호출 시작...');
      await fetchFeaturedPosts();
      console.log('🔄 fetchFeaturedPosts 호출 완료');
      
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
      console.log('🔄 오류 복구를 위한 fetchFeaturedPosts 호출...');
      await fetchFeaturedPosts();
    } finally {
      setUpdatingPosts(new Set());
      console.log('🎯 드래그 순서 변경 완료');
    }
  };

  // 포스트 순서 변경 (화살표 버튼용) - RLS 방식으로 변경
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

      // 새로운 순서로 배열 생성
      const newFeaturedPosts = [...featuredPosts];
      [newFeaturedPosts[currentIndex], newFeaturedPosts[newIndex]] = 
      [newFeaturedPosts[newIndex], newFeaturedPosts[currentIndex]];
      
      console.log('📝 교체할 포스트들:', {
        current: { id: featuredPosts[currentIndex].id, title: featuredPosts[currentIndex].title },
        target: { id: featuredPosts[newIndex].id, title: featuredPosts[newIndex].title }
      });

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
      console.log('🔄 fetchFeaturedPosts 호출 시작...');
      await fetchFeaturedPosts();
      console.log('🔄 fetchFeaturedPosts 호출 완료');
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

  // 독립 페이지인지 확인 (직접 /dashboard2/admin/blog-editor로 접근했는지)
  const isStandalonePage = typeof window !== 'undefined' && window.location.pathname === '/dashboard2/admin/blog-editor';

  // 권한 확인
  useEffect(() => {
    if (loading || !roleLoaded) {
      return;
    }

    if (!session) {
      setError('로그인이 필요합니다.');
      return;
    }
    
    if (userRole !== 'admin') {
      setError('관리자 권한이 필요합니다.');
      return;
    }

    setError(null);
  }, [session, userRole, loading, roleLoaded]);

  // URL 쿼리 파라미터에서 탭 정보 읽기
  useEffect(() => {
    // initialTab prop이 있으면 우선 사용 (임베드 모드)
    if (initialTab && ['list', 'create', 'categories', 'featured'].includes(initialTab)) {
      setActiveTab(initialTab);
      return;
    }
    
    // URL 파라미터에서 탭 정보 읽기 (독립 페이지 모드)
    const tabParam = searchParams.get('tab');
    if (tabParam && ['list', 'create', 'categories', 'featured'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams, initialTab]);

  // 탭 변경 핸들러
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    
    // 독립 페이지인 경우에만 URL 업데이트
    if (isStandalonePage) {
      const newUrl = new URL(window.location);
      newUrl.searchParams.set('tab', newTab);
      window.history.replaceState({}, '', newUrl);
    }
  };

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

  useEffect(() => {
    fetchBlogPosts();
  }, [session, supabase, loading, roleLoaded, userRole]);

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

  useEffect(() => {
    fetchCategories();
  }, [session, supabase, loading, roleLoaded, userRole]);

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

  // 카테고리 슬러그를 한글 이름으로 변환하는 헬퍼 함수
  const getCategoryName = (categorySlug) => {
    const category = categories.find(cat => cat.slug === categorySlug);
    return category?.name || categorySlug;
  };

  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  // 메인페이지 표시 포스트 목록 불러오기
  const fetchFeaturedPosts = async () => {
    if (loading || !roleLoaded || !session || userRole !== 'admin') {
      console.log('🚫 fetchFeaturedPosts 스킵:', { loading, roleLoaded, hasSession: !!session, userRole });
      return;
    }
    
    console.log('📋 fetchFeaturedPosts 시작...');
    
    try {
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
        })) || [],
        rawData: featured
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

      // 순서 재정렬 - RLS 방식으로
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

  // featured 탭이 활성화될 때 데이터 로드
  useEffect(() => {
    console.log('🎯 useEffect 실행됨:', { 
      activeTab, 
      hasSession: !!session, 
      userRole, 
      loading, 
      roleLoaded 
    });
    
    if (activeTab === 'featured') {
      console.log('⭐ featured 탭 활성화됨 - fetchFeaturedPosts 호출');
      fetchFeaturedPosts();
    }
  }, [activeTab, session, supabase, loading, roleLoaded, userRole]);

  // featuredPosts 상태 변경 추적
  useEffect(() => {
    console.log('🔄 featuredPosts 상태 변경됨:', {
      count: featuredPosts.length,
      posts: featuredPosts.map((p, i) => ({
        index: i,
        id: p.id,
        title: p.title,
        featured_order: p.featured_order
      }))
    });
  }, [featuredPosts]);

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

      // featured 목록 새로고침
      if (activeTab === 'featured') {
        await fetchFeaturedPosts();
      }

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

  // 포스트 저장 성공 시 호출되는 함수
  const handlePostSaveSuccess = async () => {
    console.log('🎉 포스트 저장 성공 콜백 시작');
    
    try {
      // 필터 초기화 (모든 포스트가 보이도록)
      console.log('🧹 필터 초기화');
      setSearchTerm('');
      setStatusFilter('all');
      setCategoryFilter('all');
      
      // 즉시 목록 새로고침
      console.log('🔄 목록 새로고침 시작...');
      await fetchBlogPosts(true); // 강제 새로고침 플래그
      
      // 짧은 지연 후 탭 변경
      setTimeout(() => {
        console.log('📋 목록 탭으로 이동');
        setActiveTab('list');
        
        // 추가 지연 후 다시 한 번 새로고침 (안전장치)
        setTimeout(() => {
          console.log('🔄 안전장치: 추가 새로고침');
          fetchBlogPosts(true);
        }, 500);
        
      }, 100);
      
    } catch (error) {
      console.error('❌ 포스트 저장 성공 콜백 오류:', error);
    }
    
    console.log('🎉 포스트 저장 성공 콜백 완료');
  };

  // 필터링된 블로그 포스트
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
    
    const isVisible = matchesSearch && matchesStatus && matchesCategory;
    
    // 디버깅: 초안 포스트가 필터링되는 이유 추적
    if (post.status === 'draft' && !isVisible) {
      console.log('🔍 초안 포스트 필터링 분석:', {
        포스트제목: post.title,
        상태: post.status,
        검색어: searchTerm,
        상태필터: statusFilter,
        카테고리필터: categoryFilter,
        검색매치: matchesSearch,
        상태매치: matchesStatus,
        카테고리매치: matchesCategory,
        최종표시여부: isVisible
      });
    }
    
    return isVisible;
  });

  console.log('📊 현재 필터링 상태:', {
    전체포스트수: blogPosts.length,
    필터링된포스트수: filteredPosts.length,
    검색어: searchTerm || '없음',
    상태필터: statusFilter,
    카테고리필터: categoryFilter,
    초안포스트수: blogPosts.filter(p => p.status === 'draft').length,
    필터링된초안수: filteredPosts.filter(p => p.status === 'draft').length
  });

  // 상태별 통계
  const stats = {
    total: blogPosts.length,
    published: blogPosts.filter(post => post.status === 'published').length,
    draft: blogPosts.filter(post => post.status === 'draft').length,
    archived: blogPosts.filter(post => post.status === 'archived').length
  };

  // 콘텐츠 렌더링 함수
  const renderContent = () => (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      {/* 페이지 헤더 */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold">블로그 관리</h1>
        <p className="text-muted-foreground">블로그 포스트를 생성, 편집, 관리하고 카테고리를 설정합니다.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 포스트</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">전체 블로그 포스트</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">발행됨</CardTitle>
            <Badge variant="default" className="h-4 w-4 p-0 text-xs">P</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
            <p className="text-xs text-muted-foreground">현재 발행 중</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">초안</CardTitle>
            <Badge variant="secondary" className="h-4 w-4 p-0 text-xs">D</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
            <p className="text-xs text-muted-foreground">작성 중인 포스트</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">메인페이지 표시</CardTitle>
            <Badge variant="outline" className="h-4 w-4 p-0 text-xs">★</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blogPosts.filter(post => post.featured).length}</div>
            <p className="text-xs text-muted-foreground">최대 3개까지</p>
          </CardContent>
        </Card>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              포스트 목록
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              포스트 생성
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              카테고리 관리
            </TabsTrigger>
            <TabsTrigger value="featured" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              메인페이지 설정
            </TabsTrigger>
          </TabsList>

          {/* 포스트 목록 탭 */}
          <TabsContent value="list" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>블로그 포스트 목록</CardTitle>
                    <CardDescription>
                      작성된 블로그 포스트를 확인하고 관리합니다. 
                      <span className="inline-flex items-center ml-2 text-yellow-600">
                        <span className="mr-1">★</span>
                        메인페이지에 표시할 포스트를 최대 3개까지 선택할 수 있습니다.
                      </span>
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => setActiveTab('create')}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    새 포스트 작성
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* 필터링 및 검색 */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="제목이나 내용으로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="상태 필터" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">모든 상태</SelectItem>
                      <SelectItem value="published">발행됨</SelectItem>
                      <SelectItem value="draft">초안</SelectItem>
                      <SelectItem value="archived">보관됨</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="카테고리 필터" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">모든 카테고리</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.slug}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 포스트 목록 */}
                {pageLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="text-center">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      <p className="mt-2 text-sm text-muted-foreground">포스트를 불러오는 중...</p>
                    </div>
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium">포스트가 없습니다</p>
                    <p className="text-muted-foreground mb-4">첫 번째 블로그 포스트를 작성해보세요.</p>
                    <Button onClick={() => handleTabChange('create')}>
                      <Plus className="h-4 w-4 mr-2" />
                      포스트 생성
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">제목</th>
                          <th className="text-left p-3 font-medium">상태</th>
                          <th className="text-left p-3 font-medium">카테고리</th>
                          <th className="text-left p-3 font-medium">메인페이지 표시</th>
                          <th className="text-left p-3 font-medium">작성일</th>
                          <th className="text-left p-3 font-medium">작업</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPosts.map((post) => (
                          <tr key={post.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">
                              <div>
                                <div className="font-medium">{post.title}</div>
                                {post.excerpt && (
                                  <div className="text-sm text-gray-500 mt-1">
                                    {post.excerpt.length > 100 
                                      ? `${post.excerpt.substring(0, 100)}...` 
                                      : post.excerpt
                                    }
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge 
                                variant={
                                  post.status === 'published' ? 'default' :
                                  post.status === 'draft' ? 'secondary' : 'outline'
                                }
                              >
                                {post.status === 'published' ? '발행됨' :
                                 post.status === 'draft' ? '초안' : '보관됨'}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <Badge variant="outline">
                                {getCategoryName(post.category)}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={post.featured || false}
                                  onChange={() => handleToggleFeatured(post.id, post.featured)}
                                  disabled={updatingPosts.has(post.id)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                                />
                                {post.featured && (
                                  <span className="ml-2 text-xs text-yellow-600">★</span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-sm text-gray-500">
                              {formatDate(post.created_at)}
                            </td>
                            <td className="p-3">
                              <div className="flex gap-2">
                                {post.status === 'published' && post.slug && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/dashboard2/admin/blog-editor/edit/${post.id}`)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeletePost(post.id)}
                                  disabled={updatingPosts.has(post.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 포스트 생성 탭 */}
          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>새 블로그 포스트 생성</CardTitle>
                <CardDescription>새로운 블로그 포스트를 작성합니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <BlogPostEditor onSaveSuccess={handlePostSaveSuccess} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 카테고리 관리 탭 */}
          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>카테고리 관리</CardTitle>
                <CardDescription>블로그 포스트 카테고리를 관리합니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryManager 
                  categories={categories} 
                  onCategoryUpdate={fetchCategories}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 메인페이지 설정 탭 */}
          <TabsContent value="featured" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 현재 메인페이지에 표시되는 포스트들 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    메인페이지 표시 포스트
                  </CardTitle>
                  <CardDescription>
                    현재 메인페이지에 표시되는 포스트들입니다. 최대 3개까지 선택할 수 있고, 순서를 조정할 수 있습니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {featuredPosts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>메인페이지에 표시할 포스트를 선택해주세요.</p>
                    </div>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={featuredPosts.map(post => post.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-3">
                          {featuredPosts.map((post, index) => (
                            <SortablePostItem
                              key={post.id}
                              post={post}
                              index={index}
                              onMoveUp={(postId) => movePost(postId, 'up')}
                              onMoveDown={(postId) => movePost(postId, 'down')}
                              onRemove={removeFromFeatured}
                              isFirst={index === 0}
                              isLast={index === featuredPosts.length - 1}
                              isUpdating={updatingPosts.has(post.id)}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}
                </CardContent>
              </Card>

              {/* 추가 가능한 포스트들 */}
              <Card>
                <CardHeader>
                  <CardTitle>추가 가능한 포스트</CardTitle>
                  <CardDescription>
                    발행된 포스트 중에서 메인페이지에 추가할 수 있는 포스트들입니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {availablePosts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>추가 가능한 발행된 포스트가 없습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {availablePosts.map((post) => (
                        <div 
                          key={post.id} 
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div>
                            <h4 className="font-medium">{post.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {post.profiles?.full_name || '관리자'} • {new Date(post.published_at).toLocaleDateString('ko-KR')}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addToFeatured(post.id)}
                            disabled={featuredPosts.length >= 3 || updatingPosts.has(post.id)}
                          >
                            {featuredPosts.length >= 3 ? '최대 3개' : '추가'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 메인페이지 미리보기 안내 */}
            <Card>
              <CardHeader>
                <CardTitle>메인페이지 미리보기</CardTitle>
                <CardDescription>
                  설정한 포스트들이 메인페이지에 어떻게 표시되는지 확인하려면 메인페이지를 방문해보세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <a href="/" target="_blank" rel="noopener noreferrer">
                    메인페이지에서 확인하기
                  </a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  // 로딩 상태
  if (loading || !roleLoaded) {
    const loadingContent = (
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
          <div className="text-center">
            <div 
              className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" 
              role="status" 
              aria-busy="true"
            >
              <span className="sr-only">로딩 중...</span>
            </div>
            <p className="mt-4 text-muted-foreground">
              인증 상태를 확인하는 중...
            </p>
          </div>
        </div>
      </div>
    );

    if (!isStandalonePage) {
      return loadingContent;
    }

    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">
                      블로그 관리
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      블로그 에디터
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          {loadingContent}
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // 에러 상태
  if (error) {
    const errorContent = (
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
          <div className="text-center">
            <p className="text-destructive font-medium">{error}</p>
            <Button 
              onClick={() => router.push('/signin')} 
              className="mt-4"
            >
              로그인 페이지로 이동
            </Button>
          </div>
        </div>
      </div>
    );

    if (!isStandalonePage) {
      return errorContent;
    }

    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">
                      블로그 관리
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      블로그 에디터
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          {errorContent}
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // 독립 페이지가 아닌 경우 (메인 관리자 페이지에 임베드된 경우)
  if (!isStandalonePage) {
    return renderContent();
  }

  // 독립 페이지인 경우 사이드바 포함
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    블로그 관리
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    블로그 에디터
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        {renderContent()}
      </SidebarInset>
    </SidebarProvider>
  );
} 