Always respond in Korean

# 프로젝트 글로벌 규칙
## 0. 모든 답변은 한글로 답할것!
## 1. 기술 스택
- **프론트엔드 프레임워크**: Next.js 14 (App Router)
- **스타일링**: 
  - Tailwind CSS 3.3.3 (기본 스타일링)
  - Bootstrap 5.3.3 (기존 UI 컴포넌트)
  - shadcn/ui (대시보드 페이지지 전용)
  - 대시보드 페이지지 디자인은 shadcn/ui 만 사용
- **상태 관리**: React Context API
- **백엔드/데이터베이스**: Supabase (인증, 데이터베이스, 스토리지)
- **UI 라이브러리**: 
  - Radix UI (접근성 컴포넌트)
  - React Bootstrap (기존 UI 컴포넌트)
  - Lucide Icons (아이콘)

## 2. 디렉토리 구조
```
educvve_next-main/
├── public/                 # 정적 파일
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (auth)/         # 인증 관련 페이지
│   │   ├── admin/          # 관리자 대시보드
│   │   ├── dashboard/      # 사용자 대시보드
│   │   ├── instructor/     # 강사 전용 페이지
│   │   └── ...             # 기타 페이지 라우트
│   │
│   ├── assets/             # 이미지, 폰트 등 정적 자산
│   │   ├── css/            # 전역 CSS
│   │   └── js/             # 서드파티 JS
│   │
│   ├── components/         # 재사용 가능한 UI 컴포넌트
│   │   ├── admin/          # 관리자 전용 컴포넌트 (shadcn/ui)
│   │   │   └── dashboard/  # 관리자 대시보드 컴포넌트
│   │   ├── common/         # 공통 컴포넌트 (Bootstrap)
│   │   ├── instructor/     # 강사 전용 컴포넌트
│   │   └── student/        # 학생 전용 컴포넌트
│   │
│   ├── contexts/           # React Context
│   ├── hooks/              # 커스텀 훅
│   ├── layouts/            # 레이아웃 컴포넌트
│   ├── lib/                # 서드파티 초기화, 클라이언트 라이브러리, 재사용 가능한 로직
│   │   ├── hooks/          # 커스텀 React 훅 (useAccordion, useStickyHeader 등)
│   │   └── supabase/       # Supabase 관련 초기화 및 헬퍼 함수들
│   │       ├── fetchCourseMenu.js
│   │       ├── fetchCourses.js
│   │       ├── index.js
│   │       └── supabaseClient.js
│   │
│   ├── styles/             # 전역 스타일
│   └── utils/              # 순수 유틸리티 함수들 (컴포넌트 의존성 없음)
│       ├── auth/           # 인증 관련 유틸리티
│       │   ├── authState.js
│       │   └── authErrors.js
│       ├── formValidators.js
│       ├── logger.js
│       └── urlValidation.js
│
├── .env.local              # 환경 변수
├── next.config.mjs         # Next.js 설정
├── tailwind.config.js      # Tailwind CSS 설정
└── postcss.config.js       # PostCSS 설정
```

## 3. 디렉토리 구조 가이드라인

### `src/lib/`
- **용도**: 서드파티 라이브러리 초기화, 재사용 가능한 로직, 클라이언트 사이드 전용 코드
- **주요 내용**:
  - `hooks/`: 재사용 가능한 React 커스텀 훅
  - `supabase/`: Supabase 클라이언트 초기화 및 데이터 페칭 로직
  - `utils.js`: 애플리케이션 전반에서 사용되는 유틸리티 함수들
- **규칙**:
  - 컴포넌트와 독립적으로 동작해야 함
  - 서버 컴포넌트에서 사용 불가 (클라이언트 컴포넌트 전용)
  - React 컴포넌트와의 결합도는 낮게 유지

### `src/utils/`
- **용도**: 순수 유틸리티 함수들 (컴포넌트 의존성 없음)
- **주요 내용**:
  - `auth/`: 인증 관련 유틸리티 함수
  - `formValidators.js`: 폼 유효성 검사 함수
  - `logger.js`: 로깅 유틸리티
  - `urlValidation.js`: URL 유효성 검사
- **규칙**:
  - React 컴포넌트에 의존하지 않아야 함
  - 순수 함수로 작성 (동일 입력 → 동일 출력 보장)
  - 서버/클라이언트 모두에서 사용 가능해야 함

## 4. 파일 및 코드 컨벤션

### 파일 네이밍 규칙
- **컴포넌트 파일명**: PascalCase (예: `UserProfile.jsx`)
- **유틸리티/훅 파일명**: camelCase (예: `useAuth.js`, `formValidators.js`)
- **일관성 유지**:
  - 신규 컴포넌트 파일은 반드시 `.jsx`로 생성
  - import 시 확장자 생략 금지 (예: `import Button from './Button.jsx'`)
  - Next.js의 특수 파일들(`page.jsx`, `layout.jsx` 등)도 모두 `.jsx` 확장자 사용

### 코드 컨벤션
- **언어**: JavaScript (ES6+) / TypeScript
- **포맷팅**: ESLint + Prettier
- **네이밍 규칙**:
  - 컴포넌트: PascalCase (예: `UserProfile.jsx`)
  - 변수/함수: camelCase
  - 상수: UPPER_SNAKE_CASE
  - CSS 클래스: kebab-case
- **주석**: 복잡한 로직이나 비즈니스 규칙에 대한 주석 필수
- **컴포넌트 구조**: 
  - 하나의 컴포넌트는 하나의 책임만 가짐
  - props 타입 검증 (PropTypes 또는 TypeScript)
  - 명확한 컴포넌트 계층 구조 유지

## 5. 역할 기반 접근 제어
- **역할**:
  - 학생: 강의 수강, 과제 제출
  - 강사: 강의 관리, 학생 관리
  - 관리자: 시스템 전체 관리
- **접근 제어**:
  - 미들웨어를 통한 라우트 보호
  - 클라이언트 측에서의 역할별 UI 조건부 렌더링
  - API 엔드포인트에서의 권한 검증
- **인증/권한 체크 정책**:
  - **이중 검증 원칙**: 모든 보호된 경로는 서버와 클라이언트 양쪽에서 검증
  - **미들웨어 책임**: 기본적인 세션 확인 및 로그인 여부 검증 (1차 방어선)
  - **레이아웃 컴포넌트 책임**: 세부적인 역할 기반 접근 제어 및 사용자 경험 관리 (2차 방어선)
  - **어드민 페이지**: `/dashboard2/admin` 경로는 미들웨어에서 기본 세션 체크, 레이아웃 컴포넌트에서 역할 검증
  - **디버깅 로그**: 인증/권한 검증 과정에서 상세 로그 기록 (개발 환경에서만)
  - **오류 처리**: 인증/권한 오류 시 사용자 친화적인 메시지 표시 및 적절한 리다이렉트

## 6. 성능 최적화
- **이미지 최적화**: Next.js Image 컴포넌트 사용
- **코드 분할**: 동적 import 활용
- **캐싱 전략**: SWR을 통한 데이터 캐싱
- **번들 최적화**: 번들 분석기 활용

## 7. 접근성
- WAI-ARIA 가이드라인 준수
- 키보드 네비게이션 지원
- 스크린 리더 호환성 검증
- 색상 대비 비율 준수 (WCAG 2.1 AA 기준)

## 8. 보안
- 환경 변수를 통한 민감 정보 관리
- Supabase RLS(Row Level Security) 적용
- CSRF/XSS 방어 조치
- 정규식을 통한 입력 검증

## 9. 테스트
- 컴포넌트 단위 테스트 (Jest + React Testing Library)
- E2E 테스트 (Cypress)
- 접근성 테스트 (axe-core)

## 10. 버전 관리
- Git Flow 전략 채택
- 의미 있는 커밋 메시지 작성
- PR 템플릿 활용

## 11. 문서화
- 주요 컴포넌트에 JSDoc 주석 추가
- API 문서화 (Swagger/OpenAPI)
- 프로젝트 설정 가이드 작성
