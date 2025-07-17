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

  // 학원 정보가 없는 경우 로딩 표시
  if (!course) {
    return (
      <section>
        <div className="td_height_120 td_height_lg_80" />
        <div className="container">
          <div className="text-center py-10">
            <p>학원 정보를 불러오는 중...</p>
          </div>
        </div>
      </section>
    );
  }

  // 기본값 설정 - 오프라인 학원용
  const {
    title = "수학의문 학원 프로그램",
    subtitle = "",
    description = "대치동 최고의 수학 전문 학원입니다.",
    category = "일반",
    author_name = "수학의문 강사진",
    author_image_url,
    image_url,
    video_url,
    course_label = "",
    price = 0,
    seats = 30,
    weeks = 12,
    semesters = 1,
    what_you_will_learn = [],
    requirements = [],
    includes = [],
    curriculum = [],
    reviews = [],
    last_update,
    created_at,
    
    // 오프라인 학원용 필드들
    instructor_bio = "",
    instructor_experience = "",
    instructor_specialization = [],
    instructor_education = "",
    difficulty_level = "beginner",
    course_duration = "",
    course_language = "ko",
    course_level = "all",
    course_format = "offline",
    max_enrollment = 999,
    target_audience = [],
    learning_objectives = [],
    assessment_methods = [],
    schedule_type = "flexible",
    class_schedule = [],
    start_date = null,
    end_date = null,
    enrollment_deadline = null,
    course_outline = "",
    materials_provided = [],
    software_required = [],
    certificate_available = false,
    certificate_requirements = "",
    discount_price = 0,
    discount_percentage = 0,
    payment_options = ['lump_sum'],
    refund_policy = "",
    trial_available = false,
    meta_title = "",
    meta_description = "",
    meta_keywords = [],
    social_image_url = "",
    promotional_video_url = "",
    live_session_count = 0,
    recorded_session_count = 0,
    assignment_count = 0,
    quiz_count = 0,
    discussion_enabled = true,
    qa_enabled = true,
    visibility = "public",
    sort_order = 0,
    rating = 0,
    review_count = 0,
    enrollment_count = 0,
    completion_rate = 0,
    tags = []
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
  
  // 새로 추가된 필드들 파싱
  const instructorSpecializationItems = parseJsonField(instructor_specialization);
  const targetAudienceItems = parseJsonField(target_audience);
  const learningObjectivesItems = parseJsonField(learning_objectives);
  const assessmentMethodsItems = parseJsonField(assessment_methods);
  const classScheduleItems = parseJsonField(class_schedule);
  const materialsProvidedItems = parseJsonField(materials_provided);
  const softwareRequiredItems = parseJsonField(software_required);
  const paymentOptionsItems = parseJsonField(payment_options);
  const metaKeywordsItems = parseJsonField(meta_keywords);
  const tagsItems = parseJsonField(tags);

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

  // 난이도 표시
  const getDifficultyLabel = (level) => {
    const levels = {
      'beginner': '초급',
      'intermediate': '중급',
      'advanced': '고급',
      'expert': '전문가'
    };
    return levels[level] || '초급';
  };

  // 수강 레벨 표시
  const getCourseLevelLabel = (level) => {
    const levels = {
      'all': '전체',
      'elementary': '초등부',
      'middle': '중등부',
      'high': '고등부',
      'adult': '성인'
    };
    return levels[level] || '전체';
  };

  // 강의 형태 표시
  const getCourseFormatLabel = (format) => {
    const formats = {
      'online': '온라인',
      'offline': '오프라인',
      'hybrid': '혼합형'
    };
    return formats[format] || '온라인';
  };

  // 스케줄 유형 표시
  const getScheduleTypeLabel = (type) => {
    const types = {
      'flexible': '유연한 일정',
      'fixed': '고정 일정',
      'self_paced': '자율 진도'
    };
    return types[type] || '유연한 일정';
  };

  // 오프라인 학원은 가격 정보 비표시
  // const getDisplayPrice = () => {
  //   if (discount_price > 0 && discount_price < price) {
  //     return {
  //       originalPrice: price,
  //       discountPrice: discount_price,
  //       discountPercentage: discount_percentage
  //     };
  //   }
  //   return {
  //     originalPrice: price,
  //     discountPrice: null,
  //     discountPercentage: 0
  //   };
  // };

  // const priceInfo = getDisplayPrice();

  const defaultDescription = `
    <h3>시험대비 소개</h3>
    ${description}
    
    <h3>이런 분들께 추천합니다</h3>
    <ul>
      <li>수학 시험 성적을 체계적으로 향상시키고 싶은 학생</li>
      <li>내신 및 수능 대비가 필요한 학생</li>
      <li>개념부터 심화까지 단계별 시험 준비를 원하는 학생</li>
    </ul>

    <h3>시험대비 특징</h3>
    <ul>
      <li>개인별 맞춤 시험 준비 전략 제공</li>
      <li>실시간 질의응답 및 피드백</li>
      <li>체계적인 문제 해결 방법론 제시</li>
      <li>정기적인 성취도 평가 및 보고</li>
    </ul>
  `;

  return (
    <section>
      <div className="td_height_120 td_height_lg_80" />
      <div className="container">
        {/* Hero Section with Course Overview */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="card shadow-lg border-0 overflow-hidden">
              <div className="row g-0">
                <div className="col-lg-6">
                  {/* 홍보 영상 또는 메인 이미지 */}
                  {promotional_video_url ? (
                    <div className="ratio ratio-16x9 h-100">
                      <iframe
                        src={promotional_video_url}
                        allowFullScreen
                        title="학원 홍보 영상"
                        className="rounded-start"
                      ></iframe>
                    </div>
                  ) : video_url ? (
                    <div className="ratio ratio-16x9 h-100">
                      <iframe
                        src={video_url}
                        allowFullScreen
                        title="수업 소개 영상"
                        className="rounded-start"
                      ></iframe>
                    </div>
                  ) : (social_image_url || image_url) ? (
                    <img 
                      src={social_image_url || image_url} 
                      alt={title}
                      className="img-fluid h-100 object-fit-cover rounded-start"
                    />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100 bg-light rounded-start">
                      <div className="text-center text-muted">
                        <i className="fas fa-image fa-3x mb-3"></i>
                        <p className="mb-0">학원 이미지가 없습니다</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="col-lg-6">
                  <div className="card-body p-4 p-lg-5 h-100 d-flex flex-column">
                    {/* 카테고리 및 수업 유형 */}
                    <div className="mb-3">
                      <span className="badge bg-primary fs-6 me-2">{category}</span>
                      {course_label && (
                        <span className="badge bg-success fs-6 me-2">{course_label}</span>
                      )}
                      <span className="badge bg-secondary fs-6">
                        {getDifficultyLabel(difficulty_level)}
                      </span>
                    </div>

                    <h1 className="display-5 fw-bold text-dark mb-3">{title}</h1>
                    
                    {/* 부제목 */}
                    {subtitle && (
                      <p className="lead text-muted mb-4">{subtitle}</p>
                    )}

                    {/* 평점 및 통계 */}
                    <div className="d-flex align-items-center mb-4">
                      {rating > 0 && (
                        <div className="me-4">
                          <div className="d-flex align-items-center">
                            <div className="text-warning me-2">
                              {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
                            </div>
                            <span className="fw-bold">{rating.toFixed(1)}</span>
                            <span className="text-muted ms-1">({review_count}개 후기)</span>
                          </div>
                        </div>
                      )}
                      {enrollment_count > 0 && (
                        <div className="text-muted">
                          <i className="fas fa-users me-1"></i>
                          {enrollment_count}명 수강중
                        </div>
                      )}
                    </div>

                    {/* 학원 연락처 및 상담 */}
                    <div className="mt-auto">
                      <div className="mb-3">
                        <h5 className="text-primary mb-2">
                          <i className="fas fa-phone me-2"></i>
                          상담 및 문의
                        </h5>
                        <p className="text-muted mb-1">
                          전화: 02-XXX-XXXX
                        </p>
                        <p className="text-muted mb-0">
                          대치동 수학의문 학원
                        </p>
                      </div>
                      
                      <div className="d-grid gap-2 d-md-flex">
                        <button className="btn btn-primary btn-lg flex-fill">
                          <i className="fas fa-phone me-2"></i>
                          상담 신청
                        </button>
                        <button className="btn btn-outline-secondary btn-lg">
                          <i className="fas fa-map-marker-alt me-2"></i>
                          위치 안내
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 학원 강사진 소개 */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="row align-items-center">
                  <div className="col-md-2 text-center">
                    <img 
                      src={author_image_url || authorImg} 
                      alt={author_name}
                      className="rounded-circle img-fluid"
                      style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="col-md-6">
                    <h5 className="fw-bold mb-1">{author_name}</h5>
                    <p className="text-muted mb-1">대치동 수학의문 전문 강사</p>
                    {instructor_education && (
                      <p className="small text-muted mb-0">{instructor_education}</p>
                    )}
                    {instructorSpecializationItems.length > 0 && (
                      <div className="mt-2">
                        {instructorSpecializationItems.slice(0, 3).map((spec, index) => (
                          <span key={index} className="badge bg-light text-dark me-1 mb-1">
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="col-md-4 text-md-end">
                    <div className="small text-muted">
                      <div><i className="fas fa-calendar-alt me-1"></i>학원 설립: {formatDate(created_at)}</div>
                      {instructor_experience && (
                        <div className="mt-1"><i className="fas fa-award me-1"></i>경력: {instructor_experience}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Main Content */}
          <div className="col-lg-8">
            <div className="td_course_details">
              {/* Bootstrap Tabs */}
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0">
                  <ul className="nav nav-tabs card-header-tabs nav-fill" id="courseTabs" role="tablist">
                    <li className="nav-item" role="presentation">
                      <button className="nav-link active fw-semibold" id="overview-tab" data-bs-toggle="tab" data-bs-target="#overview" type="button" role="tab" aria-controls="overview" aria-selected="true">
                        <i className="fas fa-info-circle me-2"></i>학원 소개
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button className="nav-link fw-semibold" id="curriculum-tab" data-bs-toggle="tab" data-bs-target="#curriculum" type="button" role="tab" aria-controls="curriculum" aria-selected="false">
                        <i className="fas fa-book me-2"></i>수업 프로그램
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button className="nav-link fw-semibold" id="instructor-tab" data-bs-toggle="tab" data-bs-target="#instructor" type="button" role="tab" aria-controls="instructor" aria-selected="false">
                        <i className="fas fa-user-tie me-2"></i>강사진
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button className="nav-link fw-semibold" id="benefits-tab" data-bs-toggle="tab" data-bs-target="#benefits" type="button" role="tab" aria-controls="benefits" aria-selected="false">
                        <i className="fas fa-gift me-2"></i>학원 특징
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button className="nav-link fw-semibold" id="reviews-tab" data-bs-toggle="tab" data-bs-target="#reviews" type="button" role="tab" aria-controls="reviews" aria-selected="false">
                        <i className="fas fa-star me-2"></i>성과 및 후기
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button className="nav-link fw-semibold" id="methods-tab" data-bs-toggle="tab" data-bs-target="#methods" type="button" role="tab" aria-controls="methods" aria-selected="false">
                        <i className="fas fa-chart-line me-2"></i>관리 시스템
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="card-body p-4">
                  <div className="tab-content" id="courseTabsContent">
                    {/* 탭 1: 학원 소개 */}
                    <div className="tab-pane fade show active" id="overview" role="tabpanel" aria-labelledby="overview-tab">
                      <div className="row">
                        <div className="col-12">
                          <h2 className="h3 fw-bold mb-4 text-primary">
                            <i className="fas fa-building me-2"></i>
                            대치동 수학의문 학원 소개
                          </h2>
                          
                          <div className="blog-content mb-4" 
                            dangerouslySetInnerHTML={{ 
                              __html: description && description.trim().length > 10 && description.includes('<') 
                                ? description 
                                : `
                                  <h3>대치동 수학의문 학원</h3>
                                  <p>${description}</p>
                                  
                                  <h3>이런 학생들을 위한 학원입니다</h3>
                                  <ul>
                                    <li>대치동에서 수학 성적을 확실히 올리고 싶은 학생</li>
                                    <li>내신 및 수능 수학에서 고득점을 노리는 학생</li>
                                    <li>체계적인 개별 관리를 받고 싶은 학생</li>
                                    <li>수학 기초부터 심화까지 완성하고 싶은 학생</li>
                                  </ul>

                                  <h3>수학의문 학원만의 특별한 장점</h3>
                                  <ul>
                                    <li>개별 맞춤형 수업 및 오답 관리 시스템</li>
                                    <li>대치동 15년 이상 경력의 전문 강사진</li>
                                    <li>소수 정예 인원으로 체계적 관리</li>
                                    <li>실시간 질의응답 및 즉시 피드백</li>
                                    <li>정기적인 모의고사 및 성적 관리</li>
                                  </ul>
                                ` 
                            }} 
                          />
                        </div>
                      </div>
                      
                      <div className="row g-4 mt-3">
                        {/* 학원 교육 목표 */}
                        {learningObjectivesItems.length > 0 && (
                          <div className="col-md-6">
                            <div className="card h-100 border-primary border-opacity-25">
                              <div className="card-body">
                                <h4 className="card-title h5 text-primary mb-3">
                                  <i className="fas fa-target me-2"></i>
                                  교육 목표
                                </h4>
                                <ul className="list-unstyled">
                                  {learningObjectivesItems.map((objective, index) => (
                                    <li key={index} className="mb-2 d-flex align-items-start">
                                      <i className="fas fa-check-circle text-success me-2 mt-1 flex-shrink-0"></i>
                                      <span>{objective}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 대상 학생 */}
                        {targetAudienceItems.length > 0 && (
                          <div className="col-md-6">
                            <div className="card h-100 border-info border-opacity-25">
                              <div className="card-body">
                                <h4 className="card-title h5 text-info mb-3">
                                  <i className="fas fa-users me-2"></i>
                                  대상 학생
                                </h4>
                                <ul className="list-unstyled">
                                  {targetAudienceItems.map((audience, index) => (
                                    <li key={index} className="mb-2 d-flex align-items-start">
                                      <i className="fas fa-user-graduate text-info me-2 mt-1 flex-shrink-0"></i>
                                      <span>{audience}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 코스 정보 요약 */}
                      <div className="row g-3 mt-4">
                        <div className="col-sm-6 col-lg-3">
                          <div className="card text-center bg-primary bg-opacity-10 border-primary border-opacity-25">
                            <div className="card-body py-3">
                              <i className="fas fa-clock text-primary fs-4 mb-2"></i>
                              <div className="fw-bold">{weeks || 12}주 과정</div>
                              <small className="text-muted">총 수업 기간</small>
                            </div>
                          </div>
                        </div>
                        <div className="col-sm-6 col-lg-3">
                          <div className="card text-center bg-success bg-opacity-10 border-success border-opacity-25">
                            <div className="card-body py-3">
                              <i className="fas fa-users text-success fs-4 mb-2"></i>
                              <div className="fw-bold">{seats || 30}명</div>
                              <small className="text-muted">수강 정원</small>
                            </div>
                          </div>
                        </div>
                        <div className="col-sm-6 col-lg-3">
                          <div className="card text-center bg-warning bg-opacity-10 border-warning border-opacity-25">
                            <div className="card-body py-3">
                              <i className="fas fa-signal text-warning fs-4 mb-2"></i>
                              <div className="fw-bold">{getDifficultyLabel(difficulty_level)}</div>
                              <small className="text-muted">난이도</small>
                            </div>
                          </div>
                        </div>
                        <div className="col-sm-6 col-lg-3">
                          <div className="card text-center bg-info bg-opacity-10 border-info border-opacity-25">
                            <div className="card-body py-3">
                              <i className="fas fa-desktop text-info fs-4 mb-2"></i>
                              <div className="fw-bold">{getCourseFormatLabel(course_format)}</div>
                              <small className="text-muted">수업 방식</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 탭 2: 시험대비 커리큘럼 */}
                    <div className="tab-pane fade" id="curriculum" role="tabpanel" aria-labelledby="curriculum-tab">
                      <h2 className="h3 fw-bold mb-4 text-primary">
                        <i className="fas fa-list-ol me-2"></i>
                        시험대비 커리큘럼
                      </h2>
                      
                      {/* 커리큘럼 개요 */}
                      {course_outline && (
                        <div className="alert alert-info border-0 shadow-sm mb-4">
                          <h4 className="alert-heading h5">
                            <i className="fas fa-info-circle me-2"></i>
                            커리큘럼 개요
                          </h4>
                          <p className="mb-0">{course_outline}</p>
                        </div>
                      )}

                      <div className="mb-4">
                        <p className="lead">체계적으로 구성된 단계별 시험 준비 과정을 통해 수학 실력을 향상시킬 수 있습니다.</p>
                      </div>

                      {/* 커리큘럼 아코디언 */}
                      <div className="accordion" id="curriculumAccordion">
                        {curriculumItems.length > 0 ? (
                          curriculumItems.map((item, index) => (
                            <div key={index} className="accordion-item border-0 shadow-sm mb-2">
                              <h3 className="accordion-header">
                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${index}`} aria-expanded="false" aria-controls={`collapse${index}`}>
                                  <div className="d-flex align-items-center">
                                    <span className="badge bg-primary me-3">{index + 1}차시</span>
                                    <span className="fw-semibold">{item}</span>
                                  </div>
                                </button>
                              </h3>
                              <div id={`collapse${index}`} className="accordion-collapse collapse" data-bs-parent="#curriculumAccordion">
                                <div className="accordion-body">
                                  <div className="row g-3">
                                    <div className="col-md-8">
                                      <h5 className="h6 text-primary">학습 내용</h5>
                                      <p className="mb-0">{item}</p>
                                    </div>
                                    <div className="col-md-4">
                                      <h5 className="h6 text-secondary">학습 목표</h5>
                                      <ul className="list-unstyled small">
                                        <li><i className="fas fa-check text-success me-1"></i> 개념 이해</li>
                                        <li><i className="fas fa-check text-success me-1"></i> 문제 해결</li>
                                        <li><i className="fas fa-check text-success me-1"></i> 실전 적용</li>
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          [
                            '기본 개념 정립 및 기초 문제 풀이',
                            '유형별 문제 해결 전략 학습',
                            '응용 문제 및 심화 학습',
                            '실전 문제 풀이 및 오답 관리'
                          ].map((item, index) => (
                            <div key={index} className="accordion-item border-0 shadow-sm mb-2">
                              <h3 className="accordion-header">
                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${index}`} aria-expanded="false" aria-controls={`collapse${index}`}>
                                  <div className="d-flex align-items-center">
                                    <span className="badge bg-primary me-3">{index + 1}주차</span>
                                    <span className="fw-semibold">{item}</span>
                                  </div>
                                </button>
                              </h3>
                              <div id={`collapse${index}`} className="accordion-collapse collapse" data-bs-parent="#curriculumAccordion">
                                <div className="accordion-body">
                                  <div className="row g-3">
                                    <div className="col-md-8">
                                      <h5 className="h6 text-primary">학습 내용</h5>
                                      <p className="mb-0">{item}</p>
                                    </div>
                                    <div className="col-md-4">
                                      <h5 className="h6 text-secondary">학습 목표</h5>
                                      <ul className="list-unstyled small">
                                        <li><i className="fas fa-check text-success me-1"></i> 개념 이해</li>
                                        <li><i className="fas fa-check text-success me-1"></i> 문제 해결</li>
                                        <li><i className="fas fa-check text-success me-1"></i> 실전 적용</li>
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* 수업 일정 */}
                      {classScheduleItems.length > 0 && (
                        <div className="mt-5">
                          <h3 className="h4 fw-bold mb-3 text-secondary">
                            <i className="fas fa-calendar-alt me-2"></i>
                            수업 일정
                          </h3>
                          <div className="table-responsive">
                            <table className="table table-hover border-0 shadow-sm">
                              <thead className="table-primary">
                                <tr>
                                  <th scope="col" className="fw-semibold">
                                    <i className="fas fa-clock me-2"></i>시간
                                  </th>
                                  <th scope="col" className="fw-semibold">
                                    <i className="fas fa-book me-2"></i>내용
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {classScheduleItems.map((schedule, index) => (
                                  <tr key={index}>
                                    <td className="fw-semibold text-primary">
                                      {schedule.time || `${index + 1}차시`}
                                    </td>
                                    <td>{schedule.content || schedule}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 탭 3: 전문 강사진 */}
                    <div className="tab-pane fade" id="instructor" role="tabpanel" aria-labelledby="instructor-tab">
                      <h2 className="h3 fw-bold mb-4 text-primary">
                        <i className="fas fa-chalkboard-teacher me-2"></i>
                        전문 강사진
                      </h2>
                      
                      <div className="row">
                        <div className="col-lg-4">
                          <div className="card border-0 shadow-sm text-center">
                            <div className="card-body p-4">
                              <div className="position-relative d-inline-block mb-3">
                                <img 
                                  src={author_image_url || authorImg} 
                                  alt={author_name}
                                  className="rounded-circle img-fluid shadow"
                                  style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                />
                                <span className="position-absolute bottom-0 end-0 badge bg-success rounded-pill">
                                  <i className="fas fa-check"></i>
                                </span>
                              </div>
                              <h4 className="fw-bold text-dark mb-2">{author_name}</h4>
                              <p className="text-muted mb-3">수학 전문 강사</p>
                              {instructor_education && (
                                <div className="mb-3">
                                  <small className="text-primary">
                                    <i className="fas fa-graduation-cap me-1"></i>
                                    {instructor_education}
                                  </small>
                                </div>
                              )}
                              
                              {/* 전문 분야 배지 */}
                              {instructorSpecializationItems.length > 0 && (
                                <div className="d-flex flex-wrap justify-content-center gap-1">
                                  {instructorSpecializationItems.slice(0, 4).map((spec, index) => (
                                    <span key={index} className="badge bg-primary bg-opacity-10 text-primary px-2 py-1">
                                      {spec}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-lg-8">
                          <div className="row g-4">
                            {/* 강사 소개 */}
                            <div className="col-12">
                              <div className="card border-0 bg-light">
                                <div className="card-body">
                                  <h5 className="card-title text-primary mb-3">
                                    <i className="fas fa-user-circle me-2"></i>
                                    강사 소개
                                  </h5>
                                  {instructor_bio ? (
                                    <p className="card-text">{instructor_bio}</p>
                                  ) : (
                                    <p className="card-text">
                                      10년 이상의 수학 교육 경험을 보유한 전문 강사진이 학생 개인의 수준에 맞춰 
                                      체계적이고 효과적인 수학 학습을 도와드립니다.
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* 주요 경력 */}
                            {instructor_experience && (
                              <div className="col-md-6">
                                <div className="card border-0 border-start border-success border-4">
                                  <div className="card-body">
                                    <h5 className="card-title text-success mb-3">
                                      <i className="fas fa-briefcase me-2"></i>
                                      주요 경력
                                    </h5>
                                    <p className="card-text">{instructor_experience}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* 교육 철학 */}
                            <div className="col-md-6">
                              <div className="card border-0 border-start border-warning border-4">
                                <div className="card-body">
                                  <h5 className="card-title text-warning mb-3">
                                    <i className="fas fa-lightbulb me-2"></i>
                                    교육 철학
                                  </h5>
                                  <p className="card-text small">
                                    학생 개개인의 특성을 파악하여 맞춤형 교육을 제공하며, 
                                    단순 암기가 아닌 원리 이해를 통한 수학적 사고력 향상을 목표로 합니다.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 전문 분야 상세 */}
                          {instructorSpecializationItems.length > 0 && (
                            <div className="mt-4">
                              <h5 className="text-info mb-3">
                                <i className="fas fa-star me-2"></i>
                                전문 분야
                              </h5>
                              <div className="row g-2">
                                {instructorSpecializationItems.map((spec, index) => (
                                  <div key={index} className="col-md-4 col-sm-6">
                                    <div className="card border-info border-opacity-25 text-center">
                                      <div className="card-body py-2">
                                        <small className="fw-semibold text-info">{spec}</small>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 탭 4: 학원 특별혜택 */}
                    <div className="tab-pane fade" id="benefits" role="tabpanel" aria-labelledby="benefits-tab">
                      <h2 className="h3 fw-bold mb-4 text-primary">
                        <i className="fas fa-gifts me-2"></i>
                        학원 특별혜택
                      </h2>
                      
                      <div className="row g-4">
                        <div className="col-lg-6">
                          <div className="card border-0 shadow-sm h-100">
                            <div className="card-header bg-gradient text-white" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                              <h5 className="card-title mb-0">
                                <i className="fas fa-gift me-2"></i>
                                포함 혜택
                              </h5>
                            </div>
                            <div className="card-body">
                              {includeItems.length > 0 ? (
                                <ul className="list-unstyled">
                                  {includeItems.map((item, index) => (
                                    <li key={index} className="mb-3 d-flex align-items-start">
                                      <i className="fas fa-check-circle text-success me-3 mt-1 flex-shrink-0"></i>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <ul className="list-unstyled">
                                  <li className="mb-3 d-flex align-items-start">
                                    <i className="fas fa-check-circle text-success me-3 mt-1 flex-shrink-0"></i>
                                    <span>개별 맞춤 학습 진도 관리</span>
                                  </li>
                                  <li className="mb-3 d-flex align-items-start">
                                    <i className="fas fa-check-circle text-success me-3 mt-1 flex-shrink-0"></i>
                                    <span>실시간 질의응답 및 피드백</span>
                                  </li>
                                  <li className="mb-3 d-flex align-items-start">
                                    <i className="fas fa-check-circle text-success me-3 mt-1 flex-shrink-0"></i>
                                    <span>정기적인 성취도 평가</span>
                                  </li>
                                </ul>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-lg-6">
                          <div className="card border-0 shadow-sm h-100">
                            <div className="card-header bg-gradient text-white" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
                              <h5 className="card-title mb-0">
                                <i className="fas fa-book-open me-2"></i>
                                제공 자료
                              </h5>
                            </div>
                            <div className="card-body">
                              {materialsProvidedItems.length > 0 ? (
                                <ul className="list-unstyled">
                                  {materialsProvidedItems.map((material, index) => (
                                    <li key={index} className="mb-3 d-flex align-items-start">
                                      <i className="fas fa-file-pdf text-danger me-3 mt-1 flex-shrink-0"></i>
                                      <span>{material}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <ul className="list-unstyled">
                                  <li className="mb-3 d-flex align-items-start">
                                    <i className="fas fa-file-pdf text-danger me-3 mt-1 flex-shrink-0"></i>
                                    <span>맞춤형 교재 및 문제집</span>
                                  </li>
                                  <li className="mb-3 d-flex align-items-start">
                                    <i className="fas fa-file-pdf text-danger me-3 mt-1 flex-shrink-0"></i>
                                    <span>실전 모의고사 자료</span>
                                  </li>
                                  <li className="mb-3 d-flex align-items-start">
                                    <i className="fas fa-file-pdf text-danger me-3 mt-1 flex-shrink-0"></i>
                                    <span>오답 노트 템플릿</span>
                                  </li>
                                </ul>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 추가 혜택들 */}
                      <div className="row g-3 mt-4">
                        {/* 수료증 정보 */}
                        {certificate_available && (
                          <div className="col-md-6">
                            <div className="alert alert-success border-0 shadow-sm">
                              <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                  <i className="fas fa-certificate fa-2x text-success"></i>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                  <h5 className="alert-heading h6 mb-1">수료증 발급</h5>
                                  <p className="mb-0 small">
                                    {certificate_requirements || "과정 수료 시 수료증이 발급됩니다."}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 무료 체험 */}
                        {trial_available && (
                          <div className="col-md-6">
                            <div className="alert alert-info border-0 shadow-sm">
                              <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                  <i className="fas fa-star fa-2x text-info"></i>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                  <h5 className="alert-heading h6 mb-1">무료 체험 가능</h5>
                                  <p className="mb-0 small">
                                    첫 수업은 무료로 체험하실 수 있습니다. 학습 방식과 강사진을 먼저 확인해보세요.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 환불 정책 */}
                        {refund_policy && (
                          <div className="col-12">
                            <div className="alert alert-warning border-0 shadow-sm">
                              <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                  <i className="fas fa-shield-alt fa-2x text-warning"></i>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                  <h5 className="alert-heading h6 mb-1">환불 정책</h5>
                                  <p className="mb-0 small">{refund_policy}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 소프트웨어 요구사항 */}
                      {softwareRequiredItems.length > 0 && (
                        <div className="mt-4">
                          <h4 className="h5 fw-bold text-secondary mb-3">
                            <i className="fas fa-laptop-code me-2"></i>
                            필요 소프트웨어
                          </h4>
                          <div className="row g-2">
                            {softwareRequiredItems.map((software, index) => (
                              <div key={index} className="col-md-4 col-sm-6">
                                <div className="card border-secondary border-opacity-25">
                                  <div className="card-body py-2 text-center">
                                    <small className="fw-semibold text-secondary">{software}</small>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 탭 5: 합격 후기 */}
                    <div className="tab-pane fade" id="reviews" role="tabpanel" aria-labelledby="reviews-tab">
                      <h2 className="h3 fw-bold mb-4 text-primary">
                        <i className="fas fa-trophy me-2"></i>
                        합격 후기
                      </h2>
                      
                      {reviewItems.length > 0 ? (
                        <div className="row g-4">
                          {reviewItems.map((review, index) => (
                            <div key={index} className="col-md-6">
                              <div className="card border-0 shadow-sm h-100">
                                <div className="card-body">
                                  <div className="d-flex align-items-center mb-3">
                                    <div className="flex-shrink-0 me-3">
                                      <div className="bg-gradient rounded-circle d-flex align-items-center justify-content-center text-white fw-bold" 
                                           style={{ 
                                             width: '60px', 
                                             height: '60px',
                                             background: `linear-gradient(135deg, ${['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'][index % 6]} 0%, ${['#764ba2', '#667eea', '#f5576c', '#f093fb', '#00f2fe', '#4facfe'][index % 6]} 100%)`
                                           }}>
                                        {String.fromCharCode(65 + (index % 26))}
                                      </div>
                                    </div>
                                    <div className="flex-grow-1">
                                      <div className="d-flex align-items-center mb-1">
                                        <div className="text-warning me-2">
                                          {Array.from({length: 5}, (_, i) => (
                                            <i key={i} className="fas fa-star"></i>
                                          ))}
                                        </div>
                                        <span className="badge bg-success">합격</span>
                                      </div>
                                      <h6 className="mb-0 text-muted">
                                        합격생 {String.fromCharCode(65 + (index % 26))}
                                      </h6>
                                    </div>
                                  </div>
                                  <blockquote className="blockquote mb-0">
                                    <p className="mb-0 fst-italic">{review}</p>
                                  </blockquote>
                                </div>
                                <div className="card-footer bg-transparent border-0">
                                  <small className="text-muted">
                                    <i className="fas fa-calendar-alt me-1"></i>
                                    {new Date(new Date().getFullYear(), Math.floor(index / 2), (index * 7) % 28 + 1).toLocaleDateString('ko-KR')}
                                  </small>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-5">
                          <div className="mb-4">
                            <i className="fas fa-trophy text-warning" style={{ fontSize: '4rem' }}></i>
                          </div>
                          <h4 className="fw-bold mb-3">합격 후기 준비중</h4>
                          <p className="text-muted lead">곧 많은 합격 후기들을 만나보실 수 있습니다.</p>
                          <div className="row g-3 mt-4 justify-content-center">
                            <div className="col-md-3 col-sm-6">
                              <div className="card border-warning border-opacity-25 bg-warning bg-opacity-10">
                                <div className="card-body text-center py-3">
                                  <h5 className="text-warning mb-1">98%</h5>
                                  <small className="text-muted">목표 달성률</small>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-3 col-sm-6">
                              <div className="card border-success border-opacity-25 bg-success bg-opacity-10">
                                <div className="card-body text-center py-3">
                                  <h5 className="text-success mb-1">4.9/5</h5>
                                  <small className="text-muted">만족도</small>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 탭 6: 시험대비 방법 */}
                    <div className="tab-pane fade" id="methods" role="tabpanel" aria-labelledby="methods-tab">
                      <h2 className="h3 fw-bold mb-4 text-primary">
                        <i className="fas fa-chart-line me-2"></i>
                        시험대비 방법
                      </h2>
                      
                      {/* 평가 방법 */}
                      {assessmentMethodsItems.length > 0 && (
                        <div className="mb-5">
                          <h3 className="h4 fw-bold mb-3 text-secondary">
                            <i className="fas fa-clipboard-check me-2"></i>
                            평가 방법
                          </h3>
                          <div className="row g-3">
                            {assessmentMethodsItems.map((method, index) => (
                              <div key={index} className="col-md-6">
                                <div className="card border-0 shadow-sm h-100">
                                  <div className="card-body">
                                    <div className="d-flex align-items-center mb-3">
                                      <div className="flex-shrink-0">
                                        <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                          <span className="fw-bold text-primary">{index + 1}</span>
                                        </div>
                                      </div>
                                      <h5 className="card-title mb-0 ms-3 text-primary">평가 {index + 1}</h5>
                                    </div>
                                    <p className="card-text">{method}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="row g-4 mb-5">
                        <div className="col-lg-6">
                          <div className="card border-0 shadow-sm h-100">
                            <div className="card-header bg-gradient text-white" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                              <h5 className="card-title mb-0">
                                <i className="fas fa-chart-pie me-2"></i>
                                학습 통계
                              </h5>
                            </div>
                            <div className="card-body">
                              <div className="row g-3">
                                <div className="col-6">
                                  <div className="text-center">
                                    <div className="h2 fw-bold text-success mb-1">{completion_rate}%</div>
                                    <small className="text-muted">완료율</small>
                                  </div>
                                </div>
                                <div className="col-6">
                                  <div className="text-center">
                                    <div className="h2 fw-bold text-warning mb-1">{rating.toFixed(1)}</div>
                                    <small className="text-muted">평점 ({review_count}개 후기)</small>
                                  </div>
                                </div>
                                <div className="col-12">
                                  <div className="text-center">
                                    <div className="h2 fw-bold text-info mb-1">{enrollment_count}</div>
                                    <small className="text-muted">수강생</small>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-lg-6">
                          <div className="card border-0 shadow-sm h-100">
                            <div className="card-header bg-gradient text-white" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
                              <h5 className="card-title mb-0">
                                <i className="fas fa-calendar-check me-2"></i>
                                수업 구성
                              </h5>
                            </div>
                            <div className="card-body">
                              <div className="row g-3">
                                <div className="col-6">
                                  <div className="text-center">
                                    <div className="h3 fw-bold text-primary mb-1">{live_session_count}</div>
                                    <small className="text-muted">라이브 세션</small>
                                  </div>
                                </div>
                                <div className="col-6">
                                  <div className="text-center">
                                    <div className="h3 fw-bold text-secondary mb-1">{recorded_session_count}</div>
                                    <small className="text-muted">녹화 세션</small>
                                  </div>
                                </div>
                                <div className="col-6">
                                  <div className="text-center">
                                    <div className="h3 fw-bold text-warning mb-1">{assignment_count}</div>
                                    <small className="text-muted">과제</small>
                                  </div>
                                </div>
                                <div className="col-6">
                                  <div className="text-center">
                                    <div className="h3 fw-bold text-danger mb-1">{quiz_count}</div>
                                    <small className="text-muted">퀴즈</small>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 학습 팁 */}
                      <div className="card border-0 shadow-sm">
                        <div className="card-header bg-light">
                          <h4 className="card-title mb-0 text-primary">
                            <i className="fas fa-lightbulb me-2"></i>
                            효과적인 시험 준비 방법
                          </h4>
                        </div>
                        <div className="card-body">
                          <div className="row g-3">
                            {[
                              { icon: 'clock', text: '매일 일정한 시간에 꾸준히 학습하기', color: 'primary' },
                              { icon: 'edit', text: '틀린 문제는 반드시 오답 노트에 정리하기', color: 'danger' },
                              { icon: 'brain', text: '개념 이해 후 충분한 문제 풀이 연습하기', color: 'success' },
                              { icon: 'chart-bar', text: '정기적인 모의고사로 실전 감각 기르기', color: 'warning' }
                            ].map((tip, index) => (
                              <div key={index} className="col-md-6">
                                <div className={`card border-${tip.color} border-opacity-25 bg-${tip.color} bg-opacity-10 h-100`}>
                                  <div className="card-body d-flex align-items-center">
                                    <div className="flex-shrink-0 me-3">
                                      <i className={`fas fa-${tip.icon} fa-2x text-${tip.color}`}></i>
                                    </div>
                                    <div className="flex-grow-1">
                                      <p className="mb-0 fw-semibold">{tip.text}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 수강 후 얻을 수 있는 것 */}
              {learningItems.length > 0 && (
                <div className="mt-5">
                  <div className="card border-0 shadow-lg">
                    <div className="card-header bg-gradient text-white text-center py-4" 
                         style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                      <h2 className="h3 fw-bold mb-0">
                        <i className="fas fa-graduation-cap me-2"></i>
                        수강 후 얻을 수 있는 것
                      </h2>
                    </div>
                    <div className="card-body p-4">
                      <div className="row g-4">
                        {learningItems.map((item, index) => (
                          <div key={index} className="col-lg-6">
                            <div className="card border-0 bg-light h-100">
                              <div className="card-body d-flex align-items-center">
                                <div className="flex-shrink-0 me-3">
                                  <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" 
                                       style={{ width: '50px', height: '50px' }}>
                                    <i className="fas fa-check fa-lg text-success"></i>
                                  </div>
                                </div>
                                <div className="flex-grow-1">
                                  <p className="mb-0 fw-semibold">{item}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            <div className="sticky-top" style={{ top: '20px' }}>
              {/* 비디오 플레이어 */}
              {video_url && (
                <div className="card border-0 shadow-sm mb-4">
                  <VideoPlayer
                    trigger={
                      <a
                        href="#vid001"
                        className="d-block position-relative overflow-hidden"
                      >
                        <img 
                          src={image_url || videoThumb} 
                          alt="Video thumbnail" 
                          className="img-fluid rounded-top"
                          style={{ height: '200px', objectFit: 'cover', width: '100%' }}
                        />
                        <div className="position-absolute top-50 start-50 translate-middle">
                          <div className="bg-white bg-opacity-90 rounded-circle d-flex align-items-center justify-content-center" 
                               style={{ width: '60px', height: '60px' }}>
                            <i className="fas fa-play text-primary fs-4"></i>
                          </div>
                        </div>
                      </a>
                    }
                  />
                </div>
              )}
              
              {/* 강의 정보 카드 */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-primary text-white">
                  <h5 className="card-title mb-0">
                    <i className="fas fa-info-circle me-2"></i>
                    강의 정보
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-6">
                      <div className="text-center">
                        <div className="text-primary fw-bold fs-5">{seats || 30}</div>
                        <small className="text-muted">수강 정원</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-center">
                        <div className="text-info fw-bold fs-5">{semesters || 1}</div>
                        <small className="text-muted">학기</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-center">
                        <div className="text-success fw-bold fs-5">{weeks || 12}</div>
                        <small className="text-muted">주차</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-center">
                        <div className="text-warning fw-bold fs-5">{getCourseLevelLabel(course_level)}</div>
                        <small className="text-muted">수준</small>
                      </div>
                    </div>
                  </div>
                  
                  <hr className="my-3" />
                  
                  <div className="mb-3">
                    <small className="text-muted">카테고리</small>
                    <div className="fw-semibold">{category}</div>
                  </div>
                  
                  <div className="mb-3">
                    <small className="text-muted">수업 형태</small>
                    <div className="fw-semibold">{getCourseFormatLabel(course_format)}</div>
                  </div>
                  
                  <div className="mb-3">
                    <small className="text-muted">일정 유형</small>
                    <div className="fw-semibold">{getScheduleTypeLabel(schedule_type)}</div>
                  </div>
                  
                  {/* 학원 상담 정보 */}
                  <hr className="my-3" />
                  <div className="text-center">
                    <div className="h5 text-primary fw-bold mb-2">
                      <i className="fas fa-phone me-2"></i>
                      상담 및 문의
                    </div>
                    <p className="text-muted mb-1">학원 방문 및 전화 상담 가능</p>
                    <p className="fw-semibold text-dark">02-XXX-XXXX</p>
                  </div>
                </div>
              </div>

              {/* 포함 사항 */}
              {includeItems.length > 0 && (
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-header bg-success text-white">
                    <h6 className="card-title mb-0">
                      <i className="fas fa-check-circle me-2"></i>
                      포함 사항
                    </h6>
                  </div>
                  <div className="card-body">
                    <ul className="list-unstyled mb-0">
                      {includeItems.map((item, index) => (
                        <li key={index} className="mb-2 d-flex align-items-start">
                          <i className="fas fa-check text-success me-2 mt-1 flex-shrink-0"></i>
                          <span className="small">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* 수강 요건 */}
              {requirementItems.length > 0 && (
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-header bg-warning text-dark">
                    <h6 className="card-title mb-0">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      수강 요건
                    </h6>
                  </div>
                  <div className="card-body">
                    <ul className="list-unstyled mb-0">
                      {requirementItems.map((item, index) => (
                        <li key={index} className="mb-2 d-flex align-items-start">
                          <i className="fas fa-info-circle text-warning me-2 mt-1 flex-shrink-0"></i>
                          <span className="small">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {/* 수강 신청 버튼 */}
              <div className="d-grid gap-2 mb-4">
                <Link
                  href="/cart"
                  className="btn btn-primary btn-lg"
                >
                  <i className="fas fa-shopping-cart me-2"></i>
                  수강 신청
                </Link>
                {trial_available && (
                  <button className="btn btn-outline-secondary">
                    <i className="fas fa-play me-2"></i>
                    무료 체험
                  </button>
                )}
              </div>

              {/* 소셜 공유 */}
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-light">
                  <h6 className="card-title mb-0">
                    <i className="fas fa-share-alt me-2"></i>
                    공유하기
                  </h6>
                </div>
                <div className="card-body text-center">
                  <div className="d-flex justify-content-center gap-3">
                    <Link href="#" className="btn btn-outline-primary btn-sm">
                      <i className="fab fa-facebook-f"></i>
                    </Link>
                    <Link href="#" className="btn btn-outline-info btn-sm">
                      <i className="fab fa-twitter"></i>
                    </Link>
                    <Link href="#" className="btn btn-outline-danger btn-sm">
                      <i className="fab fa-instagram"></i>
                    </Link>
                    <Link href="#" className="btn btn-outline-success btn-sm">
                      <i className="fab fa-whatsapp"></i>
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* 수업 일정 요약 */}
              {start_date && end_date && (
                <div className="card border-0 shadow-sm mt-4">
                  <div className="card-header bg-info text-white">
                    <h6 className="card-title mb-0">
                      <i className="fas fa-calendar me-2"></i>
                      수업 일정
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row g-2 text-center">
                      <div className="col-6">
                        <small className="text-muted d-block">시작일</small>
                        <div className="fw-semibold">{formatDate(start_date)}</div>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">종료일</small>
                        <div className="fw-semibold">{formatDate(end_date)}</div>
                      </div>
                      {enrollment_deadline && (
                        <div className="col-12 mt-2">
                          <small className="text-danger">
                            <i className="fas fa-clock me-1"></i>
                            신청마감: {formatDate(enrollment_deadline)}
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};