/**
 * @deprecated 이 파일은 더 이상 사용되지 않습니다.
 * 대신 @/hooks/useAuth.js를 사용하세요.
 * 
 * 마이그레이션 가이드: /MIGRATION_GUIDE.md
 * 
 * 기존 코드:
 * import { useAuthState } from '@/hooks/useAuthState';
 * 
 * 새로운 코드:
 * import { useAuth } from '@/hooks/useAuth';
 * 
 * API가 100% 호환되므로 import 경로만 변경하면 됩니다.
 */

import { useAuth } from './useAuth';

/**
 * @deprecated useAuth를 사용하세요
 */
export const useAuthState = () => {
  console.warn('⚠️  useAuthState는 더 이상 사용되지 않습니다. useAuth를 사용하세요.');
  return useAuth();
};

// 기존 코드는 주석 처리됨
/*
// 기존 582줄의 코드가 있었음
// 모든 기능이 useAuth.js로 통합되었습니다.
*/

// 역할 상수도 새로운 훅에서 가져옴
export const ROLES = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student'
};
