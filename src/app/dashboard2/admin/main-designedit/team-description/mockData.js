// 팀 소개 섹션의 기본 데이터
export const DEFAULT_TEAM_DESCRIPTION = {
  // 좌측 콘텐츠
  subtitle: '수학의 문을 열어드리는 전문 강사진',
  title: '10년 차 이상 수학 전문가가\n개념의 문을 엽니다.',
  description: '수학의 문\' 강사진은 전원 수학 전공·10년 차 이상 경력으로 검증된 전문가입니다. 내신·수능·경시까지, 학생 맞춤형 전략을 제시합니다.\n\n오늘도 우리는 풀이 과정을 교정하며 "왜 이렇게 푸는가"를 끝까지 안내합니다. 탁월한 결과가 나올 수밖에 없는 이유입니다.',
  buttonText: '전체 강사 프로필 보기',
  buttonLink: '/team-members',
  
  // 팀 멤버들
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
};

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Supabase 클라이언트 초기화
const supabase = createClientComponentClient();

// 데이터베이스에서 team_description 섹션 데이터를 가져오는 함수
export const fetchTeamDescriptionData = async () => {
  try {
    const { data, error } = await supabase
      .from('main_page_content')
      .select('*')
      .eq('section_name', 'team_description')
      .maybeSingle();

    if (error) {
      console.error('Supabase fetch error:', error);
      throw new Error(error.message || '데이터를 불러오는 데 실패했습니다.');
    }

    if (!data) {
      console.log('No team_description data found, returning null');
      return null;
    }

    const content = data.content;

    // 데이터 형식 검증 및 기본값 설정
    return {
      subtitle: content.subtitle || DEFAULT_TEAM_DESCRIPTION.subtitle,
      title: content.title || DEFAULT_TEAM_DESCRIPTION.title,
      description: content.description || DEFAULT_TEAM_DESCRIPTION.description,
      buttonText: content.buttonText || DEFAULT_TEAM_DESCRIPTION.buttonText,
      buttonLink: content.buttonLink || DEFAULT_TEAM_DESCRIPTION.buttonLink,
      teamMembers: Array.isArray(content.teamMembers) ? content.teamMembers : DEFAULT_TEAM_DESCRIPTION.teamMembers
    };
  } catch (error) {
    console.error('Error fetching team_description data:', error);
    // 에러가 발생해도 null을 반환하여 기본값을 사용하도록 함
    return null;
  }
};

// 데이터베이스에 team_description 섹션 데이터를 저장/업데이트하는 함수
export const saveTeamDescriptionData = async (content) => {
  try {
    console.log('Saving team_description data:', content);

    // 1. 데이터 유효성 검사
    if (!content) {
      throw new Error('저장할 내용이 없습니다.');
    }

    const saveData = {
      section_name: 'team_description',
      content: {
        subtitle: content.subtitle || DEFAULT_TEAM_DESCRIPTION.subtitle,
        title: content.title || DEFAULT_TEAM_DESCRIPTION.title,
        description: content.description || DEFAULT_TEAM_DESCRIPTION.description,
        buttonText: content.buttonText || DEFAULT_TEAM_DESCRIPTION.buttonText,
        buttonLink: content.buttonLink || DEFAULT_TEAM_DESCRIPTION.buttonLink,
        teamMembers: content.teamMembers || DEFAULT_TEAM_DESCRIPTION.teamMembers
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

    console.log('Team description data saved successfully:', data);
    return {
      success: true,
      message: '팀 소개가 성공적으로 저장되었습니다.',
      content: saveData.content
    };

  } catch (error) {
    console.error('Error in saveTeamDescriptionData:', error);
    throw error;
  }
}; 