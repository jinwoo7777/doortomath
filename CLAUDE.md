# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DoorToMath is a Korean educational platform for mathematics education built with Next.js 15. The project serves "대치 수학의문" (Daechi Math Questions) academy with multi-role user management (admin, instructor, student).

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Architecture Overview

### Authentication & Authorization
- **Supabase Auth**: User authentication with role-based access control
- **Middleware**: Route protection based on user roles (admin, instructor, student)
- **Role System**: Three distinct user types with different dashboard access levels
- **Session Management**: Server-side session handling with cookies

### Database Integration
- **Supabase**: PostgreSQL database with migrations in `supabase/migrations/`
- **Client Pattern**: Separate browser and server clients (`supabaseClientBrowser.js`, `supabaseClientServer.js`)
- **Data Fetching**: Utility functions for courses, schedules, and content management

### Routing Structure
- **Public Routes**: Home, about, courses, blog, contact
- **Protected Routes**: Role-based dashboard access
  - `/dashboard/student` - Student dashboard
  - `/dashboard/instructor` - Instructor dashboard  
  - `/dashboard2/admin` - Admin dashboard (newer version)
- **Authentication Routes**: Sign in/up, password reset, email verification

### Component Architecture
- **Layout System**: Centralized layout with HeaderThree and FooterThree
- **UI Components**: Combination of Radix UI primitives and custom components
- **Styling**: Tailwind CSS with custom theme + Keep Bootstrap only for legacy pages
- **State Management**: React hooks with Supabase real-time subscriptions

### Content Management
- **Dynamic Content**: Main page content stored in Supabase `main_page_content` table
- **Blog System**: TipTap rich text editor for content creation
- **Course Management**: Admin interface for course creation and management
- **File Uploads**: Image and document management through Supabase Storage

## Key Patterns

### Supabase Client Usage
```javascript
// Browser client (client components)
import { supabase } from '@/lib/supabase/supabaseClientBrowser.js';

// Server client (server components)
import { createServerClient } from '@supabase/ssr';
```

### Role-Based Access Control
- Middleware checks user roles and redirects appropriately
- Role verification in both middleware and component level
- Default role is 'student' when no role is specified

### Content Loading Pattern
- Server components fetch data directly from Supabase
- Fallback to default content when database content is unavailable
- Logging with custom logger utility for debugging

### Dashboard Layout
- Shared dashboard layout with role-based sidebar navigation
- Modern admin dashboard uses shadcn/ui components
- Dashboard page design uses only shadcn/ui

## Important File Locations

### Configuration
- `next.config.mjs` - Next.js configuration with standalone output
- `tailwind.config.js` - Tailwind CSS with custom theme variables
- `middleware.js` - Route protection and role-based access control
- `components.json` - shadcn/ui component configuration

### Authentication
- `src/lib/auth/` - Authentication utilities and helpers
- `src/hooks/useAuth.js` - Custom authentication hook
- `src/app/auth/` - Authentication pages and API routes

### Database
- `src/lib/supabase/` - Supabase client configuration and utilities
- `supabase/migrations/` - Database migrations
- `scripts/` - Database utility scripts

### Styling
- `src/styles/globals.css` - Global styles and CSS variables
- `src/assets/css/` - Legacy CSS files (Bootstrap, animations)
- `src/components/ui/` - Reusable UI components

## Development Notes

### Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- Additional Supabase service keys for server-side operations

### Build Configuration
- ESLint and TypeScript errors are ignored during builds
- React Strict Mode is disabled
- Standalone output for deployment

### Content Management
- Main page content is editable through admin dashboard
- Content falls back to hardcoded defaults if database is unavailable
- Real-time updates through Supabase subscriptions

### Multi-language Support
- Primary language is Korean
- UI text is hardcoded in Korean with some English fallbacks
- No internationalization framework currently implemented



### 파일 크기 및 복잡도 관리
- 최대 파일 길이: 한 파일은 300줄을 넘지 않도록 제한합니다.
- 함수/메서드 길이: 단일 함수나 메서드는 50줄을 넘지 않도록 합니다.
- 복잡도 제한: 순환 복잡도(Cyclomatic Complexity)가 10을 넘지 않도록 합니다.
- 중첩 깊이: 조건문과 반복문의 중첩은 3단계를 넘지 않도록 합니다.
- 컴포넌트 분리 시점: 컴포넌트가 100줄을 넘거나, 5개 이상의 상태 변수를 가질 때 분리를 고려합니다.

### 폴더 구조 및 파일 조직
- **기본 폴더 구조**:
/src
  /app                   # Next.js 앱 라우터 (페이지 및 레이아웃)
  /components            # 재사용 가능한 UI 컴포넌트
    /ui                  # 기본 UI 컴포넌트 (버튼, 카드 등)
    /layout              # 레이아웃 관련 컴포넌트
    /forms               # 폼 관련 컴포넌트
    /[feature]           # 특정 기능별 컴포넌트
      /components        # 해당 기능 내 하위 컴포넌트
      /hooks             # 해당 기능 관련 커스텀 훅
      /utils             # 해당 기능 관련 유틸리티 함수
  /hooks                 # 전역 커스텀 훅
  /lib                   # 유틸리티 함수 및 헬퍼
    /api                 # API 관련 함수
    /utils               # 일반 유틸리티 함수
    /constants           # 상수 정의
  /styles                # 전역 스타일
  /types                 # TypeScript 타입 정의
  /context               # React Context 정의
  /store                 # 상태 관리 (Redux, Zustand 등)
  /public                # 정적 파일 (이미지, 폰트 등)

- **컴포넌트 폴더 구조**:
대규모 컴포넌트는 다음과 같이 구조화합니다:

/[ComponentName]
  index.js               # 메인 컴포넌트 내보내기
  [ComponentName].jsx    # 메인 컴포넌트 구현
  [ComponentName].module.css # 컴포넌트별 스타일 (필요시)
  /components            # 하위 컴포넌트
    [SubComponent].jsx
  /hooks                 # 컴포넌트 관련 훅
    use[Feature].js
  /utils                 # 컴포넌트 관련 유틸리티
  /constants             # 컴포넌트 관련 상수
  /types                 # 컴포넌트 관련 타입 (TypeScript)

- **명명 규칙**
- 파일명: PascalCase로 컴포넌트 파일명 지정 (예: ButtonGroup.jsx)
- 폴더명: 기능/도메인 기반으로 kebab-case 사용 (예: user-profile)
- 훅 파일명: camelCase로 nav-user.jsx 접두사 사용 (예: useNavUser.js)
- 유틸리티 파일명: camelCase 사용 (예: dateFormatter.js)

### 컴포넌트 설계 원칙
- 단일 책임 원칙: 각 컴포넌트는 하나의 명확한 책임만 가져야 합니다.
- 컴포넌트 계층 구조:
- 페이지 컴포넌트: 라우팅 및 데이터 가져오기 담당
- 컨테이너 컴포넌트: 상태 관리 및 비즈니스 로직 담당
- 프레젠테이션 컴포넌트: UI 렌더링만 담당 (가능한 순수 함수형)
- 재사용성 고려: 두 곳 이상에서 사용되는 UI 패턴은 별도 컴포넌트로 추출합니다.
- Props 인터페이스: 명확한 props 인터페이스를 정의하고 문서화합니다.

### 코드 구성 및 가독성
- 일관된 코드 스타일: 프로젝트 전체에서 일관된 코딩 스타일을 유지합니다.
- 의미 있는 이름: 변수, 함수, 컴포넌트에 그 목적을 명확히 나타내는 이름을 사용합니다.
- 주석 작성: 복잡한 로직이나 비즈니스 규칙에는 한글 주석을 추가합니다.
- 섹션 구분: 긴 파일에서는 주석으로 코드 섹션을 명확히 구분합니다.

### 코드 분할 및 모듈화 전략
- 기능별 분할: 관련 기능은 같은 모듈/폴더에 그룹화합니다.
- 논리적 분리: UI, 비즈니스 로직, 데이터 접근 계층을 분리합니다.
- 코드 스플리팅: 큰 번들은 동적 임포트를 통해 분할합니다.
- 모듈 경계: 명확한 공개 API를 가진 모듈을 설계합니다.
- 순환 의존성 방지: 모듈 간 순환 의존성이 생기지 않도록 구조화합니다.

### 상태 관리 구조화
- 로컬 vs 전역: 상태의 범위에 따라 적절한 관리 방식을 선택합니다.
- 상태 계층화:
- UI 상태: 컴포넌트 내부에서 useState로 관리
- 폼 상태: 폼 라이브러리 또는 커스텀 훅으로 관리
- 공유 상태: Context API 또는 상태 관리 라이브러리로 관리
- 서버 상태: 쿼리 라이브러리(React Query, SWR 등)로 관리
- 상태 정규화: 중첩된 상태 구조를 피하고 정규화된 상태를 유지합니다.

### 코드 재사용 패턴
- 컴포넌트 합성: 작은 컴포넌트를 조합하여 복잡한 UI를 구성합니다.
- 커스텀 훅: 상태 로직을 재사용하기 위해 커스텀 훅을 만듭니다.
- 고차 컴포넌트(HOC): 공통 기능을 여러 컴포넌트에 제공할 때 HOC 패턴을 고려합니다.
- 유틸리티 함수: 순수 함수로 공통 로직을 추출합니다.
- 컴포넌트 라이브러리: 자주 사용되는 UI 패턴은 내부 컴포넌트 라이브러리로 관리합니다.

### 성능 최적화 지침
- 불필요한 렌더링 방지: React.memo, useMemo, useCallback을 적절히 사용합니다.
- 지연 로딩: 큰 컴포넌트나 라이브러리는 필요할 때만 로드합니다.
- 가상화: 긴 목록을 렌더링할 때는 가상화 기법을 사용합니다.
- 이미지 최적화: 이미지는 적절한 크기와 포맷으로 최적화합니다.
- 번들 크기 모니터링: 번들 분석 도구를 사용하여 크기를 모니터링합니다.

### 테스트 구조
- 테스트 폴더 구조: 소스 코드 구조를 반영하는 테스트 구조를 유지합니다.
/src
  /components
    /Button
      Button.jsx
      Button.test.jsx    # 컴포넌트와 같은 위치에 테스트 파일
  /utils
    formatter.js
    formatter.test.js
- 테스트 범위: 단위 테스트, 통합 테스트, E2E 테스트의 적절한 조합을 유지합니다.
- 테스트 가능한 설계: 의존성 주입, 순수 함수 등 테스트하기 쉬운 패턴을 사용합니다.

### 에러 처리 및 디버깅
- 일관된 에러 처리: 애플리케이션 전체에서 일관된 에러 처리 방식을 사용합니다.
- 의미 있는 에러 메시지: 사용자와 개발자에게 도움이 되는 명확한 에러 메시지를 제공합니다.
- 로깅: 중요한 이벤트와 에러는 적절히 로깅합니다.
- 방어적 프로그래밍: 예상치 못한 입력과 상황에 대비합니다.


- 반응형 디자인: 다양한 화면 크기에 대응하는 반응형 디자인을 구현합니다.

### 문서화 및 주석
- 컴포넌트 문서화: 각 컴포넌트의 목적, props, 사용 예시를 문서화합니다.
- 코드 주석: 복잡한 로직이나 비즈니스 규칙에는 한글 주석을 추가합니다.
- 타입 정의: 꼭 필요한 경우에만 TypeScript를 사용하여 인터페이스와 타입을 명확히 정의합니다.
- 스토리북: UI 컴포넌트는 Storybook으로 문서화하고 시각적으로 테스트합니다.

### 리팩토링 우선순위
- 심각한 구조적 문제: 과도하게 큰 파일, 복잡한 함수, 깊은 중첩
- 성능 병목 현상: 불필요한 렌더링, 무거운 연산, 비효율적인 API 호출
- 코드 중복 및 일관성 부재: 반복되는 코드 패턴, 중복된 로직
- 유지보수성 저해 요소: 불명확한 명명, 주석 부재, 하드코딩된 값
- 테스트 가능성 문제: 테스트하기 어려운 구조, 강한 결합
- 접근성 및 사용자 경험 문제: 접근성 위반, 반응형 문제
- 기술 부채: 구식 패턴, 사용하지 않는 코드, 불필요한 의존성
- 문서화 및 가독성 개선: 문서화 부족, 복잡한 알고리즘 설명
- 코드 현대화: 구형 API 사용, 최신 기능 미활용
- 팀 협업 및 개발 경험 개선: 빌드 최적화, 개발 환경 개선

### 코드 리뷰 체크리스트
[ ] 파일이 300줄을 초과하는가?
[ ] 단일 함수/메서드가 50줄을 초과하는가?
[ ] 컴포넌트가 단일 책임을 넘어서는가?
[ ] 폴더 구조가 일관되고 논리적인가?
[ ] 명명이 일관되고 의미가 명확한가?
[ ] 상태 관리가 적절히 구조화되어 있는가?
[ ] 중복 코드가 있는가?
[ ] 테스트가 가능한 구조인가?
[ ] 성능 최적화가 필요한 부분이 있는가?
[ ] 접근성 요구사항을 충족하는가?

### Rules