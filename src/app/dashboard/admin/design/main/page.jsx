'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HexColorPicker } from 'react-colorful';
import { HeroSection } from '@/components/admin/dashboard/main-design/HeroSection';
import { AboutSection } from '@/components/admin/dashboard/main-design/AboutSection';
import { RateSection } from '@/components/admin/dashboard/main-design/RateSection';
import { CategorySection } from '@/components/admin/dashboard/main-design/CategorySection';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save, Trash2, PlusCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

import { useCallback } from 'react';

// Debounce utility function
const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

// Default content structure
const FONT_WEIGHTS = [
  { value: 'font-normal', label: '보통 (400)' },
  { value: 'font-medium', label: '중간 (500)' },
  { value: 'font-semibold', label: '세미볼드 (600)' },
  { value: 'font-bold', label: '볼드 (700)' },
  { value: 'font-extrabold', label: '엑스트라 볼드 (800)' },
];



const DEFAULT_CONTENT = {
  hero: {
    subtitleUp: '100 % 모든 개념이 ‘내 것’이 되는 그날까지',
    subtitleUpColor: '#8B5CF6', // 기본 강조색 (보라색) 헥스 코드
    title: '',
    titleFontWeight: 'font-bold',
    subtitle: '',
    buttonText: '시작하기',
    buttonLink: '',
    backgroundImage: ''
  },
  rate: {
    heading: '2025년 수학의문 | 명문대 입학현황',
    items: [
      { id: 1, title: '고려대 경영학과 5명', description: 'Solid Questions Solving & Fresh Topics', image: '/home_2/university_korea.png' },
      { id: 2, title: '서울대 검퓨터공학과 4명', description: 'Learn and More expertise', image: '/home_2/university_seoul.png' },
      { id: 3, title: '연세대 의학과 5명', description: 'Behind the word mountains', image: '/home_2/university_yensei.png' },
      { id: 4, title: '카이스트 산업공학과 3명', description: 'Behind the word mountains', image: '/home_2/university_KAIST.png' },
    ]
  },

  categoryTwoHeader: {
    subtitle: '"수학의 문" 미리보기',
    title: '수학의 문 장점을을 살펴보세요',
  },

  about: {
    title: '우리 회사 소개',
    content: '우리 회사는 최고의 교육 서비스를 제공하기 위해 노력하고 있습니다.',
    image1: '/home_3/about_img_1.jpg',
    image2: '/home_3/about_img_2.jpg',
    image3: '/home_3/review_img.png',
    features: [
      {
        icon: '/home_3/feature_icon_1.svg',
        title: '체계적인 커리큘럼',
        description: '전문가들이 설계한 단계별 학습 로드맵으로 체계적으로 학습할 수 있습니다.'
      },
      {
        icon: '/home_3/feature_icon_2.svg',
        title: '1:1 맞춤 학습',
        description: '개인별 학습 성과 분석을 바탕으로 한 맞춤형 학습 전략을 제공합니다.'
      },
      {
        icon: '/home_3/feature_icon_3.svg',
        title: '개인별 약점 보완',
        description: '학생별 약점을 분석하여 체계적으로 보완할 수 있는 맞춤형 학습 프로그램을 제공합니다.'
      },
      {
        icon: '/home_3/feature_icon_4.svg',
        title: '10년차 이상 강사진',
        description: '풍부한 경험을 가진 전문 강사진이 학생들의 성장을 돕습니다.'
      },
      {
        icon: '/home_3/achievement_icon_2.svg',
        title: '지인 추천율 90%',
        description: '높은 만족도로 인해 90% 이상의 학생들이 지인에게 추천하는 교육 서비스를 제공합니다.'
      }
    ]
  }
};

export default function MainPageDesign() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sections, setSections] = useState(DEFAULT_CONTENT);
  const [categories, setCategories] = useState([]); // Add categories state
  const [date, setDate] = useState(new Date()); // Date Picker 상태 추가

  // Debounced save function for categories
  const debouncedSaveCategories = useCallback(
    debounce(async (updatedCategories) => {
      console.log('debouncedSaveCategories called with:', updatedCategories); // Add this line
      try {
        // Removed saveSection call
      } catch (error) {
        console.error('Error saving category:', error);
        toast({
          title: '카테고리 저장 실패',
          description: error.message || '카테고리 저장 중 오류가 발생했습니다.',
          variant: 'destructive'
        });
      }
    }, 500), // 500ms debounce delay
    [toast] // saveSection은 useCallback 내부에서 정의되므로 종속성에서 제거
  );

  useEffect(() => {
    let isMounted = true;
    
    const fetchContent = async (accessToken) => {
      try {
        setIsLoading(true);
        let authHeaders = {};
        if (accessToken) {
          authHeaders = { Authorization: `Bearer ${accessToken}` };
        } else {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            authHeaders = { Authorization: `Bearer ${session.access_token}` };
          }
        }
        console.log('Fetching with authHeaders:', authHeaders); // Debug log
        const response = await fetch('/api/admin/design/main', {
          headers: authHeaders,
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorData = await response.json(); // Parse error response
          console.error('API fetch error response:', errorData); // Log error data
          throw new Error(errorData.message || 'Failed to fetch content');
        }
        
        const { content } = await response.json();
        
        if (isMounted && content) {
          setSections(prev => {
            const mergedContent = {
              ...DEFAULT_CONTENT,
              ...content,
              categoryTwoHeader: typeof content.categoryTwoHeader === 'string' ? JSON.parse(content.categoryTwoHeader) : content.categoryTwoHeader,
              about: { // Ensure about section is merged deeply
                ...DEFAULT_CONTENT.about,
                ...content.about,
                features: content.about?.features?.length > 0
                  ? content.about.features
                  : DEFAULT_CONTENT.about.features
              }
            };
            return mergedContent;
          });
        }

        // Fetch categories from main_page_content table
        const { data: categoriesContentData, error: categoriesContentError } = await supabase
          .from('main_page_content')
          .select('content')
          .eq('section_name', 'categories')
          .single();

        if (categoriesContentError && categoriesContentError.code !== 'PGRST116') { // PGRST116 means no rows found
          throw categoriesContentError;
        }

        if (isMounted && categoriesContentData) {
          try {
            setCategories(categoriesContentData.content);
          } catch (parseError) {
            console.error('Error parsing categories content:', parseError);
            setCategories([]); // Fallback to empty array if parsing fails
          }
        } else if (isMounted) {
          setCategories([]); // Initialize as empty if no data found
        }

      } catch (error) {
        console.error('Error loading page content:', error);
        if (isMounted) {
          toast({
            title: '오류 발생',
            description: '페이지 내용을 불러오는 중 오류가 발생했습니다.',
            variant: 'destructive'
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        fetchContent(session.access_token);
      } else {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
          if (newSession?.access_token) {
            fetchContent(newSession.access_token);
            subscription.unsubscribe();
          }
        });
      }
    };
    init();
    
    return () => {
      isMounted = false;
      clearTimeout(saveTimeout);
    };
  }, [toast]);






  const handleSectionChange = (section, field, value) => {
    setSections(prev => {
      const newSections = { ...prev };
      // Handle nested fields like 'features.0.icon'
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
    // saveSection(section, value, { autoSave: true }); // 자동 저장 비활성화
  };
  
  // Store the timeout ID
  let saveTimeout;


  const handleRateItemChange = (index, field, value) => {
    setSections(prev => {
      const updatedRateItems = [...prev.rate.items];
      updatedRateItems[index] = {
        ...updatedRateItems[index],
        [field]: value
      };
      return {
        ...prev,
        rate: {
          ...prev.rate,
          items: updatedRateItems
        }
      };
    });
  };

  const addRateItem = () => {
    setSections(prev => ({
      ...prev,
      rate: {
        ...prev.rate,
        items: [
          ...prev.rate.items,
          { id: Date.now(), title: '', description: '', image: '' }
        ]
      }
    }));
  };

  const removeRateItem = async (id) => {
    console.log('Attempting to remove item with ID:', id);
    // 상태를 먼저 업데이트하고, 그 업데이트된 상태를 기반으로 저장합니다.
    setSections(prev => {
      const updatedItems = prev.rate.items.filter(item => item.id !== id);
      const newRateSection = {
        ...prev.rate,
        items: updatedItems
      };
      // 상태 업데이트 후 바로 저장 로직 호출
      // saveSection('rate', newRateSection); // 자동 저장 비활성화
      return {
        ...prev,
        rate: newRateSection
      };
    });
  };

  // New functions for category management
  const handleCategoryChange = (id, field, value) => {
    setCategories(prev => {
      const updatedCategories = prev.map(cat =>
        cat.id === id ? { ...cat, [field]: value } : cat
      );
      console.log('handleCategoryChange - updatedCategories:', updatedCategories); // Add this line
      return updatedCategories;
    });
  };

  const addCategory = async () => {
    try {
      const newCategory = { id: Date.now(), title: '', icon: '', description: '' }; // 고유 ID 할당
      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories); // `prev` 상태를 올바르게 사용

    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: '카테고리 추가 실패',
        description: error.message || '카테고리 추가 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    }
  };

  const removeCategory = async (id) => {
    try {
      const updatedCategories = categories.filter(cat => cat.id !== id);
      setCategories(updatedCategories);

    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: '카테고리 삭제 실패',
        description: error.message || '카테고리 삭제 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    }
  };


  const saveSection = async (sectionName, contentToSave = null, options = {}) => {
    // Skip if we're in the middle of saving or loading
    if (isSaving || isLoading) return;
    
    // Allow saving for both manual and auto-save.
    // The previous condition `if (options.autoSave !== true)` was preventing auto-saves from triggering the fetch.
    // If autoSave is true, or if it's a manual call (options.autoSave is undefined), proceed with saving.
    if (options.autoSave === true || options.autoSave === undefined) {
      try {
        setIsSaving(true);

        let contentToSend;
        if (sectionName === 'categories') {
          contentToSend = contentToSave || categories; // Use categories state for 'categories' section
        } else {
          contentToSend = contentToSave || sections[sectionName]; // Use sections state for others
        }

        const { data: { session: saveSession } } = await supabase.auth.getSession();
        console.log('Saving with authHeaders:', saveSession?.access_token ? { Authorization: `Bearer ${saveSession.access_token}` } : {}); // Debug log
        const response = await fetch('/api/admin/design/main', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(saveSession?.access_token && { Authorization: `Bearer ${saveSession.access_token}` })
          },
          body: JSON.stringify({
            section_name: sectionName,
            content: contentToSend
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('API save error response:', errorData); // Log error data
          throw new Error(errorData.message || 'Failed to save content via API');
        }

        const result = await response.json();
        console.log('API route save success:', result);

        toast({ title: '저장 완료', description: '내용이 성공적으로 저장되었습니다.' });

      } catch (error) {
        console.error('Error saving section:', error);
        toast({
          title: '저장 실패',
          description: error.message || '내용 저장 중 오류가 발생했습니다.',
          variant: 'destructive'
        });
      } finally {
        setIsSaving(false);
      }
    }
  };
  
  const handleSaveAll = async () => {
    try {
      setIsSaving(true);
      
      // Save each section
      await Promise.all(
        Object.keys(sections).map(sectionName => 
          saveSection(sectionName)
        )
      ); // saveSection 호출을 다시 활성화하여 모든 섹션을 저장하도록 합니다.
      
      toast({
        title: '모든 변경사항 저장 완료',
        description: '모든 섹션이 성공적으로 저장되었습니다.',
      });
    } catch (error) {
      console.error('Error saving all sections:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">로딩 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">메인페이지 디자인 관리</h1>
          <p className="text-sm text-muted-foreground">
            메인페이지의 각 섹션을 편집하고 저장하세요.
          </p>
        </div>
        <Button 
          onClick={handleSaveAll} 
          disabled={isSaving}
          className="gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              저장 중...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              모든 변경사항 저장
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="hero" className="space-y-4">
        <TabsList>
          <TabsTrigger value="hero">히어로 섹션</TabsTrigger>
          <TabsTrigger value="rate">입학 현황</TabsTrigger>
          <TabsTrigger value="about">학원 소개</TabsTrigger>
          <TabsTrigger value="categories">카테고리 관리</TabsTrigger>


        </TabsList>

        {/* 히어로 섹션 */}
        <TabsContent value="hero">
          <HeroSection 
            hero={sections.hero} 
            handleSectionChange={handleSectionChange} 
            FONT_WEIGHTS={FONT_WEIGHTS} 
            video={sections.video}
          />
        </TabsContent>

        {/* 회사 소개 섹션 */}
        <TabsContent value="about">
          <AboutSection 
            about={sections.about} 
            handleSectionChange={handleSectionChange} 
          />
        </TabsContent>

        {/* 입학 현황 섹션 */}
        <TabsContent value="rate">
          <RateSection
            rate={sections.rate}
            handleSectionChange={handleSectionChange}
            handleRateItemChange={handleRateItemChange}
            addRateItem={addRateItem}
            removeRateItem={removeRateItem}
          />
        </TabsContent>

        {/* 카테고리 관리 섹션 */}
        <TabsContent value="categories">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>카테고리 헤더 설정</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-2 w-full">
                  <Label htmlFor="categoryTwoSubtitle" className="w-24">
                    부제목
                  </Label>
                  <Input
                    id="categoryTwoSubtitle"
                    value={sections.categoryTwoHeader?.subtitle || ''}
                    onChange={(e) => handleSectionChange('categoryTwoHeader', 'subtitle', e.target.value)}
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center gap-2 w-full">
                  <Label htmlFor="categoryTwoTitle" className="w-24">
                    제목
                  </Label>
                  <Input
                    id="categoryTwoTitle"
                    value={sections.categoryTwoHeader?.title || ''}
                    onChange={(e) => handleSectionChange('categoryTwoHeader', 'title', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={() => saveSection('categories', categories)}
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    카테고리 저장
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <CategorySection
            categories={categories}
            handleCategoryChange={handleCategoryChange}
            addCategory={addCategory}
            removeCategory={removeCategory}
          />
        </TabsContent>
      </Tabs>

      {/* Date Picker 추가 */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">날짜 선택</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP", { locale: ko }) : <span className="text-gray-500">날짜를 선택하세요</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                captionLayout="dropdown"
              />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
