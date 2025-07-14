"use client";

import React from "react";
import { useTabs } from "../../lib/hooks/useTabs";
import Link from "next/link";
import { VideoPlayer } from "../videos/VideoPlayer";
import '@/styles/tiptap.css';

const authorImg = "/others/author_1.jpg";
const videoThumb = "/others/video_thumb.jpg";

export default function CourseDetailContent({ course }) {
  useTabs();

  // 강의 데이터가 없는 경우 로딩 표시
  if (!course) {
    return (
      <section>
        <div className="td_height_120 td_height_lg_80" />
        <div className="container">
          <div className="text-center py-10">
            <p>강의 정보를 불러오는 중...</p>
          </div>
        </div>
      </section>
    );
  }

  // 기본값 설정
  const {
    title = "강의 제목",
    description = "강의 설명이 없습니다.",
    category = "일반",
    author_name = "수학의문 강사진",
    author_image_url,
    image_url,
    video_url,
    price = 0,
    seats = 30,
    semesters = 1,
    weeks = 12,
    what_you_will_learn = [],
    requirements = [],
    includes = [],
    curriculum = [],
    reviews = [],
    last_update,
    created_at
  } = course;

  // 학습 내용 파싱 (JSON 형태일 수 있음)
  const parseJsonField = (field) => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    try {
      return JSON.parse(field);
    } catch {
      return [field];
    }
  };

  const learningItems = parseJsonField(what_you_will_learn);
  const requirementItems = parseJsonField(requirements);
  const includeItems = parseJsonField(includes);
  const curriculumItems = parseJsonField(curriculum);
  const reviewItems = parseJsonField(reviews);

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return "미정";
    try {
      return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return "미정";
    }
  };

  const defaultDescription = `
    <h3>강의 소개</h3>
    ${description}
    
    <h3>이런 분들께 추천합니다</h3>
    <ul>
      <li>수학 실력을 체계적으로 향상시키고 싶은 학생</li>
      <li>내신 및 수능 대비가 필요한 학생</li>
      <li>개념부터 심화까지 단계별 학습을 원하는 학생</li>
    </ul>

    <h3>강의 특징</h3>
    <ul>
      <li>개인별 맞춤 학습 진도 관리</li>
      <li>실시간 질의응답 및 피드백</li>
      <li>체계적인 문제 해결 방법론 제시</li>
      <li>정기적인 성취도 평가 및 보고</li>
    </ul>
  `;

  return (
    <section>
      <div className="td_height_120 td_height_lg_80" />
      <div className="container">
        <div className="row td_gap_y_50">
          {/* content */}
          <div className="col-lg-8">
            <div className="td_course_details">
              {/* video or image */}
              {video_url ? (
                <div className="embed-responsive embed-responsive-16by9 td_radius_10 td_mb_40">
                  <iframe
                    className="embed-responsive-item"
                    src={video_url}
                    allowFullScreen
                  ></iframe>
                </div>
              ) : image_url ? (
                <div className="td_mb_40">
                  <img 
                    src={image_url} 
                    alt={title}
                    className="w-100 td_radius_10"
                    style={{ maxHeight: '400px', objectFit: 'cover' }}
                  />
                </div>
              ) : (
                <div className="td_center td_height_400 td_radius_10 td_mb_40" style={{ backgroundColor: '#f5f5f5' }}>
                  <p className="td_heading_color td_opacity_7">미리보기 이미지가 없습니다</p>
                </div>
              )}

              {/* info */}
              <span className="td_course_label td_mb_10">{category}</span>

              <h2 className="td_fs_48 td_mb_30">
                {title}
              </h2>

              <div className="td_course_meta td_mb_40">
                <div className="td_course_avatar">
                  <img src={author_image_url || authorImg} alt="Course author" />
                  <p className="td_heading_color mb-0 td_medium">
                    <span className="td_accent_color">강사:</span>
                    <span>{author_name}</span>
                  </p>
                </div>
                <div className="td_course_published td_medium td_heading_color">
                  <span className="td_accent_color">마지막 업데이트:</span> {formatDate(last_update || created_at)}
                </div>
              </div>

              {/* tabs */}
              <div className="td_tabs td_style_1 td_mb_50">
                <ul className="td_tab_links td_style_2 td_type_2 td_mp_0 td_medium td_fs_20 td_heading_color">
                  <li className="active">
                    <a href="#td_tab_1">강의 소개</a>
                  </li>
                  <li>
                    <a href="#td_tab_2">커리큘럼</a>
                  </li>
                  <li>
                    <a href="#td_tab_3">강사진</a>
                  </li>
                  <li>
                    <a href="#td_tab_4">후기</a>
                  </li>
                </ul>
                <div className="td_tab_body td_fs_18">
                  <div className="td_tab active" id="td_tab_1">
                    <h2 className="td_fs_32 td_mb_20">강의 설명</h2>
                    <div 
                      className="blog-content"
                      dangerouslySetInnerHTML={{ 
                        __html: description && description.trim().length > 10 && description.includes('<') 
                          ? description 
                          : defaultDescription 
                      }} 
                    />
                  </div>
                  <div className="td_tab" id="td_tab_2">
                    <h2 className="td_fs_32 td_mb_20">커리큘럼</h2>
                    {curriculumItems.length > 0 ? (
                      <>
                        <p>체계적으로 구성된 단계별 학습 과정을 통해 수학 실력을 향상시킬 수 있습니다.</p>
                        <ul className="td_fs_16">
                          {curriculumItems.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <>
                        <p>체계적으로 구성된 단계별 학습 과정을 통해 수학 실력을 향상시킬 수 있습니다.</p>
                        <ul className="td_fs_16">
                          <li>1주차: 기본 개념 정립 및 기초 문제 풀이</li>
                          <li>2주차: 유형별 문제 해결 전략 학습</li>
                          <li>3주차: 응용 문제 및 심화 학습</li>
                          <li>4주차: 실전 문제 풀이 및 오답 관리</li>
                        </ul>
                      </>
                    )}
                  </div>
                  <div className="td_tab" id="td_tab_3">
                    <h2 className="td_fs_32 td_mb_20">강사 소개</h2>
                    <div className="td_course_avatar td_mb_20">
                      <img 
                        src={author_image_url || authorImg} 
                        alt={author_name}
                        style={{ width: '80px', height: '80px' }}
                      />
                      <div>
                        <h4 className="td_fs_20 td_mb_5">{author_name}</h4>
                        <p className="td_heading_color td_opacity_7 mb-0">수학 전문 강사</p>
                      </div>
                    </div>
                    <p>
                      10년 이상의 수학 교육 경험을 보유한 전문 강사진이<br/> 학생 개인의 수준에 맞춰 
                      체계적이고 효과적인 수학 학습을 도와드립니다.
                    </p>
                  </div>
                  <div className="td_tab" id="td_tab_4">
                    <h2 className="td_fs_32 td_mb_20">수강 후기</h2>
                    {reviewItems.length > 0 ? (
                      <div className="space-y-4">
                        {reviewItems.map((review, index) => (
                          <div key={index} className="p-4 border rounded-lg bg-gray-50">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold">
                                  {String.fromCharCode(65 + (index % 26))}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="flex text-yellow-400">
                                    {'★'.repeat(5)}
                                  </div>
                                  <span className="text-sm text-gray-500">
                                    익명의 수강생
                                  </span>
                                </div>
                                <p className="text-gray-700 leading-relaxed">{review}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-gray-400 text-2xl">💬</span>
                        </div>
                        <p className="text-gray-600 mb-2">아직 등록된 후기가 없습니다.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {learningItems.length > 0 && (
                <>
                  <h2 className="td_fs_32 td_mb_30">수강 후 얻을 수 있는 것</h2>
                  <div className="row td_gap_y_24 td_mb_50">
                    {learningItems.map((item, index) => (
                      <div key={index} className="col-lg-6">
                        <div className="td_iconbox td_style_4 td_type_2">
                          <div className="td_iconbox_icon">
                            <i className="fa-solid fa-check td_accent_color"></i>
                          </div>
                          <div className="td_iconbox_content">
                            <p className="td_iconbox_text mb-0">{item}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* sidebar */}
          <div className="col-lg-4">
            <div className="td_card td_style_7">
              {video_url && (
                <>
                  <VideoPlayer
                    trigger={
                      <a
                        href="#vid001"
                        className="td_card_video_block td_video_open d-block"
                      >
                        <img src={image_url || videoThumb} alt="Video thumbnail" />
                        <span className="td_player_btn_wrap_2">
                          <span className="td_player_btn td_center">
                            <span></span>
                          </span>
                        </span>
                      </a>
                    }
                  />
                  <div className="td_height_30 td_height_lg_30" />
                </>
              )}
              
              <h3 className="td_fs_20 td_semibold td_mb_15">
                강의 정보:
              </h3>
              <ul className="td_course_meta_list td_mp_0 td_medium td_heading_color">
                <li>
                  <span className="td_course_meta_title">수강 정원:</span>
                  <span className="td_course_meta_value">{seats}명</span>
                </li>
                <li>
                  <span className="td_course_meta_title">학기:</span>
                  <span className="td_course_meta_value">{semesters}학기</span>
                </li>
                <li>
                  <span className="td_course_meta_title">주차:</span>
                  <span className="td_course_meta_value">{weeks}주</span>
                </li>
                <li>
                  <span className="td_course_meta_title">카테고리:</span>
                  <span className="td_course_meta_value">{category}</span>
                </li>
                {price > 0 && (
                  <li>
                    <span className="td_course_meta_title">수강료:</span>
                    <span className="td_course_meta_value">{price.toLocaleString()}원</span>
                  </li>
                )}
              </ul>

              {includeItems.length > 0 && (
                <>
                  <div className="td_height_30 td_height_lg_30" />
                  <h3 className="td_fs_20 td_semibold td_mb_15">
                    포함 사항:
                  </h3>
                  <ul className="td_course_meta_list td_mp_0 td_medium td_heading_color">
                    {includeItems.map((item, index) => (
                      <li key={index}>
                        <span className="td_course_meta_title">
                          <i className="fa-solid fa-check td_accent_color td_mr_10"></i>
                        </span>
                        <span className="td_course_meta_value">{item}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {requirementItems.length > 0 && (
                <>
                  <div className="td_height_30 td_height_lg_30" />
                  <h3 className="td_fs_20 td_semibold td_mb_15">
                    수강 요건:
                  </h3>
                  <ul className="td_course_meta_list td_mp_0 td_medium td_heading_color">
                    {requirementItems.map((item, index) => (
                      <li key={index}>
                        <span className="td_course_meta_title">
                          <i className="fa-solid fa-info-circle td_accent_color td_mr_10"></i>
                        </span>
                        <span className="td_course_meta_value">{item}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              
              <div className="td_height_30 td_height_lg_30" />
              <Link
                href="/cart"
                className="td_btn td_style_1 td_radius_10 td_medium w-100"
              >
                <span className="td_btn_in td_white_color td_accent_bg">
                  <span>수강 신청</span>
                </span>
              </Link>

              <div className="td_height_40 td_height_lg_30" />
              <h3 className="td_fs_20 td_semibold td_mb_15">공유하기:</h3>
              <div className="td_footer_social_btns td_fs_18 td_accent_color">
                <Link href="#" className="td_center">
                  <i className="fa-brands fa-facebook-f"></i>
                </Link>
                <Link href="#" className="td_center">
                  <i className="fa-brands fa-x-twitter"></i>
                </Link>
                <Link href="#" className="td_center">
                  <i className="fa-brands fa-instagram"></i>
                </Link>
                <Link href="#" className="td_center">
                  <i className="fa-brands fa-pinterest-p"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
