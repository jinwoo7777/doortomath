// 시설 섹션의 기본 데이터
export const DEFAULT_FACILITIES = {
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
};

// 통계 정보 섹션의 기본 데이터
export const DEFAULT_FUNFACTS = {
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
};

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Supabase 클라이언트 초기화
const supabase = createClientComponentClient();

// 데이터베이스에서 facilities 섹션 데이터를 가져오는 함수
export const fetchFacilitiesData = async () => {
  try {
    const { data, error } = await supabase
      .from('main_page_content')
      .select('*')
      .eq('section_name', 'facilities')
      .maybeSingle();

    if (error) {
      console.error('Supabase fetch error:', error);
      throw new Error(error.message || '데이터를 불러오는 데 실패했습니다.');
    }

    if (!data) {
      console.log('No facilities data found, returning null');
      return null;
    }

    const content = data.content;

    // 데이터 형식 검증 및 기본값 설정
    return {
      title: content.title || DEFAULT_FACILITIES.title,
      subtitle: content.subtitle || DEFAULT_FACILITIES.subtitle,
      backgroundImage: content.backgroundImage || DEFAULT_FACILITIES.backgroundImage,
      videoUrl: content.videoUrl || DEFAULT_FACILITIES.videoUrl,
      features: Array.isArray(content.features) ? content.features : DEFAULT_FACILITIES.features
    };
  } catch (error) {
    console.error('Error fetching facilities data:', error);
    // 에러가 발생해도 null을 반환하여 기본값을 사용하도록 함
    return null;
  }
};

// 데이터베이스에서 funfacts 섹션 데이터를 가져오는 함수
export const fetchFunfactsData = async () => {
  try {
    const { data, error } = await supabase
      .from('main_page_content')
      .select('*')
      .eq('section_name', 'funfacts')
      .maybeSingle();

    if (error) {
      console.error('Supabase fetch error:', error);
      throw new Error(error.message || '데이터를 불러오는 데 실패했습니다.');
    }

    if (!data) {
      console.log('No funfacts data found, returning null');
      return null;
    }

    const content = data.content;

    // 데이터 형식 검증 및 기본값 설정
    return {
      items: Array.isArray(content.items) ? content.items : DEFAULT_FUNFACTS.items
    };
  } catch (error) {
    console.error('Error fetching funfacts data:', error);
    // 에러가 발생해도 null을 반환하여 기본값을 사용하도록 함
    return null;
  }
};

// 데이터베이스에 facilities 섹션 데이터를 저장/업데이트하는 함수
export const saveFacilitiesData = async (content) => {
  try {
    console.log('Saving facilities data:', content);

    // 1. 데이터 유효성 검사
    if (!content) {
      throw new Error('저장할 내용이 없습니다.');
    }

    const saveData = {
      section_name: 'facilities',
      content: {
        title: content.title || DEFAULT_FACILITIES.title,
        subtitle: content.subtitle || DEFAULT_FACILITIES.subtitle,
        backgroundImage: content.backgroundImage || DEFAULT_FACILITIES.backgroundImage,
        videoUrl: content.videoUrl || DEFAULT_FACILITIES.videoUrl,
        features: content.features || DEFAULT_FACILITIES.features
      },
      updated_at: new Date().toISOString(),
    };

    console.log('Formatted data for save:', JSON.stringify(saveData, null, 2));

    const { data, error: rpcError } = await supabase.rpc('update_main_page_content', {
      p_section_name: saveData.section_name,
      p_content: saveData.content
    });

    if (rpcError) {
      console.error('Supabase RPC error:', rpcError);
      throw new Error(rpcError.message || '내용을 저장하는 데 실패했습니다.');
    }

    console.log('Facilities data saved successfully:', data);
    return {
      success: true,
      message: '시설 데이터가 성공적으로 저장되었습니다.',
      content: saveData.content
    };

  } catch (error) {
    console.error('Error in saveFacilitiesData:', error);
    throw error;
  }
};

// 데이터베이스에 funfacts 섹션 데이터를 저장/업데이트하는 함수
export const saveFunfactsData = async (content) => {
  try {
    console.log('Saving funfacts data:', content);

    // 1. 데이터 유효성 검사
    if (!content) {
      throw new Error('저장할 내용이 없습니다.');
    }

    const saveData = {
      section_name: 'funfacts',
      content: {
        items: content.items || DEFAULT_FUNFACTS.items
      },
      updated_at: new Date().toISOString(),
    };

    console.log('Formatted data for save:', JSON.stringify(saveData, null, 2));

    const { data, error: rpcError } = await supabase.rpc('update_main_page_content', {
      p_section_name: saveData.section_name,
      p_content: saveData.content
    });

    if (rpcError) {
      console.error('Supabase RPC error:', rpcError);
      throw new Error(rpcError.message || '내용을 저장하는 데 실패했습니다.');
    }

    console.log('Funfacts data saved successfully:', data);
    return {
      success: true,
      message: '통계 정보가 성공적으로 저장되었습니다.',
      content: saveData.content
    };

  } catch (error) {
    console.error('Error in saveFunfactsData:', error);
    throw error;
  }
}; 