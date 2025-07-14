"use client"

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Plus, X, ImageOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

import { AppSidebar } from "@/components/admin/shadcn-dashborard/app-sidebar"

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

// Default content structure
const DEFAULT_CONTENT = {
  levelTest: {
    subtitle: '수학의 문 - 레벨 진단',
    title: '10분 진단으로\n당신의 수학 레벨을 확인하세요',
    description: '20년 데이터로 설계된 AI 분석이 약점을 정확히 짚어주고,\n목표 등급까지의 최단 코스를 제시합니다.',
    certificateImage: '/home_3/certificate_thumb.jpg',
    achievements: [
      {
        id: 1,
        icon: '/home_3/achievement_icon_1.svg',
        title: '빠른 온라인 진단',
        description: '20문항 객관식 + 서술형, 시험 감각 그대로 10분 완성'
      },
      {
        id: 2,
        icon: '/home_3/achievement_icon_2.svg',
        title: '정밀 오답 분석',
        description: '단원-개념별 취약 포인트를 그래프로 시각화'
      },
      {
        id: 3,
        icon: '/home_3/achievement_icon_3.svg',
        title: '맞춤 커리큘럼 추천',
        description: '목표 등급·학교 일정에 맞춰 전용 반 자동 매칭'
      },
      {
        id: 4,
        icon: '/home_3/achievement_icon_4.svg',
        title: '전문가 1:1 상담',
        description: '10년차 이상의 전담 강사진이 학습 플랜을 개별 설계'
      }
    ]
  }
};

// 이미지 미리보기 컴포넌트
const ImagePreview = ({ src, alt, className = "w-8 h-8" }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    setImageError(false);
    setImageLoading(true);
  }, [src]);

  if (!src || imageError) {
    return (
      <div className={`${className} bg-muted rounded border-2 border-dashed border-muted-foreground/20 flex items-center justify-center`}>
        <ImageOff className="w-4 h-4 text-muted-foreground/50" />
      </div>
    );
  }

  return (
    <div className={`${className} bg-muted rounded border overflow-hidden flex items-center justify-center relative`}>
      {imageLoading && (
        <div className="absolute inset-0 bg-muted/50 flex items-center justify-center">
          <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain"
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
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [isDirty, setIsDirty] = useState(false);
  const supabase = createClientComponentClient();
  
  // 콘텐츠 변경 핸들러
  const handleContentChange = (section, field, value) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setIsDirty(true);
  };

  // 성취 항목 변경 핸들러
  const handleAchievementChange = (index, field, value) => {
    setContent(prev => ({
      ...prev,
      levelTest: {
        ...prev.levelTest,
        achievements: prev.levelTest.achievements.map((achievement, i) => 
          i === index ? { ...achievement, [field]: value } : achievement
        )
      }
    }));
    setIsDirty(true);
  };

  // 성취 항목 추가
  const addAchievement = () => {
    const newId = Math.max(...content.levelTest.achievements.map(a => a.id), 0) + 1;
    setContent(prev => ({
      ...prev,
      levelTest: {
        ...prev.levelTest,
        achievements: [
          ...prev.levelTest.achievements,
          {
            id: newId,
            icon: '/home_3/achievement_icon_1.svg',
            title: '새로운 성취',
            description: '성취에 대한 설명을 입력하세요'
          }
        ]
      }
    }));
    setIsDirty(true);
  };

  // 성취 항목 삭제
  const removeAchievement = (index) => {
    setContent(prev => ({
      ...prev,
      levelTest: {
        ...prev.levelTest,
        achievements: prev.levelTest.achievements.filter((_, i) => i !== index)
      }
    }));
    setIsDirty(true);
  };

  // Supabase에 데이터 저장
  const saveToSupabase = async (sectionName, content) => {
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
    
    try {
      setIsSaving(true);

      // levelTest 섹션 저장
      await saveToSupabase('levelTest', content.levelTest);

      setIsDirty(false);
      toast({ 
        title: '저장 완료', 
        description: '레벨 테스트 섹션이 성공적으로 저장되었습니다.' 
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
    let isMounted = true;
    
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Supabase에서 데이터 로드
        const { data: levelTestData, error: levelTestError } = await supabase
          .from('main_page_content')
          .select('content')
          .eq('section_name', 'levelTest')
          .single();

        if (levelTestData && !levelTestError && isMounted) {
          setContent(prev => ({
            ...prev,
            levelTest: {
              ...prev.levelTest,
              ...levelTestData.content
            }
          }));
        }

      } catch (error) {
        console.error('Error loading page content:', error);
        if (isMounted) {
          setError('페이지 내용을 불러오는 중 오류가 발생했습니다.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchContent();
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  if (loading) {
    return (
      <SidebarProvider>
        <SidebarInset>
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
                레벨 테스트 데이터를 불러오는 중...
              </p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }
  
  if (error) {
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

  return (
    <SidebarProvider>
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 예시 이미지 카드 */}
            <Card className="bg-muted/50 rounded-xl">
              <CardHeader>
                <CardTitle>예시 이미지</CardTitle>
                <CardDescription>메인 페이지에 표시되는 레벨 테스트 섹션 예시입니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full pt-[50%] rounded-lg overflow-hidden">
                  <img 
                    src="/admin_images/level-test_section.png" 
                    alt="레벨 테스트 섹션 미리보기" 
                    className="absolute top-0 left-0 w-full h-full object-cover rounded-md shadow-sm"
                  />
                </div>
              </CardContent>
            </Card>
            <div></div>

            {/* 설정 카드 */}
            <Card className="bg-muted/50 rounded-xl">
              <CardHeader>
                <CardTitle>레벨 테스트 섹션</CardTitle>
                <CardDescription>메인 페이지에 표시될 레벨 테스트 섹션의 내용을 편집합니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 기본 정보 */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="level-subtitle">부제목</Label>
                    <Input
                      id="level-subtitle"
                      value={content.levelTest?.subtitle || ''}
                      onChange={(e) => handleContentChange('levelTest', 'subtitle', e.target.value)}
                      placeholder="수학의 문 - 레벨 진단"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="level-title">메인 제목</Label>
                    <Textarea
                      id="level-title"
                      value={content.levelTest?.title || ''}
                      onChange={(e) => handleContentChange('levelTest', 'title', e.target.value)}
                      placeholder="10분 진단으로\n당신의 수학 레벨을 확인하세요"
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      줄바꿈은 \n으로 표시됩니다
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="level-description">설명 텍스트</Label>
                    <Textarea
                      id="level-description"
                      value={content.levelTest?.description || ''}
                      onChange={(e) => handleContentChange('levelTest', 'description', e.target.value)}
                      placeholder="20년 데이터로 설계된 AI 분석이 약점을 정확히 짚어주고,\n목표 등급까지의 최단 코스를 제시합니다."
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      줄바꿈은 \n으로 표시됩니다
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <ImagePreview 
                        src={content.levelTest?.certificateImage} 
                        alt="인증서 미리보기"
                        className="w-16 h-16"
                      />
                      <div className="flex-1 space-y-2">
                        <Label htmlFor="certificate-image">인증서 이미지 경로</Label>
                        <Input
                          id="certificate-image"
                          value={content.levelTest?.certificateImage || ''}
                          onChange={(e) => handleContentChange('levelTest', 'certificateImage', e.target.value)}
                          placeholder="/home_3/certificate_thumb.jpg"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 성취 항목들 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">성취 항목</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={addAchievement}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      항목 추가
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {content.levelTest?.achievements?.map((achievement, index) => (
                      <Card key={achievement.id} className="border-2 border-dashed">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">항목 {index + 1}</CardTitle>
                            {content.levelTest.achievements.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAchievement(index)}
                                className="text-destructive hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-start gap-3">
                              <ImagePreview 
                                src={achievement.icon} 
                                alt={`${achievement.title} 아이콘`}
                                className="w-16 h-16 bg-gray-900"
                              />
                              <div className="flex-1 space-y-2">
                                <Label htmlFor={`achievement-icon-${index}`}>아이콘 경로</Label>
                                <Input
                                  id={`achievement-icon-${index}`}
                                  value={achievement.icon}
                                  onChange={(e) => handleAchievementChange(index, 'icon', e.target.value)}
                                  placeholder="/home_3/achievement_icon_1.svg"
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`achievement-title-${index}`}>제목</Label>
                            <Input
                              id={`achievement-title-${index}`}
                              value={achievement.title}
                              onChange={(e) => handleAchievementChange(index, 'title', e.target.value)}
                              placeholder="성취 제목"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`achievement-description-${index}`}>설명</Label>
                            <Textarea
                              id={`achievement-description-${index}`}
                              value={achievement.description}
                              onChange={(e) => handleAchievementChange(index, 'description', e.target.value)}
                              placeholder="성취에 대한 설명"
                              rows={2}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>

              <div className="p-6 pt-0">
                <div className="flex justify-end space-x-2">
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
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        저장 중...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        변경사항 저장
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
