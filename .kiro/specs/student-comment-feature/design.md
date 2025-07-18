# Design Document: 학생 코멘트 기능

## Overview

학생 코멘트 기능은 관리자가 학생별로 중요한 메모나 특이사항을 기록하고 관리할 수 있는 기능입니다. 이 기능은 학생 목록에서 코멘트 아이콘을 통해 접근할 수 있으며, 학생 학습현황 모달에서도 확인할 수 있습니다. 코멘트는 시간순으로 기록되어 학생의 상황 변화를 추적할 수 있습니다.

## Architecture

이 기능은 기존 학생 관리 시스템에 통합되며, 다음과 같은 아키텍처 구성요소를 가집니다:

1. **프론트엔드 컴포넌트**:
   - 코멘트 입력 모달 컴포넌트
   - 코멘트 표시 컴포넌트 (학습현황 모달 내)
   - 코멘트 목록 컴포넌트

2. **백엔드 API**:
   - 코멘트 생성 API
   - 코멘트 조회 API
   - 코멘트 삭제 API

3. **데이터베이스**:
   - 학생 코멘트 테이블

## Components and Interfaces

### 1. 코멘트 모달 컴포넌트 (StudentCommentModal)

```jsx
// 코멘트 모달 컴포넌트 인터페이스
interface StudentCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onUpdate: () => void;
}
```

이 컴포넌트는 다음 기능을 제공합니다:
- 학생 정보 표시
- 기존 코멘트 목록 표시
- 새 코멘트 입력 폼
- 코멘트 저장 및 취소 기능
- 코멘트 삭제 기능

### 2. 학습현황 모달 내 코멘트 섹션 (StudentCoursesModal 확장)

기존 `StudentCoursesModal` 컴포넌트에 코멘트 섹션을 추가합니다:

```jsx
// 학습현황 모달 내 코멘트 섹션
<div className="mt-6 border-t pt-4">
  <h3 className="text-lg font-medium">학생 코멘트</h3>
  <StudentCommentList 
    studentId={student?.id} 
    onEdit={() => openCommentModal(student)} 
  />
</div>
```

### 3. 코멘트 목록 컴포넌트 (StudentCommentList)

```jsx
// 코멘트 목록 컴포넌트 인터페이스
interface StudentCommentListProps {
  studentId: string;
  onEdit?: () => void;
  showEditButton?: boolean;
}
```

이 컴포넌트는 다음 기능을 제공합니다:
- 학생의 코멘트 목록 표시
- 코멘트 작성 날짜 및 시간 표시
- 코멘트 수정 버튼 (선택적)

## Data Models

### 학생 코멘트 테이블 (student_comments)

```sql
CREATE TABLE student_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  course_id UUID REFERENCES courses(id),
  instructor_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE student_comments ENABLE ROW LEVEL SECURITY;

-- 관리자만 모든 작업 가능
CREATE POLICY admin_all ON student_comments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 강사는 자신이 담당하는 강의의 학생에 대한 코멘트만 조회/추가/수정 가능
CREATE POLICY instructor_own_courses ON student_comments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN courses c ON c.instructor_id = p.id
      WHERE p.id = auth.uid() 
      AND p.role = 'instructor'
      AND c.id = student_comments.course_id
    )
  );
```

## API 설계

### 1. 코멘트 생성/조회/삭제 API

Supabase 클라이언트를 사용하여 다음과 같은 API 함수를 구현합니다:

```javascript
// 학생 코멘트 조회 (강사 및 강의 정보 포함)
const fetchStudentComments = async (studentId) => {
  const { data, error } = await supabase
    .from('student_comments')
    .select(`
      *,
      instructor:instructor_id(id, full_name, email),
      course:course_id(id, title)
    `)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

// 학생이 수강 중인 강의 및 강사 목록 조회
const fetchStudentCourses = async (studentId) => {
  const { data, error } = await supabase
    .from('student_schedules')
    .select(`
      id,
      schedule:schedule_id(
        id,
        course_id,
        course:course_id(
          id,
          title,
          instructor_id,
          instructor:instructor_id(id, full_name)
        )
      )
    `)
    .eq('student_id', studentId);
  
  if (error) throw error;
  
  // 강의 및 강사 정보 추출
  const courses = data
    .filter(item => item.schedule?.course)
    .map(item => ({
      id: item.schedule.course.id,
      title: item.schedule.course.title,
      instructor_id: item.schedule.course.instructor_id,
      instructor_name: item.schedule.course.instructor?.full_name || '강사 정보 없음'
    }));
  
  return courses;
};

// 학생 코멘트 추가
const addStudentComment = async (studentId, content, courseId, instructorId) => {
  const { data, error } = await supabase
    .from('student_comments')
    .insert([
      { 
        student_id: studentId, 
        content,
        course_id: courseId,
        instructor_id: instructorId,
        created_by: session.user.id
      }
    ])
    .select();
  
  if (error) throw error;
  return data;
};

// 학생 코멘트 삭제
const deleteStudentComment = async (commentId) => {
  const { error } = await supabase
    .from('student_comments')
    .delete()
    .eq('id', commentId);
  
  if (error) throw error;
  return true;
};
```

### 2. 학생 강의 및 강사 정보 조회

학생이 수강 중인 강의와 담당 강사 정보를 조회하여 코멘트 작성 시 선택할 수 있도록 합니다.

## UI/UX 설계

### 1. 코멘트 모달

코멘트 모달은 다음과 같은 UI 요소를 포함합니다:

```
+------------------------------------------+
| 강사 코멘트 - [학생 이름]                |  X
+------------------------------------------+
| 기존 코멘트:                             |
|                                          |
| [2023-07-18 15:30] 수학 기초 - 김선생   |
| 코멘트 내용 1...                  [삭제] |
|                                          |
| [2023-07-15 10:15] 영어 회화 - 이선생   |
| 코멘트 내용 2...                  [삭제] |
|                                          |
+------------------------------------------+
| 새 코멘트:                               |
|                                          |
| 강의 선택:                               |
| [수학 기초 (김선생) ▼]                  |
|                                          |
| +------------------------------------+   |
| |                                    |   |
| |                                    |   |
| +------------------------------------+   |
|                                          |
| [취소]                          [저장]   |
+------------------------------------------+
```

### 2. 학습현황 모달 내 코멘트 섹션

학습현황 모달 내 코멘트 섹션은 다음과 같은 UI 요소를 포함합니다:

```
+------------------------------------------+
| 강사 코멘트                     [수정]   |
+------------------------------------------+
| [2023-07-18 15:30] 수학 기초 - 김선생   |
| 코멘트 내용 1...                         |
|                                          |
| [2023-07-15 10:15] 영어 회화 - 이선생   |
| 코멘트 내용 2...                         |
|                                          |
| 또는                                     |
|                                          |
| 코멘트가 없습니다.                       |
+------------------------------------------+
```

### 3. 코멘트 항목 디자인

각 코멘트 항목은 다음 정보를 포함합니다:

1. 코멘트 작성 날짜 및 시간
2. 관련 강의 이름
3. 작성한 강사 이름
4. 코멘트 내용
5. 삭제 버튼 (권한이 있는 경우)

```jsx
<div className="border-b pb-3 mb-3 last:border-0">
  <div className="flex justify-between items-start">
    <div>
      <div className="text-sm text-muted-foreground">
        {formatDate(comment.created_at)} - {comment.course?.title} - {comment.instructor?.full_name}
      </div>
      <div className="mt-1">{comment.content}</div>
    </div>
    {canDelete && (
      <Button variant="ghost" size="sm" onClick={() => onDelete(comment.id)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    )}
  </div>
</div>
```

## Error Handling

1. **데이터베이스 오류**:
   - 코멘트 저장/조회/삭제 시 발생하는 데이터베이스 오류는 try-catch 블록으로 처리
   - 오류 발생 시 사용자에게 토스트 메시지로 알림

2. **입력 유효성 검사**:
   - 빈 코멘트 제출 방지
   - 코멘트 길이 제한 (최대 1000자)

3. **권한 오류**:
   - 관리자 권한이 없는 사용자의 접근 제한
   - 권한 오류 발생 시 적절한 메시지 표시

## Testing Strategy

1. **단위 테스트**:
   - 코멘트 관련 API 함수 테스트
   - 코멘트 컴포넌트 렌더링 테스트

2. **통합 테스트**:
   - 코멘트 추가/조회/삭제 기능 테스트
   - 학습현황 모달과의 통합 테스트

3. **사용자 시나리오 테스트**:
   - 코멘트 추가 및 확인 시나리오
   - 코멘트 삭제 시나리오
   - 권한에 따른 접근 제한 시나리오