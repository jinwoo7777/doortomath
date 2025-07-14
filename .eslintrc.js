module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // 큰따옴표 이스케이프 처리 규칙 비활성화
    'react/no-unescaped-entities': 'off',
    // 추가로 useEffect 의존성 배열 경고도 비활성화 (signup/confirm-email/page.jsx에서 발생한 경고)
    'react-hooks/exhaustive-deps': 'warn'
  }
};
