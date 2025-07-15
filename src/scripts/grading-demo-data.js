// 자동 채점 관리 데모 데이터 생성 스크립트
const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 가능한 답안 배열 (실제 수학 문제 답안들)
const possibleAnswers = [
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
  '①', '②', '③', '④', '⑤',
  'A', 'B', 'C', 'D', 'E',
  '참', '거짓', 'True', 'False',
  '0', '-1', '1/2', '2/3', '3/4', '√2', '√3',
  '무한대', '정의되지 않음', '존재하지 않음'
];

// 시험 유형별 정보
const examTypes = {
  regular: { label: '정기시험', scoreRange: [3, 8] },
  midterm: { label: '중간고사', scoreRange: [5, 10] },
  final: { label: '기말고사', scoreRange: [5, 12] },
  quiz: { label: '퀴즈', scoreRange: [2, 5] }
};

// 과목별 정보
const subjects = ['수학', '물리', '화학', '생물', '영어', '국어'];

// 문제 설명 템플릿
const descriptionTemplates = [
  '이차방정식의 해를 구하는 문제',
  '미분과 적분의 기본 개념',
  '삼각함수의 성질과 활용',
  '확률과 통계의 기본 원리',
  '벡터의 내적과 외적',
  '함수의 극한과 연속성',
  '도함수의 활용',
  '정적분의 계산',
  '수열의 극한',
  '복소수의 성질',
  '로그함수의 성질',
  '지수함수의 그래프',
  '원의 방정식',
  '직선의 방정식',
  '포물선의 성질',
  '타원의 방정식',
  '쌍곡선의 성질',
  '부등식의 해',
  '절댓값 함수',
  '역함수의 성질'
];

// 랜덤 날짜 생성 (최근 6개월)
function getRandomDate() {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 6);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// 랜덤 답안 생성
function generateRandomAnswers(count, examType) {
  const answers = [];
  const scoreRange = examTypes[examType].scoreRange;
  
  for (let i = 1; i <= count; i++) {
    const score = Math.floor(Math.random() * (scoreRange[1] - scoreRange[0] + 1)) + scoreRange[0];
    const answer = possibleAnswers[Math.floor(Math.random() * possibleAnswers.length)];
    const description = Math.random() > 0.3 ? 
      descriptionTemplates[Math.floor(Math.random() * descriptionTemplates.length)] : '';
    
    answers.push({
      question: i,
      answer: answer,
      score: score,
      description: description
    });
  }
  
  return answers;
}

// 데모 데이터 생성
async function generateDemoData() {
  console.log('자동 채점 관리 데모 데이터 생성을 시작합니다...');
  
  try {
    // 1. 기존 데이터 확인
    const { data: existingData } = await supabase
      .from('exam_answer_keys')
      .select('id')
      .limit(1);
    
    if (existingData && existingData.length > 0) {
      console.log('기존 데이터가 있습니다. 추가 데이터를 생성합니다.');
    }
    
    // 2. 강사 및 스케줄 데이터 확인
    const { data: teachers } = await supabase
      .from('teachers')
      .select('id, name')
      .eq('is_active', true);
    
    const { data: schedules } = await supabase
      .from('schedules')
      .select('id, subject, grade, teacher_name')
      .eq('is_active', true);
    
    if (!teachers || teachers.length === 0) {
      console.log('강사 데이터가 없습니다. 먼저 강사 데이터를 생성해주세요.');
      return;
    }
    
    if (!schedules || schedules.length === 0) {
      console.log('스케줄 데이터가 없습니다. 먼저 스케줄 데이터를 생성해주세요.');
      return;
    }
    
    // 3. 답안 키 데이터 생성
    const answerKeys = [];
    const examTypeKeys = Object.keys(examTypes);
    
    for (let i = 0; i < 25; i++) {
      const teacher = teachers[Math.floor(Math.random() * teachers.length)];
      const schedule = schedules[Math.floor(Math.random() * schedules.length)];
      const examType = examTypeKeys[Math.floor(Math.random() * examTypeKeys.length)];
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const examDate = getRandomDate();
      
      // 답안 개수 랜덤 생성 (50-100개)
      const answerCount = Math.floor(Math.random() * 51) + 50;
      const answers = generateRandomAnswers(answerCount, examType);
      const totalScore = answers.reduce((sum, answer) => sum + answer.score, 0);
      
      const answerKey = {
        exam_date: examDate.toISOString().split('T')[0],
        subject: subject,
        teacher_id: teacher.id,
        schedule_id: schedule.id,
        exam_type: examType,
        exam_title: `${examDate.getFullYear()}년 ${examDate.getMonth() + 1}월 ${subject} ${examTypes[examType].label}`,
        exam_description: `${teacher.name} 강사의 ${subject} ${examTypes[examType].label} 답안 키입니다. 총 ${answerCount}문제로 구성되어 있습니다.`,
        total_score: totalScore,
        answers: answers
      };
      
      answerKeys.push(answerKey);
    }
    
    // 4. 데이터베이스에 삽입
    console.log(`${answerKeys.length}개의 답안 키 데이터를 생성합니다...`);
    
    const { data, error } = await supabase
      .from('exam_answer_keys')
      .insert(answerKeys)
      .select();
    
    if (error) {
      console.error('데이터 삽입 중 오류 발생:', error);
      return;
    }
    
    console.log(`✅ 성공적으로 ${data.length}개의 답안 키 데이터를 생성했습니다!`);
    
    // 5. 생성된 데이터 통계
    const stats = {
      total: data.length,
      byExamType: {},
      bySubject: {},
      totalQuestions: 0,
      totalScore: 0
    };
    
    data.forEach(item => {
      stats.byExamType[item.exam_type] = (stats.byExamType[item.exam_type] || 0) + 1;
      stats.bySubject[item.subject] = (stats.bySubject[item.subject] || 0) + 1;
      stats.totalQuestions += item.answers.length;
      stats.totalScore += item.total_score;
    });
    
    console.log('\n📊 생성된 데이터 통계:');
    console.log(`총 답안 키: ${stats.total}개`);
    console.log(`총 문제 수: ${stats.totalQuestions}개`);
    console.log(`총 점수: ${stats.totalScore}점`);
    console.log(`평균 문제 수: ${Math.round(stats.totalQuestions / stats.total)}개`);
    console.log(`평균 점수: ${Math.round(stats.totalScore / stats.total)}점`);
    
    console.log('\n시험 유형별 분포:');
    Object.entries(stats.byExamType).forEach(([type, count]) => {
      console.log(`  ${examTypes[type].label}: ${count}개`);
    });
    
    console.log('\n과목별 분포:');
    Object.entries(stats.bySubject).forEach(([subject, count]) => {
      console.log(`  ${subject}: ${count}개`);
    });
    
  } catch (error) {
    console.error('데모 데이터 생성 중 오류 발생:', error);
  }
}

// 실행
if (require.main === module) {
  generateDemoData();
}

module.exports = { generateDemoData };