'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ROLES } from '@/lib/auth/constants';
import { AppSidebar } from "@/components/admin/shadcn-dashborard/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from "sonner"
import { mockRateData } from './mockData';
import { PlusCircle, MinusCircle } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// 이미 초기화된 Supabase 클라이언트 사용

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import { Separator } from "@/components/ui/separator"

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function Page() {
  const router = useRouter();
  const { session, userRole, isAuthenticated, hasRole } = useAuth(); // useAuth 훅 사용
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [sections, setSections] = useState({
    rate: {
      heading: '',
      items: []
    }
  });
  const supabase = createClientComponentClient();
  
  // 변경사항 추적을 위한 상태
  const [isDirty, setIsDirty] = useState(false);
  
  // 섹션 변경 핸들러
  const handleSectionChange = useCallback((section, field, value) => {
    setSections(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setIsDirty(true);
  }, []);
  
  // 입학 현황 항목 변경 핸들러
  const handleRateItemChange = useCallback((index, field, value) => {
    setSections(prev => {
      const updatedItems = [...prev.rate.items];
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      return {
        ...prev,
        rate: {
          ...prev.rate,
          items: updatedItems
        }
      };
    });
    setIsDirty(true);
  }, []);
  
  // 입학 현황 항목 추가
  const addRateItem = useCallback(() => {
    const newId = Math.max(0, ...sections.rate.items.map(item => item.id)) + 1;
    setSections(prev => ({
      ...prev,
      rate: {
        ...prev.rate,
        items: [
          ...prev.rate.items,
          { 
            id: newId, 
            title: '새 대학명',
            description: '설명을 입력하세요',
            image: '/home_2/university_korea.png' // 기본 이미지
          }
        ]
      }
    }));
    setIsDirty(true);
  }, [sections.rate.items]);
  
  // 입학 현황 항목 삭제
  const removeRateItem = useCallback((id) => {
    if (sections.rate.items.length <= 1) {
      toast.error('최소 하나의 항목은 남아있어야 합니다.');
      return;
    }
    
    setSections(prev => ({
      ...prev,
      rate: {
        ...prev.rate,
        items: prev.rate.items.filter(item => item.id !== id)
      }
    }));
    setIsDirty(true);
    toast.success('항목이 삭제되었습니다.');
  }, [sections.rate.items.length]);
  
  // 데이터베이스에서 입학 현황 데이터 로드
  const loadRateSection = useCallback(async () => {
    try {
      setIsPageLoading(true);
      
      // section_name이 'rate'인 데이터 조회
      const { data, error } = await supabase
        .from('main_page_content')
        .select('*')
        .eq('section_name', 'rate')
        .single();
      
      if (error || !data) {
        // 데이터가 없거나 오류가 발생한 경우 목업 데이터 사용
        setSections(prev => ({
          ...prev,
          rate: mockRateData
        }));
        return;
      }
      
      // 데이터베이스에서 가져온 데이터로 상태 업데이트
      const rateData = data.content || data;
      
      // 데이터베이스에 items가 없거나 빈 배열인 경우 목업 데이터의 items 사용
      const items = (rateData.items && rateData.items.length > 0) 
        ? rateData.items 
        : mockRateData.items;
      
      setSections(prev => ({
        ...prev,
        rate: {
          ...mockRateData, // 기본값으로 목업 데이터 사용
          ...rateData,    // 데이터베이스 데이터로 덮어쓰기
          items           // items는 위에서 처리한 대로 사용
        }
      }));
    } catch (error) {
      // 사용자에게 친숙한 오류 메시지 표시
      const errorMessage = error.message || '데이터를 불러오는 중 오류가 발생했습니다.';
      toast.error(`오류: ${errorMessage}`);
    } finally {
      setIsPageLoading(false);
    }
  }, []);
  
  // 변경사항 저장
  const saveChanges = async () => {
    if (!isDirty) {
      toast.info('변경된 내용이 없습니다.');
      return;
    }
    
    try {
      setIsSaving(true);
      setSaveStatus('저장 중...');
      
      // 1. 인증 상태 확인 (useAuth 훅 사용)
      if (!isAuthenticated || !session) {
        throw new Error('인증이 필요합니다. 로그인 후 다시 시도해주세요.');
      }

      // 2. 관리자 권한 확인 (useAuth 훅 사용)
      if (!hasRole(ROLES.ADMIN)) {
        throw new Error('이 작업을 수행할 권한이 없습니다. 관리자로 로그인해주세요.');
      }
      
      console.log('변경사항 저장 시도:', sections.rate);
      console.log('현재 사용자 역할:', userRole);
      
      // 3. 데이터베이스에 저장 시도 (section_name을 기준으로 upsert)
      const { data, error } = await supabase
        .from('main_page_content')
        .upsert({
          section_name: 'rate',
          content: {
            ...sections.rate,
            updated_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'section_name',  // section_name 필드를 기준으로 중복 체크
          returning: 'minimal'         // 업데이트된 데이터를 반환하지 않음
        });
      
      if (error) {
        console.error('저장 중 오류 발생:', error);
        throw error;
      }
      
      console.log('변경사항이 성공적으로 저장되었습니다.');
      setIsDirty(false);
      setSaveStatus('저장되었습니다!');
      toast.success('입학 현황이 성공적으로 저장되었습니다.');
      
      // 2초 후 상태 메시지 초기화
      setTimeout(() => setSaveStatus(''), 2000);
      
    } catch (error) {
      console.error('저장 중 오류 발생:', error);
      setSaveStatus('저장 실패');
      
      // 데이터베이스 스키마 오류인 경우 특별 처리
      if (error.message && error.message.includes('column') && error.message.includes('not found')) {
        toast.error('데이터베이스 스키마가 일치하지 않습니다. 관리자에게 문의해주세요.');
      } else {
        toast.error(`변경사항 저장 중 오류가 발생했습니다: ${error.message}`);
      }
      
      // 오류 발생 시에도 기존 데이터는 유지
      setSections(prev => ({
        ...prev,
        rate: {
          ...prev.rate
        }
      }));
    } finally {
      setIsSaving(false);
    }
  };
  
  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadRateSection();
  }, [loadRateSection]);

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
            대시보드 데이터를 불러오는 중...
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
          {/* 예시 이미지 카드 */}
          <Card className="bg-muted/50 rounded-xl">
            <CardHeader>
              <CardTitle>예시 이미지</CardTitle>
              <CardDescription>메인 페이지에 표시되는 입학 현황 섹션 예시입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative w-full pt-[30.25%] rounded-lg overflow-hidden">
                <img 
                  src="/admin_images/rate_section.png" 
                  alt="입학 현황 섹션 미리보기" 
                  className="absolute top-0 left-0 w-full h-full object-cover rounded-md shadow-sm"
                />
              </div>
            </CardContent>
          </Card>
          <div></div>

          {/* 설정 카드 */}
          <Card className="bg-muted/50 rounded-xl">
                      <CardHeader>
                        <CardTitle>입학 현황 섹션</CardTitle>
                        <CardDescription>메인 페이지에 표시될 입학 현황 텍스트와 항목들을 설정합니다.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-4">
                          <Label htmlFor="rate-heading">섹션 제목</Label>
                          <Input
                            id="rate-heading"
                            value={sections.rate.heading || ''}
                            onChange={(e) => handleSectionChange('rate', 'heading', e.target.value)}
                            placeholder="2025년 수학의문 | 명문대 입학현황"
                          />
                        </div>

                        <h3 className="text-lg font-semibold mt-6">입학 현황 항목</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {sections.rate.items && sections.rate.items.map((item, index) => (
                            <Card key={item.id} className="p-4 space-y-1 border">
                              <div className="flex justify-between items-center">
                                <h4 className="font-medium">항목 {index + 1}</h4>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeRateItem(item.id)}
                                >
                                  <MinusCircle className="h-4 w-4 mr-2" />
                                  항목 삭제
                                </Button>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`rate-item-title-${index}`}>제목</Label>
                                <Input
                                  id={`rate-item-title-${index}`}
                                  value={item.title || ''}
                                  onChange={(e) => handleRateItemChange(index, 'title', e.target.value)}
                                  placeholder="고려대 경영학과 5명"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`rate-item-image-${index}`}>이미지</Label>
                                <div className="flex flex-row gap-4 mt-2">
                                  {[ 
                                    "/home_2/university_korea.png",
                                    "/home_2/university_seoul.png",
                                    "/home_2/university_yensei.png",
                                    "/home_2/university_KAIST.png",
                                  ].map((imagePath, imageIndex) => (
                                    <div key={imageIndex} className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        id={`image-${item.id}-${imageIndex}`}
                                        name={`image-${item.id}`}
                                        value={imagePath}
                                        checked={item.image === imagePath}
                                        onChange={() =>
                                          handleRateItemChange(index, "image", imagePath)
                                        }
                                        className="form-radio h-4 w-4 text-blue-600"
                                      />
                                      <label htmlFor={`image-${item.id}-${imageIndex}`}>
                                        <img src={imagePath} alt={`Option ${imageIndex + 1}`} className="w-12 h-12 object-cover rounded" />
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`rate-item-description-${index}`}>설명</Label>
                                <Textarea
                                  id={`rate-item-description-${index}`}
                                  value={item.description || ''}
                                  onChange={(e) => handleRateItemChange(index, 'description', e.target.value)}
                                  placeholder="Solid Questions Solving & Fresh Topics"
                                />
                              </div>
                            </Card>
                          ))}
                        </div>
                      </CardContent>

                      <div className="p-6 pt-0">
                        <div className="flex justify-between items-center">
                          <Button onClick={addRateItem}>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            새 항목 추가
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
                              {isSaving ? '저장 중...' : '변경사항 저장'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                    
                    
                  </div>
                </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
