# 기술 스택 및 빌드 시스템

## 핵심 기술 스택

- **프레임워크**: Next.js 15 (React 19)
- **언어**: JavaScript (JSX)
- **스타일링**: Tailwind CSS
- **데이터베이스**: Supabase (PostgreSQL)
- **인증**: Supabase Auth
- **상태 관리**: React Hooks
- **UI 컴포넌트**: 
  - Radix UI (저수준 접근성 컴포넌트)
  - Shadcn UI (Radix UI 기반 컴포넌트 시스템)
  - React Bootstrap (일부 컴포넌트)
- **폼 관리**: React Hook Form + Zod 유효성 검사
- **차트/시각화**: Chart.js + React-Chartjs-2
- **날짜 관리**: date-fns
- **알림**: Sonner (토스트 알림)

## 빌드 및 개발 도구

- **패키지 관리**: npm
- **린팅**: ESLint
- **포스트 CSS**: Autoprefixer, Tailwind
- **빌드 출력**: Standalone (Next.js 최적화 빌드)

## 주요 명령어

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:3000)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 린트 검사
npm run lint

# 성적 관리 데모 데이터 생성
npm run demo:grading
```

## Supabase 통합

- **클라이언트 인증**: `@supabase/auth-helpers-nextjs`
- **데이터 접근**: Row Level Security (RLS) 정책 기반
- **마이그레이션**: SQL 마이그레이션 파일 (`supabase/migrations/`)

## 코드 스타일 및 패턴

- **컴포넌트**: 함수형 컴포넌트 + React Hooks
- **클라이언트 컴포넌트**: "use client" 지시어 사용
- **커스텀 훅**: 재사용 가능한 로직은 커스텀 훅으로 분리
- **데이터 페칭**: Supabase 클라이언트 + useEffect/useCallback
- **오류 처리**: try-catch + toast 알림
- **비동기 처리**: async/await 패턴