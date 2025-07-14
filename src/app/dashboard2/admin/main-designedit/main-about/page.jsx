'use client';

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';


import { AppSidebar } from "@/components/admin/shadcn-dashborard/app-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Image as ImageIcon, PlusCircle, X } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

// 데이터 및 API 함수 가져오기
import { DEFAULT_ABOUT, fetchAboutData, saveAboutData } from './mockData.js';

// 이미지 미리보기 컴포넌트
const ImagePreview = ({ src, alt, className = "w-full h-32" }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    setImageError(false);
    setImageLoading(true);
  }, [src]);

  if (!src || imageError) {
    return (
      <div className={`${className} bg-muted rounded border-2 border-dashed border-muted-foreground/20 flex items-center justify-center`}>
        <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
        <span className="ml-2 text-sm text-muted-foreground">이미지 없음</span>
      </div>
    );
  }

  return (
    <div className={`${className} bg-muted rounded border overflow-hidden flex items-center justify-center relative`}>
      {imageLoading && (
        <div className="absolute inset-0 bg-muted/50 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
      />
    </div>
  );
};

export default function Page() {
  const router = useRouter();
  const { updateAuthState } = useAuth(); // useAuth 훅 사용
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [about, setAbout] = useState(DEFAULT_ABOUT);
  const [isDirty, setIsDirty] = useState(false);
  
  // 데이터 로드 함수
  const loadAboutData = useCallback(async () => {
    setIsPageLoading(true);
    try {
      // 데이터베이스에서 about 데이터 로드
      const data = await fetchAboutData();
      
      if (data) {
        // 데이터베이스에 저장된 데이터가 있으면 적용
        setAbout(prev => ({
          ...DEFAULT_ABOUT, // 기본값 먼저 적용
          ...data, // 데이터베이스 값으로 덮어쓰기
          // features가 없으면 기본값 유지
          features: data.features || DEFAULT_ABOUT.features,
          // images가 없으면 기본값 유지
          images: data.images || DEFAULT_ABOUT.images,
          // stats가 없으면 기본값 유지
          stats: data.stats || DEFAULT_ABOUT.stats
        }));
      } else {
        // 데이터가 없으면 기본값 사용
        setAbout(DEFAULT_ABOUT);
      }
      setIsDirty(false);
    } catch (error) {
      console.error('학원 소개 데이터 로드 중 오류 발생:', error);
      toast.error('학원 소개 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsPageLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadAboutData();
  }, [loadAboutData]);

  // 섹션 변경 핸들러
  const handleSectionChange = (section, field, value) => {
    setIsDirty(true);
    
    if (section === 'about' && field.includes('features')) {
      // features.0.icon과 같은 형식의 필드 처리
      const parts = field.split('.');
      if (parts.length === 3 && parts[0] === 'features') {
        const index = parseInt(parts[1], 10);
        const subField = parts[2];
        
        setAbout(prev => {
          const updatedFeatures = [...prev.features];
          updatedFeatures[index] = {
            ...updatedFeatures[index],
            [subField]: value
          };
          return {
            ...prev,
            features: updatedFeatures
          };
        });
        return;
      }
    }

    if (section === 'about' && field.includes('stats')) {
      // stats.value 또는 stats.label 처리
      const parts = field.split('.');
      if (parts.length === 2 && parts[0] === 'stats') {
        const subField = parts[1];
        
        setAbout(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            [subField]: value
          }
        }));
        return;
      }
    }
    
    // 일반 필드 업데이트
    setAbout(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 이미지 URL 변경 핸들러
  const handleImageUrlChange = (index, url) => {
    const updatedImages = [...about.images];
    updatedImages[index] = url;
    setAbout(prev => ({
      ...prev,
      images: updatedImages,
      [`image${index + 1}`]: url // image1, image2, image3도 함께 업데이트
    }));
    setIsDirty(true);
  };

  // 학원 소개 저장 함수
  const handleSave = async () => {
    if (isSaving || !isDirty) return;
    
    setIsSaving(true);
    
    try {
      // 데이터베이스에 저장 (이제 saveAboutData가 내부에서 Supabase 클라이언트를 초기화함)
      const savedData = await saveAboutData(about);
      
      // 저장된 데이터로 상태 업데이트
      if (savedData && savedData.content) {
        const content = savedData.content;
        setAbout(prev => ({
          ...prev,
          title: content.title || '',
          content: content.content || '',
          image1: content.image1 || '',
          image2: content.image2 || '',
          image3: content.image3 || '',
          images: Array.isArray(content.images) ? content.images : [
            content.image1 || '',
            content.image2 || '',
            content.image3 || ''
          ].filter(Boolean),
          stats: content.stats || DEFAULT_ABOUT.stats,
          features: Array.isArray(content.features) ? content.features : []
        }));
      }
      
      setIsDirty(false);
      toast.success('학원 소개가 성공적으로 저장되었습니다.');
      updateAuthState({ lastActivity: new Date().toISOString() }); // 저장 성공 시 lastActivity 갱신
    } catch (error) {
      console.error('저장 중 오류 발생:', error);
      toast.error(error.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 초기화 핸들러
  const handleReset = () => {
    if (confirm('변경사항을 취소하고 마지막으로 저장된 상태로 되돌리시겠습니까?')) {
      loadAboutData();
    }
  };

  // 로딩 상태 렌더링
  if (isPageLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div 
            className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" 
            role="status" 
            aria-busy="true"
          >
            <span className="sr-only">로딩 중...</span>
          </div>
          <p className="mt-4 text-muted-foreground">
            학원 소개 데이터를 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <SidebarInset>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/*--------------------------------------------------------------------------------- */}
            {/* 학원 소개 이미지 카드 */}
            <Card className="bg-muted/50 rounded-xl">
            <CardHeader>
              <CardTitle>예시 이미지</CardTitle>
              <CardDescription>메인 페이지에 표시되는 학원 소개 섹션 예시입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative w-full pt-[50%] rounded-lg overflow-hidden">
                <img 
                  src="/admin_images/about_section.png" 
                  alt="학원 소개 섹션 미리보기" 
                  className="absolute top-0 left-0 w-full h-full object-cover rounded-md shadow-sm"
                />
              </div>
            </CardContent>
          </Card>
          <div></div>
          
          {/*--------------------------------------------------------------------------------- */}
          {/* 학원 소개 텍스트 카드 */}
           <Card className="bg-muted/50 rounded-xl">
              <CardHeader>
                <CardTitle>학원 소개 텍스트</CardTitle>
                <CardDescription>학원 소개에 표시될 제목과 내용을 입력하세요.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>제목</Label>
                  <input
                    type="text"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={about.title || ''}
                    onChange={(e) => handleSectionChange('about', 'title', e.target.value)}
                    placeholder="학원 소개 제목"
                  />
                </div>
                <div className="space-y-2">
                  <Label>내용</Label>
                  <textarea
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={about.content || ''}
                    onChange={(e) => handleSectionChange('about', 'content', e.target.value)}
                    placeholder="학원 소개 내용을 입력하세요"
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    줄바꿈은 \n으로 표시됩니다
                  </p>
                </div>
              </CardContent>
            </Card>
            <div></div>

            {/*--------------------------------------------------------------------------------- */}
            {/* 이미지 URL 관리 카드 */}
            <Card className="bg-muted/50 rounded-xl">
              <CardHeader>
                <CardTitle>이미지 관리</CardTitle>
                <CardDescription>학원 소개 섹션에 표시될 이미지들을 설정하세요.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 이미지 1 */}
                <div className="space-y-2">
                  <Label>첫 번째 이미지 URL</Label>
                  <Input
                    value={about.image1 || ''}
                    onChange={(e) => {
                      handleSectionChange('about', 'image1', e.target.value);
                      handleImageUrlChange(0, e.target.value);
                    }}
                    placeholder="/home_3/about_img_1.jpg"
                  />
                  <ImagePreview src={about.image1} alt="첫 번째 이미지 미리보기" />
                </div>

                {/* 이미지 2 */}
                <div className="space-y-2">
                  <Label>두 번째 이미지 URL</Label>
                  <Input
                    value={about.image2 || ''}
                    onChange={(e) => {
                      handleSectionChange('about', 'image2', e.target.value);
                      handleImageUrlChange(1, e.target.value);
                    }}
                    placeholder="/home_3/about_img_2.jpg"
                  />
                  <ImagePreview src={about.image2} alt="두 번째 이미지 미리보기" />
                </div>

                {/* 이미지 3 (통계 박스 이미지) */}
                <div className="space-y-2">
                  <Label>통계 박스 이미지 URL</Label>
                  <Input
                    value={about.image3 || ''}
                    onChange={(e) => {
                      handleSectionChange('about', 'image3', e.target.value);
                      handleImageUrlChange(2, e.target.value);
                    }}
                    placeholder="/home_3/review_img.png"
                  />
                  <ImagePreview src={about.image3} alt="통계 박스 이미지 미리보기" />
                </div>
              </CardContent>
            </Card>
            <div></div>
            {/*--------------------------------------------------------------------------------- */}
            {/* 통계 정보 관리 카드 */}
            <Card className="bg-muted/50 rounded-xl">
              <CardHeader>
                <CardTitle>통계 정보</CardTitle>
                <CardDescription>학원 통계 정보를 설정하세요.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>통계 값</Label>
                  <Input
                    value={about.stats?.value || ''}
                    onChange={(e) => handleSectionChange('about', 'stats.value', e.target.value)}
                    placeholder="3000명+"
                  />
                </div>
                <div className="space-y-2">
                  <Label>통계 설명</Label>
                  <Input
                    value={about.stats?.label || ''}
                    onChange={(e) => handleSectionChange('about', 'stats.label', e.target.value)}
                    placeholder="학원 누적 학생수"
                  />
                </div>
              </CardContent>
            </Card>
          
          <div></div>
          {/*--------------------------------------------------------------------------------- */}
          {/* 학원 특징 관리 카드 */}
          <Card className="bg-muted/50 rounded-xl">
          <CardHeader>
              <CardTitle>학원 특징 관리</CardTitle>
              <CardDescription>학원의 특징을 추가, 수정, 삭제할 수 있습니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {about.features.map((feature, index) => (
                  <Card key={index} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-2">
                        <div className="h-24 w-full bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                          {feature.icon ? (
                            <img 
                              src={feature.icon} 
                              alt={`특징 ${index + 1} 아이콘`} 
                              className="w-12 h-12 object-contain"
                            />
                          ) : (
                            <span className="text-gray-400 text-sm">아이콘 미리보기</span>
                          )}
                        </div>
                        <div className="mt-2">
                          <Label>아이콘 URL</Label>
                          <input
                            type="text"
                            className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={feature.icon || ''}
                            onChange={(e) => handleSectionChange('about', `features.${index}.icon`, e.target.value)}
                            placeholder="아이콘 이미지 URL"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-9 space-y-4">
                        <div>
                          <Label>제목</Label>
                          <input
                            type="text"
                            className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={feature.title || ''}
                            onChange={(e) => handleSectionChange('about', `features.${index}.title`, e.target.value)}
                            placeholder="특징 제목"
                          />
                        </div>
                        <div>
                          <Label>설명</Label>
                          <textarea
                            className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={feature.description || ''}
                            onChange={(e) => handleSectionChange('about', `features.${index}.description`, e.target.value)}
                            placeholder="특징 설명"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-1 flex items-start justify-end">
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => {
                            const updatedFeatures = about.features.filter((_, i) => i !== index);
                            setAbout(prev => ({ ...prev, features: updatedFeatures }));
                            setIsDirty(true);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          
            <div className="p-6 pt-0">
            <div className="flex justify-between items-center">
            <Button
                  variant="outline"
                  onClick={() => {
                    const newFeature = { 
                      id: Date.now(),
                      icon: '', 
                      title: '', 
                      description: '' 
                    };
                    setAbout(prev => ({ ...prev, features: [...prev.features, newFeature] }));
                    setIsDirty(true);
                  }}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  새 특징 추가
                </Button>      
                <div className="flex space-x-2">
                           <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleReset}
                      disabled={!isDirty || isSaving}
                    >
                      취소
                    </Button>
                    <Button 
                      size="sm"
                      onClick={handleSave} 
                      disabled={!isDirty || isSaving}
                      className="flex items-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          저장 중...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          변경사항 저장
                        </>
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
