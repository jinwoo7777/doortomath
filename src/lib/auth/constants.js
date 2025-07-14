/**
 * @file 인증 관련 상수 정의
 * @description 역할, 에러 메시지 등 인증과 관련된 상수를 정의합니다.
 */

/**
 * 사용자 역할 상수
 * @enum {string}
 */
export const ROLES = {
  /** 관리자 역할 */
  ADMIN: 'admin',
  /** 강사 역할 */
  INSTRUCTOR: 'instructor',
  /** 학생 역할 */
  STUDENT: 'student'
};

/**
 * 역할별 기본 대시보드 리다이렉션 경로
 * @type {Object.<string, string>}
 */
export const DEFAULT_REDIRECTS = {
  [ROLES.ADMIN]: '/dashboard2/admin',
  [ROLES.INSTRUCTOR]: '/dashboard/instructor',
  [ROLES.STUDENT]: '/dashboard/student'
};

/**
 * 에러 메시지 맵
 * @type {Object.<string, string>}
 */
export const ERROR_MESSAGES = {
  'invalid_credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'email_not_confirmed': '이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.',
  'user_not_found': '사용자를 찾을 수 없습니다.',
  'network_error': '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.',
  'AuthApiError: Email not confirmed': '이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.',
  'AuthApiError: Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'AuthApiError: User already registered': '이미 등록된 사용자입니다.',
  'AuthApiError: User not found': '사용자를 찾을 수 없습니다.',
  'default': '오류가 발생했습니다. 잠시 후 다시 시도해주세요.'

};

/**
 * 세션 타임아웃 (밀리초)
 * @type {number}
 */
export const SESSION_TIMEOUT_MS = parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT_MS || '3600000', 10);

/**
 * 세션 갱신 임계값 (밀리초)
 * @type {number}
 */
export const SESSION_REFRESH_THRESHOLD = 300000; // 5분 전에 갱신 시도

/**
 * 세션 체크 주기 (밀리초)
 * @type {number}
 */
export const SESSION_CHECK_INTERVAL = 60000; // 1분마다 확인
