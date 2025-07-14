"use client"

import React, { useState, useEffect } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useSearchParams } from 'next/navigation';
import { BlogItem } from "./BlogItem";
import { BlogPagination } from "./BlogPagination";

export const BlogAllSidebar = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const supabase = createClientComponentClient();
  const searchParams = useSearchParams();
  
  // URL에서 검색 파라미터 가져오기
  const searchQuery = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';
  const tagFilter = searchParams.get('tag') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // 페이지네이션 설정
  const POSTS_PER_PAGE = 6; // 페이지당 포스트 수

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
          .eq('status', 'published');

        // 카테고리 필터가 있는 경우
        if (categoryFilter) {
          query = query.eq('category', categoryFilter);
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
  }, [supabase, categoryFilter]);

  // 검색어나 태그 필터에 따라 포스트 필터링
  useEffect(() => {
    let filtered = [...blogPosts];

    // 검색어 필터링
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => {
        return (
          post.title.toLowerCase().includes(query) ||
          post.excerpt?.toLowerCase().includes(query) ||
          post.content?.toLowerCase().includes(query) ||
          post.author.toLowerCase().includes(query) ||
          post.tags.some(tag => tag.toLowerCase().includes(query))
        );
      });
      console.log(`🔍 검색어 "${searchQuery}"로 필터링 결과:`, filtered.length, '개');
    }

    // 태그 필터링
    if (tagFilter) {
      filtered = filtered.filter(post => 
        post.tags.some(tag => tag.toLowerCase() === tagFilter.toLowerCase())
      );
      console.log(`🏷️ 태그 "${tagFilter}"로 필터링 결과:`, filtered.length, '개');
    }

    setFilteredPosts(filtered);
  }, [blogPosts, searchQuery, tagFilter]);

  // 페이지네이션 계산
  const totalPosts = filteredPosts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const displayPosts = filteredPosts.slice(startIndex, endIndex);

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    console.log(`📄 페이지 변경: ${currentPage} → ${page}`);
    // URL 변경은 BlogPagination 컴포넌트에서 처리됨
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">로딩 중...</span>
        </div>
        <p className="mt-3">블로그 포스트를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-5">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  if (filteredPosts.length === 0) {
    return (
      <div className="text-center py-5">
        {searchQuery || categoryFilter || tagFilter ? (
          <>
            <h4>검색 결과가 없습니다</h4>
            <p className="text-muted">
              {searchQuery && `"${searchQuery}"`}
              {categoryFilter && `카테고리: ${categoryFilter}`}
              {tagFilter && `태그: ${tagFilter}`}
              <br />
              다른 검색어나 필터를 시도해보세요.
            </p>
          </>
        ) : (
          <>
            <h4>아직 등록된 블로그 포스트가 없습니다.</h4>
            <p className="text-muted">첫 번째 블로그 포스트를 기다려주세요!</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* 검색/필터 결과 표시 */}
      {(searchQuery || categoryFilter || tagFilter) && (
        <div className="mb-4 p-3 bg-light rounded">
          <h5 className="mb-2">검색 결과</h5>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            {searchQuery && (
              <span className="badge bg-primary">
                검색어: "{searchQuery}"
              </span>
            )}
            {categoryFilter && (
              <span className="badge bg-secondary">
                카테고리: {categoryFilter}
              </span>
            )}
            {tagFilter && (
              <span className="badge bg-info">
                태그: {tagFilter}
              </span>
            )}
            <span className="text-muted ms-2">
              총 {totalPosts}개 포스트
            </span>
          </div>
        </div>
      )}

      {/* 페이지네이션 정보 표시 */}
      {totalPages > 1 && (
        <div className="mb-3 text-muted text-center">
          <small>
            전체 {totalPosts}개 포스트 중 {startIndex + 1}-{Math.min(endIndex, totalPosts)}번째 포스트 
            (페이지 {currentPage} / {totalPages})
          </small>
        </div>
      )}

      {/* 블로그 포스트 목록 */}
      <div className="row td_gap_y_30">
        {displayPosts.map((post, index) => (
          <div className="col-lg-6" key={post.id || index}>
            <BlogItem {...post} />
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-5">
          <BlogPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};
