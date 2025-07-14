"use client";

import React from "react";
import Link from "next/link";
import { useHobble } from "../../lib/hooks/useHobble";
import { VideoPlayer } from "../videos/VideoPlayer";

const heroImg1 = "/home_3/hero_img_1.png";
const heroShape1 = "/home_3/hero_shape_1.svg";
const heroShape2 = "/home_3/hero_shape_2.svg";
const heroShape3 = "/home_3/hero_shape_3.svg";
const heroShape4 = "/home_3/hero_shape_4.svg";

export const HeroThree = ({ content = {} }) => {
  const { hero = {}, video = { videoUrl: '', videoText: '이달의 온라인 특강!' } } = content;
  const {
    subtitleUp = '100 % 모든 개념이 ‘내 것’이 되는 그날까지',
    subtitleUpColor = '#8B5CF6', // 기본 강조색 (보라색) 헥스 코드
    title = '문제 풀이를 넘어 \n개념의 문을 엽니다.',
    subtitle = '단순한 암기가 아닌, 진짜 개념 이해를 기반으로 성적을 올립니다. \n아이의 ‘왜?’에 끝까지 답하는 수업, 지금 시작하세요.',
    buttonText = '모든 과정 살펴보기',
  } = hero;

  const getYouTubeVideoId = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?\n]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  };

  const videoId = getYouTubeVideoId(video.videoUrl);


  useHobble();

  return (
    <section className="td_hero td_style_3 td_center td_hobble">
      <div className="container">
        <div
          className="td_hero_text wow fadeInDown"
          data-wow-duration="1s"
          data-wow-delay="0.5s"
        >
          <p className={`td_hero_subtitle_up td_fs_18 td_spacing_1 td_semibold text-uppercase td_mb_14`} style={{ color: subtitleUpColor }}>
            {subtitleUp}
          </p>
          <h1 className={`td_hero_title td_fs_64 td_mb_20 ${hero.titleFontWeight || 'font-bold'}`} data-component-name="HeroThree">
            {title.split('\n').map((line, idx) => (
              <React.Fragment key={idx}>
                {line}
                {idx !== title.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </h1>
          <p className="td_hero_subtitle td_fs_18 td_heading_color td_opacity_7 td_mb_30">
            {subtitle.split('\n').map((line, idx) => (
              <React.Fragment key={idx}>
                {line}
                {idx !== subtitle.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>

          <div className="td_btns_group">
            <Link
              href={hero.buttonLink || "/courses-grid-view"}
              className="td_btn td_style_1 td_radius_30 td_medium"
            >
              <span className="td_btn_in td_white_color td_accent_bg">
                <span>{buttonText}</span>
                <svg
                  width="19"
                  height="20"
                  viewBox="0 0 19 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  role="presentation"
                >
                  <path
                    d="M15.1575 4.34302L3.84375 15.6567"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15.157 11.4142C15.157 11.4142 16.0887 5.2748 15.157 4.34311C14.2253 3.41142 8.08594 4.34314 8.08594 4.34314"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>

            {/* 비디오 버튼 - videoText가 있으면 항상 표시 */}
            {video?.videoText && (
              <VideoPlayer
                videoId={videoId}
                trigger={
                  <button
                    type="button"
                    className="td_player_btn_wrap td_video_open td_medium td_heading_color"
                    aria-label={video.videoText || '동영상 재생'}
                    disabled={!videoId}
                  >
                    <span className="td_player_btn td_center">
                      <span></span>
                    </span>
                    <span className="td_play_btn_text">{video.videoText}</span>
                  </button>
                }
              />
            )}
          </div>
        </div>
      </div>

      <div className="td_hero_img_box">
        <img
          src={heroImg1}
          alt="Hero"
          className="td_hero_img_1 wow fadeInRight"
          data-wow-duration="1s"
          data-wow-delay="0.3s"
        />

        <div
          className="td_hero_shape_1 td_hover_layer_3 wow fadeIn"
          data-wow-duration="1s"
          data-wow-delay="0.8s"
        />

        <div className="td_hero_shape_2">
          <img src={heroShape1} alt="Hero shape" className="td_hover_layer_5" />
        </div>
      </div>

      <div className="td_hero_shape_3 td_hover_layer_3" />

      <div className="td_hero_shape_4">
        <img src={heroShape2} alt="Hero shape" />
      </div>

      <div className="td_hero_shape_5">
        <img src={heroShape3} alt="Hero shape" />
      </div>

      <div className="td_hero_shape_6 td_hover_layer_3">
        <img src={heroShape4} alt="Hero shape" />
      </div>

      <div className="td_hero_shape_7 td_hover_layer_5" />
    </section>
  );
};
