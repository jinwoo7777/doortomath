// ...'use client';

import React, { useEffect, useState } from 'react';
import { fetchCourseMenu } from '@/lib/supabase/fetchCourseMenu';
import { useRouter } from "next/navigation";

import CourseBasicInfoForm from "./CourseBasicInfoForm";
import CourseDetailsForm from "./CourseDetailsForm";
import CourseContentForm from "./CourseContentForm";
import { useAuth } from '@/hooks/useAuth';


import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { InlineSpinner } from '@/components/ui/spinner';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage, 
  FormDescription, 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

import { supabase } from '@/lib/supabase';


import { isSafeRedirectUrl } from '@/lib/auth/helpers';

// isValidUrl 함수를 isSafeRedirectUrl 또는 간단한 URL 검증으로 대체
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const formSchema = z.object({
  // 기본 정보
  title: z
    .string()
    .min(2, { message: '강의 제목은 2자 이상 입력해주세요.' })
    .max(100, { message: '강의 제목은 100자 이하로 입력해주세요.' })
    .trim(),
    
  user_id: z.string().optional(),
  
  description: z
    .string()
    .min(20, { message: '강의 설명은 20자 이상 입력해주세요.' })
    .max(2000, { message: '강의 설명은 2000자 이하로 입력해주세요.' })
    .trim(),
    
  course_label: z
    .string()
    .min(2, { message: '강의 라벨은 2자 이상 입력해주세요.' })
    .max(50, { message: '강의 라벨은 50자 이하로 입력해주세요.' })
    .trim(),
    
  price: z
    .string()
    .min(1, { message: '가격을 입력해주세요.' })
    .refine((val) => /^[0-9,]+$/.test(val), {
      message: '유효한 가격을 입력해주세요.',
    }),

  // 메타 정보
  seats: z
    .number({ invalid_type_error: '좌석 수는 숫자여야 합니다.' })
    .int({ message: '정수를 입력하세요.' })
    .min(1, { message: '좌석 수는 1 이상이어야 합니다.' }),
  semesters: z
    .number({ invalid_type_error: '학기 수는 숫자여야 합니다.' })
    .int({ message: '정수를 입력하세요.' })
    .min(1, { message: '학기 수는 1 이상이어야 합니다.' }),
  weeks: z
    .number({ invalid_type_error: '기간(주)은 숫자여야 합니다.' })
    .int({ message: '정수를 입력하세요.' })
    .min(1, { message: '기간(주)은 1 이상이어야 합니다.' }),
  
  // 상세 정보
  details: z.object({
    level: z.enum(['초급', '중급', '고급'], {
      required_error: '난이도를 선택해주세요.',
    }),
    
    duration: z
      .string()
      .min(1, { message: '강의 시간을 입력해주세요.' })
      .regex(/^[0-9]+(\.[0-9]+)?\s*(시간|분|h|m)/i, {
        message: '예: 2시간 30분 또는 2.5h',
      }),
      
    total_lectures: z
      .number()
      .min(1, { message: '강의 수는 1개 이상이어야 합니다.' })
      .max(1000, { message: '강의 수는 1000개를 초과할 수 없습니다.' })
      .int({ message: '정수만 입력 가능합니다.' }),
    thumbnail_url: z
      .string()
      .refine((url) => !url || isValidUrl(url), {
        message: '유효한 URL을 입력해주세요.',
      })
      .optional(),
    video_url: z
      .string()
      .refine((url) => !url || isValidUrl(url), {
        message: '유효한 URL을 입력해주세요.',
      })
      .refine((url) => !url || url.includes('youtube.com') || url.includes('vimeo.com'), {
        message: 'YouTube 또는 Vimeo URL만 허용됩니다.',
      })
      .optional(),
    language: z.string().default('한국어'),
    subtitle_languages: z
      .string()
      .max(100, { message: '자막 언어는 100자 이하로 입력해주세요.' })
      .optional(),
    certificate_available: z.boolean().default(true),
  }),
  category: z.string().min(1, { message: '카테고리를 선택해주세요.' }),
  
  // 학습 목표 및 요구사항
  what_you_will_learn: z
    .string()
    .min(20, { message: '학습 목표를 20자 이상 상세히 입력해주세요.' })
    .max(2000, { message: '학습 목표는 2000자 이하로 입력해주세요.' })
    .refine(
      (val) => val.split('\n').filter(Boolean).length >= 3,
      { message: '학습 목표를 3개 이상 입력해주세요.' }
    ),
    
  requirements: z
    .string()
    .min(10, { message: '필요한 사전 지식을 10자 이상 입력해주세요.' })
    .max(2000, { message: '필요한 사전 지식은 2000자 이하로 입력해주세요.' })
    .refine(
      (val) => val.split('\n').filter(Boolean).length >= 1,
      { message: '최소 1개 이상의 사전 지식을 입력해주세요.' }
    ),
    
  includes: z
    .string()
    .max(2000, { message: '강의 내용은 2000자 이하로 입력해주세요.' })
    .optional(),
  
  // 메타데이터
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  
  featured: z.boolean().default(false),

});

export default function CourseForm({ courseData, onSuccess }) {
  const router = useRouter();
  const { session, userRole } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [categories, setCategories] = useState([]); // 카테고리 상태 추가

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      user_id: session?.user?.id || '',
      description: '',
      course_label: '',
      price: '',
      details: {
        level: undefined,
        duration: '',
        total_lectures: 1,
        thumbnail_url: '',
        video_url: '',
        language: '한국어',
        subtitle_languages: '',
        certificate_available: true,
      },
      category: '',
      what_you_will_learn: '',
      requirements: '',
      includes: '',
      status: 'draft',
      featured: false,
      seats: 1,
      semesters: 1,
      weeks: 1,
    },
  });

  useEffect(() => {
    if (courseData && !initialDataLoaded) {
      const formattedPrice = courseData.price ? courseData.price.toLocaleString('ko-KR') : '';

      form.reset({
        ...courseData,
        price: formattedPrice,
        details: {
          level: courseData.details?.level || undefined,
          duration: courseData.details?.duration || '',
          total_lectures: courseData.details?.total_lectures || 1,
          thumbnail_url: courseData.details?.thumbnail_url || '',
          video_url: courseData.details?.video_url || '',
          language: courseData.details?.language || '한국어',
          subtitle_languages: courseData.details?.subtitle_languages || '',
          certificate_available: courseData.details?.certificate_available ?? true,
        },
        category: courseData.category || courseData.details?.category || '',
      });
      setInitialDataLoaded(true);
    }

    // CourseMenu 불러오기 - main_page_content 테이블의 'course_menu' 섹션에서 가져옴


    const fetchCategories = async () => {
      try {
        const menu = await fetchCourseMenu();
        const names = menu
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((item) => item.name?.trim())
          .filter(Boolean);
        setCategories(names);
      } catch (error) {
        console.error('CourseMenu 조회 오류:', error);
        toast.error('메뉴를 불러오는 데 실패했습니다.');
      }
    };


    fetchCategories();
  }, [courseData, form, initialDataLoaded, session?.user?.id])

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg rounded-lg">
      <CardContent className="p-8">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(async (values) => {
            setIsSubmitting(true);
            setError(null);

            if (!session?.user) {
              toast.error('로그인이 필요합니다.');
              setIsSubmitting(false);
              return;
            }

            if (userRole !== 'admin') {
              toast.error('관리자만 강의를 생성/수정할 수 있습니다.');
              setIsSubmitting(false);
              return;
            }

            try {
              const priceValue = parseFloat(values.price.replace(/,/g, ''));
              if (isNaN(priceValue)) {
                throw new Error('유효하지 않은 가격 형식입니다.');
              }

              const courseToSave = {
                ...values,
                price: priceValue,
                seats: Number(values.seats),
                semesters: Number(values.semesters),
                weeks: Number(values.weeks),
                user_id: session.user.id,
              };

              let data = null;
              let error = null;

              if (courseData?.id) {
                // Update existing course
                const { data: updatedData, error: updateError } = await supabase
                  .from('courses')
                  .update(courseToSave)
                  .eq('id', courseData.id)
                  .select();
                data = updatedData;
                error = updateError;
              } else {
                // Insert new course
                const { data: insertedData, error: insertError } = await supabase
                  .from('courses')
                  .insert(courseToSave)
                  .select();
                data = insertedData;
                error = insertError;
              }

              if (error) {
                console.error('Supabase 에러:', error);
                throw new Error(error.message || '강의 저장 중 오류가 발생했습니다.');
              }

              toast.success('강의가 성공적으로 저장되었습니다!');
              
              // onSuccess 콜백이 있으면 실행, 없으면 기본 동작
              if (onSuccess) {
                onSuccess();
              } else {
                router.push('/dashboard/admin/courses');
                router.refresh();
              }
            } catch (err) {
              console.error('강의 저장 실패:', err);
              setError(err.message || '알 수 없는 오류가 발생했습니다.');
              toast.error(err.message || '강의 저장에 실패했습니다.');
            } finally {
              setIsSubmitting(false);
            }
          })} className="space-y-10">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800">
                <TabsTrigger value="basic" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">기본 정보</TabsTrigger>
                <TabsTrigger value="details" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">상세 정보</TabsTrigger>
                <TabsTrigger value="content" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">학습 내용</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="mt-8 space-y-8">
                <CourseBasicInfoForm categories={categories} />
              </TabsContent>
              <TabsContent value="details" className="mt-8 space-y-8">
                <CourseDetailsForm />
              </TabsContent>
              <TabsContent value="content" className="mt-8 space-y-8">
                <CourseContentForm />
              </TabsContent>
            </Tabs>



            <Separator className="my-8" />

            <div className="flex justify-end gap-4">
              {error && (
                <p className="text-red-500 text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {error}
                </p>
              )}
              <Button type="button" variant="outline" onClick={() => router.back()}>
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <InlineSpinner />
                    저장 중...
                  </>
                ) : (
                  '강의 저장'
                )}
              </Button>
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
 