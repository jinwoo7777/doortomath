/**
 * @file 통합 인증 헬퍼 함수들
 * @description 인증과 관련된 모든 유틸리티 함수들을 제공합니다.
 */

import { ERROR_MESSAGES } from './constants.js';

/**
 * Supabase 인증 에러 메시지 한국어 변환
 */
const AUTH_ERROR_MAP = {
  'Email not confirmed': '이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.',
  'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'Email link is invalid or has expired': '이메일 링크가 만료되었거나 유효하지 않습니다.',
  'User already registered': '이미 가입된 이메일 주소입니다.',
  'Unable to validate email address: invalid format': '유효하지 않은 이메일 형식입니다.',
  'Password should be at least 6 characters': '비밀번호는 최소 6자 이상이어야 합니다.',
  'Invalid email or password': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'Unable to validate email address: Domain not found': '존재하지 않는 이메일 도메인입니다.',
  'User not found': '가입되지 않은 이메일 주소입니다.',
  'New password should be different from the old password': '이전 비밀번호와 다른 비밀번호를 사용해주세요.',
  'Password recovery requires an email': '이메일 주소를 입력해주세요.',
};

/**
 * 에러 메시지를 사용자 친화적으로 변환
 * @param {Error|string} error - 에러 객체 또는 메시지
 * @returns {string} 사용자 친화적인 에러 메시지
 */
export const getErrorMessage = (error) => {
  if (!error) return ERROR_MESSAGES.default;
  
  // 에러 메시지 추출
  let message = '';
  if (typeof error === 'string') {
    message = error;
  } else if (error.message) {
    message = error.message;
  } else {
    message = String(error);
  }
  
  // Supabase 에러 매핑 우선 확인
  if (AUTH_ERROR_MAP[message]) {
    return AUTH_ERROR_MAP[message];
  }
  
  // 일반적인 에러 패턴 확인
  const errorKey = Object.keys(ERROR_MESSAGES).find(key => 
    message.toLowerCase().includes(key.toLowerCase())
  );
  
  if (errorKey) {
    return ERROR_MESSAGES[errorKey];
  }
  
  return message || ERROR_MESSAGES.default;
};

/**
 * 에러 객체에서 에러 메시지 추출 (레거시 호환)
 * @param {Error|string} error - 에러 객체 또는 메시지
 * @returns {string} 사용자 친화적인 에러 메시지
 */
export const extractAuthError = (error) => {
  return getErrorMessage(error);
};

/**
 * 이메일 형식 유효성 검사
 * @param {string} email - 검사할 이메일
 * @returns {boolean} 유효한 이메일인지 여부
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * 전화번호 형식 유효성 검사
 * @param {string} phone - 검사할 전화번호
 * @returns {boolean} 유효한 전화번호인지 여부
 */
export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const phoneRegex = /^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$/;
  return phoneRegex.test(phone.trim());
};

/**
 * 비밀번호 강도 검사
 * @param {string} password - 검사할 비밀번호
 * @returns {Object} 검사 결과 객체
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      strength: 0,
      requirements: {
        minLength: false,
        hasUpper: false,
        hasLower: false,
        hasNumber: false,
        hasSpecial: false
      }
    };
  }
  
  const minLength = 6;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const isValid = password.length >= minLength;
  const strength = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  
  return {
    isValid,
    strength,
    requirements: {
      minLength: password.length >= minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial
    }
  };
};

/**
 * 간단한 비밀번호 검증 (레거시 호환)
 * @param {string} password - 검사할 비밀번호
 * @returns {boolean} 유효한 비밀번호인지 여부
 */
export const isValidPassword = (password) => {
  return validatePassword(password).isValid;
};

/**
 * 역할 기반 접근 권한 확인
 * @param {string} userRole - 사용자 역할
 * @param {string|string[]} requiredRoles - 필요한 역할(들)
 * @returns {boolean} 접근 권한 여부
 */
export const hasPermission = (userRole, requiredRoles) => {
  if (!userRole) return false;
  
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return roles.some(role => userRole === role);
};

/**
 * 사용자 이름 유효성 검사
 * @param {string} name - 검사할 이름
 * @returns {boolean} 유효한 이름인지 여부
 */
export const isValidName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 50;
};

/**
 * 안전한 리다이렉트 URL 검증
 * @param {string} url - 검증할 URL
 * @returns {boolean} 안전한 URL인지 여부
 */
export const isSafeRedirectUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  // 상대 경로만 허용
  if (url.startsWith('/') && !url.startsWith('//')) {
    return true;
  }
  
  // 절대 경로는 허용하지 않음
  return false;
};

/**
 * 로그인 폼 데이터 검증
 * @param {Object} formData - 로그인 폼 데이터
 * @returns {Object} 검증 결과
 */
export const validateLoginForm = (formData) => {
  const errors = [];

  if (!formData.email?.trim()) {
    errors.push('이메일을 입력해주세요.');
  } else if (!isValidEmail(formData.email)) {
    errors.push('유효한 이메일 주소를 입력해주세요.');
  }

  if (!formData.password) {
    errors.push('비밀번호를 입력해주세요.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 회원가입 폼 기본 검증
 * @param {Object} formData - 회원가입 폼 데이터
 * @returns {Object} 검증 결과
 */
export const validateSignupForm = (formData) => {
  const errors = [];

  if (!formData.name?.trim()) {
    errors.push('이름을 입력해주세요.');
  } else if (!isValidName(formData.name)) {
    errors.push('이름은 2자 이상 50자 이하여야 합니다.');
  }

  if (!formData.email?.trim()) {
    errors.push('이메일을 입력해주세요.');
  } else if (!isValidEmail(formData.email)) {
    errors.push('유효한 이메일 주소를 입력해주세요.');
  }

  if (!formData.password) {
    errors.push('비밀번호를 입력해주세요.');
  } else if (!isValidPassword(formData.password)) {
    errors.push('비밀번호는 최소 6자 이상이어야 합니다.');
  }

  if (formData.password !== formData.confirmPassword) {
    errors.push('비밀번호가 일치하지 않습니다.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 문자열 자르기 및 ellipsis 추가
 * @param {string} str - 자를 문자열
 * @param {number} length - 최대 길이
 * @returns {string} 자른 문자열
 */
export const truncateString = (str, length = 50) => {
  if (!str || typeof str !== 'string') return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
};

/**
 * 대기 시간 추가 (딜레이)
 * @param {number} ms - 대기 시간 (밀리초)
 * @returns {Promise} 대기 Promise
 */
export const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * 디바운스 함수 생성
 * @param {Function} func - 실행할 함수
 * @param {number} wait - 대기 시간
 * @returns {Function} 디바운스된 함수
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * 쓰로틀 함수 생성
 * @param {Function} func - 실행할 함수
 * @param {number} limit - 제한 시간
 * @returns {Function} 쓰로틀된 함수
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};
