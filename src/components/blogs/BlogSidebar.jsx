"use client"

import React, { useState, useEffect } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from "next/link";

export const BlogSidebar = () => {
  const [recentPosts, setRecentPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const supabase = createClientComponentClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL에서 현재 검색어 가져오기
  useEffect(() => {
    const currentQuery = searchParams.get('search') || '';
    setSearchQuery(currentQuery);
  }, [searchParams]);

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        setLoading(true);

        // 최신 포스트 가져오기
        const { data: recentPostsData, error: recentError } = await supabase
          .from('blog_posts')
          .select('id, title, slug, created_at, image_url')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(3);

        if (recentError) throw recentError;

        // 카테고리 가져오기
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('blog_categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (categoriesError) throw categoriesError;

        // 카테고리별 포스트 수 계산
        const { data: postCountData, error: countError } = await supabase
          .from('blog_posts')
          .select('category')
          .eq('status', 'published');

        if (countError) throw countError;

        // 카테고리별 포스트 수 집계
        const categoryCounts = {};
        postCountData.forEach(post => {
          categoryCounts[post.category] = (categoryCounts[post.category] || 0) + 1;
        });

        // 카테고리에 포스트 수 추가
        const categoriesWithCounts = categoriesData.map(category => ({
          ...category,
          postCount: categoryCounts[category.slug] || 0
        }));

        // 인기 태그 계산 (모든 포스트의 태그를 수집하고 빈도 계산)
        const { data: tagsData, error: tagsError } = await supabase
          .from('blog_posts')
          .select('tags')
          .eq('status', 'published');

        if (tagsError) throw tagsError;

        const tagCounts = {};
        tagsData.forEach(post => {
          if (post.tags) {
            try {
              const tags = typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags;
              if (Array.isArray(tags)) {
                tags.forEach(tag => {
                  tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
              }
            } catch (e) {
              console.error('태그 파싱 오류:', e);
            }
          }
        });

        // 태그를 빈도 순으로 정렬하고 상위 5개만 선택
        const sortedTags = Object.entries(tagCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([tag, count]) => ({ name: tag, count }));

        setRecentPosts(recentPostsData || []);
        setCategories(categoriesWithCounts);
        setPopularTags(sortedTags);
      } catch (err) {
        console.error('사이드바 데이터 불러오기 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSidebarData();
  }, [supabase]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // 검색 폼 제출 핸들러
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      // 검색어가 있으면 블로그 페이지로 검색 파라미터와 함께 이동
      router.push(`/blog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // 검색어 입력 핸들러
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="td_left_sidebar">
      {/* search */}
      <div className="td_sidebar_widget">
        <h3 className="td_sidebar_widget_title td_fs_20 td_mb_30">
          Search Here
        </h3>
        <form onSubmit={handleSearchSubmit} className="td_sidebar_search">
          <input
            type="text"
            placeholder="Keywords"
            className="td_sidebar_search_input"
            value={searchQuery}
            onChange={handleSearchInputChange}
          />
          <button type="submit" className="td_sidebar_search_btn td_center">
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
        </form>
        {searchQuery && (
          <div className="mt-2">
            <small className="text-muted">
              검색어: "{searchQuery}"
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary ms-2"
                onClick={() => {
                  setSearchQuery('');
                  router.push('/blog');
                }}
              >
                초기화
              </button>
            </small>
          </div>
        )}
      </div>

      {/* recents */}
      <div className="td_sidebar_widget">
        <h3 className="td_sidebar_widget_title td_fs_20 td_mb_30">
          Recent Post
        </h3>
        {loading ? (
          <div className="text-center">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">로딩 중...</span>
            </div>
          </div>
        ) : (
          <ul className="td_recent_post_list td_mp_0">
            {recentPosts.map((post) => (
              <li key={post.id}>
                <div className="td_recent_post">
                  <Link href={`/blog/${post.slug || post.id}`} className="td_recent_post_thumb">
                    <img 
                      src={post.image_url || '/home_1/post_1.jpg'} 
                      alt={post.title}
                      onError={(e) => {
                        e.target.src = '/home_1/post_1.jpg';
                      }}
                    />
                  </Link>
                  <div className="td_recent_post_right">
                    <p className="td_recent_post_date mb-0 td_fs_14">
                      <i className="fa-regular fa-calendar"></i>
                      <span>{formatDate(post.created_at)}</span>
                    </p>
                    <h3 className="td_fs_16 td_semibold mb-0">
                      <Link href={`/blog/${post.slug || post.id}`}>{post.title}</Link>
                    </h3>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* categories */}
      <div className="td_sidebar_widget">
        <h3 className="td_sidebar_widget_title td_fs_20 td_mb_30">
          Categories
        </h3>
        {loading ? (
          <div className="text-center">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">로딩 중...</span>
            </div>
          </div>
        ) : (
          <ul className="td_sidebar_widget_list">
            {categories.map((category) => (
              <li key={category.id} className="cat-item">
                <Link href={`/blog?category=${category.slug}`}>
                  <span>{category.name}</span>
                  <span>({String(category.postCount).padStart(2, "0")})</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* tags */}
      <div className="td_sidebar_widget">
        <h3 className="td_sidebar_widget_title td_fs_20 td_mb_30">Popular Tags</h3>
        {loading ? (
          <div className="text-center">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">로딩 중...</span>
            </div>
          </div>
        ) : (
          <div className="tagcloud">
            {popularTags.length > 0 ? (
              popularTags.map((tag) => (
                <Link 
                  key={tag.name} 
                  href={`/blog?tag=${encodeURIComponent(tag.name)}`} 
                  className="tag-cloud-link"
                >
                  {tag.name}
                </Link>
              ))
            ) : (
              <span className="text-muted">태그가 없습니다</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
