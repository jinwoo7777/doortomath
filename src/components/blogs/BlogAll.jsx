"use client"

import React, { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/supabaseClientBrowser';
import { BlogPagination } from "./BlogPagination";
import { BlogItem } from "./BlogItem";

// 카테고리 슬러그를 한글 이름으로 변환하는 헬퍼 함수
const getCategoryName = (categorySlug) => {
  const categoryMap = {
    'general': '일반',
    'education': '교육',
    'math': '수학',
    'admission': '입시',
    'notice': '공지사항'
  };
  return categoryMap[categorySlug] || categorySlug;
};

export const BlogAll = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const tagFilter = searchParams.get('tag');
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from('blog_posts')
          .select(`
            *,
            profiles!blog_posts_author_id_fkey (
              full_name,
              email
            )
          `)
          .eq('status', 'published')
          .neq('status', 'deleted'); // 삭제된 포스트 명시적 제외

        // 카테고리 필터 적용
        if (categoryFilter) {
          query = query.eq('category', categoryFilter);
        }

        // 태그 필터 적용 (JSON 배열에서 태그 검색)
        if (tagFilter) {
          // URL 디코딩된 태그 사용
          const decodedTag = decodeURIComponent(tagFilter);
          query = query.contains('tags', `"${decodedTag}"`);
        }

        const { data, error } = await query.order('published_at', { ascending: false });

        if (error) throw error;

        // 데이터를 BlogItem 컴포넌트에 맞는 형태로 변환
        const transformedPosts = data?.map(post => {
          // 태그가 JSON 문자열인 경우 파싱
          let tags = [];
          if (post.tags) {
            try {
              tags = typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags;
            } catch (e) {
              console.error('태그 파싱 오류:', e);
              tags = [];
            }
          }

          return {
            id: post.id,
            image: post.image_url || '/home_1/post_1.jpg', // 기본 이미지
            date: new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }),
            author: post.profiles?.full_name || '관리자',
            title: post.title,
            excerpt: post.excerpt,
            link: `/blog/${post.slug || post.id}`,
            category: post.category,
            tags: Array.isArray(tags) ? tags : [],
            featured: post.featured,
            content: post.content // 검색을 위해 내용도 포함
          };
        }) || [];

        setBlogPosts(transformedPosts);
        console.log('✅ 블로그 포스트 로드 완료:', transformedPosts.length, '개');
      } catch (err) {
        console.error('블로그 포스트 불러오기 오류:', err);
        setError('블로그 포스트를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, [categoryFilter, tagFilter]);

  // 검색어에 따라 포스트 필터링
  useEffect(() => {
    if (!searchQuery) {
      setFilteredPosts(blogPosts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = blogPosts.filter(post => {
      return (
        post.title.toLowerCase().includes(query) ||
        post.excerpt?.toLowerCase().includes(query) ||
        post.content?.toLowerCase().includes(query) ||
        post.author.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query))
      );
    });

    setFilteredPosts(filtered);
    console.log(`🔍 검색어 "${searchQuery}"로 필터링 결과:`, filtered.length, '개');
  }, [blogPosts, searchQuery]);

  const displayPosts = searchQuery ? filteredPosts : blogPosts;

  if (loading) {
    return (
      <section>
        <div className="td_height_120 td_height_lg_80" />
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">로딩 중...</span>
            </div>
            <p className="mt-3">블로그 포스트를 불러오는 중...</p>
          </div>
        </div>
        <div className="td_height_120 td_height_lg_80" />
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <div className="td_height_120 td_height_lg_80" />
        <div className="container">
          <div className="text-center py-5">
            <p className="text-danger">{error}</p>
          </div>
        </div>
        <div className="td_height_120 td_height_lg_80" />
      </section>
    );
  }

  return (
    <section>
      <div className="td_height_120 td_height_lg_80" />
      <div className="container">
        {/* 검색/카테고리별/태그별 제목 표시 */}
        {(searchQuery || categoryFilter || tagFilter) && (
          <div className="text-center mb-5">
            <h2 className="td_fs_36 td_mb_15">
              {searchQuery 
                ? `"${searchQuery}" 검색 결과`
                : categoryFilter 
                ? `${getCategoryName(categoryFilter)} 카테고리`
                : `"${decodeURIComponent(tagFilter)}" 태그`
              }
            </h2>
            <p className="td_opacity_7">
              총 {displayPosts.length}개의 포스트가 있습니다
            </p>
            <div className="td_height_20" />
          </div>
        )}

        {displayPosts.length === 0 ? (
          <div className="text-center py-5">
            <h3>
              {searchQuery 
                ? `"${searchQuery}"에 대한 검색 결과가 없습니다.`
                : categoryFilter 
                ? `${getCategoryName(categoryFilter)} 카테고리에 등록된 포스트가 없습니다.`
                : tagFilter
                ? `"${decodeURIComponent(tagFilter)}" 태그가 포함된 포스트가 없습니다.`
                : '아직 등록된 블로그 포스트가 없습니다.'
              }
            </h3>
            <p className="text-muted">
              {(searchQuery || categoryFilter || tagFilter)
                ? '다른 검색어나 카테고리, 태그를 확인해보세요!'
                : '첫 번째 블로그 포스트를 기다려주세요!'
              }
            </p>
          </div>
        ) : (
          <>
            {/* 검색 결과 표시 배지 */}
            {(searchQuery || categoryFilter || tagFilter) && (
              <div className="mb-4 d-flex justify-content-center">
                <div className="d-flex flex-wrap gap-2 align-items-center">
                  {searchQuery && (
                    <span className="badge bg-primary fs-6 px-3 py-2">
                      검색어: "{searchQuery}"
                    </span>
                  )}
                  {categoryFilter && (
                    <span className="badge bg-secondary fs-6 px-3 py-2">
                      카테고리: {getCategoryName(categoryFilter)}
                    </span>
                  )}
                  {tagFilter && (
                    <span className="badge bg-info fs-6 px-3 py-2">
                      태그: {decodeURIComponent(tagFilter)}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="row td_gap_y_30">
              {displayPosts.map((post, index) => (
                <div className="col-lg-4" key={post.id || index}>
                  <BlogItem {...post} />
                </div>
              ))}
            </div>

            <div className="td_height_60 td_height_lg_40" />

            {/* pagination */}
            <BlogPagination />
          </>
        )}
      </div>
      <div className="td_height_120 td_height_lg_80" />
    </section>
  );
};
