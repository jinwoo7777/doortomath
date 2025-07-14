"use client";

import React, { useEffect, useMemo, useState } from "react";
import { fetchCourseMenu } from "@/lib/supabase/fetchCourseMenu";
import { fetchCourses } from "@/lib/supabase/fetchCourses";
import { CoursesOneItem } from "./CoursesOneItem";
import { Loader2, AlertTriangle } from "lucide-react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

/**
 * Supabase 강의를 카테고리별 탭으로 표시하는 컴포넌트
 * 기존 CoursesOne.jsx 의 정적 구현을 대체하기 위해 작성함.
 */
const CoursesCategoryTabs = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [courses, setCourses] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [sectionVisibility, setSectionVisibility] = useState({
    visible: true,
    title: "Academic Courses",
    subtitle: "Popular Courses"
  });
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClientComponentClient();

  // 탭 변경 시 WOW 애니메이션 재실행 및 스크롤 이벤트 트리거
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      if (window.wowInstance) {
        window.wowInstance.sync();
      } else if (window.WOW) {
        window.wowInstance = new window.WOW();
        window.wowInstance.init();
      }
    } catch (_) {
      // WOW 미존재 시 무시
    }

    // 일부 브라우저에서 in-view 체크를 위해 강제 스크롤 이벤트 발송
    window.requestAnimationFrame(() => {
      window.dispatchEvent(new Event("scroll"));
    });
  }, [activeIndex]);

  // 섹션 표시 설정 불러오기
  useEffect(() => {
    const fetchSectionVisibility = async () => {
      try {
        const { data, error } = await supabase
          .from('main_page_content')
          .select('content')
          .eq('section_name', 'courses_section_visibility')
          .single();

        if (error) {
          console.error('섹션 표시 설정 불러오기 오류:', error);
          return;
        }

        if (data && data.content) {
          setSectionVisibility(data.content);
        }
      } catch (err) {
        console.error('섹션 표시 설정 불러오기 실패:', err);
      }
    };

    fetchSectionVisibility();
  }, [supabase]);

  // CourseMenu 로드
  useEffect(() => {
    const loadMenu = async () => {
      try {
        const data = await fetchCourseMenu();
        setMenuItems((data ?? []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
      } catch (err) {
        console.error("CourseMenu 로드 실패", err);
      }
    };
    loadMenu();
  }, []);

  // Courses 로드
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCourses();
        setCourses(data ?? []);
      } catch (err) {
        console.error("Courses 로드 실패", err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // 메뉴 아이템이 없으면 기본 메뉴 생성
  const effectiveTabs = useMemo(() => {
    if (menuItems.length > 0) {
      return menuItems;
    }
    // 기본값
    return [
      { name: "시험대비", order: 1 },
      { name: "학습분석", order: 2 },
      { name: "내신,모의 기출분석", order: 3 },
      { name: "선행수업", order: 4 },
      { name: "개별오답관리", order: 5 },
    ];
  }, [menuItems]);

  // 로딩 중이거나 섹션이 비활성화된 경우 렌더링하지 않음
  if (isLoading) {
    return null; // 또는 로딩 스피너
  }

  // 섹션이 비활성화된 경우 아무것도 렌더링하지 않음
  if (!sectionVisibility.visible) {
    return null;
  }

  return (
    <section>
      <div className="td_height_112 td_height_lg_75" />

      <div className="container">
        {/* header */}
        <div
          className="td_section_heading td_style_1 text-center wow fadeInUp"
          data-wow-duration="1s"
          data-wow-delay="0.15s"
        >
          <p className="td_section_subtitle_up td_fs_18 td_semibold td_spacing_1 td_mb_10 text-uppercase td_accent_color">
            {sectionVisibility.subtitle}
          </p>
          <h2 className="td_section_title td_fs_48 mb-0">{sectionVisibility.title}</h2>
        </div>
        <div className="td_height_30 td_height_lg_30" />

        {/* tabs */}
        <div className="td_tabs">
          {/* tab links */}
          <ul
            className="flex flex-wrap justify-center gap-8 bg-[#F9F9FA] border border-gray-200 rounded-full p-2"
            data-wow-duration="1s"
            
            
          >
            {effectiveTabs.map((tab, idx) => {
              const href = tab.href || `#tab_${idx}`;
              return (
                <li key={tab.id || tab.name || idx} className={idx === activeIndex ? "active" : ""}>
                  <button
                      type="button"
                      onClick={() => setActiveIndex(idx)}
                      className={`px-9 py-3 text-[20px] font-medium rounded-full transition-colors focus:outline-none ${idx === activeIndex ? 'bg-[var(--accent-color)] text-white shadow' : 'text-gray-900 hover:bg-gray-100'}`}
                    >
                      {tab.name || tab.label}
                    </button>
                </li>
              );
            })}
          </ul>
          <div className="td_height_50 td_height_lg_50" />

          {/* tab bodies */}
          <div className="td_tab_body">
            {effectiveTabs.map((tab, idx) => {
              const catName = (tab.name || "").trim();
              const catCourses = courses.filter((c) => ((c.category || "기타").trim()) === catName);
              if (typeof window !== "undefined") {
                console.log("[TAB]", catName, catCourses.length, catCourses);
              }
              return (
                <div key={idx} className={`td_tab ${idx === activeIndex ? "active" : ""}`} style={{ display: idx === activeIndex ? 'block' : 'none' }}>
                  {catCourses.length ? (
                    <div className="row td_gap_y_24">
                      {catCourses.map((course) => (
                        <div
                          key={course.id}
                          className="col-lg-4 col-md-6 wow fadeInUp"
                          data-wow-duration="1s"
                          data-wow-delay="0.2s"
                        >
                          <CoursesOneItem
                            id={course.id} // 강의 ID 전달
                            src={course.thumbnail_url || course.image_url || "/images/placeholder-course.jpg"}
                            seats={course.seats}
                            semesters={course.semesters}
                            subtitle={course.category}
                            title={course.title}
                            description={course.description}
                            totalRatings={course.total_ratings || 0}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="td_tab_comming_soon td_center td_fs_24 td_semibold td_heading_color py-10">
                      강의 준비중입니다.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="td_height_120 td_height_lg_80" />
    </section>
  );
};

export default CoursesCategoryTabs;
