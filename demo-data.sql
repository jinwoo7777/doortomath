-- 자동 채점 관리 데모 데이터
-- 실행 전에 기존 데이터를 확인하고 중복을 방지하세요

-- 1. 강사 데이터 (이미 있다면 건너뛰기)
INSERT INTO teachers (id, name, email, phone, specialization, bio, experience_years, is_active)
VALUES 
  (gen_random_uuid(), '김수학', 'kim.math@example.com', '010-1234-5678', ARRAY['수학', '물리'], '15년 경력의 수학 전문 강사', 15, true),
  (gen_random_uuid(), '이과학', 'lee.science@example.com', '010-2345-6789', ARRAY['화학', '생물'], '10년 경력의 과학 전문 강사', 10, true),
  (gen_random_uuid(), '박영어', 'park.english@example.com', '010-3456-7890', ARRAY['영어'], '12년 경력의 영어 전문 강사', 12, true),
  (gen_random_uuid(), '최국어', 'choi.korean@example.com', '010-4567-8901', ARRAY['국어'], '8년 경력의 국어 전문 강사', 8, true)
ON CONFLICT (email) DO NOTHING;

-- 2. 스케줄 데이터 (이미 있다면 건너뛰기)
INSERT INTO schedules (id, grade, day_of_week, time_slot, subject, teacher_name, classroom, max_students, is_active)
VALUES 
  (gen_random_uuid(), '고등부', 1, '09:00-10:30', '수학', '김수학', 'A101', 20, true),
  (gen_random_uuid(), '중등부', 2, '10:45-12:15', '수학', '김수학', 'A102', 25, true),
  (gen_random_uuid(), '고등부', 3, '14:00-15:30', '물리', '이과학', 'B201', 15, true),
  (gen_random_uuid(), '중등부', 4, '15:45-17:15', '화학', '이과학', 'B202', 20, true),
  (gen_random_uuid(), '고등부', 5, '18:00-19:30', '영어', '박영어', 'C301', 18, true),
  (gen_random_uuid(), '중등부', 6, '19:45-21:15', '국어', '최국어', 'D401', 22, true);

-- 3. 답안 키 데이터 생성
WITH teacher_ids AS (
  SELECT id, name FROM teachers WHERE is_active = true
), schedule_ids AS (
  SELECT id, subject, teacher_name FROM schedules WHERE is_active = true
), demo_data AS (
  SELECT 
    t.id as teacher_id,
    s.id as schedule_id,
    s.subject,
    t.name as teacher_name,
    generate_series(1, 5) as exam_number,
    (ARRAY['regular', 'midterm', 'final', 'quiz'])[1 + floor(random() * 4)] as exam_type,
    current_date - (floor(random() * 180)::int * interval '1 day') as exam_date
  FROM teacher_ids t
  JOIN schedule_ids s ON t.name = s.teacher_name
)
INSERT INTO exam_answer_keys (
  exam_date, 
  subject, 
  teacher_id, 
  schedule_id, 
  exam_type, 
  exam_title, 
  exam_description, 
  total_score, 
  answers
)
SELECT 
  exam_date,
  subject,
  teacher_id,
  schedule_id,
  exam_type,
  subject || ' ' || 
  CASE exam_type
    WHEN 'regular' THEN '정기시험'
    WHEN 'midterm' THEN '중간고사'
    WHEN 'final' THEN '기말고사'
    WHEN 'quiz' THEN '퀴즈'
  END || ' (' || to_char(exam_date, 'YYYY-MM-DD') || ')' as exam_title,
  teacher_name || ' 강사의 ' || subject || ' 시험 답안 키입니다.' as exam_description,
  -- 총 점수는 문제 수에 따라 동적으로 계산
  CASE exam_type
    WHEN 'regular' THEN 500
    WHEN 'midterm' THEN 800
    WHEN 'final' THEN 1000
    WHEN 'quiz' THEN 300
  END as total_score,
  -- 답안 배열 생성 (50-100개 문제)
  (
    SELECT json_agg(
      json_build_object(
        'question', question_num,
        'answer', (ARRAY['1', '2', '3', '4', '5', '①', '②', '③', '④', '⑤', 'A', 'B', 'C', 'D', 'E', '참', '거짓', '0', '-1', '1/2', '2/3', '√2', '√3'])[1 + floor(random() * 23)],
        'score', CASE exam_type
          WHEN 'regular' THEN 5 + floor(random() * 6)
          WHEN 'midterm' THEN 8 + floor(random() * 5)
          WHEN 'final' THEN 10 + floor(random() * 6)
          WHEN 'quiz' THEN 3 + floor(random() * 4)
        END,
        'description', CASE 
          WHEN random() > 0.7 THEN ''
          ELSE (ARRAY['이차방정식의 해', '미분의 기본개념', '삼각함수의 성질', '확률과 통계', '벡터의 내적', '함수의 극한', '도함수의 활용', '정적분 계산', '수열의 극한', '복소수의 성질', '로그함수', '지수함수', '원의 방정식', '직선의 방정식', '포물선의 성질', '부등식의 해', '절댓값 함수', '역함수의 성질'])[1 + floor(random() * 18)]
        END
      )
    )
    FROM generate_series(1, 50 + floor(random() * 51)) as question_num
  )::jsonb as answers
FROM demo_data;

-- 4. 데이터 확인 쿼리
SELECT 
  COUNT(*) as total_answer_keys,
  COUNT(DISTINCT teacher_id) as unique_teachers,
  COUNT(DISTINCT subject) as unique_subjects,
  AVG(total_score) as avg_total_score,
  MIN(exam_date) as earliest_exam,
  MAX(exam_date) as latest_exam
FROM exam_answer_keys;

-- 5. 시험 유형별 통계
SELECT 
  exam_type,
  COUNT(*) as count,
  AVG(total_score) as avg_score,
  AVG(jsonb_array_length(answers)) as avg_questions
FROM exam_answer_keys
GROUP BY exam_type
ORDER BY count DESC;