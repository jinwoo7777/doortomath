"use client"

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, BookOpen, Settings, List, Eye, Edit, Trash2, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// 강의 관리 컴포넌트들 import
import MenuManagementContent from '@/components/admin/dashboard/menu-management/MenuManagementContent';
import { AdvancedCourseEditor } from '@/components/admin/dashboard/courses-design/AdvancedCourseEditor';
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

export default function ClassDescriptionPage({ initialTab }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, userRole, loading, roleLoaded } = useAuth();
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('list');
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [updatingCourses, setUpdatingCourses] = useState(new Set()); // 상태 변경 중인 수업 ID들
  
  // 섹션 표시 설정 상태
  const [sectionVisibility, setSectionVisibility] = useState({
    visible: true,
    title: "Academic Courses",
    subtitle: "Popular Courses"
  });
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);
  
  const supabase = createClientComponentClient();

  // 독립 페이지인지 확인 (직접 /dashboard2/admin/class-description로 접근했는지)
  const isStandalonePage = typeof window !== 'undefined' && window.location.pathname === '/dashboard2/admin/class-description';

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
    if (initialTab && ['list', 'create', 'menu', 'settings'].includes(initialTab)) {
      setActiveTab(initialTab);
      return;
    }
    
    // URL 파라미터에서 탭 정보 읽기 (독립 페이지 모드)
    const tabParam = searchParams.get('tab');
    if (tabParam && ['list', 'create', 'menu', 'settings'].includes(tabParam)) {
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

  // 섹션 표시 설정 불러오기
  const fetchSectionVisibility = async () => {
    try {
      const { data, error } = await supabase
        .from('main_page_content')
        .select('content')
        .eq('section_name', 'courses_section_visibility')
        .single();

      if (error) {
        console.error('섹션 표시 설정 불러오기 오류:', error);
        return;
      }

      if (data) {
        setSectionVisibility(data.content);
      }
    } catch (err) {
      console.error('섹션 표시 설정 불러오기 실패:', err);
    }
  };

  // 강의 목록 불러오기
  const fetchCourses = async (forceRefresh = false) => {
    if (loading || !roleLoaded || !session || userRole !== 'admin') {
      console.log('📋 fetchCourses 스킵:', { loading, roleLoaded, hasSession: !!session, userRole });
      return;
    }
    
    console.log('📋 수업 목록 불러오기 시작', { forceRefresh, currentCoursesCount: courses.length });
    setPageLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log('📋 데이터베이스에서 가져온 수업:', {
        총개수: data?.length || 0,
        상태별개수: {
          published: data?.filter(c => c.status === 'published').length || 0,
          draft: data?.filter(c => c.status === 'draft').length || 0,
        },
        최신수업: data?.[0] ? {
          제목: data[0].title,
          상태: data[0].status,
          생성시간: data[0].created_at
        } : null
      });
      
      setCourses(data || []);
      console.log('📋 상태 업데이트 완료:', data?.length || 0, '개 수업');
      
    } catch (err) {
      console.error('❌ 수업 목록 불러오기 오류:', err);
      toast.error('수업 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setPageLoading(false);
      console.log('📋 fetchCourses 완료');
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchSectionVisibility(); // 페이지 로드 시 섹션 표시 설정 불러오기
  }, [session, supabase, loading, roleLoaded, userRole]);

  // 섹션 표시 설정 저장 (디바운스 적용)
  const [updateTimeout, setUpdateTimeout] = useState(null);

  const handleSectionVisibilityUpdate = async (updatedSettings) => {
    if (isUpdatingVisibility) return;

    // 즉시 UI 업데이트
    setSectionVisibility(updatedSettings);

    // 기존 타이머 취소
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }

    // 새 타이머 설정
    const timeoutId = setTimeout(async () => {
      setIsUpdatingVisibility(true);
      
      try {
        const { error } = await supabase
          .from('main_page_content')
          .update({ 
            content: updatedSettings,
            updated_at: new Date().toISOString()
          })
          .eq('section_name', 'courses_section_visibility');

        if (error) {
          console.error('섹션 표시 설정 저장 오류:', error);
          toast.error('설정 저장 중 오류가 발생했습니다.');
          return;
        }

        toast.success('섹션 표시 설정이 저장되었습니다.');
        
      } catch (err) {
        console.error('섹션 표시 설정 저장 실패:', err);
        toast.error('설정 저장 중 오류가 발생했습니다.');
      } finally {
        setIsUpdatingVisibility(false);
      }
    }, 1000); // 1초 디바운스

    setUpdateTimeout(timeoutId);
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
    };
  }, [updateTimeout]);

  // 강의 삭제
  const handleDeleteCourse = async (courseId) => {
    if (!confirm('정말로 이 수업을 삭제하시겠습니까?')) {
      return;
    }

    console.log('🗑️ 수업 삭제 시작:', courseId);
    
    // 삭제 중인 수업을 로딩 상태로 설정
    setUpdatingCourses(prev => new Set([...prev, courseId]));

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) {
        console.error('❌ 수업 삭제 실패:', error);
        throw error;
      }

      console.log('✅ 수업 삭제 성공');
      
      // 로컬 상태에서 삭제된 수업 제거
      setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
      
      toast.success('수업이 성공적으로 삭제되었습니다.');
    } catch (supabaseError) {
      console.error('❌ 수업 삭제 오류:', supabaseError);
      
      const errorDetails = {
        message: supabaseError.message || '알 수 없는 오류',
        code: supabaseError.code || 'UNKNOWN'
      };
      
      console.error('🔍 삭제 에러 상세 정보:', errorDetails);
      
      // 구체적인 에러 메시지 표시
      if (errorDetails.code === '42501') {
        toast.error('삭제 권한이 없습니다. 관리자에게 문의하세요.');
      } else if (errorDetails.code === 'PGRST116') {
        toast.error('수업을 찾을 수 없습니다.');
      } else {
        toast.error(`수업 삭제 중 오류가 발생했습니다: ${errorDetails.message}`);
      }
    } finally {
      // 로딩 상태 해제
      setUpdatingCourses(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
    }
  };

  // 강의 상태 변경
  const handleStatusChange = async (courseId, newStatus) => {
    console.log('🔄 수업 상태 변경 시작:', { courseId, newStatus });
    
    // 이미 업데이트 중인 수업인지 확인
    if (updatingCourses.has(courseId)) {
      console.log('⚠️ 이미 업데이트 중인 수업:', courseId);
      toast.warning('이미 상태 변경이 진행 중입니다. 잠시 기다려주세요.');
      return;
    }

    // 로딩 상태 시작
    setUpdatingCourses(prev => new Set([...prev, courseId]));
    
    try {
      console.log('💾 수업 상태 변경 중...');
      
      const updateData = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('courses')
        .update(updateData)
        .eq('id', courseId);

      if (error) {
        console.error('❌ 수업 상태 변경 실패:', error);
        throw error;
      }

      console.log('✅ 수업 상태 변경 성공');
      
      // 로컬 상태 업데이트
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course.id === courseId 
            ? { ...course, ...updateData }
            : course
        )
      );

      const statusMessages = {
        'draft': '초안으로 변경',
        'published': '게시'
      };

      toast.success(`수업이 ${statusMessages[newStatus]}되었습니다.`);
    } catch (supabaseError) {
      console.error('❌ 수업 상태 변경 오류:', supabaseError);
      
      const errorDetails = {
        message: supabaseError.message || '알 수 없는 오류',
        code: supabaseError.code || 'UNKNOWN'
      };
      
      console.error('🔍 에러 상세 정보:', errorDetails);
      
      // 구체적인 에러 메시지 표시
      if (errorDetails.code === '42501') {
        toast.error('상태 변경 권한이 없습니다. 관리자에게 문의하세요.');
      } else if (errorDetails.code === 'PGRST116') {
        toast.error('수업을 찾을 수 없습니다.');
      } else {
        toast.error(`수업 상태 변경 중 오류가 발생했습니다: ${errorDetails.message}`);
      }
    } finally {
      // 로딩 상태 해제
      setUpdatingCourses(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
    }
  };

  // 강의 편집 핸들러
  const handleEditCourse = (course) => {
    console.log('📝 수업 편집 페이지로 이동:', course.id, course.title);
    router.push(`/dashboard2/admin/class-description/edit/${course.id}`);
  };

  // 강의 저장 성공 시 호출되는 함수
  const handleCourseSaveSuccess = async () => {
    console.log('🎉 수업 저장 성공 콜백 시작');
    
    try {
      // 필터 초기화 (모든 수업이 보이도록)
      console.log('🧹 필터 초기화');
      setSearchTerm('');
      setStatusFilter('all');
      setCategoryFilter('all');
      
      // 즉시 목록 새로고침
      console.log('🔄 목록 새로고침 시작...');
      await fetchCourses(true); // 강제 새로고침 플래그
      
      // 짧은 지연 후 탭 변경
      setTimeout(() => {
        console.log('📋 목록 탭으로 이동');
        setActiveTab('list');
        
        // 추가 지연 후 다시 한 번 새로고침 (안전장치)
        setTimeout(() => {
          console.log('🔄 안전장치: 추가 새로고침');
          fetchCourses(true);
        }, 500);
        
      }, 100);
      
    } catch (error) {
      console.error('❌ 수업 저장 성공 콜백 오류:', error);
    }
    
    console.log('🎉 수업 저장 성공 콜백 완료');
  };

  // 필터링된 강의 목록
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // 카테고리 목록 추출
  const categories = [...new Set(courses.map(course => course.category).filter(Boolean))];

  // 상태별 통계
  const stats = {
    total: courses.length,
    published: courses.filter(course => course.status === 'published').length,
    draft: courses.filter(course => course.status === 'draft').length,
    categories: categories.length
  };

  // 콘텐츠 렌더링 함수
  const renderContent = () => (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      {/* 페이지 헤더 */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold">수업 설명 관리</h1>
        <p className="text-muted-foreground">수업 설명과 홍보 콘텐츠를 생성, 편집, 관리합니다.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 수업</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">전체 등록된 수업</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">게시된 수업</CardTitle>
            <Badge variant="default" className="h-4 w-4 p-0 text-xs">P</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
            <p className="text-xs text-muted-foreground">현재 공개 중</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">초안</CardTitle>
            <Badge variant="secondary" className="h-4 w-4 p-0 text-xs">D</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
            <p className="text-xs text-muted-foreground">작성 중인 수업</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">카테고리</CardTitle>
            <Badge variant="outline" className="h-4 w-4 p-0 text-xs">C</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categories}</div>
            <p className="text-xs text-muted-foreground">수업 분류</p>
          </CardContent>
        </Card>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              수업 목록
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              수업 설명 생성
            </TabsTrigger>
            <TabsTrigger value="menu" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              메뉴 관리
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <ToggleLeft className="h-4 w-4" />
              섹션 표시 설정
            </TabsTrigger>
          </TabsList>

          {/* 강의 목록 탭 */}
          <TabsContent value="list" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>수업 목록</CardTitle>
                <CardDescription>등록된 수업 설명을 확인하고 관리할 수 있습니다.</CardDescription>
                
                {/* 필터링 및 검색 */}
                <div className="flex flex-col md:flex-row gap-4 pt-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="제목이나 설명으로 검색..."
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
                      <SelectItem value="published">게시됨</SelectItem>
                      <SelectItem value="draft">초안</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="카테고리 필터" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">모든 카테고리</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={() => handleTabChange('create')} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    새 수업 설명
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {pageLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="text-center">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      <p className="mt-2 text-sm text-muted-foreground">수업을 불러오는 중...</p>
                    </div>
                  </div>
                ) : filteredCourses.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium">수업이 없습니다</p>
                    <p className="text-muted-foreground mb-4">첫 번째 수업 설명을 생성해보세요.</p>
                    <Button onClick={() => handleTabChange('create')}>
                      <Plus className="h-4 w-4 mr-2" />
                      수업 설명 생성
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredCourses.map((course) => (
                      <div key={course.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{course.title}</h3>
                              <Badge 
                                variant={
                                  course.status === 'published' ? 'default' : 'secondary'
                                }
                              >
                                {course.status === 'published' ? '게시됨' : '초안'}
                              </Badge>
                            </div>
                            {course.description && (
                              <p className="text-muted-foreground mb-2 line-clamp-2">{course.description.replace(/<[^>]*>/g, '').substring(0, 150)}...</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>카테고리: {course.category || '미분류'}</span>
                              <span>좌석: {course.seats || 0}석</span>
                              <span>기간: {course.weeks || 0}주</span>
                              <span>가격: {course.price ? `${course.price.toLocaleString()}원` : '무료'}</span>
                              <span>생성일: {new Date(course.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {course.status === 'published' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`/course-details/${course.id}`, '_blank')}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditCourse(course)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Select 
                              value={course.status} 
                              onValueChange={(newStatus) => handleStatusChange(course.id, newStatus)}
                              disabled={updatingCourses.has(course.id)}
                            >
                              <SelectTrigger className="w-[100px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="draft">초안</SelectItem>
                                <SelectItem value="published">게시</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCourse(course.id)}
                              className="text-destructive hover:text-destructive"
                              disabled={updatingCourses.has(course.id)}
                            >
                              {updatingCourses.has(course.id) ? (
                                <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 강의 생성 탭 */}
          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>새 수업 설명 생성</CardTitle>
                <CardDescription>
                  새로운 수업 설명을 생성합니다. 기존 수업을 편집하려면 수업 목록에서 편집 버튼을 클릭하세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdvancedCourseEditor 
                  editingCourse={null}
                  onSaveSuccess={handleCourseSaveSuccess}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 메뉴 관리 탭 */}
          <TabsContent value="menu" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>수업 메뉴 관리</CardTitle>
                <CardDescription>수업 카테고리 메뉴를 관리하고 순서를 변경할 수 있습니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <MenuManagementContent />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 섹션 표시 설정 탭 */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>수업 섹션 표시 설정</CardTitle>
                <CardDescription>메인 페이지에서 수업 섹션의 표시 여부와 제목, 부제목을 관리합니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* 섹션 표시 여부 */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label htmlFor="visible" className="text-base font-medium">
                        수업 섹션 표시
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        메인 페이지에서 수업 섹션을 표시할지 여부를 설정합니다
                      </p>
                    </div>
                    <Switch
                      id="visible"
                      checked={sectionVisibility.visible}
                      onCheckedChange={(checked) => handleSectionVisibilityUpdate({ ...sectionVisibility, visible: checked })}
                      disabled={isUpdatingVisibility}
                    />
                  </div>

                  {/* 제목 및 부제목 설정 (섹션이 표시될 때만) */}
                  {sectionVisibility.visible && (
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                      <h4 className="font-medium">섹션 내용 설정</h4>
                      
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-medium">
                          메인 제목
                        </Label>
                        <Input
                          id="title"
                          value={sectionVisibility.title}
                          onChange={(e) => handleSectionVisibilityUpdate({ ...sectionVisibility, title: e.target.value })}
                          disabled={isUpdatingVisibility}
                          placeholder="예: Academic Courses"
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">수업 섹션의 메인 제목입니다</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="subtitle" className="text-sm font-medium">
                          부제목
                        </Label>
                        <Input
                          id="subtitle"
                          value={sectionVisibility.subtitle}
                          onChange={(e) => handleSectionVisibilityUpdate({ ...sectionVisibility, subtitle: e.target.value })}
                          disabled={isUpdatingVisibility}
                          placeholder="예: Popular Courses"
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">메인 제목 위에 표시되는 부제목입니다</p>
                      </div>

                      {/* 미리보기 */}
                      <div className="mt-6 p-4 border rounded-lg bg-background">
                        <h5 className="text-sm font-medium mb-3">미리보기</h5>
                        <div className="text-center space-y-2">
                          <p className="text-sm text-primary uppercase font-semibold">
                            {sectionVisibility.subtitle}
                          </p>
                          <h3 className="text-2xl font-bold">
                            {sectionVisibility.title}
                          </h3>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 상태 표시 */}
                  {isUpdatingVisibility && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin"></div>
                      <span>설정을 저장하는 중...</span>
                    </div>
                  )}
                </div>
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
                      수업 설명 관리
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      수업설명 관리
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
                      수업 설명 관리
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      수업설명 관리
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
                    수업 설명 관리
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    수업 설명 관리
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