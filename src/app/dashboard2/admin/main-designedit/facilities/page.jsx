'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

import { AppSidebar } from "@/components/admin/shadcn-dashborard/app-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoadingSpinner, InlineSpinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Save, Image as ImageIcon, PlusCircle, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

// 데이터 및 API 함수 가져오기
import { DEFAULT_FACILITIES, fetchFacilitiesData, saveFacilitiesData, DEFAULT_FUNFACTS, fetchFunfactsData, saveFunfactsData } from './mockData.js';

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
          <InlineSpinner size="md" />
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

// 통계용 이미지 미리보기 컴포넌트
const StatImagePreview = ({ src, alt, className = "w-16 h-16" }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    setImageError(false);
    setImageLoading(true);
  }, [src]);

  if (!src || imageError) {
    return (
      <div className={`${className} bg-muted rounded border-2 border-dashed border-muted-foreground/20 flex items-center justify-center`}>
        <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
      </div>
    );
  }

  return (
    <div className={`${className} bg-muted rounded border overflow-hidden flex items-center justify-center relative`}>
      {imageLoading && (
        <div className="absolute inset-0 bg-muted/50 flex items-center justify-center">
          <InlineSpinner />
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
  const { updateAuthState } = useAuth();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // 시설 관련 상태
  const [facilities, setFacilities] = useState(DEFAULT_FACILITIES);
  const [facilitiesIsDirty, setFacilitiesIsDirty] = useState(false);
  
  // 통계 관련 상태
  const [funfacts, setFunfacts] = useState(DEFAULT_FUNFACTS);
  const [funfactsIsDirty, setFunfactsIsDirty] = useState(false);
  
  // 데이터 로드 함수들
  const loadFacilitiesData = useCallback(async () => {
    try {
      const data = await fetchFacilitiesData();
      
      if (data) {
        setFacilities(prev => ({
          ...DEFAULT_FACILITIES,
          ...data,
          features: data.features || DEFAULT_FACILITIES.features
        }));
      } else {
        setFacilities(DEFAULT_FACILITIES);
      }
      setFacilitiesIsDirty(false);
    } catch (error) {
      console.error('시설 데이터 로드 중 오류 발생:', error);
      toast.error('시설 데이터를 불러오는 중 오류가 발생했습니다.');
    }
  }, []);

  const loadFunfactsData = useCallback(async () => {
    try {
      const data = await fetchFunfactsData();
      
      if (data) {
        setFunfacts(prev => ({
          ...DEFAULT_FUNFACTS,
          ...data,
          items: data.items || DEFAULT_FUNFACTS.items
        }));
      } else {
        setFunfacts(DEFAULT_FUNFACTS);
      }
      setFunfactsIsDirty(false);
    } catch (error) {
      console.error('통계 정보 데이터 로드 중 오류 발생:', error);
      toast.error('통계 정보 데이터를 불러오는 중 오류가 발생했습니다.');
    }
  }, []);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    const loadAllData = async () => {
      setIsPageLoading(true);
      try {
        await Promise.all([
          loadFacilitiesData(),
          loadFunfactsData()
        ]);
      } finally {
        setIsPageLoading(false);
      }
    };
    
    loadAllData();
  }, [loadFacilitiesData, loadFunfactsData]);

  // 시설 관련 핸들러들
  const handleBasicInfoChange = (field, value) => {
    setFacilities(prev => ({
      ...prev,
      [field]: value
    }));
    setFacilitiesIsDirty(true);
  };

  const handleFeatureChange = (index, field, value) => {
    setFacilities(prev => {
      const updatedFeatures = [...prev.features];
      updatedFeatures[index] = {
        ...updatedFeatures[index],
        [field]: value
      };
      return {
        ...prev,
        features: updatedFeatures
      };
    });
    setFacilitiesIsDirty(true);
  };

  const handleAddFeature = () => {
    const newFeature = {
      id: Date.now(),
      icon: '',
      title: '',
      description: ''
    };
    setFacilities(prev => ({
      ...prev,
      features: [...prev.features, newFeature]
    }));
    setFacilitiesIsDirty(true);
  };

  const handleRemoveFeature = (index) => {
    setFacilities(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
    setFacilitiesIsDirty(true);
  };

  // 통계 관련 핸들러들
  const handleItemChange = (index, field, value) => {
    setFunfacts(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: field === 'value' ? parseInt(value) || 0 : value
      };
      return {
        ...prev,
        items: updatedItems
      };
    });
    setFunfactsIsDirty(true);
  };

  const handleAddItem = () => {
    const newItem = {
      id: Date.now(),
      icon: '',
      value: 0,
      suffix: '',
      label: ''
    };
    setFunfacts(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    setFunfactsIsDirty(true);
  };

  const handleRemoveItem = (index) => {
    setFunfacts(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
    setFunfactsIsDirty(true);
  };

  // 저장 함수들
  const handleSaveFacilities = async () => {
    if (isSaving || !facilitiesIsDirty) return;
    
    setIsSaving(true);
    
    try {
      const savedData = await saveFacilitiesData(facilities);
      
      if (savedData && savedData.content) {
        setFacilities(prev => ({
          ...prev,
          ...savedData.content
        }));
      }
      
      setFacilitiesIsDirty(false);
      toast.success('시설 정보가 성공적으로 저장되었습니다.');
      updateAuthState({ lastActivity: new Date().toISOString() });
    } catch (error) {
      console.error('시설 정보 저장 중 오류 발생:', error);
      toast.error(error.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFunfacts = async () => {
    if (isSaving || !funfactsIsDirty) return;
    
    setIsSaving(true);
    
    try {
      const savedData = await saveFunfactsData(funfacts);
      
      if (savedData && savedData.content) {
        setFunfacts(prev => ({
          ...prev,
          ...savedData.content
        }));
      }
      
      setFunfactsIsDirty(false);
      toast.success('통계 정보가 성공적으로 저장되었습니다.');
      updateAuthState({ lastActivity: new Date().toISOString() });
    } catch (error) {
      console.error('통계 정보 저장 중 오류 발생:', error);
      toast.error(error.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 초기화 핸들러들
  const handleResetFacilities = () => {
    if (confirm('시설 정보 변경사항을 취소하고 마지막으로 저장된 상태로 되돌리시겠습니까?')) {
      loadFacilitiesData();
    }
  };

  const handleResetFunfacts = () => {
    if (confirm('통계 정보 변경사항을 취소하고 마지막으로 저장된 상태로 되돌리시겠습니까?')) {
      loadFunfactsData();
    }
  };

  // 로딩 상태 렌더링
  if (isPageLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="xl" text="데이터를 불러오는 중..." />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-8 p-4 pt-0">
          {/* 시설 관리 섹션 */}
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 시설 섹션 예시 이미지 카드 */}
              <Card className="bg-muted/50 rounded-xl">
                <CardHeader>
                  <CardTitle>시설 섹션 예시</CardTitle>
                  <CardDescription>메인 페이지에 표시되는 시설 섹션 예시입니다.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative w-full pt-[65%] rounded-lg overflow-hidden">
                    <img 
                      src="/admin_images/facilities.png" 
                      alt="시설 섹션 미리보기" 
                      className="absolute top-0 left-0 w-full h-full object-cover rounded-md shadow-sm"
                    />
                  </div>
                </CardContent>
              </Card>
<div></div>

              {/* 기본 정보 편집 카드 */}
              <Card className="bg-muted/50 rounded-xl">
                <CardHeader>
                  <CardTitle>기본 정보</CardTitle>
                  <CardDescription>시설 섹션의 기본 정보를 설정하세요.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>제목</Label>
                    <Input
                      value={facilities.title || ''}
                      onChange={(e) => handleBasicInfoChange('title', e.target.value)}
                      placeholder="시설 섹션 제목"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>부제목</Label>
                    <Textarea
                      value={facilities.subtitle || ''}
                      onChange={(e) => handleBasicInfoChange('subtitle', e.target.value)}
                      placeholder="시설 섹션 부제목"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>배경 이미지 URL</Label>
                    <Input
                      value={facilities.backgroundImage || ''}
                      onChange={(e) => handleBasicInfoChange('backgroundImage', e.target.value)}
                      placeholder="/home_3/video_bg.jpg"
                    />
                    <ImagePreview src={facilities.backgroundImage} alt="배경 이미지 미리보기" />
                  </div>
                  <div className="space-y-2">
                    <Label>동영상 URL</Label>
                    <Input
                      value={facilities.videoUrl || ''}
                      onChange={(e) => handleBasicInfoChange('videoUrl', e.target.value)}
                      placeholder="#vid002"
                    />
                    <p className="text-xs text-muted-foreground">
                      동영상 팝업 링크 또는 YouTube URL을 입력하세요
                    </p>
                  </div>
                </CardContent>
              </Card>
              <div></div>

              {/* 시설 특징 관리 카드 */}
              <Card className="bg-muted/50 rounded-xl">
                <CardHeader>
                  <CardTitle>시설 특징 관리</CardTitle>
                  <CardDescription>시설의 특징을 추가, 수정, 삭제할 수 있습니다.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6 grid grid-cols-1">
                    {facilities.features.map((feature, index) => (
                      <Card key={feature.id || index} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="md:col-span-2">
                            <div className="h-24 w-full bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                              {feature.icon ? (
                                <img 
                                  src={feature.icon} 
                                  alt={`시설 ${index + 1} 아이콘`} 
                                  className="w-12 h-12 object-contain"
                                />
                              ) : (
                                <span className="text-gray-400 text-sm">아이콘 미리보기</span>
                              )}
                            </div>
                            <div className="mt-2">
                              <Label>아이콘 URL</Label>
                              <Input
                                value={feature.icon || ''}
                                onChange={(e) => handleFeatureChange(index, 'icon', e.target.value)}
                                placeholder="아이콘 이미지 URL"
                              />
                            </div>
                          </div>
                          <div className="md:col-span-9 space-y-4">
                            <div>
                              <Label>제목</Label>
                              <Input
                                value={feature.title || ''}
                                onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                                placeholder="시설 특징 제목"
                              />
                            </div>
                            <div>
                              <Label>설명</Label>
                              <Textarea
                                value={feature.description || ''}
                                onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                                placeholder="시설 특징 설명"
                                rows={3}
                              />
                            </div>
                          </div>
                          <div className="md:col-span-1 flex items-start justify-end">
                            <button
                              type="button"
                              className="ml-1 p-0 bg-transparent border-none cursor-pointer hover:text-red-500 transition-colors"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRemoveFeature(index);
                              }}
                              aria-label="시설 특징 삭제"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-between items-center">
                    <Button
                      variant="outline"
                      onClick={handleAddFeature}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      새 시설 특징 추가
                    </Button>

                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleResetFacilities}
                        disabled={!facilitiesIsDirty || isSaving}
                      >
                        취소
                      </Button>
                      <Button 
                        size="sm"
                        onClick={handleSaveFacilities} 
                        disabled={!facilitiesIsDirty || isSaving}
                        className="flex items-center gap-2"
                      >
                        {isSaving ? (
                          <>
                            <InlineSpinner />
                            저장 중...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            시설 정보 저장
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>


          {/* 통계 정보 관리 섹션 */}
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* 통계 섹션 예시 이미지 카드 */}


              {/* 통계 항목 관리 카드 */}
              <Card className="bg-muted/50 rounded-xl col-span-2">
                <CardHeader>
                  <CardTitle>통계 정보 관리</CardTitle>
                  <CardDescription>학원의 통계 정보를 추가, 수정, 삭제할 수 있습니다.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {funfacts.items.map((item, index) => (
                      <Card key={item.id || index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold">통계 항목 {index + 1}</h3>
                          <button
                            type="button"
                            className="ml-1 p-0 bg-transparent border-none cursor-pointer hover:text-red-500 transition-colors"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleRemoveItem(index);
                            }}
                            aria-label="통계 항목 삭제"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="space-y-4">
                          {/* 아이콘 */}
                          <div className="flex items-center space-x-4">
                            <div>
                              <Label>아이콘 미리보기</Label>
                              <StatImagePreview src={item.icon} alt={`통계 ${index + 1} 아이콘`} className="w-16 h-16 bg-gray-900"/>
                            </div>
                            <div className="flex-1">
                              <Label>아이콘 URL</Label>
                              <Input
                                value={item.icon || ''}
                                onChange={(e) => handleItemChange(index, 'icon', e.target.value)}
                                placeholder="/home_3/funfact_icon_1.svg"
                              />
                            </div>
                          </div>

                          {/* 숫자 값과 접미사 */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>숫자 값</Label>
                              <Input
                                type="number"
                                value={item.value || 0}
                                onChange={(e) => handleItemChange(index, 'value', e.target.value)}
                                placeholder="20"
                              />
                            </div>
                            <div>
                              <Label>접미사</Label>
                              <Input
                                value={item.suffix || ''}
                                onChange={(e) => handleItemChange(index, 'suffix', e.target.value)}
                                placeholder="+년"
                              />
                            </div>
                          </div>

                          {/* 설명 라벨 */}
                          <div>
                            <Label>설명</Label>
                            <Input
                              value={item.label || ''}
                              onChange={(e) => handleItemChange(index, 'label', e.target.value)}
                              placeholder="대치동 20년운영 원장직강"
                            />
                          </div>

                          {/* 미리보기 */}
                          <div className="mt-4 p-3 bg-gray-900 rounded-lg text-white">
                            <div className="text-center">
                              <div className="text-2xl font-bold">
                                {item.value}{item.suffix}
                              </div>
                              <div className="text-sm opacity-70 mt-1">
                                {item.label}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-between items-center">
                    <Button
                      variant="outline"
                      onClick={handleAddItem}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      새 통계 항목 추가
                    </Button>

                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleResetFunfacts}
                        disabled={!funfactsIsDirty || isSaving}
                      >
                        취소
                      </Button>
                      <Button 
                        size="sm"
                        onClick={handleSaveFunfacts} 
                        disabled={!funfactsIsDirty || isSaving}
                        className="flex items-center gap-2"
                      >
                        {isSaving ? (
                          <>
                            <InlineSpinner />
                            저장 중...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            통계 정보 저장
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
