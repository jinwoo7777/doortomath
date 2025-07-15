Always respond in Korean

## Supabase 데이터베이스 접근 규칙

### 🔒 기본 원칙: RLS 우선 사용
모든 Supabase 데이터베이스 CRUD 작업은 **Row Level Security (RLS) 방식을 우선적으로 사용**한다.

### 🔐 RLS 방식 구현 가이드

#### 1. 클라이언트 사이드 인증
```javascript
// 인증된 세션이 있는 Supabase 클라이언트 사용
const authenticatedSupabase = createClientComponentClient();

// 세션 토큰으로 명시적 인증
if (session?.access_token) {
  await authenticatedSupabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token
  });
}
```

#### 2. CRUD 작업 실행
```javascript
const { data, error } = await authenticatedSupabase
  .from('table_name')
  .select/insert/update/delete(...)
  .eq('id', itemId);
```

#### 3. 오류 처리 패턴
```javascript
if (error) {
  console.error('❌ 작업 실패:', error);
  
  // RLS 관련 오류 구분
  if (error.message?.includes('RLS') || error.message?.includes('policy') || error.code === '42501') {
    toast.error('권한이 없습니다. 관리자로 로그인했는지 확인해주세요.');
  } else if (error.code === 'PGRST116') {
    toast.error('데이터를 찾을 수 없습니다.');
  } else {
    toast.error(`작업 중 오류가 발생했습니다: ${error.message}`);
  }
  throw error;
}
```

### 🚫 API 엔드포인트 사용 예외 상황

다음 경우에만 API 엔드포인트 방식을 사용한다:

1. **복잡한 비즈니스 로직**: 여러 테이블 간 복잡한 트랜잭션이 필요한 경우
2. **대량 데이터 처리**: 한 번에 많은 레코드를 처리해야 하는 경우
3. **외부 서비스 연동**: 이메일 발송, 파일 처리 등 외부 API와 연동이 필요한 경우
4. **성능 최적화**: RLS 방식으로 해결하기 어려운 성능 이슈가 있는 경우
5. **RLS 정책으로 해결할 수 없는 특수한 권한 요구사항**

### 📝 로깅 패턴

모든 데이터베이스 작업에 일관된 로깅을 적용한다:

```javascript
// 작업 시작
console.log('🔄 [작업명] 시작:', { 관련_데이터 });

// 인증 시도
console.log('🔐 세션 토큰으로 인증 시도');

// 작업 성공
console.log('✅ [작업명] 성공:', result);

// 작업 실패
console.error('❌ [작업명] 실패:', error);
```

### 🔍 권한 검증 순서

1. **클라이언트 사이드**: 세션 및 사용자 역할 확인
2. **데이터베이스 레벨**: RLS 정책을 통한 권한 검증
3. **서버 사이드** (API 엔드포인트 사용 시): 추가 비즈니스 로직 검증

### 💡 모범 사례

#### DO (권장)
- ✅ RLS 정책을 먼저 설정하고 클라이언트 코드 작성
- ✅ 명시적 세션 인증으로 `auth.uid()` 문제 방지
- ✅ 구체적이고 의미 있는 오류 메시지 제공
- ✅ 작업 전후 데이터 새로고침으로 UI 일관성 유지
- ✅ 로딩 상태 관리로 중복 요청 방지

#### DON'T (피해야 할 것)
- ❌ 편의상 바로 Service Role Key 사용
- ❌ RLS 정책 우회를 기본 해결책으로 사용
- ❌ 클라이언트에서 민감한 데이터 검증만 수행
- ❌ 오류 발생 시 일반적인 메시지만 표시
- ❌ 권한 문제를 무시하고 우회 방법만 찾기

### 🛡️ 보안 체크리스트

코드 리뷰 시 다음 항목을 확인한다:

- [ ] RLS 정책이 올바르게 설정되어 있는가?
- [ ] 세션 인증이 명시적으로 처리되고 있는가?
- [ ] 권한 오류가 적절히 처리되고 있는가?
- [ ] 민감한 데이터가 클라이언트에 노출되지 않는가?
- [ ] 사용자 입력이 적절히 검증되고 있는가?

### 📋 구현 체크리스트

새로운 CRUD 기능 구현 시:

1. [ ] RLS 정책 설정/확인
2. [ ] 클라이언트 사이드 세션 인증 구현
3. [ ] 적절한 오류 처리 및 사용자 피드백
4. [ ] 로딩 상태 및 중복 요청 방지
5. [ ] 일관된 로깅 패턴 적용
6. [ ] UI 상태 동기화 (데이터 새로고침)
7. [ ] 권한별 테스트 수행