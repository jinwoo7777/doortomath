// 자동 채점 관리 목업 데이터 10개 생성 스크립트
const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 목업 데이터 10개 생성
const mockData = [
  {
    exam_date: '2024-01-15',
    subject: '수학',
    exam_type: 'midterm',
    exam_title: '2024년 1월 수학 중간고사',
    exam_description: '중학교 2학년 수학 중간고사 답안지입니다. 방정식과 함수 단원을 중심으로 출제되었습니다.',
    total_score: 100,
    answers: [
      { question: 1, answer: '②', score: 5, description: '일차방정식의 해 구하기' },
      { question: 2, answer: '3', score: 4, description: '이차방정식의 근과 계수의 관계' },
      { question: 3, answer: '①', score: 6, description: '함수의 그래프 해석' },
      { question: 4, answer: '12', score: 5, description: '연립방정식의 해' },
      { question: 5, answer: '④', score: 4, description: '부등식의 해집합' },
      { question: 6, answer: '2/3', score: 6, description: '분수 방정식의 해' },
      { question: 7, answer: '①', score: 5, description: '함수의 정의역과 치역' },
      { question: 8, answer: '5', score: 4, description: '이차함수의 최댓값' },
      { question: 9, answer: '③', score: 6, description: '함수의 합성' },
      { question: 10, answer: '8', score: 5, description: '방정식의 실근' },
      { question: 11, answer: '②', score: 4, description: '부등식의 그래프' },
      { question: 12, answer: '√2', score: 6, description: '무리방정식의 해' },
      { question: 13, answer: '④', score: 5, description: '함수의 역함수' },
      { question: 14, answer: '9', score: 4, description: '이차방정식의 판별식' },
      { question: 15, answer: '①', score: 6, description: '함수의 증감' },
      { question: 16, answer: '4', score: 5, description: '연립부등식의 해' },
      { question: 17, answer: '③', score: 4, description: '함수의 대칭성' },
      { question: 18, answer: '1/2', score: 6, description: '분수함수의 점근선' },
      { question: 19, answer: '②', score: 5, description: '절댓값 함수' },
      { question: 20, answer: '7', score: 4, description: '방정식의 해의 개수' }
    ]
  },
  {
    exam_date: '2024-01-20',
    subject: '물리',
    exam_type: 'final',
    exam_title: '2024년 1월 물리 기말고사',
    exam_description: '고등학교 1학년 물리 기말고사 답안지입니다. 역학과 열역학을 중심으로 출제되었습니다.',
    total_score: 120,
    answers: [
      { question: 1, answer: '④', score: 6, description: '등속직선운동의 속도-시간 그래프' },
      { question: 2, answer: '20m/s', score: 8, description: '등가속도운동의 속도 계산' },
      { question: 3, answer: '②', score: 6, description: '뉴턴의 제2법칙' },
      { question: 4, answer: '50N', score: 8, description: '힘의 평형' },
      { question: 5, answer: '③', score: 6, description: '원운동의 구심력' },
      { question: 6, answer: '9.8m/s²', score: 8, description: '자유낙하운동의 가속도' },
      { question: 7, answer: '①', score: 6, description: '운동량 보존법칙' },
      { question: 8, answer: '120J', score: 8, description: '일과 에너지' },
      { question: 9, answer: '④', score: 6, description: '탄성충돌과 비탄성충돌' },
      { question: 10, answer: '25m', score: 8, description: '포물선운동의 최고점' },
      { question: 11, answer: '②', score: 6, description: '열역학 제1법칙' },
      { question: 12, answer: '300K', score: 8, description: '절대온도와 섭씨온도' },
      { question: 13, answer: '③', score: 6, description: '열전도와 열대류' },
      { question: 14, answer: '4200J', score: 8, description: '비열과 열량' },
      { question: 15, answer: '①', score: 6, description: '이상기체의 상태방정식' }
    ]
  },
  {
    exam_date: '2024-01-25',
    subject: '화학',
    exam_type: 'quiz',
    exam_title: '2024년 1월 화학 퀴즈',
    exam_description: '원소의 주기율표와 화학결합에 대한 퀴즈입니다.',
    total_score: 50,
    answers: [
      { question: 1, answer: '③', score: 5, description: '주기율표의 주기와 족' },
      { question: 2, answer: '18', score: 5, description: '원소의 원자번호' },
      { question: 3, answer: '①', score: 5, description: '이온결합의 특성' },
      { question: 4, answer: '공유결합', score: 5, description: '분자 간 결합의 종류' },
      { question: 5, answer: '④', score: 5, description: '전자배치의 규칙' },
      { question: 6, answer: '8', score: 5, description: '최외각전자의 개수' },
      { question: 7, answer: '②', score: 5, description: '원소의 금속성과 비금속성' },
      { question: 8, answer: 'H₂O', score: 5, description: '분자식 표기법' },
      { question: 9, answer: '③', score: 5, description: '산화수의 개념' },
      { question: 10, answer: '극성', score: 5, description: '분자의 극성' }
    ]
  },
  {
    exam_date: '2024-02-01',
    subject: '생물',
    exam_type: 'regular',
    exam_title: '2024년 2월 생물 정기시험',
    exam_description: '세포의 구조와 기능에 대한 정기시험입니다.',
    total_score: 80,
    answers: [
      { question: 1, answer: '②', score: 6, description: '세포막의 구조' },
      { question: 2, answer: '미토콘드리아', score: 6, description: '세포의 발전소' },
      { question: 3, answer: '④', score: 6, description: '핵의 기능' },
      { question: 4, answer: '리보솜', score: 6, description: '단백질 합성 장소' },
      { question: 5, answer: '①', score: 6, description: '세포분열의 과정' },
      { question: 6, answer: '23', score: 6, description: '인간의 염색체 수' },
      { question: 7, answer: '③', score: 6, description: 'DNA의 구조' },
      { question: 8, answer: 'RNA', score: 6, description: '전사 과정의 산물' },
      { question: 9, answer: '②', score: 6, description: '효소의 특성' },
      { question: 10, answer: '세포질', score: 6, description: '세포 내 물질 이동' },
      { question: 11, answer: '④', score: 6, description: '광합성의 과정' },
      { question: 12, answer: '산소', score: 6, description: '호흡 과정에서 사용되는 기체' },
      { question: 13, answer: '①', score: 6, description: '세포의 항상성' },
      { question: 14, answer: '삼투', score: 2, description: '물의 이동 원리' }
    ]
  },
  {
    exam_date: '2024-02-05',
    subject: '영어',
    exam_type: 'midterm',
    exam_title: '2024년 2월 영어 중간고사',
    exam_description: '문법과 독해를 중심으로 한 영어 중간고사입니다.',
    total_score: 100,
    answers: [
      { question: 1, answer: '③', score: 4, description: '현재완료시제' },
      { question: 2, answer: 'have been', score: 4, description: '수동태 완료형' },
      { question: 3, answer: '①', score: 4, description: '관계대명사 용법' },
      { question: 4, answer: 'which', score: 4, description: '관계대명사 선택' },
      { question: 5, answer: '④', score: 4, description: '가정법 과거' },
      { question: 6, answer: 'would have', score: 4, description: '가정법 과거완료' },
      { question: 7, answer: '②', score: 4, description: '분사구문' },
      { question: 8, answer: 'Being', score: 4, description: '분사의 용법' },
      { question: 9, answer: '③', score: 4, description: '도치구문' },
      { question: 10, answer: 'Never', score: 4, description: '부정어 도치' },
      { question: 11, answer: '①', score: 4, description: '독해 - 주제' },
      { question: 12, answer: '④', score: 4, description: '독해 - 빈칸추론' },
      { question: 13, answer: '②', score: 4, description: '독해 - 어법' },
      { question: 14, answer: '③', score: 4, description: '독해 - 내용일치' },
      { question: 15, answer: '①', score: 4, description: '독해 - 제목' },
      { question: 16, answer: '④', score: 4, description: '독해 - 글의 순서' },
      { question: 17, answer: '②', score: 4, description: '독해 - 문장삽입' },
      { question: 18, answer: '③', score: 4, description: '독해 - 요약' },
      { question: 19, answer: '①', score: 4, description: '독해 - 함축의미' },
      { question: 20, answer: '④', score: 4, description: '독해 - 전체맥락' },
      { question: 21, answer: '②', score: 4, description: '어휘 - 유의어' },
      { question: 22, answer: '③', score: 4, description: '어휘 - 반의어' },
      { question: 23, answer: '①', score: 4, description: '어휘 - 문맥상 의미' },
      { question: 24, answer: '④', score: 4, description: '어휘 - 적절한 표현' },
      { question: 25, answer: '②', score: 4, description: '어휘 - 연어관계' }
    ]
  },
  {
    exam_date: '2024-02-10',
    subject: '국어',
    exam_type: 'final',
    exam_title: '2024년 2월 국어 기말고사',
    exam_description: '문학과 문법을 중심으로 한 국어 기말고사입니다.',
    total_score: 110,
    answers: [
      { question: 1, answer: '③', score: 5, description: '현대시의 화자와 상황' },
      { question: 2, answer: '은유법', score: 5, description: '시어의 함축적 의미' },
      { question: 3, answer: '①', score: 5, description: '시상 전개 과정' },
      { question: 4, answer: '④', score: 5, description: '화자의 정서' },
      { question: 5, answer: '②', score: 5, description: '표현 기법' },
      { question: 6, answer: '의인법', score: 5, description: '수사법의 종류' },
      { question: 7, answer: '③', score: 5, description: '고전소설의 배경' },
      { question: 8, answer: '①', score: 5, description: '인물의 성격' },
      { question: 9, answer: '④', score: 5, description: '갈등 구조' },
      { question: 10, answer: '②', score: 5, description: '서술자의 시점' },
      { question: 11, answer: '③', score: 5, description: '주제 의식' },
      { question: 12, answer: '사설시조', score: 5, description: '갈래와 성격' },
      { question: 13, answer: '①', score: 5, description: '품사의 분류' },
      { question: 14, answer: '④', score: 5, description: '문장 성분' },
      { question: 15, answer: '②', score: 5, description: '어미의 종류' },
      { question: 16, answer: '능동태', score: 5, description: '문장의 형태' },
      { question: 17, answer: '③', score: 5, description: '높임법' },
      { question: 18, answer: '①', score: 5, description: '문체의 특성' },
      { question: 19, answer: '④', score: 5, description: '단어의 형성' },
      { question: 20, answer: '②', score: 5, description: '음성 변화' },
      { question: 21, answer: '③', score: 5, description: '어휘의 체계' },
      { question: 22, answer: '①', score: 5, description: '문법 요소의 기능' }
    ]
  },
  {
    exam_date: '2024-02-15',
    subject: '수학',
    exam_type: 'quiz',
    exam_title: '2024년 2월 수학 퀴즈',
    exam_description: '삼각함수와 지수로그함수에 대한 퀴즈입니다.',
    total_score: 40,
    answers: [
      { question: 1, answer: '②', score: 4, description: '삼각함수의 정의' },
      { question: 2, answer: '1', score: 4, description: 'sin²θ + cos²θ의 값' },
      { question: 3, answer: '③', score: 4, description: '삼각함수의 그래프' },
      { question: 4, answer: 'π/6', score: 4, description: '삼각함수의 주기' },
      { question: 5, answer: '④', score: 4, description: '삼각함수의 덧셈공식' },
      { question: 6, answer: '②', score: 4, description: '지수법칙' },
      { question: 7, answer: '8', score: 4, description: '지수방정식의 해' },
      { question: 8, answer: '①', score: 4, description: '로그의 정의' },
      { question: 9, answer: '3', score: 4, description: '로그방정식의 해' },
      { question: 10, answer: '③', score: 4, description: '로그함수의 그래프' }
    ]
  },
  {
    exam_date: '2024-02-20',
    subject: '물리',
    exam_type: 'regular',
    exam_title: '2024년 2월 물리 정기시험',
    exam_description: '파동과 전자기학에 대한 정기시험입니다.',
    total_score: 90,
    answers: [
      { question: 1, answer: '①', score: 6, description: '파동의 성질' },
      { question: 2, answer: '340m/s', score: 6, description: '음파의 속도' },
      { question: 3, answer: '④', score: 6, description: '파동의 간섭' },
      { question: 4, answer: '②', score: 6, description: '도플러 효과' },
      { question: 5, answer: '③', score: 6, description: '전자기파의 성질' },
      { question: 6, answer: '3×10⁸m/s', score: 6, description: '빛의 속도' },
      { question: 7, answer: '①', score: 6, description: '쿨롱의 법칙' },
      { question: 8, answer: '④', score: 6, description: '전기장의 세기' },
      { question: 9, answer: '②', score: 6, description: '전위와 전위차' },
      { question: 10, answer: '6V', score: 6, description: '옴의 법칙' },
      { question: 11, answer: '③', score: 6, description: '자기장의 방향' },
      { question: 12, answer: '①', score: 6, description: '전자기 유도' },
      { question: 13, answer: '④', score: 6, description: '렌츠의 법칙' },
      { question: 14, answer: '②', score: 6, description: '교류와 직류' },
      { question: 15, answer: '③', score: 6, description: '변압기의 원리' }
    ]
  },
  {
    exam_date: '2024-02-25',
    subject: '화학',
    exam_type: 'midterm',
    exam_title: '2024년 2월 화학 중간고사',
    exam_description: '산과 염기, 화학반응에 대한 중간고사입니다.',
    total_score: 95,
    answers: [
      { question: 1, answer: '②', score: 5, description: '산과 염기의 정의' },
      { question: 2, answer: '7', score: 5, description: '순수한 물의 pH' },
      { question: 3, answer: '④', score: 5, description: '지시약의 색깔 변화' },
      { question: 4, answer: '③', score: 5, description: '중화반응' },
      { question: 5, answer: '①', score: 5, description: '염의 가수분해' },
      { question: 6, answer: 'NaCl', score: 5, description: '중성염의 예' },
      { question: 7, answer: '②', score: 5, description: '산화와 환원' },
      { question: 8, answer: '+3', score: 5, description: '산화수 계산' },
      { question: 9, answer: '④', score: 5, description: '전기분해' },
      { question: 10, answer: '③', score: 5, description: '갈바니 전지' },
      { question: 11, answer: '①', score: 5, description: '화학반응속도' },
      { question: 12, answer: '촉매', score: 5, description: '반응속도에 영향을 주는 요인' },
      { question: 13, answer: '②', score: 5, description: '화학평형' },
      { question: 14, answer: '④', score: 5, description: '르샤틀리에 원리' },
      { question: 15, answer: '③', score: 5, description: '평형상수' },
      { question: 16, answer: '①', score: 5, description: '용해도곱' },
      { question: 17, answer: '②', score: 5, description: '몰농도 계산' },
      { question: 18, answer: '25', score: 5, description: '화학반응식 계수' },
      { question: 19, answer: '④', score: 5, description: '기체의 성질' }
    ]
  },
  {
    exam_date: '2024-03-01',
    subject: '생물',
    exam_type: 'final',
    exam_title: '2024년 3월 생물 기말고사',
    exam_description: '유전과 진화에 대한 기말고사입니다.',
    total_score: 105,
    answers: [
      { question: 1, answer: '③', score: 5, description: '멘델의 법칙' },
      { question: 2, answer: '①', score: 5, description: '우성과 열성' },
      { question: 3, answer: '④', score: 5, description: '유전자형과 표현형' },
      { question: 4, answer: '9:3:3:1', score: 5, description: '이인자잡종의 분리비' },
      { question: 5, answer: '②', score: 5, description: '반성유전' },
      { question: 6, answer: '③', score: 5, description: '연관과 교차' },
      { question: 7, answer: '①', score: 5, description: 'DNA 복제' },
      { question: 8, answer: '④', score: 5, description: '전사와 번역' },
      { question: 9, answer: 'mRNA', score: 5, description: '유전정보의 전달' },
      { question: 10, answer: '②', score: 5, description: '돌연변이' },
      { question: 11, answer: '③', score: 5, description: '자연선택' },
      { question: 12, answer: '①', score: 5, description: '진화의 증거' },
      { question: 13, answer: '④', score: 5, description: '종 분화' },
      { question: 14, answer: '②', score: 5, description: '생태계의 구조' },
      { question: 15, answer: '③', score: 5, description: '개체군의 성장' },
      { question: 16, answer: '①', score: 5, description: '생물다양성' },
      { question: 17, answer: '④', score: 5, description: '에너지 흐름' },
      { question: 18, answer: '②', score: 5, description: '물질 순환' },
      { question: 19, answer: '③', score: 5, description: '생태계 평형' },
      { question: 20, answer: '①', score: 5, description: '환경 보전' },
      { question: 21, answer: '④', score: 5, description: '생명공학' }
    ]
  }
];

// 데이터베이스에 삽입하는 함수
async function insertMockData() {
  console.log('자동 채점 관리 목업 데이터 10개 생성을 시작합니다...');
  
  try {
    // 1. 기존 데이터 확인
    const { data: existingData } = await supabase
      .from('exam_answer_keys')
      .select('id')
      .limit(5);
    
    console.log(`기존 데이터: ${existingData?.length || 0}개`);
    
    // 2. 목업 데이터 삽입
    console.log(`${mockData.length}개의 목업 데이터를 삽입합니다...`);
    
    const { data, error } = await supabase
      .from('exam_answer_keys')
      .insert(mockData)
      .select();
    
    if (error) {
      console.error('데이터 삽입 중 오류 발생:', error);
      return;
    }
    
    console.log(`✅ 성공적으로 ${data.length}개의 목업 데이터를 생성했습니다!`);
    
    // 3. 생성된 데이터 통계
    const stats = {
      total: data.length,
      byExamType: {},
      bySubject: {},
      totalQuestions: 0,
      totalScore: 0
    };
    
    data.forEach(item => {
      const examTypeLabels = {
        'midterm': '중간고사',
        'final': '기말고사',
        'quiz': '퀴즈',
        'regular': '정기시험'
      };
      
      const examTypeLabel = examTypeLabels[item.exam_type] || item.exam_type;
      stats.byExamType[examTypeLabel] = (stats.byExamType[examTypeLabel] || 0) + 1;
      stats.bySubject[item.subject] = (stats.bySubject[item.subject] || 0) + 1;
      stats.totalQuestions += item.answers.length;
      stats.totalScore += item.total_score;
    });
    
    console.log('\n📊 생성된 목업 데이터 통계:');
    console.log(`총 답안 키: ${stats.total}개`);
    console.log(`총 문제 수: ${stats.totalQuestions}개`);
    console.log(`총 점수: ${stats.totalScore}점`);
    console.log(`평균 문제 수: ${Math.round(stats.totalQuestions / stats.total)}개`);
    console.log(`평균 점수: ${Math.round(stats.totalScore / stats.total)}점`);
    
    console.log('\n📋 시험 유형별 분포:');
    Object.entries(stats.byExamType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}개`);
    });
    
    console.log('\n📚 과목별 분포:');
    Object.entries(stats.bySubject).forEach(([subject, count]) => {
      console.log(`  ${subject}: ${count}개`);
    });
    
    console.log('\n📝 생성된 목업 데이터 목록:');
    data.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.exam_title} (${item.subject}) - ${item.answers.length}문제, ${item.total_score}점`);
    });
    
  } catch (error) {
    console.error('목업 데이터 생성 중 오류 발생:', error);
  }
}

// 실행
if (require.main === module) {
  insertMockData();
}

module.exports = { insertMockData, mockData };