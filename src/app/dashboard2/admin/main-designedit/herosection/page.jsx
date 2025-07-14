'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from "@/components/ui/button"
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HexColorPicker } from 'react-colorful';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
const supabase = createClientComponentClient();

import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  AspectRatio,
  Image
} from "@/components/ui/sidebar"

// Default content structure (from main page.jsx for initial hero data)
const FONT_WEIGHTS = [
  { value: 'font-normal', label: '보통 (400)' },
  { value: 'font-medium', label: '중간 (500)' },
  { value: 'font-semibold', label: '세미볼드 (600)' },
  { value: 'font-bold', label: '볼드 (700)' },
  { value: 'font-extrabold', label: '엑스트라 볼드 (800)' },
];

const DEFAULT_HERO_CONTENT = {
  subtitleUp: '100 % 모든 개념이 ‘내 것’이 되는 그날까지',
  subtitleUpColor: '#8B5CF6',
  title: '문제 풀이를 넘어 개념의 문을 엽니다.',
  titleFontWeight: 'font-bold',
  subtitle: '“깊이 있는 한 권이, 얕은 열 권을 이깁니다.” 양보다 질을 추가하는 수업, 지금 시작하세요.',
  buttonText: '모든 과정 살펴보기',
  buttonLink: '',
  backgroundImage: '',
  videoUrl: '',
  videoText: ''
};

export default function Page() {
  const [hero, setHero] = useState(DEFAULT_HERO_CONTENT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const router = useRouter();
  

  // useAuth 훅 사용 - 세션 정보와 로딩 상태 확인
  const { session, loading: authLoading } = useAuth();

  // Supabase에서 데이터 로드
  useEffect(() => {
    // 인증 로딩 중이거나 세션이 없으면 실행하지 않음
    if (authLoading || !session) {
      return;
    }

    const fetchHeroSection = async () => {
      setLoading(true);
      setError(null);
      
      try {

        // 3. 히어로 섹션 데이터 조회
        console.log('히어로 섹션 데이터 조회 시작');
        
        const { data, error } = await supabase
          .from('main_page_content')
          .select('content')
          .eq('section_name', 'hero')
          .single();

        console.log('히어로 섹션 조회 결과:', { data, error });

        // 데이터가 없거나 content가 비어있을 경우 기본값으로 upsert
        if (error && error.code === 'PGRST116' || !data || !data.content || Object.keys(data.content).length === 0) {
          console.log('데이터가 없어 기본값으로 upsert 시도');
          
          const { data: upsertData, error: upsertError } = await supabase
            .from('main_page_content')
            .upsert({ 
              section_name: 'hero', 
              content: DEFAULT_HERO_CONTENT,
              updated_at: new Date().toISOString()
            }, { 
              onConflict: 'section_name' 
            })
            .select('content')
            .single();

          console.log('Upsert 결과:', { upsertData, upsertError });

          if (upsertError) {
            console.error('Upsert 오류:', upsertError);
            throw upsertError;
          }
          
          setHero(upsertData?.content || DEFAULT_HERO_CONTENT);
        } else if (error) {
          // PGRST116 이외의 오류 처리
          console.error('히어로 섹션 조회 오류:', error);
          throw error;
        } else {
          // 정상적으로 데이터가 있는 경우
          setHero(data.content);
        }
        
      } catch (err) {
        console.error('데이터 로드 오류:', err);
        setError(err.message || '데이터를 불러오는 데 실패했습니다.');
        toast.error(err.message || '데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchHeroSection();
  }, [session, authLoading]); // session과 authLoading을 의존성 배열에 추가

  // 수동 저장을 위한 함수
  const handleSave = async () => {
    if (!isDirty) return; // 변경사항이 없으면 저장하지 않음
    
    setIsSaving(true);
    setSaveStatus('저장 중...');
    
    try {
      // 1. 세션 확인
      if (!session) {
        throw new Error('인증이 필요합니다. 로그인 후 다시 시도해주세요.');
      }

      // 2. 관리자 권한 확인
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
        
      if (profileError || !profile || profile.role !== 'admin') {
        throw new Error('이 작업을 수행할 권한이 없습니다. 관리자로 로그인해주세요.');
      }

      // 3. 데이터 저장
      const { error } = await supabase.rpc('update_main_page_content', {
        p_section_name: 'hero',
        p_content: hero
      });

      if (error) {
        throw error;
      }
      
      setSaveStatus('저장되었습니다!');
      setIsDirty(false);
      toast.success('히어로 섹션이 성공적으로 저장되었습니다.');
      setTimeout(() => setSaveStatus(''), 2000);
      
    } catch (err) {
      console.error('Error saving hero section:', err);
      setError(err.message || '데이터 저장에 실패했습니다.');
      setSaveStatus('저장 실패');
      toast.error(err.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSectionChange = (section, field, value) => {
    let updatedHero;
    if (section === 'hero') {
      updatedHero = {
        ...hero,
        [field]: value
      };
    } else if (section === 'video') {
      updatedHero = {
        ...hero,
        [field]: value
      };
    }
    setHero(updatedHero);
    setIsDirty(true); // 변경사항이 있음을 표시
  };

  if (loading) {
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
            데이터를 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center text-red-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <SidebarInset>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-muted/50 aspect-video rounded-xl"><CardHeader>
          <CardTitle>예시 이미지</CardTitle>
          <CardDescription>메인 상단에 표시되는 섹션입니다.</CardDescription>
          <div className="relative w-full pt-[45%] rounded-lg overflow-hidden">
          <img src="/admin_images/hero_section.png" alt="히어로 섹션 미리보기" className="absolute top-0 left-0 w-full h-full object-cover rounded-md shadow-sm" />
          </div>
          </CardHeader>
          </Card>
          <div></div>

            <Card className="bg-muted/50 aspect-video rounded-xl">
            <CardHeader>
            <CardTitle>섹션 설정</CardTitle>
            <CardDescription>메인 상단에 표시되는 섹션의 내용을 설정합니다.</CardDescription>
            </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="hero-subtitle-up">상단 문구</Label>
                    <Textarea
                      id="hero-subtitle-up"
                      value={hero.subtitleUp || ''}
                      onChange={(e) => handleSectionChange('hero', 'subtitleUp', e.target.value)}
                    />
                    <div className="mt-2">
                      <Label>상단 문구 색상</Label>
                      <div className="relative flex items-center space-x-2">
                        <div
                          className="w-8 h-8 rounded-full border shadow-md cursor-pointer"
                          style={{ backgroundColor: hero.subtitleUpColor || '#8B5CF6' }}
                          onClick={() => document.getElementById('color-picker-popover').classList.toggle('hidden')}
                        />
                        <Input
                          value={hero.subtitleUpColor || '#8B5CF6'}
                          onChange={(e) => handleSectionChange('hero', 'subtitleUpColor', e.target.value)}
                          className="w-[120px]"
                        />
                        <div id="color-picker-popover" className="absolute z-10 p-2 bg-white border rounded-md shadow-lg hidden top-full mt-2">
                          <HexColorPicker
                            color={hero.subtitleUpColor || '#8B5CF6'}
                            onChange={(color) => handleSectionChange('hero', 'subtitleUpColor', color)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hero-title">제목</Label>
                    <Textarea
                      id="hero-title"
                      value={hero.title || ''}
                      onChange={(e) => handleSectionChange('hero', 'title', e.target.value)}
                    />
                    <div className="mt-2">
                      <Label>제목 폰트 두께</Label>
                      <Select
                        value={hero.titleFontWeight || 'font-bold'}
                        onValueChange={(value) => {
                          handleSectionChange('hero', 'titleFontWeight', value);
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue>
                            <span className={`${hero.titleFontWeight || 'font-bold'}`}>폰트두께 선택</span>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {FONT_WEIGHTS.map((weight) => (
                            <SelectItem key={weight.value} value={weight.value}>
                              <span className={weight.value}>{weight.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hero-subtitle">부제목</Label>
                    <Textarea
                      id="hero-subtitle"
                      value={hero.subtitle || ''}
                      onChange={(e) => handleSectionChange('hero', 'subtitle', e.target.value)}
                    />
                  </div>


                </div>
              </CardContent>
              <br></br>
              <CardHeader>
                <CardTitle>버튼 설정</CardTitle>
                <CardDescription>메인 페이지에 표시될 버튼 텍스트와 링크를 설정합니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
              <div className="space-y-2">
                    <Label htmlFor="hero-button">버튼 텍스트</Label>
                    <Input
                      id="hero-button"
                      value={hero.buttonText || ''}
                      onChange={(e) => handleSectionChange('hero', 'buttonText', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hero-button-link">버튼 링크 (URL)</Label>
                    <Input
                      id="hero-button-link"
                      value={hero.buttonLink || ''}
                      onChange={(e) => handleSectionChange('hero', 'buttonLink', e.target.value)}
                      placeholder="https://example.com/courses"
                    />
                  </div>
                <div className="space-y-2">
                  <Label htmlFor="video-url">동영상 URL (유튜브 링크)</Label>
                  <Input
                    id="video-url"
                    value={hero.videoUrl || ''}
                    onChange={(e) => handleSectionChange('video', 'videoUrl', e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=your-video-id"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="video-text">동영상 버튼 텍스트</Label>
                  <Input
                    id="video-text"
                    value={hero.videoText || ''}
                    onChange={(e) => handleSectionChange('video', 'videoText', e.target.value)}
                    placeholder="이달의 온라인 특강!"
                  />
                </div>
                </CardContent>
                <br></br>
                <CardHeader>
                <CardTitle>배경 이미지 설정</CardTitle>
                <CardDescription>메인 페이지에 표시될 배경 이미지 URL을 설정합니다.</CardDescription>
              </CardHeader>
                <CardContent className="space-y-4"> 
                <div className="space-y-2">
                    <Label htmlFor="hero-bg">배경 이미지 URL</Label>
                    <Input
                      id="hero-bg"
                      value={hero.backgroundImage || ''}
                      onChange={(e) => handleSectionChange('hero', 'backgroundImage', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                    {hero.backgroundImage ? (
                      <div className="mt-2 rounded-md overflow-hidden border">
                        <img src={hero.backgroundImage} alt="배경 이미지 미리보기" className="w-full h-auto object-cover" />
                      </div>
                    ) : (
                      <div className="mt-2 text-sm text-muted-foreground">배경 이미지가 없습니다.</div>
                    )}
                  </div>
              </CardContent>
                
                {/* 저장 버튼 섹션 */}
                <div className="p-6 pt-0">
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline"
                      onClick={() => window.location.reload()}
                    >
                      취소
                    </Button>
                    <Button 
                      onClick={handleSave}
                      disabled={!isDirty || isSaving}
                    >
                      {isSaving ? '저장 중...' : '변경사항 저장'}
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
