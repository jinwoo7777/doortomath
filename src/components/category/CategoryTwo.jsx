'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from '@/lib/supabase/index.js';


export const CategoryTwo = ({ subtitle, title }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('main_page_content')
          .select('content')
          .eq('section_name', 'categories')
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
          throw error;
        }

        if (data) {
          try {
            setCategories(data.content);
          } catch (parseError) {
            console.error('Error parsing categories content:', parseError);
            setError('카테고리 데이터를 불러오는 중 오류가 발생했습니다.');
            setCategories([]);
          }
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('카테고리 데이터를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="td_gray_bg_5">
        <div className="td_height_112 td_height_lg_75" />
        <div className="container">
          <div className="text-center">
            <p className="td_section_subtitle_up td_fs_18 td_semibold td_spacing_1 td_mb_10 text-uppercase td_accent_color">
              {subtitle}
            </p>
            <h2 className="td_section_title td_fs_48 mb-0">
              {title}
            </h2>
          </div>
          <div className="td_height_50 td_height_lg_50" />
          <div className="text-center text-gray-500">카테고리 데이터를 불러오는 중...</div>
        </div>
        <div className="td_height_120 td_height_lg_80" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="td_gray_bg_5">
        <div className="td_height_112 td_height_lg_75" />
        <div className="container">
          <div className="text-center">
            <p className="td_section_subtitle_up td_fs_18 td_semibold td_spacing_1 td_mb_10 text-uppercase td_accent_color">
              {subtitle}
            </p>
            <h2 className="td_section_title td_fs_48 mb-0">
              {title}
            </h2>
          </div>
          <div className="td_height_50 td_height_lg_50" />
          <div className="text-center text-red-500">오류: {error}</div>
        </div>
        <div className="td_height_120 td_height_lg_80" />
      </section>
    );
  }

  // If no categories are found, display a message
  if (categories.length === 0) {
    return (
      <section className="td_gray_bg_5">
        <div className="td_height_112 td_height_lg_75" />
        <div className="container">
          <div className="text-center">
            <p className="td_section_subtitle_up td_fs_18 td_semibold td_spacing_1 td_mb_10 text-uppercase td_accent_color">
              {subtitle}
            </p>
            <h2 className="td_section_title td_fs_48 mb-0">
              {title}
            </h2>
          </div>
          <div className="td_height_50 td_height_lg_50" />
          <div className="text-center text-gray-500">표시할 카테고리가 없습니다.</div>
        </div>
        <div className="td_height_120 td_height_lg_80" />
      </section>
    );
  }

  return (
    <section className="td_gray_bg_5">
      <div className="td_height_112 td_height_lg_75" />
      <div className="container">
        <div
          className="td_section_heading td_style_1 text-center wow fadeInUp"
          data-wow-duration="1s"
          data-wow-delay="0.2s"
        >
          <p className="td_section_subtitle_up td_fs_18 td_semibold td_spacing_1 td_mb_10 text-uppercase td_accent_color">
            &quot;수학의 문&quot; 미리보기
          </p>
          <h2 className="td_section_title td_fs_48 mb-0">
            수학의 문 장점을을 살펴보세요
          </h2>
        </div>
        <div className="td_height_50 td_height_lg_50" />

        <div className="row td_gap_y_24">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="col-xxl-3 col-lg-4 col-md-6 wow fadeInUp"
              data-wow-duration="1s"
              data-wow-delay={`0.${index + 2}s`}
            >
              <Link
                href="/courses-grid-with-sidebar"
                className="td_iconbox td_style_3 td_fs_18 td_semibold td_radius_10 td_white_bg td_heading_color"
              >
                <span className="td_iconbox_icon">
                  <img src={category.icon} alt="" />
                </span>
                <span className="td_iconbox_title">{category.title}</span>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="td_height_120 td_height_lg_80" />
    </section>
  );
};
