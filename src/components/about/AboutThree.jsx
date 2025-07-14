import React from "react";
import Link from "next/link";

const aboutShape1 = "/home_3/about_shape_1.svg";
const aboutShape2 = "/home_3/about_shape_2.svg";


const signImg = "/home_3/mathematics_87612.svg";
const awardIcon = "/home_2/cs_award_box_icon.svg";
const aboutIcon1 = "/home_3/feature_icon_1.svg";
const aboutIcon2 = "/home_3/feature_icon_2.svg";

export const AboutThree = ({ 
  content = {
    title: '에듀시브만의 차별화된 교육',
    description: '에듀시브는 단순한 학습 플랫폼을 넘어, 학생들의 잠재력을 최대한 끌어올리는 종합 교육 솔루션을 제공합니다. 10년 이상의 노하우를 바탕으로 한 체계적인 커리큘럼과 1:1 맞춤 학습 시스템으로 모든 학생이 자신만의 속도로 성장할 수 있도록 돕습니다.',
    stats: [
      { value: '30k+', label: '누적 수강생' },
      { value: '98%', label: '만족도' },
      { value: '4.9', label: '평점' }
    ],
    features: [
      {
        icon: aboutIcon1,
        title: '체계적인 커리큘럼',
        description: '전문가들이 설계한 단계별 학습 로드맵으로 체계적으로 학습할 수 있습니다.'
      },
      {
        icon: aboutIcon2,
        title: '1:1 맞춤 학습',
        description: '개인별 학습 성과 분석을 바탕으로 한 맞춤형 학습 전략을 제공합니다.'
      }
    ],
    image1: '/home_3/about_img_1.jpg',
    image2: '/home_3/about_img_2.jpg',
    image3: '/home_3/review_img.png'
  }
}) => {
  return (
    <section className="td_shape_section_9">
      <div className="td_shape_position_1 position-absolute">
        <img src={aboutShape1} alt="" />
      </div>
      <div className="td_shape_position_2 position-absolute">
        <img src={aboutShape2} alt="" />
      </div>
      <div className="td_height_112 td_height_lg_75" />
      <div className="container">
        <div className="row td_gap_y_40 align-items-center">
          <div className="col-lg-6">
            <div className="td_image_box td_style_3">
              <div
                className="td_image_box_img_1 wow fadeInLeft"
                data-wow-duration="1s"
                data-wow-delay="0.25s"
              >
                <img src={content.image1} alt="" className="td_radius_10" />
              </div>
              <div
                className="td_image_box_img_2 wow fadeInRight"
                data-wow-duration="1s"
                data-wow-delay="0.3s"
              >
                <img src={content.image2} alt="" className="td_radius_10" />
              </div>
              <div
                className="td_review_box td_heading_bg text-center td_center wow fadeInUp"
                data-wow-duration="1s"
                data-wow-delay="0.35s"
              >
                <div className="td_review_box_in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                  <img src={content.image3} alt="" />
                  <h3 className="td_fs_32 td_medium td_white_color">{content.stats?.value || '3000명+'}</h3>
                  <p className="mb-0 td_light td_opacity_7 td_white_color">
                    {content.stats?.label || '학원 누적 학생수'}
                  </p>
                </div>
              </div>
              <div
                className="td_sign_box wow fadeInDown"
                data-wow-duration="1s"
                data-wow-delay="0.4s"
              >
                <div className="td_sign_box_in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                  <img src={signImg} alt="" style={{ width: '80px', height: '80px', transform: 'translateX(-15px)' }}/>
                  <h3 className="td_fs_20 td_semibold mb-0" style={{ transform: 'translateX(-15px)' }}>
                    대치동 20년 수학학원
                  </h3>
                  <p className="mb-0 td_heading_color td_opacity_6" style={{ transform: 'translateX(-15px)' }}>
                    모두 10년차 이상 강사진
                  </p>
                </div>
                <svg
                  width="220"
                  height="209"
                  viewBox="0 0 220 209"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                >
                  <path
                    d="M90.7847 61.3658C91.6024 51.6359 99.3778 44.2904 108.872 44.2904H109.432L110.576 44.3708L199.107 52.276L108.927 0.757812L0 62.9865L108.927 125.219L174.727 87.6264L107.349 81.6096C97.3438 80.7169 89.9157 71.6346 90.7847 61.3658Z"
                    fill="#00001B"
                  />
                  <path
                    d="M219.905 71.3829C219.427 68.7423 217.086 66.3805 214.452 66.154L109.454 56.7779C106.028 56.4523 103.168 59.0162 102.88 62.4429C102.535 65.8041 104.996 68.8134 108.399 69.1914L207.853 78.0735V121.651C207.766 123.846 208.902 125.914 210.817 127.039C212.731 128.162 215.116 128.162 217.032 127.039C218.947 125.914 220.083 123.846 219.994 121.651V72.3617C219.994 72.0323 219.964 71.7048 219.905 71.3829Z"
                    fill="#00001B"
                  />
                  <path
                    d="M111.88 137.797C110.057 138.85 107.799 138.85 105.976 137.797L52.0037 106.964L14.5195 155.632C64.6571 160.466 97.5725 194.278 109.222 208.324C121.927 194.628 157.626 160.743 203.851 155.686L167.923 105.781L111.88 137.797Z"
                    fill="#00001B"
                  />
                </svg>
                <div className="td_award_box_icon td_center">
                  <img src={awardIcon} alt="" />
                </div>
              </div>
            </div>
          </div>
          <div
            className="col-lg-6 wow fadeInRight"
            data-wow-duration="1s"
            data-wow-delay="0.4s"
          >
            <div className="td_section_heading td_style_1 td_mb_40">
              <p className="td_section_subtitle_up td_fs_18 td_semibold td_spacing_1 td_mb_10 text-uppercase td_accent_color">
              SKY/의치한 합격생 100명
              </p>
              <h2 className="td_heading_lg text-5xl font-bold whitespace-pre-wrap td_mb_8 leading-[1.1]" dangerouslySetInnerHTML={{ __html: (content.title || '에듀시브만의<br />차별화된 교육').replace(/\n/g, '<br />') }} />
              <p className="td_mb_0 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: (content.content || content.description || '에듀시브는 단순한 학습 플랫폼을 넘어, 학생들의 잠재력을 최대한 끌어올리는 종합 교육 솔루션을 제공합니다. 10년 이상의 노하우를 바탕으로 한 체계적인 커리큘럼과 1:1 맞춤 학습 시스템으로 모든 학생이 자신만의 속도로 성장할 수 있도록 돕습니다.').replace(/\n/g, '<br />') }} />
            </div>
            <div className="td_mb_40 position-relative">
              {(() => {
                // 기본 기능 목록
                const defaultFeatures = [
                  {
                    icon: aboutIcon1,
                    title: '체계적인 커리큘럼',
                    description: '전문가들이 설계한 단계별 학습 로드맵으로 체계적으로 학습할 수 있습니다.'
                  },
                  {
                    icon: "/home_3/feature_icon_2.svg",
                    title: '1:1 맞춤 학습',
                    description: '개인별 학습 성과 분석을 바탕으로 한 맞춤형 학습 전략을 제공합니다.'
                  },
                  {
                    icon: "/home_3/feature_icon_3.svg",
                    title: '개인별 약점 보완',
                    description: '학생별 약점을 분석하여 체계적으로 보완할 수 있는 맞춤형 학습 프로그램을 제공합니다.'
                  },
                  {
                    icon: "/home_3/feature_icon_4.svg",
                    title: '10년차 이상 강사진',
                    description: '풍부한 경험을 가진 전문 강사진이 학생들의 성장을 돕습니다.'
                  },
                  {
                    icon: "/home_3/achievement_icon_2.svg",
                    title: '지인 추천율 90%',
                    description: '높은 만족도로 인해 90% 이상의 학생들이 지인에게 추천하는 교육 서비스를 제공합니다.'
                  }
                ];

                // content.features가 있으면 기본값과 병합, 없으면 기본값 사용
                const features = content.features?.length > 0 
                  ? content.features 
                  : defaultFeatures;

                return features.map((feature, index) => (
                  <React.Fragment key={index}>
                    <div className="td_iconbox td_style_5">
                      <div className="td_iconbox_icon">
                        <div className="td_iconbox_icon_in td_center">
                          <img src={feature.icon} alt={feature.title} />
                        </div>
                      </div>
                      <div className="td_iconbox_right">
                        <h3 className="td_iconbox_title td_fs_32 td_mb_4 font-semibold">
                          {feature.title}
                        </h3>
                        <p className="td_iconbox_subtitle mb-0 td_heading_color td_fs_18 td_opacity_7">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                    {index < features.length - 1 && <div className="td_height_30 td_height_lg_30" />}
                  </React.Fragment>
                ));
              })()}
            </div>
            <Link
              href="/about"
              className="td_btn td_style_1 td_radius_30 td_medium td_with_shadow"
            >
              <span className="td_btn_in td_white_color td_accent_bg">
                <span>자세히 알아보기 </span>
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
          </div>
        </div>
      </div>
      <div className="td_height_120 td_height_lg_80" />
    </section>
  );
};
