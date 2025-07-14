'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AdminCourseEditPage({ params }) {
  const { courseId } = React.use(params);
  const router = useRouter();
  const { session, userRole, loading, roleLoaded } = useAuth();
  const [course, setCourse] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);
  const supabase = createClientComponentClient();

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

  // 수업 데이터 로드
  useEffect(() => {
    const fetchCourse = async () => {
      if (!session || userRole !== 'admin' || !courseId) {
        return;
      }

      try {
        setPageLoading(true);
        console.log('📝 수업 데이터 로드 시작:', courseId);

        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single();

        if (error) {
          console.error('❌ 수업 데이터 로드 실패:', error);
          if (error.code === 'PGRST116') {
            setError('수업을 찾을 수 없습니다.');
          } else {
            setError('수업 데이터를 불러오는 중 오류가 발생했습니다.');
          }
          return;
        }

        console.log('✅ 수업 데이터 로드 성공:', data.title);
        setCourse(data);

      } catch (err) {
        console.error('❌ 수업 데이터 로드 오류:', err);
        setError('수업 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setPageLoading(false);
      }
    };

    fetchCourse();
  }, [session, userRole, courseId]); // supabase 제거

  // 저장 성공 핸들러
  const handleSaveSuccess = async () => {
    console.log('🎉 수업 편집 완료');
    toast.success('수업이 성공적으로 수정되었습니다.');
    
    // 잠시 후 목록 페이지로 이동
    setTimeout(() => {
      router.push('/dashboard2/admin/class-description?tab=list');
    }, 1000);
  };

  // 로딩 중
  if (loading || !roleLoaded || pageLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/dashboard2/admin/class-description">
                      수업 설명 관리
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>수업 편집</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="mt-2 text-sm text-muted-foreground">수업 정보를 불러오는 중...</p>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/dashboard2/admin/class-description">
                      수업 설명 관리
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>오류</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <p className="text-destructive font-medium">{error}</p>
                <Button 
                  onClick={() => router.push('/dashboard2/admin/class-description')} 
                  className="mt-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  목록으로 돌아가기
                </Button>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // 정상 상태
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard2/admin/class-description">
                    수업 설명 관리
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{course?.title || '수업 편집'}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">수업 편집</h1>
              <p className="text-muted-foreground">"{course?.title}" 수업의 설명을 수정합니다.</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard2/admin/class-description?tab=list')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              목록으로 돌아가기
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>수업 설명 편집</CardTitle>
            </CardHeader>
            <CardContent>
              <AdvancedCourseEditor 
                editingCourse={course}
                onSaveSuccess={handleSaveSuccess}
              />
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 