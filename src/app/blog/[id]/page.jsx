"use client"

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/supabaseClientBrowser";
import { BlogCommentForm } from "@/components/blogs/BlogCommentForm";
import { BlogComments } from "@/components/blogs/BlogComments";
import { BlogContainer } from "@/components/blogs/BlogContainer";
import { VideoPlayer } from "@/components/videos/VideoPlayer";
import { Layout } from "@/layouts/Layout";
import Link from "next/link";
import '@/styles/tiptap.css';

const videobg = "/home_1/video_bg.jpg";
const avatar1 = "/home_1/avatar_1.png";

export default function BlogDetails() {
  const params = useParams();
  const slug = params.id;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null); // 에러 초기화
        
        console.log('=== 블로그 포스트 조회 시작 ===');
        console.log('URL 파라미터 (slug/id):', slug);
        console.log('현재 URL:', window.location.href);
        
        // 먼저 slug로 찾기 시도
        console.log('1. slug로 조회 시도:', slug);
        let { data, error } = await supabase
          .from('blog_posts')
          .select(`
            *,
            profiles!blog_posts_author_id_fkey (
              full_name,
              email
            )
          `)
          .eq('slug', slug)
          .eq('status', 'published')
          .neq('status', 'deleted') // 삭제된 포스트 제외
          .maybeSingle();

        console.log('slug 조회 결과:', { data: !!data, error });

        // slug로 찾지 못했으면 id로 찾기 시도
        if (!data && !error) {
          console.log('2. id로 조회 시도:', slug);
          
          const result = await supabase
            .from('blog_posts')
            .select(`
              *,
              profiles!blog_posts_author_id_fkey (
                full_name,
                email
              )
            `)
            .eq('id', slug)
            .eq('status', 'published')
            .neq('status', 'deleted') // 삭제된 포스트 제외
            .maybeSingle();
          
          data = result.data;
          error = result.error;
          
          console.log('id 조회 결과:', { data: !!data, error });
        }

        if (error) {
          console.error('=== 데이터베이스 오류 ===');
          console.error('Error details:', error);
          console.error('Error message:', error.message);
          console.error('Error code:', error.code);
          throw error;
        }

        if (!data) {
          console.log('=== 포스트를 찾을 수 없음 ===');
          console.log('검색한 slug/id:', slug);
          console.log('published 상태의 포스트가 없거나 존재하지 않는 slug/id입니다.');
          setError(`'${slug}' 블로그 포스트를 찾을 수 없습니다. published 상태인지 확인해주세요.`);
          return;
        }

        console.log('=== 포스트 찾기 성공 ===');
        console.log('포스트 제목:', data.title);
        console.log('포스트 상태:', data.status);
        console.log('포스트 slug:', data.slug);

        // 조회수 증가
        await supabase
          .from('blog_posts')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', data.id);

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
        
        console.log('=== 블로그 포스트 조회 완료 ===');
      } catch (err) {
        console.error('=== 블로그 포스트 불러오기 치명적 오류 ===');
        console.error('Error object:', err);
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
        setError(`블로그 포스트를 불러오는 중 오류가 발생했습니다: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      console.log('=== useEffect 트리거 ===');
      console.log('slug 존재:', slug);
      fetchPost();
    } else {
      console.log('=== useEffect 트리거되었지만 slug 없음 ===');
    }
  }, [slug]);

  if (loading) {
    return (
      <Layout breadcrumbTitle="로딩 중..." breadcrumbSubtitle="Blog Details">
        <BlogContainer>
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">로딩 중...</span>
            </div>
            <p className="mt-3">블로그 포스트를 불러오는 중...</p>
          </div>
        </BlogContainer>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout breadcrumbTitle="오류" breadcrumbSubtitle="Blog Details">
        <BlogContainer>
          <div className="text-center py-5">
            <h3>블로그 포스트를 찾을 수 없습니다</h3>
            <p className="text-danger">{error}</p>
            <Link href="/blog" className="btn btn-primary">
              블로그 목록으로 돌아가기
            </Link>
          </div>
        </BlogContainer>
      </Layout>
    );
  }

  const publishedDate = new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Layout
      breadcrumbTitle={post.title}
      breadcrumbSubtitle="Blog Details"
    >
      <BlogContainer>
        <div className="td_blog_details_head td_mb_40">
          {post.image_url && (
            <img src={post.image_url} alt={post.title} />
          )}

          <div className="td_blog_details_head_meta">
            <div className="td_blog_details_avatar">
              <img src={avatar1} alt="Avatar" />
              <p className="mb-0 td_heading_color td_bold">
                <span className="td_normal td_opacity_5">By</span> {post.profiles?.full_name || '관리자'}
              </p>
            </div>

            <ul className="td_blog_details_head_meta_list td_mp_0 td_heading_color">
              <li>
                <div className="td_icon_btns">
                  <span className="td_icon_btn td_center td_heading_color">
                    <svg
                      width="13"
                      height="15"
                      viewBox="0 0 13 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.4375 0.75C3.65625 0.75 3.875 0.96875 3.875 1.1875V2.5H9.125V1.1875C9.125 0.96875 9.31641 0.75 9.5625 0.75C9.78125 0.75 10 0.96875 10 1.1875V2.5H10.875C11.832 2.5 12.625 3.29297 12.625 4.25V13C12.625 13.9844 11.832 14.75 10.875 14.75H2.125C1.14062 14.75 0.375 13.9844 0.375 13V4.25C0.375 3.29297 1.14062 2.5 2.125 2.5H3V1.1875C3 0.96875 3.19141 0.75 3.4375 0.75Z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                </div>
                {publishedDate}
              </li>
              <li>
                <div className="td_icon_btns">
                  <span className="td_icon_btn td_center td_heading_color">
                    <svg
                      width="15"
                      height="11"
                      viewBox="0 0 15 11"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.5 0C11.6406 0 15 2.46094 15 5.5C15 8.53906 11.6406 11 7.5 11C3.35938 11 0 8.53906 0 5.5C0 2.46094 3.35938 0 7.5 0ZM7.5 8.25C9.57031 8.25 11.25 6.57031 11.25 4.5C11.25 2.42969 9.57031 0.75 7.5 0.75C5.42969 0.75 3.75 2.42969 3.75 4.5C3.75 6.57031 5.42969 8.25 7.5 8.25Z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                </div>
                {post.view_count || 0} Views
              </li>
            </ul>
          </div>
        </div>

        <div className="td_blog_details">
          <h2>{post.title}</h2>
          
          {post.excerpt && (
            <div className="td_blog_excerpt td_mb_30">
              <p><strong>{post.excerpt}</strong></p>
            </div>
          )}

          <div 
            className="td_blog_content blog-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
        
        <div className="td_height_50 td_height_lg_40" />
        
        <div className="td_post_share">
          <div className="td_categories">
            <h4 className="mb-0 td_fs_18">Tags:</h4>
            {post.tags && post.tags.length > 0 ? (
              post.tags.map((tag, index) => (
                <Link key={index} href={`/blog?tag=${encodeURIComponent(tag)}`} className="td_category">
                  {tag}
                </Link>
              ))
            ) : (
              <span className="td_category">일반</span>
            )}
          </div>
          <div className="td_footer_social_btns td_fs_18 td_accent_color">
            <a href="#" className="td_center">
              <i className="fa-brands fa-facebook-f"></i>
            </a>
            <a href="#" className="td_center">
              <i className="fa-brands fa-x-twitter"></i>
            </a>
            <a href="#" className="td_center">
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a href="#" className="td_center">
              <i className="fa-brands fa-pinterest-p"></i>
            </a>
          </div>
        </div>
        
        <div className="td_height_40 td_height_lg_40" />
        
        <div className="td_author_card">
          <div className="td_author_card_in">
            <img src={avatar1} alt="Author" className="td_author_card_thumb" />
            <div className="td_author_card_right">
              <p className="td_medium td_accent_color td_mb_10">Author</p>
              <h3 className="td_fs_20 td_semibold td_mb_10">{post.profiles?.full_name || '관리자'}</h3>
              <p className="mb-0">
                수학의문 학원의 전문 강사진이 작성한 양질의 교육 콘텐츠입니다.
                학생들의 수학 실력 향상을 위해 최선을 다하고 있습니다.
              </p>
            </div>
          </div>
        </div>
        
        <div className="td_height_40 td_height_lg_40" />

        {/* comments */}
        <BlogComments />

        <div className="td_height_60 td_height_lg_40" />

        {/* comment form */}
        <BlogCommentForm />
      </BlogContainer>
    </Layout>
  );
}
