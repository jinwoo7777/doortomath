"use client"

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from '@/hooks/useAuth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, ExternalLink } from 'lucide-react';
import '@/styles/tiptap.css';

const avatar1 = "/home_1/avatar_1.png";

export default function AdminBlogPreview() {
  const params = useParams();
  const router = useRouter();
  const postId = params.postId;
  const { session, userRole, loading, roleLoaded } = useAuth();
  const [post, setPost] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);
  const supabase = createClientComponentClient();

  // 권한 확인
  useEffect(() => {
    if (loading || !roleLoaded) {
      return;
    }

    if (!session) {
      toast.error('로그인이 필요합니다.');
      router.push('/signin');
      return;
    }
    
    if (userRole !== 'admin') {
      toast.error('관리자 권한이 필요합니다.');
      router.push('/dashboard2/admin');
      return;
    }
  }, [session, userRole, loading, roleLoaded, router]);

  useEffect(() => {
    const fetchPost = async () => {
      if (!session || userRole !== 'admin' || !postId) {
        return;
      }

      try {
        setPageLoading(true);
        setError(null);
        
        console.log('=== 관리자 블로그 포스트 미리보기 조회 시작 ===');
        console.log('포스트 ID:', postId);
        
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
          
          // 태그 파싱
          let tags = [];
          if (data.tags) {
            try {
              tags = typeof data.tags === 'string' ? JSON.parse(data.tags) : data.tags;
            } catch (e) {
              console.error('태그 파싱 오류:', e);
              tags = [];
            }
          }

          setPost({
            ...data,
            tags: Array.isArray(tags) ? tags : []
          });
          return;
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
            .select(`
              *,
              profiles!blog_posts_author_id_fkey (
                full_name,
                email
              )
            `)
            .eq('id', postId)
            .neq('status', 'deleted') // 삭제된 포스트만 제외
            .single();

          if (error) {
            console.error('❌ Supabase 포스트 조회 에러:', error);
            
            if (error.code === 'PGRST116') {
              setError('블로그 포스트를 찾을 수 없습니다.');
            } else {
              setError(`포스트 조회 중 오류가 발생했습니다: ${error.message}`);
            }
            return;
          }

          if (!data) {
            setError('블로그 포스트를 찾을 수 없습니다.');
            return;
          }

          console.log('✅ Supabase를 통한 포스트 조회 성공:', {
            제목: data.title,
            상태: data.status
          });
          
          // 태그 파싱
          let tags = [];
          if (data.tags) {
            try {
              tags = typeof data.tags === 'string' ? JSON.parse(data.tags) : data.tags;
            } catch (e) {
              console.error('태그 파싱 오류:', e);
              tags = [];
            }
          }

          setPost({
            ...data,
            tags: Array.isArray(tags) ? tags : []
          });

        } catch (supabaseError) {
          console.error('❌ Supabase 조회도 실패:', supabaseError);
          setError(`포스트를 불러오는 중 오류가 발생했습니다: ${supabaseError.message}`);
        }
      } finally {
        setPageLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [session, supabase, userRole, postId]);

  // 로딩 상태
  if (loading || !roleLoaded || pageLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <LoadingSpinner text="데이터를 불러오는 중..." />
              <p className="mt-2 text-sm text-muted-foreground">포스트를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              뒤로 가기
            </Button>
            <h1 className="text-2xl font-bold">포스트 미리보기</h1>
          </div>
          
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">포스트를 찾을 수 없습니다</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => router.push('/dashboard2/admin/blog-editor')}>
                  블로그 관리로 돌아가기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const publishedDate = new Date(post.published_at || post.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return <Badge variant="default">발행됨</Badge>;
      case 'draft':
        return <Badge variant="secondary">초안</Badge>;
      case 'archived':
        return <Badge variant="outline">보관됨</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              뒤로 가기
            </Button>
            <div>
              <h1 className="text-2xl font-bold">포스트 미리보기</h1>
              <p className="text-muted-foreground">관리자 전용 미리보기 모드</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getStatusBadge(post.status)}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push(`/dashboard2/admin/blog-editor/edit/${post.id}`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              편집
            </Button>
            {post.status === 'published' && (
              <Button variant="outline" size="sm" asChild>
                <a href={`/blog/${post.slug || post.id}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  실제 페이지
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <Card>
          <CardContent className="p-0">
            {/* 포스트 헤더 */}
            <div className="p-8 border-b">
              {post.image_url && (
                <div className="mb-6">
                  <img 
                    src={post.image_url} 
                    alt={post.title} 
                    className="w-full max-h-96 object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <img src={avatar1} alt="Avatar" className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-medium text-sm">
                      작성자: {post.profiles?.full_name || '관리자'}
                    </p>
                    <p className="text-xs text-muted-foreground">{publishedDate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>조회수: {post.view_count || 0}</span>
                  {post.category && <span>카테고리: {post.category}</span>}
                </div>
              </div>
            </div>

            {/* 포스트 본문 */}
            <div className="p-8">
              <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
              
              {post.excerpt && (
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <p className="text-lg font-medium">{post.excerpt}</p>
                </div>
              )}

              <div 
                className="prose prose-lg max-w-none blog-content"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            {/* 포스트 푸터 */}
            <div className="p-8 border-t">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-medium mb-2">태그:</h4>
                  <div className="flex flex-wrap gap-2">
                    {post.tags && post.tags.length > 0 ? (
                      post.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">{tag}</Badge>
                      ))
                    ) : (
                      <Badge variant="outline">태그 없음</Badge>
                    )}
                  </div>
                </div>
                
                <div className="text-right text-sm text-muted-foreground">
                  <p>생성일: {new Date(post.created_at).toLocaleDateString('ko-KR')}</p>
                  <p>수정일: {new Date(post.updated_at).toLocaleDateString('ko-KR')}</p>
                  {post.published_at && (
                    <p>발행일: {new Date(post.published_at).toLocaleDateString('ko-KR')}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 