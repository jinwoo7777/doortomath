"use client"

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoadingSpinner, InlineSpinner } from '@/components/ui/spinner';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save, Plus, X, ImageOff, Star } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { AppSidebar } from "@/components/admin/shadcn-dashborard/app-sidebar"

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

// Default content structure
const DEFAULT_CONTENT = {
  reviews: {
    items: [
      {
        id: 1,
        rating: 5,
        text: '모의고사에서 늘 4등급이던 제가 \'풀이 첨삭\' 수업을 8개월 듣고 수능에서 **수학 1등급(백분위 97)**을 받았습니다. 선생님이 문제당 \'왜 이렇게 푸는지\' 근거를 잡아주셔서, 시험장에서 처음 보는 유형도 절대 당황하지 않았어요. 20년 커리큘럼으로 다져진 내신 기출 분석집 덕분에 학교 시험도 전교 1등으로 마무리했습니다.',
        avatar: '/home_1/avatar_1.png',
        name: '김○○',
        description: '고3, 의예과 최종 합격'
      },
      {
        id: 2,
        rating: 5,
        text: '친구 소개로 들어온 뒤부터 수학은 \'외우는 과목\'이 아니라 \'이해하는 과목\'이 되었습니다. 매수업 끝나면 풀이 노트를 빨간 펜으로 샅샅이 코칭해 주시는데, 제 약점 패턴이 한눈에 보여서 스스로 공부 루틴을 디자인할 수 있었어요. 작년 평균 88점에서 올해는 내신 전 과목 100점을 기록했습니다.',
        avatar: '/home_2/avatar_2.png',
        name: '박○○',
        description: '고2, 전교 1등 유지'
      },
      {
        id: 3,
        rating: 4.5,
        text: '중학교 때까지 수학이 두려웠는데, 첫 달부터 \'개념→유형→실전\' 3단계 수업으로 체계가 잡히니까 문제 읽는 속도가 달라졌어요. 4개월 만에 중간·기말 모두 **전교 상위 1%**에 진입했고, 담임 선생님도 \'표정이 달라졌다\'고 하세요. 수업 후 자유롭게 이용할 수 있는 1:1 첨삭룸도 큰 도움이 됐습니다.',
        avatar: '/home_2/avatar_3.png',
        name: '이○○',
        description: '고1, 개념 완성반 수강'
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
      <div className={`${className} bg-muted rounded-full border-2 border-dashed border-muted-foreground/20 flex items-center justify-center`}>
        <ImageOff className="w-4 h-4 text-muted-foreground/50" />
      </div>
    );
  }

  return (
    <div className={`${className} bg-muted rounded-full border overflow-hidden flex items-center justify-center relative`}>
      {imageLoading && (
        <div className="absolute inset-0 bg-muted/50 flex items-center justify-center">
          <InlineSpinner size="sm" />
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

// 별점 표시 컴포넌트
const StarRating = ({ rating }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    } else if (i === fullStars && hasHalfStar) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />);
    } else {
      stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
    }
  }

  return <div className="flex gap-1">{stars}</div>;
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
  
  // 리뷰 항목 변경 핸들러
  const handleReviewChange = (index, field, value) => {
    setContent(prev => ({
      ...prev,
      reviews: {
        ...prev.reviews,
        items: prev.reviews.items.map((review, i) => 
          i === index ? { ...review, [field]: value } : review
        )
      }
    }));
    setIsDirty(true);
  };

  // 리뷰 항목 추가
  const addReview = () => {
    const newId = Math.max(...content.reviews.items.map(r => r.id), 0) + 1;
    setContent(prev => ({
      ...prev,
      reviews: {
        ...prev.reviews,
        items: [
          ...prev.reviews.items,
          {
            id: newId,
            rating: 5,
            text: '새로운 후기를 입력하세요.',
            avatar: '/home_1/avatar_1.png',
            name: '새○○',
            description: '학년, 과정 정보'
          }
        ]
      }
    }));
    setIsDirty(true);
  };

  // 리뷰 항목 삭제
  const removeReview = (index) => {
    setContent(prev => ({
      ...prev,
      reviews: {
        ...prev.reviews,
        items: prev.reviews.items.filter((_, i) => i !== index)
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

      // reviews 섹션 저장
      await saveToSupabase('reviews', content.reviews);

      setIsDirty(false);
      toast({ 
        title: '저장 완료', 
        description: '후기 섹션이 성공적으로 저장되었습니다.' 
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
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('main_page_content')
          .select('content')
          .eq('section_name', 'reviews')
          .single();

        if (reviewsData && !reviewsError && isMounted) {
          setContent(prev => ({
            ...prev,
            reviews: {
              ...prev.reviews,
              ...reviewsData.content
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
            <LoadingSpinner size="xl" text="후기 데이터를 불러오는 중..." />
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
                <CardDescription>메인 페이지에 표시되는 후기 섹션 예시입니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full pt-[50%] rounded-lg overflow-hidden">
                  <img 
                    src="/admin_images/reviews_section.png" 
                    alt="후기 섹션 미리보기" 
                    className="absolute top-0 left-0 w-full h-full object-cover rounded-md shadow-sm"
                  />
                </div>
              </CardContent>
            </Card>
            <div></div>
            {/* 설정 카드 */}
            <Card className="bg-muted/50 rounded-xl">
              <CardHeader>
                <CardTitle>후기 섹션</CardTitle>
                <CardDescription>메인 페이지에 표시될 고객 후기들을 편집합니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 후기 항목들 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">고객 후기</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={addReview}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      후기 추가
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {content.reviews?.items?.map((review, index) => (
                      <Card key={review.id} className="border-2 border-dashed">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-sm">후기 {index + 1}</CardTitle>
                              <StarRating rating={review.rating} />
                              <span className="text-xs text-muted-foreground">({review.rating}점)</span>
                            </div>
                            {content.reviews.items.length > 1 && (
                              <button
                                type="button"
                                className="ml-1 p-0 bg-transparent border-none cursor-pointer hover:text-red-500 transition-colors"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  removeReview(index);
                                }}
                                aria-label="리뷰 삭제"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor={`review-rating-${index}`}>별점</Label>
                            <Select 
                              value={review.rating.toString()} 
                              onValueChange={(value) => handleReviewChange(index, 'rating', parseFloat(value))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5">⭐⭐⭐⭐⭐ (5점)</SelectItem>
                                <SelectItem value="4.5">⭐⭐⭐⭐⭐ (4.5점)</SelectItem>
                                <SelectItem value="4">⭐⭐⭐⭐☆ (4점)</SelectItem>
                                <SelectItem value="3.5">⭐⭐⭐⭐☆ (3.5점)</SelectItem>
                                <SelectItem value="3">⭐⭐⭐☆☆ (3점)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`review-text-${index}`}>후기 내용</Label>
                            <Textarea
                              id={`review-text-${index}`}
                              value={review.text}
                              onChange={(e) => handleReviewChange(index, 'text', e.target.value)}
                              placeholder="고객 후기를 입력하세요"
                              rows={4}
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-start gap-3">
                              <ImagePreview 
                                src={review.avatar} 
                                alt={`${review.name} 프로필`}
                                className="w-12 h-12"
                              />
                              <div className="flex-1 space-y-2">
                                <Label htmlFor={`review-avatar-${index}`}>프로필 이미지 경로</Label>
                                <Input
                                  id={`review-avatar-${index}`}
                                  value={review.avatar}
                                  onChange={(e) => handleReviewChange(index, 'avatar', e.target.value)}
                                  placeholder="/home_1/avatar_1.png"
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`review-name-${index}`}>이름</Label>
                              <Input
                                id={`review-name-${index}`}
                                value={review.name}
                                onChange={(e) => handleReviewChange(index, 'name', e.target.value)}
                                placeholder="김○○"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`review-description-${index}`}>설명</Label>
                              <Input
                                id={`review-description-${index}`}
                                value={review.description}
                                onChange={(e) => handleReviewChange(index, 'description', e.target.value)}
                                placeholder="고3, 의예과 최종 합격"
                              />
                            </div>
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
                        <InlineSpinner />
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
