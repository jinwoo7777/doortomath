"use client"

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoadingSpinner, InlineSpinner } from '@/components/ui/spinner';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  PlusCircle, 
  MinusCircle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

import { AppSidebar } from "@/components/admin/shadcn-dashborard/app-sidebar"

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

// Default content structure
const DEFAULT_CONTENT = {
  categoryTwoHeader: {
    subtitle: '"수학의 문" 미리보기',
    title: '수학의 문 장점을을 살펴보세요',
  }
};

export default function Page() {
  console.log('Academy Preview Page rendering...');
  
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]); 
  const [sections, setSections] = useState(DEFAULT_CONTENT); 
  const [isDirty, setIsDirty] = useState(false);
  const supabase = createClientComponentClient();
  
  // 섹션 변경 핸들러
  const handleSectionChange = (section, field, value) => {
    console.log('handleSectionChange called:', { section, field, value });
    setSections(prev => {
      const newSections = { ...prev };
      const fieldPath = field.split('.');
      let current = newSections[section];

      for (let i = 0; i < fieldPath.length - 1; i++) {
        if (!current[fieldPath[i]]) {
          current[fieldPath[i]] = {};
        }
        current = current[fieldPath[i]];
      }
      current[fieldPath[fieldPath.length - 1]] = value;

      return newSections;
    });
    setIsDirty(true);
  };

  // 카테고리 변경 핸들러
  const handleCategoryChange = (index, field, value) => {
    console.log('handleCategoryChange called:', { index, field, value });
    setCategories(prev => {
      const updatedCategories = [...prev];
      updatedCategories[index] = {
        ...updatedCategories[index],
        [field]: value
      };
      return updatedCategories;
    });
    setIsDirty(true);
  };

  // 카테고리 추가
  const addCategory = () => {
    console.log('addCategory called');
    const newCategory = { 
      id: Date.now(), 
      title: '새 카테고리', 
      icon: '/home_3/category_icon_1.svg'
    };
    setCategories(prev => [...prev, newCategory]);
    setIsDirty(true);
    toast({
      title: '카테고리 추가됨',
      description: '새 카테고리가 추가되었습니다.',
    });
  };

  // 카테고리 삭제
  const removeCategory = (index) => {
    console.log('removeCategory called:', index);
    if (categories.length <= 1) {
      toast({
        title: '삭제 불가',
        description: '최소 하나의 카테고리는 남아있어야 합니다.',
        variant: 'destructive'
      });
      return;
    }
    
    setCategories(prev => prev.filter((_, i) => i !== index));
    setIsDirty(true);
    toast({
      title: '카테고리 삭제됨',
      description: '카테고리가 삭제되었습니다.',
    });
  };

  // Supabase에 데이터 저장
  const saveToSupabase = async (sectionName, content) => {
    console.log(`Saving ${sectionName} to Supabase:`, content);
    
    const { error } = await supabase
      .from('main_page_content')
      .upsert({
        section_name: sectionName,
        content: content,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'section_name'
      });

    if (error) {
      console.error(`Error saving ${sectionName}:`, error);
      throw error;
    }

    console.log(`${sectionName} saved successfully`);
  };

  // 변경사항 저장
  const saveChanges = async () => {
    if (!isDirty) {
      toast({
        title: '변경사항 없음',
        description: '저장할 변경사항이 없습니다.',
      });
      return;
    }
    
    console.log('saveChanges called');
    
    try {
      setIsSaving(true);

      // categoryTwoHeader 저장
      await saveToSupabase('categoryTwoHeader', sections.categoryTwoHeader);

      // categories 저장
      await saveToSupabase('categories', categories);

      console.log('All changes saved successfully');
      setIsDirty(false);

      toast({ 
        title: '저장 완료', 
        description: '모든 변경사항이 성공적으로 저장되었습니다.' 
      });

    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: '저장 실패',
        description: error.message || '변경사항 저장 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 데이터 로드
  useEffect(() => {
    console.log('useEffect called - starting data load');
    let isMounted = true;
    
    const fetchContent = async () => {
      try {
        console.log('fetchContent starting...');
        setLoading(true);
        setError(null);
        
        // 기본 카테고리 데이터로 시작 (Supabase 로드 실패시 백업용)
        let defaultCategories = [
          { id: 1, title: '수학 기초', icon: '/home_3/category_icon_1.svg' },
          { id: 2, title: '고급 수학', icon: '/home_3/category_icon_2.svg' },
          { id: 3, title: '문제 해결', icon: '/home_3/category_icon_3.svg' }
        ];

        // Supabase에서 실제 데이터 로드
        try {
          // categoryTwoHeader 데이터 로드
          const { data: headerData, error: headerError } = await supabase
            .from('main_page_content')
            .select('content')
            .eq('section_name', 'categoryTwoHeader')
            .single();

          if (headerData && !headerError && isMounted) {
            console.log('Header data loaded:', headerData.content);
            setSections(prev => ({
              ...prev,
              categoryTwoHeader: {
                ...prev.categoryTwoHeader,
                ...headerData.content
              }
            }));
          }

          // categories 데이터 로드
          const { data: categoriesData, error: categoriesError } = await supabase
            .from('main_page_content')
            .select('content')
            .eq('section_name', 'categories')
            .single();

          if (categoriesData && !categoriesError && categoriesData.content && isMounted) {
            console.log('Categories data loaded:', categoriesData.content);
            setCategories(categoriesData.content);
          } else if (isMounted) {
            // Supabase에서 카테고리 데이터를 가져오지 못한 경우 기본 데이터 사용
            console.log('Using default categories');
            setCategories(defaultCategories);
          }

        } catch (supabaseError) {
          console.warn('Error loading from Supabase, using default data:', supabaseError);
          if (isMounted) {
            setCategories(defaultCategories);
          }
        }

      } catch (error) {
        console.error('Error loading page content:', error);
        if (isMounted) {
          setError('페이지 내용을 불러오는 중 오류가 발생했습니다.');
        }
      } finally {
        if (isMounted) {
          console.log('fetchContent completed, setting loading to false');
          setLoading(false);
        }
      }
    };
    
    fetchContent();
    
    return () => {
      console.log('useEffect cleanup');
      isMounted = false;
    };
  }, []);
  
  console.log('Current state:', { loading, error, categories: categories.length, sections, isDirty });
  
  if (loading) {
    console.log('Rendering loading state');
    return (
      <SidebarProvider>
        <SidebarInset>
          <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
            <LoadingSpinner size="xl" text="카테고리 데이터를 불러오는 중..." />
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }
  
  if (error) {
    console.log('Rendering error state:', error);
    return (
      <SidebarProvider>
        <SidebarInset>
          <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
            <div className="text-center">
              <p className="text-destructive font-medium">{error}</p>
              <button 
                onClick={() => router.push('/signin')} 
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                로그인 페이지로 이동
              </button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  console.log('Rendering main content');
  return (
    <SidebarProvider>
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 예시 이미지 카드 */}
            <Card className="bg-muted/50 rounded-xl">
              <CardHeader>
                <CardTitle>예시 이미지</CardTitle>
                <CardDescription>메인 페이지에 표시되는 카테고리 섹션 예시입니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full pt-[30.25%] rounded-lg overflow-hidden">
                  <img 
                    src="/admin_images/academy_preview.png" 
                    alt="카테고리 섹션 미리보기" 
                    className="absolute top-0 left-0 w-full h-full object-cover rounded-md shadow-sm"
                  />
                </div>
              </CardContent>
            </Card>
            <div></div>

            {/* 설정 카드 */}
            <Card className="bg-muted/50 rounded-xl">
              <CardHeader>
                <CardTitle>카테고리 섹션</CardTitle>
                <CardDescription>메인 페이지에 표시될 카테고리 헤더와 항목들을 설정합니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 카테고리 헤더 설정 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">카테고리 헤더</h3>
                  <div className="space-y-2">
                    <Label htmlFor="category-subtitle">부제목</Label>
                    <Input
                      id="category-subtitle"
                      value={sections.categoryTwoHeader?.subtitle || ''}
                      onChange={(e) => handleSectionChange('categoryTwoHeader', 'subtitle', e.target.value)}
                      placeholder='"수학의 문" 미리보기'
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category-title">제목</Label>
                    <Input
                      id="category-title"
                      value={sections.categoryTwoHeader?.title || ''}
                      onChange={(e) => handleSectionChange('categoryTwoHeader', 'title', e.target.value)}
                      placeholder="수학의 문 장점을을 살펴보세요"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">카테고리 항목</h3>
                  <div className="grid grid-cols-1 gap-4">
                  {categories.map((category, index) => (
                      <Card key={category.id} className="p-4 bg-background border-2 hover:border-primary/20 transition-colors">
                        <div className="space-y-4">
                          {/* 카테고리 헤더 */}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg border">
                                <img 
                                  src={category.icon} 
                                  alt={`카테고리 ${index + 1} 아이콘`} 
                                  className="h-5 w-5 object-contain"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                              <span className="font-medium text-sm">카테고리 {index + 1}</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeCategory(index)}
                              disabled={categories.length <= 1}
                              className="h-8 w-8 p-0"
                            >
                              <MinusCircle className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {/* 카테고리 내용 */}
                          <div className="space-y-3">
                            {/* 제목 입력 */}
                            <div className="space-y-2">
                              <Label htmlFor={`category-title-${index}`} className="text-sm">제목</Label>
                              <Input
                                id={`category-title-${index}`}
                                value={category.title || ''}
                                onChange={(e) => handleCategoryChange(index, 'title', e.target.value)}
                                placeholder="카테고리 제목"
                                className="h-9"
                              />
                            </div>
                            
                            {/* 아이콘 설정 */}
                            <div className="space-y-2">
                              <Label className="text-sm">아이콘</Label>
                              <div className="flex items-center gap-3">
                                {/* 아이콘 미리보기 */}
                                <div className="flex items-center justify-center w-12 h-12 bg-primary/5 rounded-lg border-2 border-dashed border-primary/20 flex-shrink-0">
                                  <img 
                                    src={category.icon} 
                                    alt={`미리보기`} 
                                    className="h-8 w-8 object-contain"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                  <div 
                                    className="text-xs text-muted-foreground hidden items-center justify-center text-center"
                                    style={{ display: 'none' }}
                                  >
                                    없음
                                  </div>
                                </div>
                                
                                {/* 아이콘 경로 입력 */}
                                <div className="flex-1 space-y-1">
                                  <Input
                                    value={category.icon || ''}
                                    onChange={(e) => handleCategoryChange(index, 'icon', e.target.value)}
                                    placeholder="/home_3/category_icon_1.svg"
                                    className="font-mono text-xs h-9"
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    SVG, PNG, JPG 등 이미지 파일 경로
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>

              <div className="p-6 pt-0">
                <div className="flex justify-between items-center">
                  <Button onClick={addCategory}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    새 카테고리 추가
                  </Button>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline"
                      onClick={() => window.location.reload()}
                    >
                      취소
                    </Button>
                    <Button 
                      onClick={saveChanges}
                      disabled={!isDirty || isSaving}
                    >
                      {isSaving ? (
                        <>
                          <InlineSpinner />
                          저장 중...
                        </>
                      ) : (
                        '변경사항 저장'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
