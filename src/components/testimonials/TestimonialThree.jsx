"use client";

import React, { useRef } from "react";
import { SlickSlider } from "../slick_slider/SlickSlider";
import { useHobble } from "../../lib/hooks/useHobble";

const testimonialShape1 = "/home_3/testimonial_shape_1.svg";

// 기본 후기 데이터 (fallback)
const defaultTestimonialData = [
  {
    id: 1,
    rating: 5,
    text: "모의고사에서 늘 4등급이던 제가 '풀이 첨삭' 수업을 8개월 듣고 수능에서 **수학 1등급(백분위 97)**을 받았습니다. 선생님이 문제당 '왜 이렇게 푸는지' 근거를 잡아주셔서, 시험장에서 처음 보는 유형도 절대 당황하지 않았어요. 20년 커리큘럼으로 다져진 내신 기출 분석집 덕분에 학교 시험도 전교 1등으로 마무리했습니다.",
    avatar: "/home_1/avatar_1.png",
    name: "김○○",
    designation: "고3, 의예과 최종 합격",
  },
  {
    id: 2,
    rating: 5,
    text: "친구 소개로 들어온 뒤부터 수학은 '외우는 과목'이 아니라 '이해하는 과목'이 되었습니다. 매수업 끝나면 풀이 노트를 빨간 펜으로 샅샅이 코칭해 주시는데, 제 약점 패턴이 한눈에 보여서 스스로 공부 루틴을 디자인할 수 있었어요. 작년 평균 88점에서 올해는 내신 전 과목 100점을 기록했습니다.",
    avatar: "/home_2/avatar_2.png",
    name: "박○○",
    designation: "고2, 전교 1등 유지",
  },
  {
    id: 3,
    rating: 4.5,
    text: "중학교 때까지 수학이 두려웠는데, 첫 달부터 '개념→유형→실전' 3단계 수업으로 체계가 잡히니까 문제 읽는 속도가 달라졌어요. 4개월 만에 중간·기말 모두 **전교 상위 1%**에 진입했고, 담임 선생님도 '표정이 달라졌다'고 하세요. 수업 후 자유롭게 이용할 수 있는 1:1 첨삭룸도 큰 도움이 됐습니다.",
    avatar: "/home_2/avatar_3.png",
    name: "이○○",
    designation: "고1, 개념 완성반 수강",
  }
];

// 별점 렌더링 함수
const renderStars = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  
  // 채워진 별
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <i key={`full-${i}`} className="fa-solid fa-star" style={{ color: '#ffc107' }}></i>
    );
  }
  
  // 반별 (있는 경우)
  if (hasHalfStar) {
    stars.push(
      <i key="half" className="fa-solid fa-star-half-stroke" style={{ color: '#ffc107' }}></i>
    );
  }
  
  // 빈 별
  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <i key={`empty-${i}`} className="fa-regular fa-star" style={{ color: '#ddd' }}></i>
    );
  }
  
  return stars;
};

export const TestimonialThree = ({ content }) => {
  useHobble();

  // props에서 데이터를 가져오고, 없으면 기본값 사용
  const testimonialData = content?.items?.map(item => ({
    id: item.id,
    rating: item.rating,
    text: item.text,
    avatar: item.avatar,
    name: item.name,
    designation: item.description // description을 designation으로 매핑
  })) || defaultTestimonialData;

  let sliderRef = useRef(null);
  const next = () => sliderRef.slickNext();
  const previous = () => sliderRef.slickPrev();

  const settings = {
    autoplay: false,
    loop: true,
    speed: 800,
    arrows: true,
    slidesToShow: 3,
    responsive: [
      { breakpoint: 1600, settings: { slidesToShow: 2 } },
      { breakpoint: 1200, settings: { slidesToShow: 2 } },
      { breakpoint: 992, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <section className="td_shape_section_9 td_hobble">
      <div className="td_shape_position_4 position-absolute td_hover_layer_3">
        <img src={testimonialShape1} alt="" />
      </div>

      <div className="td_shape_position_5 position-absolute td_accent_color td_hover_layer_5">
        <svg
          width="242"
          height="231"
          viewBox="0 0 242 231"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter="url(#filter0_d_34_832)">
            <path
              d="M127.325 39.3635C128.652 37.8865 131.088 39.0374 130.79 41.0006L125.127 78.2822C124.952 79.4327 125.793 80.4889 126.953 80.5768L169.471 83.7988C171.566 83.9575 172.03 86.8264 170.092 87.6379L134.887 102.378C133.625 102.906 133.254 104.518 134.159 105.545L161.133 136.154C162.555 137.768 160.776 140.182 158.814 139.301L119.833 121.805C118.666 121.281 117.315 121.972 117.055 123.224L109.608 159.155C109.196 161.139 106.436 161.325 105.763 159.414L92.3189 121.263C91.949 120.214 90.7938 119.668 89.7483 120.048L51.7387 133.888C49.8354 134.581 48.2261 132.33 49.4973 130.753L72.5265 102.184C73.3289 101.188 73.004 99.7059 71.8589 99.1372L33.5908 80.133C31.6643 79.1763 32.3994 76.269 34.549 76.3429L75.3234 77.7447C76.6912 77.7918 77.701 76.482 77.3078 75.1712L66.3403 38.615C65.7365 36.6024 68.2476 35.1394 69.7007 36.6572L99.1874 67.4574C99.9921 68.298 101.342 68.2767 102.12 67.4112L127.325 39.3635Z"
              fill="currentColor"
            />
            <path
              d="M127.511 39.5306C128.672 38.2382 130.804 39.2453 130.543 40.9631L124.88 78.2447C124.683 79.539 125.629 80.7272 126.934 80.8261L169.452 84.048C171.285 84.187 171.692 86.6972 169.996 87.4073L134.791 102.147C133.371 102.742 132.954 104.555 133.972 105.71L160.945 136.319C162.19 137.731 160.633 139.844 158.916 139.073L119.935 121.577C118.623 120.988 117.103 121.764 116.811 123.173L109.363 159.105C109.003 160.84 106.588 161.003 105.999 159.331L92.5546 121.18C92.1386 119.999 90.839 119.385 89.6628 119.814L51.6532 133.653C49.9878 134.259 48.5797 132.29 49.692 130.91L72.7211 102.341C73.6238 101.221 73.2584 99.5531 71.9701 98.9133L33.702 79.9091C32.0163 79.072 32.6595 76.5281 34.5405 76.5928L75.3148 77.9946C76.8535 78.0475 77.9896 76.574 77.5472 75.0993L66.5798 38.5432C66.0514 36.7821 68.2486 35.502 69.5201 36.8301L99.0068 67.6303C99.9122 68.576 101.431 68.552 102.306 67.5783L127.511 39.5306Z"
              strokeWidth="0.5"
            />
          </g>
          <g clipPath="url(#clip0_34_832)">
            <path
              d="M117.885 90.793C117.885 87.5059 115.219 84.8398 111.932 84.8398C108.645 84.8398 105.979 87.5059 105.979 90.793C105.979 94.0801 108.645 96.7461 111.932 96.7461C112.916 96.7461 113.824 96.4883 114.645 96.0664C113.59 100.707 109.436 104.187 104.479 104.187C103.658 104.187 102.99 104.855 102.99 105.676C102.99 106.496 103.658 107.164 104.479 107.164C111.873 107.164 117.885 101.152 117.885 93.7578V90.793Z"
              fill="white"
            />
            <path
              d="M103.018 90.793C103.018 87.5059 100.352 84.8398 97.0645 84.8398C93.7773 84.8398 91.1113 87.5059 91.1113 90.793C91.1113 94.0801 93.7773 96.7461 97.0645 96.7461C98.0488 96.7461 98.957 96.4883 99.7773 96.0664C98.7227 100.707 94.5684 104.187 89.6113 104.187C88.791 104.187 88.123 104.855 88.123 105.676C88.123 106.496 88.791 107.164 89.6113 107.164C97.0059 107.164 103.018 101.152 103.018 93.7578V90.793Z"
              fill="white"
            />
          </g>
          <defs>
            <filter
              id="filter0_d_34_832"
              x="2.47656"
              y="6.02954"
              width="238.844"
              height="224.72"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dx="20" dy="20" />
              <feGaussianBlur stdDeviation="25" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.104167 0 0 0 0.15 0"
              />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow_34_832"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow_34_832"
                result="shape"
              />
            </filter>
            <clipPath id="clip0_34_832">
              <rect
                width="30"
                height="30"
                fill="white"
                transform="matrix(-1 0 0 -1 118.002 111)"
              />
            </clipPath>
          </defs>
        </svg>
      </div>

      <div className="td_height_112 td_height_lg_75" />
      <div className="container">
        <div
          className="td_section_heading td_style_1 text-center wow fadeInUp"
          data-wow-duration="1s"
          data-wow-delay="0.2s"
        >
          <p className="td_section_subtitle_up td_fs_18 td_semibold td_spacing_1 td_mb_10 text-uppercase td_accent_color">
            학생들의 생생 후기
          </p>
          <h2 className="td_section_title td_fs_48 mb-0">
            20년 경력의 대치동 수학전문 학원 <br />
            지금 시작하세요.
          </h2>
        </div>
        <div className="td_height_50 td_height_lg_50" />

        <div
          className="td_slider td_style_1 td_slider_gap_24 td_remove_overflow wow fadeInUp"
          data-wow-duration="1s"
          data-wow-delay="0.3s"
        >
          <div className="td_slider_container">
            <div className="td_slider_wrapper">
              <SlickSlider ref={(slider) => (sliderRef = slider)} {...settings}>
                {testimonialData.map((testimonial) => (
                  <div className="td_slide" key={testimonial.id}>
                    <div className="td_testimonial td_style_1 td_type_2 td_white_bg td_radius_5">
                      <div className="td_rating td_mb_20">
                        {renderStars(testimonial.rating)}
                      </div>
                      <blockquote className="td_testimonial_text td_fs_18 td_medium td_heading_color td_mb_30 td_opacity_9">
                        {testimonial.text}
                      </blockquote>
                      <div className="td_testimonial_meta td_mb_24">
                        <img src={testimonial.avatar} alt="" />
                        <div className="td_testimonial_meta_right">
                          <h3 className="td_fs_20 td_semibold td_mb_2">
                            {testimonial.name}
                          </h3>
                          <p className="td_fs_14 mb-0 td_heading_color td_opacity_7">
                            {testimonial.designation}
                          </p>
                        </div>
                      </div>
                      <span className="td_quote_icon td_accent_color">
                        <svg
                          width="65"
                          height="46"
                          viewBox="0 0 65 46"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            opacity="0.05"
                            d="M13.9305 26.6H1.00195V1H26.8591V27.362L17.9579 45H6.26959L14.8233 28.0505L15.5553 26.6H13.9305ZM51.0734 26.6H38.1448V1H64.002V27.362L55.1008 45H43.4124L51.9661 28.0505L52.6982 26.6H51.0734Z"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                ))}
              </SlickSlider>
            </div>
          </div>

          <div className="td_height_40 td_height_lg_40" />
          <div className="td_slider_arrows td_style_1">
            <div
              role="button"
              onClick={previous}
              className="td_left_arrow td_accent_bg rounded-circle td_center td_white_color"
            >
              <svg
                width="18"
                height="12"
                viewBox="0 0 18 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.00194 6.00024L17.002 6.00024"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6.00191 1C6.00191 1 1.00196 4.68244 1.00195 6.00004C1.00194 7.31763 6.00195 11 6.00195 11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div
              role="button"
              onClick={next}
              className="td_right_arrow td_accent_bg rounded-circle td_center td_white_color"
            >
              <svg
                width="18"
                height="12"
                viewBox="0 0 18 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.002 5.99976L1.00195 5.99976"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12.002 11C12.002 11 17.0019 7.31756 17.002 5.99996C17.002 4.68237 12.002 1 12.002 1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
