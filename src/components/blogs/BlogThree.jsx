"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/supabaseClientBrowser";
import Link from "next/link";

const calendarIcon = "/icons/calendar.svg";
const userIcon = "/icons/user.svg";

export const BlogThree = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestPosts = async () => {
      try {
        setLoading(true);
        
        // 먼저 featured 포스트들을 featured_order 순서로 가져오기
        const { data: featuredData, error: featuredError } = await supabase
          .from('blog_posts')
          .select(`
            *,
            profiles!blog_posts_author_id_fkey (
              full_name,
              email
            )
          `)
          .eq('status', 'published')
          .eq('featured', true)
          .order('featured_order', { ascending: true })
          .limit(3);

        if (featuredError) throw featuredError;

        let postsToDisplay = featuredData || [];

        // featured 포스트가 3개 미만이면 최신 포스트로 채우기
        if (postsToDisplay.length < 3) {
          const featuredIds = postsToDisplay.map(post => post.id);
          const remainingCount = 3 - postsToDisplay.length;

          let latestQuery = supabase
            .from('blog_posts')
            .select(`
              *,
              profiles!blog_posts_author_id_fkey (
                full_name,
                email
              )
            `)
            .eq('status', 'published');

          // featured 포스트가 있으면 제외
          if (featuredIds.length > 0) {
            latestQuery = latestQuery.not('id', 'in', `(${featuredIds.join(',')})`);
          }

          const { data: latestData, error: latestError } = await latestQuery
            .order('published_at', { ascending: false })
            .limit(remainingCount);

          if (latestError) throw latestError;

          // featured 포스트와 최신 포스트를 합치기
          postsToDisplay = [...postsToDisplay, ...(latestData || [])];
        }

        // 데이터를 컴포넌트에 맞는 형태로 변환
        const transformedPosts = postsToDisplay?.map((post, index) => {
          return {
            id: post.id,
            image: post.image_url || '/home_3/post_1.jpg', // 기본 이미지
            date: new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }),
            author: post.profiles?.full_name || '관리자',
            title: post.title,
            excerpt: post.excerpt || '수학의 문에서 공유하는 유익한 소식입니다.',
            link: `/blog/${post.slug || post.id}`,
            delay: `0.${2 + index}s`,
            featured: post.featured || false,
            featuredOrder: post.featured_order || 0
          };
        }) || [];

        setBlogPosts(transformedPosts);
      } catch (err) {
        console.error('최신 블로그 포스트 불러오기 오류:', err);
        setError('블로그 포스트를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestPosts();
  }, []);

  // 로딩 상태
  if (loading) {
    return (
      <section>
        <div className="td_height_112 td_height_lg_75" />
        <div className="container">
          <div
            className="td_section_heading td_style_1 td_type_1 wow fadeInUp"
            data-wow-duration="1s"
            data-wow-delay="0.2s"
          >
            <div className="td_section_heading_left">
              <p className="td_section_subtitle_up td_fs_18 td_semibold td_spacing_1 td_mb_10 text-uppercase td_accent_color">
                BLOG & ARTICLES
              </p>
              <h2 className="td_section_title td_fs_48 mb-0">
                Explore A Look At The <br />
                Latest Articles
              </h2>
            </div>
            <div className="td_section_heading_right">
              <Link
                href="/blog"
                className="td_btn td_style_2 td_heading_color td_medium td_mb_10"
              >
                See All Articles
                <i>
                  <svg
                    width="19"
                    height="20"
                    viewBox="0 0 19 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.1575 4.34302L3.84375 15.6567"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                    <path
                      d="M15.157 11.4142C15.157 11.4142 16.0887 5.2748 15.157 4.34311C14.2253 3.41142 8.08594 4.34314 8.08594 4.34314"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                  <svg
                    width="19"
                    height="20"
                    viewBox="0 0 19 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.1575 4.34302L3.84375 15.6567"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                    <path
                      d="M15.157 11.4142C15.157 11.4142 16.0887 5.2748 15.157 4.34311C14.2253 3.41142 8.08594 4.34314 8.08594 4.34314"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                </i>
              </Link>
            </div>
          </div>
          <div className="td_height_50 td_height_lg_50" />

          <div className="row td_gap_y_24">
            <div className="text-center col-12 py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">로딩 중...</span>
              </div>
              <p className="mt-3">최신 블로그 포스트를 불러오는 중...</p>
            </div>
          </div>
        </div>
        <div className="td_height_120 td_height_lg_80" />
      </section>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <section>
        <div className="td_height_112 td_height_lg_75" />
        <div className="container">
          <div
            className="td_section_heading td_style_1 td_type_1 wow fadeInUp"
            data-wow-duration="1s"
            data-wow-delay="0.2s"
          >
            <div className="td_section_heading_left">
              <p className="td_section_subtitle_up td_fs_18 td_semibold td_spacing_1 td_mb_10 text-uppercase td_accent_color">
                BLOG & ARTICLES
              </p>
              <h2 className="td_section_title td_fs_48 mb-0">
                Explore A Look At The <br />
                Latest Articles
              </h2>
            </div>
            <div className="td_section_heading_right">
              <Link
                href="/blog"
                className="td_btn td_style_2 td_heading_color td_medium td_mb_10"
              >
                See All Articles
                <i>
                  <svg
                    width="19"
                    height="20"
                    viewBox="0 0 19 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.1575 4.34302L3.84375 15.6567"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                    <path
                      d="M15.157 11.4142C15.157 11.4142 16.0887 5.2748 15.157 4.34311C14.2253 3.41142 8.08594 4.34314 8.08594 4.34314"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                  <svg
                    width="19"
                    height="20"
                    viewBox="0 0 19 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.1575 4.34302L3.84375 15.6567"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                    <path
                      d="M15.157 11.4142C15.157 11.4142 16.0887 5.2748 15.157 4.34311C14.2253 3.41142 8.08594 4.34314 8.08594 4.34314"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                </i>
              </Link>
            </div>
          </div>
          <div className="td_height_50 td_height_lg_50" />

          <div className="row td_gap_y_24">
            <div className="text-center col-12 py-5">
              <p className="text-danger">{error}</p>
              <p className="text-muted">잠시 후 다시 시도해주세요.</p>
            </div>
          </div>
        </div>
        <div className="td_height_120 td_height_lg_80" />
      </section>
    );
  }

  // 블로그 포스트가 없는 경우
  if (blogPosts.length === 0) {
    return (
      <section>
        <div className="td_height_112 td_height_lg_75" />
        <div className="container">
          <div
            className="td_section_heading td_style_1 td_type_1 wow fadeInUp"
            data-wow-duration="1s"
            data-wow-delay="0.2s"
          >
            <div className="td_section_heading_left">
              <p className="td_section_subtitle_up td_fs_18 td_semibold td_spacing_1 td_mb_10 text-uppercase td_accent_color">
                BLOG & ARTICLES
              </p>
              <h2 className="td_section_title td_fs_48 mb-0">
                Explore A Look At The <br />
                Latest Articles
              </h2>
            </div>
            <div className="td_section_heading_right">
              <Link
                href="/blog"
                className="td_btn td_style_2 td_heading_color td_medium td_mb_10"
              >
                See All Articles
                <i>
                  <svg
                    width="19"
                    height="20"
                    viewBox="0 0 19 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.1575 4.34302L3.84375 15.6567"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                    <path
                      d="M15.157 11.4142C15.157 11.4142 16.0887 5.2748 15.157 4.34311C14.2253 3.41142 8.08594 4.34314 8.08594 4.34314"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                  <svg
                    width="19"
                    height="20"
                    viewBox="0 0 19 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.1575 4.34302L3.84375 15.6567"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                    <path
                      d="M15.157 11.4142C15.157 11.4142 16.0887 5.2748 15.157 4.34311C14.2253 3.41142 8.08594 4.34314 8.08594 4.34314"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                </i>
              </Link>
            </div>
          </div>
          <div className="td_height_50 td_height_lg_50" />

          <div className="row td_gap_y_24">
            <div className="text-center col-12 py-5">
              <h4>아직 등록된 블로그 포스트가 없습니다.</h4>
              <p className="text-muted">첫 번째 블로그 포스트를 기다려주세요!</p>
            </div>
          </div>
        </div>
        <div className="td_height_120 td_height_lg_80" />
      </section>
    );
  }

  return (
    <section>
      <div className="td_height_112 td_height_lg_75" />
      <div className="container">
        <div
          className="td_section_heading td_style_1 td_type_1 wow fadeInUp"
          data-wow-duration="1s"
          data-wow-delay="0.2s"
        >
          <div className="td_section_heading_left">
            <p className="td_section_subtitle_up td_fs_18 td_semibold td_spacing_1 td_mb_10 text-uppercase td_accent_color">
              BLOG & ARTICLES
            </p>
            <h2 className="td_section_title td_fs_48 mb-0">
              Explore A Look At The <br />
              Latest Articles
            </h2>
          </div>
          <div className="td_section_heading_right">
            <Link
              href="/blog"
              className="td_btn td_style_2 td_heading_color td_medium td_mb_10"
            >
              See All Articles
              <i>
                <svg
                  width="19"
                  height="20"
                  viewBox="0 0 19 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15.1575 4.34302L3.84375 15.6567"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="M15.157 11.4142C15.157 11.4142 16.0887 5.2748 15.157 4.34311C14.2253 3.41142 8.08594 4.34314 8.08594 4.34314"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
                <svg
                  width="19"
                  height="20"
                  viewBox="0 0 19 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15.1575 4.34302L3.84375 15.6567"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="M15.157 11.4142C15.157 11.4142 16.0887 5.2748 15.157 4.34311C14.2253 3.41142 8.08594 4.34314 8.08594 4.34314"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
              </i>
            </Link>
          </div>
        </div>
        <div className="td_height_50 td_height_lg_50" />

        <div className="row td_gap_y_24">
          {blogPosts.map((post, index) => (
            <div
              key={post.id}
              className="col-lg-4 wow fadeInUp"
              data-wow-duration="1s"
              data-wow-delay={post.delay}
            >
              <div className="td_post td_style_1">
                <Link href={post.link} className="td_post_thumb d-block">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    onError={(e) => {
                      e.target.src = '/home_3/post_1.jpg';
                    }}
                  />
                  <i className="fa-solid fa-link"></i>
                </Link>
                <div className="td_post_info">
                  <div className="td_post_meta td_fs_14 td_medium td_mb_20">
                    <span>
                      <img src={calendarIcon} alt="calendar" />
                      {post.date}
                    </span>
                    <span>
                      <img src={userIcon} alt="user" />
                      {post.author}
                    </span>
                  </div>
                  <h2 className="td_post_title td_fs_24 td_medium td_mb_16">
                    <Link href={post.link}>
                      {post.featured && (
                        <span className="text-yellow-500 mr-2">★</span>
                      )}
                      {post.title}
                    </Link>
                  </h2>
                  <p className="td_post_subtitle td_mb_24 td_heading_color td_opacity_7">
                    {post.excerpt}
                  </p>
                  <Link
                    href={post.link}
                    className="td_btn td_style_1 td_type_4 td_radius_30 td_medium"
                  >
                    <span className="td_btn_in td_accent_color">
                      <span className="td_btn_text">Read More</span>
                      <span className="td_btn_icon">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M8.5 4V2.5C8.5 2.15126 8.5 1.97689 8.46167 1.83383C8.35764 1.4456 8.0544 1.14236 7.66617 1.03833C7.52311 1 7.34874 1 7 1C6.65126 1 6.47689 1 6.33383 1.03833C5.9456 1.14236 5.64236 1.4456 5.53833 1.83383C5.5 1.97689 5.5 2.15126 5.5 2.5V4C5.5 4.70711 5.5 5.06066 5.28033 5.28033C5.06066 5.5 4.70711 5.5 4 5.5L2.5 5.5C2.15126 5.5 1.97689 5.5 1.83383 5.53833C1.4456 5.64236 1.14236 5.9456 1.03833 6.33383C1 6.47689 1 6.65126 1 7C1 7.34874 1 7.52311 1.03833 7.66617C1.14236 8.0544 1.4456 8.35764 1.83383 8.46167C1.97689 8.5 2.15126 8.5 2.5 8.5H4C4.70711 8.5 5.06066 8.5 5.28033 8.71967C5.5 8.93934 5.5 9.29289 5.5 10V11.5C5.5 11.8487 5.5 12.0231 5.53833 12.1662C5.64236 12.5544 5.9456 12.8576 6.33383 12.9617C6.47689 13 6.65126 13 7 13C7.34874 13 7.52311 13 7.66617 12.9617C8.0544 12.8576 8.35764 12.5544 8.46167 12.1662C8.5 12.0231 8.5 11.8487 8.5 11.5V10C8.5 9.29289 8.5 8.93934 8.71967 8.71967C8.93934 8.5 9.29289 8.5 10 8.5H11.5C11.8487 8.5 12.0231 8.5 12.1662 8.46167C12.5544 8.35764 12.8576 8.0544 12.9617 7.66617C13 7.52311 13 7.34874 13 7C13 6.65126 13 6.47689 12.9617 6.33383C12.8576 5.9456 12.5544 5.64236 12.1662 5.53833C12.0231 5.5 11.8487 5.5 11.5 5.5H10C9.29289 5.5 8.93934 5.5 8.71967 5.28033C8.5 5.06066 8.5 4.70711 8.5 4Z"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="td_height_120 td_height_lg_80" />
    </section>
  );
};
