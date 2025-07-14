// 학원 소개 섹션의 기본 데이터
export const DEFAULT_ABOUT = {
  title: '에듀시브만의 차별화된 교육',
  content: '에듀시브는 단순한 학습 플랫폼을 넘어, 학생들의 잠재력을 최대한 끌어올리는 종합 교육 솔루션을 제공합니다.\n\n10년 이상의 노하우를 바탕으로 한 체계적인 커리큘럼과 1:1 맞춤 학습 시스템으로 모든 학생이 자신만의 속도로 성장할 수 있도록 돕습니다.',
  image1: '/home_3/about_img_1.jpg',
  image2: '/home_3/about_img_2.jpg',
  image3: '/home_3/review_img.png',
  images: [
    '/home_3/about_img_1.jpg',
    '/home_3/about_img_2.jpg',
    '/home_3/review_img.png'
  ],
  stats: {
    value: '3000명+',
    label: '학원 누적 학생수'
  },
  features: [
    {
      id: 1,
      icon: '/home_3/feature_icon_1.svg',
      title: '체계적인 커리큘럼',
      description: '전문가들이 설계한 단계별 학습 로드맵으로 체계적으로 학습할 수 있습니다.'
    },
    {
      id: 2,
      icon: '/home_3/feature_icon_2.svg',
      title: '1:1 맞춤 학습',
      description: '개인별 학습 성과 분석을 바탕으로 한 맞춤형 학습 전략을 제공합니다.'
    }
  ]
};

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Supabase 클라이언트 초기화
const supabase = createClientComponentClient();

// 데이터베이스에서 about 섹션 데이터를 가져오는 함수
export const fetchAboutData = async () => {
  try {
    // API 라우트 대신 Supabase 클라이언트를 직접 사용
    const { data, error } = await supabase
      .from('main_page_content')
      .select('*')
      .eq('section_name', 'about')
      .single(); // 'about' 섹션만 가져오도록 변경

    if (error) {
      console.error('Supabase fetch error:', error);
      throw new Error(error.message || '데이터를 불러오는 데 실패했습니다.');
    }

    if (!data) {
      console.log('No about data found, returning null');
      return null;
    }

    const content = data.content; // 'content' 필드에 실제 데이터가 있다고 가정

    // 데이터 형식 검증 및 기본값 설정
    return {
      title: content.title || '',
      content: content.content || '',
      image1: content.image1 || '',
      image2: content.image2 || '',
      image3: content.image3 || '',
      images: Array.isArray(content.images) ? content.images : [
        content.image1 || '',
        content.image2 || '',
        content.image3 || ''
      ].filter(Boolean),
      stats: content.stats || { value: '3000명+', label: '학원 누적 학생수' },
      features: Array.isArray(content.features) ? content.features : []
    };
  } catch (error) {
    console.error('Error fetching about data:', error);
    throw error;
  }
};

// 데이터베이스에 about 섹션 데이터를 저장/업데이트하는 함수
export const saveAboutData = async (content) => {
  try {
    console.log('Saving about data:', content);

    // 1. 데이터 유효성 검사
    if (!content) {
      throw new Error('저장할 내용이 없습니다.');
    }

    const saveData = {
      section_name: 'about',
      content: {
        title: content.title || '에듀시브만의 차별화된 교육',
        content: content.content || '',
        image1: content.image1 || '',
        image2: content.image2 || '',
        image3: content.image3 || '',
        images: content.images || [],
        stats: content.stats || { value: '3000명+', label: '학원 누적 학생수' },
        features: content.features || []
      },
      updated_at: new Date().toISOString(),
    };

    console.log('Formatted data for save:', JSON.stringify(saveData, null, 2));

    // API 라우트 대신 Supabase 클라이언트를 직접 사용
    const { data, error: rpcError } = await supabase.rpc('update_main_page_content', {
      p_section_name: saveData.section_name,
      p_content: saveData.content
    });

    if (rpcError) {
      console.error('Supabase RPC error:', rpcError);
      throw new Error(rpcError.message || '내용을 저장하는 데 실패했습니다.');
    }

    console.log('About data saved successfully:', data);
    return {
      success: true,
      message: '학원 소개 데이터가 성공적으로 저장되었습니다.',
      content: saveData.content // 저장된 내용을 반환
    };

  } catch (error) {
    console.error('Error in saveAboutData:', error);
    throw error;
  }
};
