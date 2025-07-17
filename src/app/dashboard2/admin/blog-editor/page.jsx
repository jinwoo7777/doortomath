"use client"

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

import { LoadingSpinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText, Settings, List, Star } from 'lucide-react';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { BlogPostEditor } from '@/components/admin/BlogPostEditor';
import { AppSidebar } from "@/components/admin/shadcn-dashborard/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

// 커스텀 훅 및 컴포넌트 임포트
import { useBlogPosts } from '@/components/admin/blog-editor/hooks/useBlogPosts';
import { useCategories } from '@/components/admin/blog-editor/hooks/useCategories';
import { useFeaturedPosts } from '@/components/admin/blog-editor/hooks/useFeaturedPosts';
import BlogPostList from '@/components/admin/blog-editor/BlogPostList';
import BlogStats from '@/components/admin/blog-editor/BlogStats';
import FeaturedPostsManager from '@/components/admin/blog-editor/FeaturedPostsManager';
import { BlogEditorHeader } from '@/components/admin/blog-editor/BlogEditorHeader';

/**
 * 블로그 에디터 페이지 컴포넌트
 * 블로그 포스트 관리, 카테고리 관리, 메인페이지 설정 기능 제공
 */
export default function BlogEditorPage({ initialTab }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, userRole, loading, roleLoaded } = useAuth();
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('list');

  // 독립 페이지인지 확인 (직접 /dashboard2/admin/blog-editor로 접근했는지)
  const isStandalonePage = typeof window !== 'undefined' && window.location.pathname === '/dashboard2/admin/blog-editor';

  // 커스텀 훅 사용
  const {
    blogPosts,
    loading: postsLoading,
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    categoryFilter, setCategoryFilter,
    filteredPosts,
    stats,
    updatingPosts,
    handleDeletePost,
    handleStatusChange,
    handleToggleFeatured,
    fetchBlogPosts
  } = useBlogPosts();

  const { categories, fetchCategories, getCategoryName } = useCategories();

  const {
    featuredPosts,
    availablePosts,
    updatingPosts: featuredUpdatingPosts,
    sensors,
    addToFeatured,
    removeFromFeatured,
    movePost,
    handleDragEnd,
    fetchFeaturedPosts
  } = useFeaturedPosts({ blogPosts, fetchBlogPosts });

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

  // featured 탭이 활성화될 때 데이터 로드
  useEffect(() => {
    if (activeTab === 'featured') {
      fetchFeaturedPosts();
    }
  }, [activeTab]);

  // 포스트 저장 성공 시 호출되는 함수
  const handlePostSaveSuccess = async () => {
    // 필터 초기화 (모든 포스트가 보이도록)
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
    
    // 즉시 목록 새로고침
    await fetchBlogPosts(true); // 강제 새로고침 플래그
    
    // 짧은 지연 후 탭 변경
    setTimeout(() => {
      setActiveTab('list');
      
      // 추가 지연 후 다시 한 번 새로고침 (안전장치)
      setTimeout(() => {
        fetchBlogPosts(true);
      }, 500);
    }, 100);
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
      <BlogStats stats={stats} />

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
            <BlogPostList 
              filteredPosts={filteredPosts}
              loading={postsLoading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              categories={categories}
              onDeletePost={handleDeletePost}
              onStatusChange={handleStatusChange}
              onToggleFeatured={handleToggleFeatured}
              onCreateClick={() => handleTabChange('create')}
              updatingPosts={updatingPosts}
              getCategoryName={getCategoryName}
            />
          </TabsContent>

          {/* 포스트 생성 탭 */}
          <TabsContent value="create" className="space-y-4">
            <BlogPostEditor onSaveSuccess={handlePostSaveSuccess} />
          </TabsContent>

          {/* 카테고리 관리 탭 */}
          <TabsContent value="categories" className="space-y-4">
            <CategoryManager 
              categories={categories} 
              onCategoryUpdate={fetchCategories}
            />
          </TabsContent>

          {/* 메인페이지 설정 탭 */}
          <TabsContent value="featured" className="space-y-4">
            <FeaturedPostsManager
              featuredPosts={featuredPosts}
              availablePosts={availablePosts}
              updatingPosts={featuredUpdatingPosts}
              sensors={sensors}
              onAddToFeatured={addToFeatured}
              onRemoveFromFeatured={removeFromFeatured}
              onMovePost={movePost}
              onDragEnd={handleDragEnd}
            />
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
          <LoadingSpinner size="xl" text="인증 상태를 확인하는 중..." />
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
          <BlogEditorHeader />
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
          <BlogEditorHeader />
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
        <BlogEditorHeader />
        {renderContent()}
      </SidebarInset>
    </SidebarProvider>
  );
}