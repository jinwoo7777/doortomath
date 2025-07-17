'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { AppSidebar } from "@/components/admin/shadcn-dashborard/app-sidebar";
import { LoadingSpinner } from '@/components/ui/spinner';
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
import AnswerKeyForm from '@/components/admin/grading/AnswerKeyForm';

export default function AnswerKeyEditPage({ params }) {
  const { answerKeyId } = React.use(params);
  const router = useRouter();
  const { session, userRole, loading, roleLoaded } = useAuth();
  const [answerKey, setAnswerKey] = useState(null);
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

  // 답안 키 데이터 로드
  useEffect(() => {
    const fetchAnswerKey = async () => {
      if (!session || userRole !== 'admin' || !answerKeyId) {
        return;
      }

      try {
        setPageLoading(true);
        console.log('📝 답안 키 데이터 로드 시작:', answerKeyId);

        const { data, error } = await supabase
          .from('exam_answer_keys')
          .select(`
            *,
            teachers:teacher_id (
              name,
              email
            ),
            schedules:schedule_id (
              subject,
              grade,
              time_slot
            )
          `)
          .eq('id', answerKeyId)
          .single();

        if (error) {
          console.error('❌ 답안 키 데이터 로드 실패:', error);
          if (error.code === 'PGRST116') {
            setError('답안 키를 찾을 수 없습니다.');
          } else {
            setError('답안 키 데이터를 불러오는 중 오류가 발생했습니다.');
          }
          return;
        }

        console.log('✅ 답안 키 데이터 로드 성공:', data.exam_title);
        setAnswerKey(data);

      } catch (err) {
        console.error('❌ 답안 키 데이터 로드 오류:', err);
        setError('답안 키 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setPageLoading(false);
      }
    };

    fetchAnswerKey();
  }, [session, userRole, answerKeyId]);

  // 저장 성공 핸들러
  const handleSaveSuccess = async () => {
    console.log('🎉 답안 키 편집 완료');
    toast.success('답안 키가 성공적으로 수정되었습니다.');
    
    // 잠시 후 상세 페이지로 이동
    setTimeout(() => {
      router.push(`/dashboard2/admin/grading/${answerKeyId}`);
    }, 1000);
  };

  // 뒤로 가기 핸들러
  const handleBack = () => {
    router.push(`/dashboard2/admin/grading/${answerKeyId}`);
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
                    <BreadcrumbLink href="/dashboard2/admin/grading-management">
                      자동 채점 관리
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>답안 키 편집</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <LoadingSpinner text="데이터를 불러오는 중..." />
                <p className="mt-2 text-sm text-muted-foreground">답안 키 정보를 불러오는 중...</p>
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
                    <BreadcrumbLink href="/dashboard2/admin/grading-management">
                      자동 채점 관리
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
                  onClick={() => router.push('/dashboard2/admin/grading-management?tab=list')} 
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
                  <BreadcrumbLink href="/dashboard2/admin/grading">
                    자동 채점 관리
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{answerKey?.exam_title || '답안 키 편집'}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">답안 키 편집</h1>
              <p className="text-muted-foreground">"{answerKey?.exam_title}" 답안 키를 수정합니다.</p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              뒤로 가기
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>답안 키 편집</CardTitle>
            </CardHeader>
            <CardContent>
              <AnswerKeyForm
                initialData={answerKey}
                onBack={handleBack}
                onSave={handleSaveSuccess}
              />
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}