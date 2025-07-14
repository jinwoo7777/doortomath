import React from "react";
import { VideoPlayer } from "../videos/VideoPlayer";

const videoBg = "/home_3/video_bg.jpg";
const featureIcon1 = "/home_3/feature_icon_1.svg";
const featureIcon2 = "/home_3/feature_icon_2.svg";
const featureIcon3 = "/home_3/feature_icon_3.svg";
const featureIcon4 = "/home_3/feature_icon_4.svg";

export const FeatureTwo = ({ 
  content = {
    title: '수학의 문 시설',
    subtitle: '20년 노하우가 녹아든 공간 설계로, 머무는 순간마다 학습 효과를 극대화합니다.',
    backgroundImage: '/home_3/video_bg.jpg',
    videoUrl: '#vid002',
    features: [
      {
        id: 1,
        icon: '/home_3/feature_icon_1.svg',
        title: '스마트 강의실',
        description: '전자칠판·빔프로젝터 완비, 복잡한 개념도 영상·그래프로 즉시 시각화'
      },
      {
        id: 2,
        icon: '/home_3/feature_icon_2.svg',
        title: '집중 자습부스',
        description: '40석 독립 칸막이 좌석, 조명·온도 최적화로 몰입도 200% 유지'
      },
      {
        id: 3,
        icon: '/home_3/feature_icon_3.svg',
        title: '1:1 첨삭룸',
        description: '풀이 과정을 교사와 마주 보며 교정, 개인 맞춤 피드백 전용 공간'
      },
      {
        id: 4,
        icon: '/home_3/feature_icon_4.svg',
        title: '소규모 토론 교실',
        description: '6-8명 구성, 발표와 질문이 자연스러운 U자형 책상 배치'
      }
    ]
  }
}) => {
  return (
    <section className="td_features_2_wrap">
      <div className="td_height_120 td_height_lg_80" />
      <div className="container">
        <div className="td_features td_style_2">
          <div
            className="td_features_thumb td_radius_10 td_center td_bg_filed"
            style={{ backgroundImage: `url(${content.backgroundImage})` }}
          >
            <VideoPlayer
              trigger={
                <a
                  href={content.videoUrl}
                  className="td_player_btn_wrap td_video_open td_medium td_heading_color wow zoomIn"
                  data-wow-duration="1s"
                  data-wow-delay="0.2s"
                >
                  <span className="td_player_btn td_center">
                    <span></span>
                  </span>
                </a>
              }
            />
          </div>

          <div className="td_features_content_wrap">
            <div
              className="td_features_content td_white_bg td_radius_10 wow fadeInRight"
              data-wow-duration="1s"
              data-wow-delay="0.3s"
            >
              <div className="td_section_heading td_style_1">
                <h2 className="td_section_title td_fs_48 mb-0">
                  {content.title}
                </h2>
                <p className="td_section_subtitle td_fs_18 mb-0">
                  {content.subtitle}
                </p>
              </div>
              <div className="td_height_40 td_height_lg_40" />
              <ul className="td_feature_list td_mp_0">
                {content.features.map((feature, index) => (
                  <li key={feature.id}>
                    <div className="td_feature_icon">
                      <img src={feature.icon} alt={`${feature.title} Icon`} />
                    </div>
                    <div className="td_feature_info">
                      <h3 className="td_fs_20 td_semibold td_mb_4">
                        {feature.title}
                      </h3>
                      <p className="td_fs_14 td_heading_color td_opacity_7 mb-0">
                        {feature.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
