import React from "react";

// 기본값 (fallback)
const defaultContent = {
  subtitle: '수학의 문 - 레벨 진단',
  title: '10분 진단으로\n당신의 수학 레벨을 확인하세요',
  description: '20년 데이터로 설계된 AI 분석이 약점을 정확히 짚어주고,\n목표 등급까지의 최단 코스를 제시합니다.',
  certificateImage: '/home_3/certificate_thumb.jpg',
  achievements: [
    {
      id: 1,
      icon: '/home_3/achievement_icon_1.svg',
      title: '빠른 온라인 진단',
      description: '20문항 객관식 + 서술형, 시험 감각 그대로 10분 완성'
    },
    {
      id: 2,
      icon: '/home_3/achievement_icon_2.svg',
      title: '정밀 오답 분석',
      description: '단원-개념별 취약 포인트를 그래프로 시각화'
    },
    {
      id: 3,
      icon: '/home_3/achievement_icon_3.svg',
      title: '맞춤 커리큘럼 추천',
      description: '목표 등급·학교 일정에 맞춰 전용 반 자동 매칭'
    },
    {
      id: 4,
      icon: '/home_3/achievement_icon_4.svg',
      title: '전문가 1:1 상담',
      description: '10년차 이상의 전담 강사진이 학습 플랜을 개별 설계'
    }
  ]
};

export const CertificateOne = ({ content }) => {
  // props에서 데이터를 가져오고, 없으면 기본값 사용
  const levelTestData = content || defaultContent;
  
  // 텍스트에서 \n을 <br>로 변환하는 함수
  const formatText = (text) => {
    if (!text) return '';
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <section className="td_heading_bg td_shape_section_9">
      <div className="td_shape_position_3 position-absolute" />
      <div className="td_height_112 td_height_lg_75" />
      <div className="container">
        <div
          className="td_section_heading td_style_1 text-center wow fadeInUp"
          data-wow-duration="1s"
          data-wow-delay="0.2s"
        >
          <p className="td_section_subtitle_up td_fs_18 td_semibold td_spacing_1 td_mb_10 text-uppercase td_white_color">
            {levelTestData.subtitle}
          </p>
          <h2 className="td_section_title td_fs_48 mb-0 td_white_color">
            {formatText(levelTestData.title)}
          </h2>
          <p className="td_iconbox_subtitle mb-0 td_fs_14 td_white_color td_opacity_7">
            {formatText(levelTestData.description)}
          </p>
        </div>
        <div className="td_height_50 td_height_lg_50" />

        <div className="row align-items-center td_gap_y_40">
          <div
            className="col-xl-6 wow fadeInLeft"
            data-wow-duration="1s"
            data-wow-delay="0.2s"
          >
            <div className="td_pr_35">
              <img
                src={levelTestData.certificateImage}
                alt="Certificate"
                className="td_radius_5 w-100"
              />
            </div>
          </div>

          <div
            className="col-xl-6 wow fadeInRight"
            data-wow-duration="1s"
            data-wow-delay="0.2s"
          >
            <div className="row td_gap_y_30 td_row_gap_30">
              {levelTestData.achievements?.map((item, index) => (
                <div className="col-md-6" key={item.id || index}>
                  <div className="td_iconbox td_style_4 td_radius_10">
                    <div className="td_iconbox_icon td_mb_16">
                      <img src={item.icon} alt="Achievement Icon" />
                    </div>
                    <h3 className="td_iconbox_title td_fs_24 td_mb_12 td_semibold td_white_color">
                      {item.title}
                    </h3>
                    <p className="td_iconbox_subtitle mb-0 td_fs_14 td_white_color td_opacity_7">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="td_height_120 td_height_lg_80" />
    </section>
  );
};
