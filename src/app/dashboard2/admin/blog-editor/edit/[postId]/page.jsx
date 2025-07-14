"use client"

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { BlogPostEditor } from '@/components/admin/BlogPostEditor';
import { AppSidebar } from "@/components/admin/shadcn-dashborard/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

export default function EditBlogPost() {
  const router = useRouter();
  const params = useParams();
  const postId = params.postId;
  const { session, userRole, loading, roleLoaded } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const supabase = createClientComponentClient();

  // 컴포넌트 마운트 시 초기 상태 로그
  useEffect(() => {
    console.log('EditBlogPost 컴포넌트 마운트됨:', {
      postId,
      params,
      initialStates: {
        loading,
        roleLoaded,
        userRole,
        hasSession: !!session,
        isLoading
      }
    });
  }, []); // 빈 배열로 마운트 시에만 실행

  // 권한 확인
  useEffect(() => {
    console.log('권한 확인 useEffect 실행됨:', { loading, roleLoaded, session: !!session, userRole });
    
    if (loading || !roleLoaded) {
      console.log('로딩 중이거나 역할이 로드되지 않아서 권한 확인 대기 중');
      return;
    }

    if (!session) {
      console.log('세션이 없어서 로그인 페이지로 리다이렉트');
      toast.error('로그인이 필요합니다.');
      router.push('/signin');
      return;
    }
    
    if (userRole !== 'admin') {
      console.log('관리자 권한이 없어서 관리자 메인으로 리다이렉트');
      toast.error('관리자 권한이 필요합니다.');
      router.push('/dashboard2/admin');
      return;
    }
    
    console.log('권한 확인 완료 - 관리자 권한 있음');
  }, [session, userRole, loading, roleLoaded, router]);

  // 블로그 포스트 불러오기
  useEffect(() => {
    console.log('fetchPost useEffect 실행됨', { 
      session: !!session, 
      userRole, 
      postId, 
      loading, 
      roleLoaded 
    });

    const fetchPost = async () => {
      console.log('fetchPost 호출 상태 확인:', { 
        loading, 
        roleLoaded, 
        hasSession: !!session, 
        userRole,
        postId,
        sessionUserId: session?.user?.id 
      });

      if (!session) {
        console.log('세션이 없어서 fetchPost 중단');
        return;
      }
      
      if (userRole !== 'admin') {
        console.log('관리자 권한이 없어서 fetchPost 중단', { userRole });
        return;
      }
      
      if (!postId) {
        console.log('postId가 없어서 fetchPost 중단');
        return;
      }
      
      console.log('fetchPost 실행 시작 - 포스트 ID:', postId);
      setIsLoading(true);
      
      try {
        // 관리자 API를 통해 포스트 조회 시도
        console.log('🌐 API를 통한 포스트 조회 시도...');
        const response = await fetch(`/api/admin/blog/${postId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          credentials: 'same-origin'
        });

        if (response.ok) {
          const { data } = await response.json();
          console.log('✅ API를 통한 포스트 조회 성공:', {
            제목: data?.title,
            상태: data?.status,
            ID: data?.id
          });
          setPost(data);
          return; // 성공했으므로 여기서 종료
        } else {
          const errorData = await response.json();
          console.log('❌ API 조회 실패, 폴백 시도:', errorData);
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }
      } catch (apiError) {
        console.log('🔄 API 실패, Supabase 클라이언트로 폴백:', apiError.message);
        
        try {
          // 폴백: 기존 Supabase 클라이언트 사용
          console.log('💾 Supabase에서 포스트 조회 중...');
          const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('id', postId)
            .single();
          
          console.log('📋 Supabase 조회 결과:', { 
            hasData: !!data, 
            error: error ? {
              message: error.message,
              code: error.code,
              details: error.details
            } : null,
            postTitle: data?.title 
          });
          
          if (error) {
            console.error('❌ Supabase 포스트 조회 에러:', error);
            throw error;
          }
          
          if (!data) {
            console.error('❌ 포스트 데이터가 없음');
            toast.error('블로그 포스트를 찾을 수 없습니다.');
            router.push('/dashboard2/admin/blog-editor');
            return;
          }

          console.log('✅ Supabase를 통한 포스트 로드 성공:', data.title);
          setPost(data);
        } catch (supabaseError) {
          console.error('❌ Supabase 조회도 실패:', supabaseError);
          
          const errorDetails = {
            message: supabaseError.message || '알 수 없는 오류',
            code: supabaseError.code || 'UNKNOWN',
            details: supabaseError.details || null,
            hint: supabaseError.hint || null
          };
          
          console.error('🔍 에러 상세 정보:', errorDetails);
          
          toast.error(`블로그 포스트를 불러오는 중 오류가 발생했습니다: ${errorDetails.message}`);
          router.push('/dashboard2/admin/blog-editor');
        }
      } finally {
        console.log('📋 fetchPost finally - 로딩 상태 해제');
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [session, supabase, userRole, postId, router]);

  // 블로그 포스트 삭제
  const handleDelete = async () => {
    if (!confirm('정말로 이 블로그 포스트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    console.log('삭제 시작 - 포스트 ID:', postId);
    setIsDeleting(true);

    try {
      // 현재 세션 확인
      if (!session) {
        throw new Error('인증되지 않은 사용자입니다.');
      }

      // API 엔드포인트를 통해 삭제 요청
      console.log('API를 통한 삭제 요청 중...');
      
      // useAuth 훅의 세션 정보 확인
      console.log('useAuth 세션 정보:', { 
        hasSession: !!session, 
        hasAccessToken: !!session?.access_token,
        userId: session?.user?.id 
      });
      
      // 현재 세션의 access token 가져오기 (이중 확인)
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      console.log('supabase.auth.getSession() 결과:', { 
        hasSession: !!currentSession, 
        hasAccessToken: !!currentSession?.access_token,
        userId: currentSession?.user?.id,
        sessionError 
      });
      
      if (sessionError) {
        console.error('세션 가져오기 에러:', sessionError);
        throw new Error('세션 정보를 가져올 수 없습니다.');
      }
      
      // useAuth의 세션을 우선 사용, 없으면 supabase에서 가져온 세션 사용
      const activeSession = session || currentSession;
      
      if (!activeSession) {
        throw new Error('세션이 존재하지 않습니다. 다시 로그인해주세요.');
      }
      
      const accessToken = activeSession.access_token;
      console.log('사용할 토큰 정보:', { 
        hasToken: !!accessToken,
        tokenLength: accessToken?.length,
        tokenPreview: accessToken ? accessToken.substring(0, 20) + '...' : null 
      });
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // 액세스 토큰이 있으면 Authorization 헤더에 추가
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
        console.log('Authorization 헤더 추가됨');
      } else {
        console.warn('액세스 토큰이 없습니다');
        throw new Error('인증 토큰을 찾을 수 없습니다.');
      }
      
      console.log('최종 요청 헤더:', { ...headers, Authorization: headers.Authorization ? headers.Authorization.substring(0, 20) + '...' : null });
      
      const response = await fetch(`/api/admin/blog/delete?postId=${postId}`, {
        method: 'DELETE',
        headers,
        credentials: 'same-origin', // 쿠키/세션 정보 포함
      });

      const result = await response.json();
      console.log('API 응답:', result);

      if (!response.ok) {
        throw new Error(result.error || '삭제 요청이 실패했습니다.');
      }

      if (result.success) {
        console.log('블로그 포스트 삭제 성공:', result.deletedPost);
        toast.success('블로그 포스트가 성공적으로 삭제되었습니다.');
        
        // 메인 관리자 페이지의 블로그 에디터 목록으로 이동
        router.push('/dashboard2/admin?path=/dashboard2/admin/blog-editor&tab=list');
      } else {
        throw new Error('삭제 처리 중 오류가 발생했습니다.');
      }

    } catch (err) {
      console.error('블로그 포스트 삭제 오류:', err);
      
      // 에러 메시지를 더 구체적으로 표시
      if (err.message.includes('권한')) {
        toast.error('삭제 권한이 없습니다. 관리자에게 문의하세요.');
      } else if (err.message.includes('찾을 수 없')) {
        toast.error('삭제할 포스트를 찾을 수 없습니다.');
      } else if (err.message.includes('인증')) {
        toast.error('인증이 필요합니다. 다시 로그인해주세요.');
      } else {
        toast.error(`블로그 포스트 삭제 중 오류가 발생했습니다: ${err.message}`);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // 포스트 저장 성공 시 호출되는 함수
  const handlePostSaveSuccess = () => {
    console.log('포스트 저장 성공 - 목록 화면으로 이동');
    toast.success('블로그 포스트가 성공적으로 저장되었습니다.');
    
    // 메인 관리자 페이지의 블로그 에디터 섹션으로 이동 (URL 쿼리 파라미터로 list 탭 활성화)
    router.push('/dashboard2/admin?path=/dashboard2/admin/blog-editor&tab=list');
  };

  // 로딩 상태
  if (loading || !roleLoaded || isLoading) {
    console.log('로딩 상태 표시 중:', { 
      loading, 
      roleLoaded, 
      isLoading,
      session: !!session,
      userRole 
    });
    
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
            <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
              <div className="text-center">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="mt-4 text-muted-foreground">블로그 포스트를 불러오는 중...</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  로딩 상태: loading={loading?.toString()}, roleLoaded={roleLoaded?.toString()}, isLoading={isLoading?.toString()}
                </p>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          {/* 헤더 */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                뒤로 가기
              </Button>
              <div>
                <h1 className="text-3xl font-bold">블로그 포스트 편집</h1>
                <p className="text-muted-foreground">"{post?.title || '제목 없음'}" 포스트를 편집합니다.</p>
              </div>
            </div>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? '삭제 중...' : '포스트 삭제'}
            </Button>
          </div>

          {/* 에디터 컨텐츠 */}
          <Card>
            <CardHeader>
              <CardTitle>포스트 편집</CardTitle>
            </CardHeader>
            <CardContent>
              {post && (
                <BlogPostEditor 
                  editingPost={post} 
                  onSaveSuccess={handlePostSaveSuccess} 
                />
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 