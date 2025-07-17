-- 수업 상세 페이지 완전 지원을 위한 courses 테이블 개선
-- 기존 컬럼은 유지하고 필요한 컬럼만 추가

-- 1. 강사 관련 컬럼 추가
ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor_bio TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor_experience TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor_specialization TEXT[];
ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor_education TEXT;

-- 2. 강의 상세 정보 컬럼 추가
ALTER TABLE courses ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(20) DEFAULT 'beginner';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS course_duration TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS course_language VARCHAR(10) DEFAULT 'ko';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS course_level VARCHAR(20) DEFAULT 'all';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS course_format VARCHAR(20) DEFAULT 'online';

-- 3. 수강 관련 컬럼 추가
ALTER TABLE courses ADD COLUMN IF NOT EXISTS enrollment_count INTEGER DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS max_enrollment INTEGER DEFAULT 999;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS completion_rate DECIMAL(5,2) DEFAULT 0.0;

-- 4. 메타데이터 컬럼 추가
ALTER TABLE courses ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE courses ADD COLUMN IF NOT EXISTS prerequisites TEXT[];
ALTER TABLE courses ADD COLUMN IF NOT EXISTS target_audience TEXT[];
ALTER TABLE courses ADD COLUMN IF NOT EXISTS learning_objectives TEXT[];
ALTER TABLE courses ADD COLUMN IF NOT EXISTS assessment_methods TEXT[];

-- 5. 스케줄 관련 컬럼 추가
ALTER TABLE courses ADD COLUMN IF NOT EXISTS schedule_type VARCHAR(20) DEFAULT 'flexible';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS class_schedule JSONB DEFAULT '[]';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS enrollment_deadline DATE;

-- 6. 추가 컨텐츠 컬럼 추가
ALTER TABLE courses ADD COLUMN IF NOT EXISTS course_outline TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS materials_provided TEXT[];
ALTER TABLE courses ADD COLUMN IF NOT EXISTS software_required TEXT[];
ALTER TABLE courses ADD COLUMN IF NOT EXISTS certificate_available BOOLEAN DEFAULT false;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS certificate_requirements TEXT;

-- 7. 가격 및 결제 관련 컬럼 추가
ALTER TABLE courses ADD COLUMN IF NOT EXISTS discount_price DECIMAL(10,2);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS discount_percentage INTEGER DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS payment_options TEXT[] DEFAULT ARRAY['lump_sum'];
ALTER TABLE courses ADD COLUMN IF NOT EXISTS refund_policy TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS trial_available BOOLEAN DEFAULT false;

-- 8. SEO 및 마케팅 컬럼 추가
ALTER TABLE courses ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS meta_keywords TEXT[];
ALTER TABLE courses ADD COLUMN IF NOT EXISTS social_image_url TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS promotional_video_url TEXT;

-- 9. 고급 기능 컬럼 추가
ALTER TABLE courses ADD COLUMN IF NOT EXISTS live_session_count INTEGER DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS recorded_session_count INTEGER DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS assignment_count INTEGER DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS quiz_count INTEGER DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS discussion_enabled BOOLEAN DEFAULT true;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS qa_enabled BOOLEAN DEFAULT true;

-- 10. 상태 관리 컬럼 추가
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'public';

-- 11. 기존 컬럼 개선을 위한 제약 조건 추가
ALTER TABLE courses ADD CONSTRAINT IF NOT EXISTS difficulty_level_check 
    CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert'));

ALTER TABLE courses ADD CONSTRAINT IF NOT EXISTS course_level_check 
    CHECK (course_level IN ('all', 'elementary', 'middle', 'high', 'adult'));

ALTER TABLE courses ADD CONSTRAINT IF NOT EXISTS course_format_check 
    CHECK (course_format IN ('online', 'offline', 'hybrid'));

ALTER TABLE courses ADD CONSTRAINT IF NOT EXISTS schedule_type_check 
    CHECK (schedule_type IN ('flexible', 'fixed', 'self_paced'));

ALTER TABLE courses ADD CONSTRAINT IF NOT EXISTS visibility_check 
    CHECK (visibility IN ('public', 'private', 'draft'));

-- 12. 인덱스 추가 (성능 개선)
CREATE INDEX IF NOT EXISTS idx_courses_difficulty_level ON courses(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_courses_course_level ON courses(course_level);
CREATE INDEX IF NOT EXISTS idx_courses_enrollment_count ON courses(enrollment_count);
CREATE INDEX IF NOT EXISTS idx_courses_rating ON courses(rating);
CREATE INDEX IF NOT EXISTS idx_courses_start_date ON courses(start_date);
CREATE INDEX IF NOT EXISTS idx_courses_tags ON courses USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_courses_is_archived ON courses(is_archived);
CREATE INDEX IF NOT EXISTS idx_courses_sort_order ON courses(sort_order);

-- 13. 기본값 업데이트 (기존 데이터 대상)
UPDATE courses SET 
    difficulty_level = 'beginner',
    course_language = 'ko',
    course_level = 'all',
    course_format = 'online',
    schedule_type = 'flexible',
    visibility = 'public',
    enrollment_count = 0,
    max_enrollment = 999,
    rating = 0.0,
    review_count = 0,
    completion_rate = 0.0,
    discount_percentage = 0,
    payment_options = ARRAY['lump_sum'],
    trial_available = false,
    certificate_available = false,
    live_session_count = 0,
    recorded_session_count = 0,
    assignment_count = 0,
    quiz_count = 0,
    discussion_enabled = true,
    qa_enabled = true,
    is_archived = false,
    sort_order = 0
WHERE difficulty_level IS NULL;

-- 14. 댓글 및 추가 기능 (필요시 활성화)
COMMENT ON COLUMN courses.instructor_bio IS '강사 상세 소개';
COMMENT ON COLUMN courses.instructor_experience IS '강사 경력사항';
COMMENT ON COLUMN courses.instructor_specialization IS '강사 전문 분야';
COMMENT ON COLUMN courses.difficulty_level IS '강의 난이도 (beginner, intermediate, advanced, expert)';
COMMENT ON COLUMN courses.course_duration IS '강의 기간 (예: 12주, 3개월)';
COMMENT ON COLUMN courses.enrollment_count IS '현재 수강생 수';
COMMENT ON COLUMN courses.rating IS '평점 (0.0 ~ 5.0)';
COMMENT ON COLUMN courses.tags IS '태그 목록 (검색 및 필터링용)';
COMMENT ON COLUMN courses.prerequisites IS '선수 과목 또는 요구사항';
COMMENT ON COLUMN courses.target_audience IS '대상 학습자';
COMMENT ON COLUMN courses.learning_objectives IS '학습 목표';
COMMENT ON COLUMN courses.class_schedule IS '수업 일정 정보 (JSON 형태)';
COMMENT ON COLUMN courses.materials_provided IS '제공되는 교재 및 자료';
COMMENT ON COLUMN courses.certificate_available IS '수료증 발급 여부';
COMMENT ON COLUMN courses.discount_price IS '할인 가격';
COMMENT ON COLUMN courses.payment_options IS '결제 방법 (lump_sum, installment)';
COMMENT ON COLUMN courses.meta_title IS 'SEO 제목';
COMMENT ON COLUMN courses.meta_description IS 'SEO 설명';
COMMENT ON COLUMN courses.visibility IS '공개 설정 (public, private, draft)';