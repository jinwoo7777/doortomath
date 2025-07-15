'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
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
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Calendar, User, Eye, Edit, Users, CheckCircle, XCircle, Trophy } from 'lucide-react';
import AnswerKeyDetail from '@/components/admin/grading/AnswerKeyDetail';
import ExamStatusContent from '@/components/admin/grading/ExamStatusContent';

export default function AnswerKeyDetailPage({ params }) {
  const { answerKeyId } = React.use(params);
  const router = useRouter();
  const { session, userRole, loading, roleLoaded } = useAuth();
  const [answerKey, setAnswerKey] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('detail'); // 'detail' 또는 'status'
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      return dateString;
    }
  };

  const getExamTypeBadge = (type) => {
    const types = {
      regular: { label: '정기시험', color: 'bg-blue-500' },
      midterm: { label: '중간고사', color: 'bg-green-500' },
      final: { label: '기말고사', color: 'bg-red-500' },
      quiz: { label: '퀴즈', color: 'bg-yellow-500' }
    };
    
    const typeInfo = types[type] || { label: type, color: 'bg-gray-500' };
    return (
      <Badge className={`text-white ${typeInfo.color}`}>
        {typeInfo.label}
      </Badge>
    );
  };

  const handleDelete = async (id) => {
    if (!confirm('정말로 이 답안 키를 삭제하시겠습니까?')) return;
    
    try {
      const { error } = await supabase
        .from('exam_answer_keys')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('답안 키가 성공적으로 삭제되었습니다.');
      router.push('/dashboard2/admin/grading-management?tab=list');
    } catch (error) {
      console.error('답안 키 삭제 중 오류:', error);
      toast.error('답안 키 삭제에 실패했습니다.');
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard2/admin/grading/edit/${answerKeyId}`);
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
                    <BreadcrumbPage>답안 키 상세보기</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
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
                  <BreadcrumbPage>{answerKey?.exam_title || '답안 키 상세보기'}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">답안 키 상세보기</h1>
              <p className="text-muted-foreground">"{answerKey?.exam_title}" 답안 키의 상세 정보입니다.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant={currentView === 'detail' ? 'default' : 'outline'}
                onClick={() => setCurrentView('detail')}
              >
                <Eye className="h-4 w-4 mr-2" />
                상세보기
              </Button>
              <Button 
                variant={currentView === 'status' ? 'default' : 'outline'}
                onClick={() => setCurrentView('status')}
              >
                <Users className="h-4 w-4 mr-2" />
                응시현황
              </Button>
              <Button 
                variant="outline" 
                onClick={handleEdit}
              >
                <Edit className="h-4 w-4 mr-2" />
                편집
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard2/admin/grading-management?tab=list')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                목록으로 돌아가기
              </Button>
            </div>
          </div>

          {/* 답안 키 기본 정보 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{answerKey?.exam_title}</CardTitle>
                {getExamTypeBadge(answerKey?.exam_type)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">시험 날짜</p>
                    <p className="font-medium">{formatDate(answerKey?.exam_date)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">과목</p>
                    <p className="font-medium">{answerKey?.subject}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-500">담당 강사</p>
                    <p className="font-medium">{answerKey?.teachers?.name || '알 수 없음'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Trophy className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-500">총 점수</p>
                    <p className="font-medium">{answerKey?.total_score}점 ({answerKey?.answers?.length || 0}문제)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 컨텐츠 영역 */}
          {currentView === 'detail' ? (
            <AnswerKeyDetail
              answerKey={answerKey}
              onBack={() => router.push('/dashboard2/admin/grading-management?tab=list')}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <ExamStatusContent
              answerKey={answerKey}
              onBack={() => router.push('/dashboard2/admin/grading-management?tab=list')}
            />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}