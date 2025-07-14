import { AboutThree } from "@/components/about/AboutThree";
import { AppOne } from "@/components/apps/AppOne";
import { BlogThree } from "@/components/blogs/BlogThree";
import { CategoryTwo } from "@/components/category/CategoryTwo";
import { CertificateOne } from "@/components/certificates/CertificateOne";
import CoursesCategoryTabs from "@/components/courses/CoursesCategoryTabs";
import { FeatureTwo } from "@/components/features/FeatureTwo";
import { FunfactOne } from "@/components/fun_facts/FunfactOne";
import { HeroThree } from "@/components/hero/HeroThree";
import { PricingOne } from "@/components/pricing/PricingOne";
import { RateTwo } from "@/components/rates/RateTwo";
import { BecomeAnInstructor } from "@/components/teams/BecomeAnInstructor";
import { TeamTwo } from "@/components/teams/TeamTwo";
import { TestimonialThree } from "@/components/testimonials/TestimonialThree";
import { Layout } from "@/layouts/Layout";
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { logError, logDebug } from '@/utils/logger';

export const dynamic = 'force-dynamic';

// 캐시 재검증 시간 설정 (초 단위, 1시간)
export const revalidate = 3600;

// 캐시 태그 정의
export const dynamicParams = true;

/**
 * 메인 페이지 콘텐츠를 가져오는 함수
 * @returns {Promise<Object>} 섹션별 콘텐츠 객체
 */
async function getMainPageContent() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: async (name) => (await cookies()).get(name)?.value,
        set: () => {
          // 메인 페이지에서는 쿠키 설정을 하지 않음
        },
        remove: () => {
          // 메인 페이지에서는 쿠키 삭제를 하지 않음
        },
      },
    }
  );
  
  // 기본값 정의
  const defaultContent = {
    about: {
      title: '에듀시브만의 차별화된 교육',
      description: '에듀시브는 단순한 학습 플랫폼을 넘어, 학생들의 잠재력을 최대한 끌어올리는 종합 교육 솔루션을 제공합니다.',
      content: '에듀시브는 단순한 학습 플랫폼을 넘어, 학생들의 잠재력을 최대한 끌어올리는 종합 교육 솔루션을 제공합니다.\n\n10년 이상의 노하우를 바탕으로 한 체계적인 커리큘럼과 1:1 맞춤 학습 시스템으로 모든 학생이 자신만의 속도로 성장할 수 있도록 돕습니다.',
      image1: '/home_3/about_img_1.jpg',
      image2: '/home_3/about_img_2.jpg',
      image3: '/home_3/review_img.png',
      stats: {
        value: '3000명+',
        label: '학원 누적 학생수'
      },
      features: [
        {
          icon: '/home_3/feature_icon_1.svg',
          title: '체계적인 커리큘럼',
          description: '전문가들이 설계한 단계별 학습 로드맵으로 체계적으로 학습할 수 있습니다.'
        },
        {
          icon: '/home_3/feature_icon_2.svg',
          title: '1:1 맞춤 학습',
          description: '개인별 학습 성과 분석을 바탕으로 한 맞춤형 학습 전략을 제공합니다.'
        }
      ]
    },
    hero: {
      buttonLink: '/courses-grid-view',
      buttonText: '모든 과정 살펴보기',
      videoUrl: '',
      videoText: '이달의 온라인 특강!'
    },
    reviews: {
      items: [
        {
          id: 1,
          rating: 5,
          text: '모의고사에서 늘 4등급이던 제가 \'풀이 첨삭\' 수업을 8개월 듣고 수능에서 **수학 1등급(백분위 97)**을 받았습니다. 선생님이 문제당 \'왜 이렇게 푸는지\' 근거를 잡아주셔서, 시험장에서 처음 보는 유형도 절대 당황하지 않았어요. 20년 커리큘럼으로 다져진 내신 기출 분석집 덕분에 학교 시험도 전교 1등으로 마무리했습니다.',
          avatar: '/home_1/avatar_1.png',
          name: '김○○',
          description: '고3, 의예과 최종 합격'
        },
        {
          id: 2,
          rating: 5,
          text: '친구 소개로 들어온 뒤부터 수학은 \'외우는 과목\'이 아니라 \'이해하는 과목\'이 되었습니다. 매수업 끝나면 풀이 노트를 빨간 펜으로 샅샅이 코칭해 주시는데, 제 약점 패턴이 한눈에 보여서 스스로 공부 루틴을 디자인할 수 있었어요. 작년 평균 88점에서 올해는 내신 전 과목 100점을 기록했습니다.',
          avatar: '/home_2/avatar_2.png',
          name: '박○○',
          description: '고2, 전교 1등 유지'
        },
        {
          id: 3,
          rating: 4.5,
          text: '중학교 때까지 수학이 두려웠는데, 첫 달부터 \'개념→유형→실전\' 3단계 수업으로 체계가 잡히니까 문제 읽는 속도가 달라졌어요. 4개월 만에 중간·기말 모두 **전교 상위 1%**에 진입했고, 담임 선생님도 \'표정이 달라졌다\'고 하세요. 수업 후 자유롭게 이용할 수 있는 1:1 첨삭룸도 큰 도움이 됐습니다.',
          avatar: '/home_2/avatar_3.png',
          name: '이○○',
          description: '고1, 개념 완성반 수강'
        }
      ]
    },
    levelTest: {
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
    },
    facilities: {
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
    },
    funfacts: {
      items: [
        {
          id: 1,
          icon: '/home_3/funfact_icon_1.svg',
          value: 20,
          suffix: '+년',
          label: '대치동 20년운영 원장직강'
        },
        {
          id: 2,
          icon: '/home_3/funfact_icon_2.svg',
          value: 3000,
          suffix: '+',
          label: '누적학생수'
        },
        {
          id: 3,
          icon: '/home_3/funfact_icon_3.svg',
          value: 90,
          suffix: '%',
          label: '1년이상 재원률'
        },
        {
          id: 4,
          icon: '/home_3/funfact_icon_4.svg',
          value: 10,
          suffix: '+년차',
          label: '검증된 전문 강사진'
        }
      ]
    },
    team_description: {
      subtitle: '수학의 문을 열어드리는 전문 강사진',
      title: '10년 차 이상 수학 전문가가\n개념의 문을 엽니다.',
      description: '수학의 문\' 강사진은 전원 수학 전공·10년 차 이상 경력으로 검증된 전문가입니다. 내신·수능·경시까지, 학생 맞춤형 전략을 제시합니다.\n\n오늘도 우리는 풀이 과정을 교정하며 "왜 이렇게 푸는가"를 끝까지 안내합니다. 탁월한 결과가 나올 수밖에 없는 이유입니다.',
      buttonText: '전체 강사 프로필 보기',
      buttonLink: '/team-members',
      teamMembers: [
        {
          id: 1,
          name: '박 진우',
          designation: '20년 운영 원장직강',
          image: '/home_3/team_member_1.jpg',
          students: 20,
          courses: 2
        },
        {
          id: 2,
          name: 'Yohana Alexa',
          designation: 'Analysis Expert',
          image: '/home_3/team_member_2.jpg',
          students: 20,
          courses: 2
        },
        {
          id: 3,
          name: 'Oshana Alexa',
          designation: 'Asst. Professor',
          image: '/home_3/team_member_3.jpg',
          students: 20,
          courses: 2
        },
        {
          id: 4,
          name: 'Alexandra Alex',
          designation: 'Math Professor',
          image: '/home_3/team_member_4.jpg',
          students: 20,
          courses: 2
        }
      ]
    }
  };

  try {
    const { data, error } = await supabase
      .from('main_page_content')
      .select('*')
      .order('section_name', { ascending: true });

    if (error) {
      logError('메인 페이지 콘텐츠 로드 중 오류 발생:', error);
      return defaultContent;
    }

    // 데이터가 없는 경우 기본값 반환
    if (!data || data.length === 0) {
      logError('데이터베이스에 메인 페이지 콘텐츠가 없습니다. 기본값을 사용합니다.');
      return defaultContent;
    }

    // 데이터 병합
    const dbContent = data.reduce((acc, item) => {
      if (item?.section_name && item.content) {
        // 데이터베이스에서 가져온 값이 있으면 사용, 없으면 기본값 유지
        acc[item.section_name] = {
          ...(defaultContent[item.section_name] || {}),
          ...item.content
        };
      }
      return acc;
    }, {});

    return { ...defaultContent, ...dbContent };
  } catch (error) {
    logError('메인 페이지 콘텐츠 로드 중 예외 발생:', error);
    return defaultContent;
  }
}

export default async function HomeThree() {
  // 서버 컴포넌트에서 Supabase 직접 호출
  const content = await getMainPageContent();
  
  // 콘텐츠 로깅 (개발 환경에서만)
  if (process.env.NODE_ENV === 'development') {
    logDebug('Loaded main page content:', JSON.stringify({
      about: content.about ? 'Content available' : 'No about content',
      hero: content.hero ? 'Content available' : 'No hero content',
      reviews: content.reviews ? 'Content available' : 'No reviews content'
    }, null, 2));
  }

  // hero 섹션에 video 정보 추가 (기본값과 병합)
  const heroContent = {
    buttonLink: "/courses-grid-view",
    buttonText: '모든 과정 살펴보기',
    videoUrl: '',
    videoText: '이달의 온라인 특강!',
    ...content.hero
  };

  // video 정보 설정
  const videoContent = {
    videoUrl: heroContent.videoUrl,
    videoText: heroContent.videoText
  };

  return (
    <Layout header={3} footer={3} bodyClass="td_theme_2">
      {/* hero */}
      <HeroThree content={{
        hero: heroContent,
        video: videoContent
      }} />

      {/* rate */}
      <RateTwo content={content} />

      {/* about */}
      <AboutThree content={content.about} />

      {/* category */}
      <CategoryTwo 
        subtitle={content.categoryTwoHeader?.subtitle}
        title={content.categoryTwoHeader?.title}
      />

      {/* courses */}
      <CoursesCategoryTabs />

      {/* certificate */}
      <CertificateOne content={content.levelTest} />

      {/* testimonial */}
      <TestimonialThree content={content.reviews} />

      {/* feature */}
      <FeatureTwo content={content.facilities} />

      {/* fun facts */}
      <FunfactOne content={content.funfacts} />

      {/* pricing */}
      {/*<PricingOne />*/}

      {/* expert team */}
      <TeamTwo content={content.team_description} />

      {/* instructor */}
      {/* <BecomeAnInstructor /> */}

      {/* app */}
      {/*<AppOne />*/}

      {/* blog */}
      <BlogThree />
    </Layout>
  );
}
