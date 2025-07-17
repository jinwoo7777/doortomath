# 학생 관리 모듈 (Student Management Module)

이 모듈은 Door to Math 교육 플랫폼의 학생 관리 기능을 담당합니다.

## 폴더 구조

```
student-management/
├── components/                # 하위 컴포넌트
│   ├── StudentFilters.jsx     # 학생 필터링 컴포넌트
│   ├── StudentForm.jsx        # 학생 추가/수정 폼 컴포넌트
│   ├── StudentList.jsx        # 학생 목록 테이블 컴포넌트
│   ├── StudentStats.jsx       # 학생 통계 카드 컴포넌트
│   └── StudentTabs.jsx        # 학생 관리 탭 컴포넌트
├── hooks/                     # 커스텀 훅
│   ├── useStudentData.js      # 학생 데이터 관리 훅
│   ├── useStudentForm.js      # 학생 폼 관리 훅
│   └── useStudentStats.js     # 학생 통계 관리 훅
├── utils/                     # 유틸리티 함수
│   └── formatters.js          # 포맷팅 유틸리티 함수
├── index.js                   # 모듈 내보내기
├── StudentCoursesModal.jsx    # 학생 수강 강의 모달
├── StudentExamScoresModal.jsx # 학생 시험 성적 모달
└── StudentManagementContent.jsx # 메인 컴포넌트
```

## 주요 기능

- 학생 목록 조회 및 필터링
- 학생 추가, 수정, 삭제
- 학생 통계 정보 표시
- 학생별 수강 강의 관리
- 학생별 시험 성적 조회
- 관심 관리 대상 학생 표시

## 사용 방법

```jsx
import { StudentManagementContent } from '@/components/admin/dashboard/student-management';

export default function StudentManagementPage() {
  return (
    <div>
      <StudentManagementContent />
    </div>
  );
}
```

## 데이터 구조

### 학생 (Student)

```javascript
{
  id: string,
  full_name: string,
  email: string,
  phone: string,
  parent_phone: string,
  birth_date: string,
  school: string,
  grade: string, // '초등부', '중등부', '고등부'
  school_grade: string, // '1학년', '2학년', ...
  notes: string,
  is_priority: boolean,
  status: string, // 'active', 'inactive'
  branch: string, // 'daechi', 'bukwirye', 'namwirye'
  created_at: string,
  updated_at: string
}
```

### 수강 정보 (Student Enrollment)

```javascript
{
  id: string,
  student_id: string,
  schedule_id: string,
  start_date: string,
  enrollment_date: string,
  status: string, // 'active', 'inactive'
  payment_status: string, // 'pending', 'completed'
  monthly_fee: number,
  notes: string,
  created_at: string,
  updated_at: string
}
```

## 컴포넌트 설명

### StudentManagementContent

학생 관리의 메인 컴포넌트로, 전체 레이아웃과 상태 관리를 담당합니다.

### StudentList

학생 목록을 테이블 형태로 표시하는 컴포넌트입니다.

### StudentForm

학생 정보를 추가하거나 수정하는 폼 컴포넌트입니다.

### StudentFilters

학생 목록을 필터링하는 컴포넌트입니다.

### StudentStats

학생 통계 정보를 카드 형태로 표시하는 컴포넌트입니다.

### StudentTabs

학생 관리 탭을 표시하는 컴포넌트입니다.

### StudentCoursesModal

학생이 수강 중인 강의 목록을 표시하고 관리하는 모달 컴포넌트입니다.

### StudentExamScoresModal

학생의 시험 성적을 표시하는 모달 컴포넌트입니다.