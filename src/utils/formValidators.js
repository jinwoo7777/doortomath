/**
 * @file 폼 유효성 검사 유틸리티
 * @description 구체적인 폼 유효성 검사 함수들을 제공합니다.
 */

import { 
  isValidEmail, 
  isValidPhone, 
  isValidPassword, 
  isValidName 
} from '../lib/auth/helpers.js';

/**
 * 학생 또는 강사 폼 유효성 검사 함수 선택
 * @param {Object} formData - 폼 데이터
 * @param {boolean} isInstructor - 강사인지 여부
 * @returns {Object} 검증 결과
 */
export const validateSignupForm = (formData, isInstructor = false) => {
  return isInstructor 
    ? validateInstructorForm(formData)
    : validateStudentForm(formData);
};

/**
 * 학생 회원가입 폼 유효성 검사
 * @param {Object} formData - 학생 회원가입 폼 데이터
 * @returns {Object} 검증 결과
 */
export const validateStudentForm = (formData) => {
  const errors = [];

  // 이름 검증
  if (!formData.name?.trim()) {
    errors.push('이름을 입력해주세요.');
  } else if (!isValidName(formData.name)) {
    errors.push('이름은 2자 이상 50자 이하여야 합니다.');
  }

  // 전화번호 검증
  if (!formData.phone?.trim()) {
    errors.push('전화번호를 입력해주세요.');
  } else if (!isValidPhone(formData.phone)) {
    errors.push('올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)');
  }

  // 이메일 검증
  if (!formData.email?.trim()) {
    errors.push('이메일을 입력해주세요.');
  } else if (!isValidEmail(formData.email)) {
    errors.push('유효한 이메일 주소를 입력해주세요.');
  }

  // 비밀번호 검증
  if (!formData.password) {
    errors.push('비밀번호를 입력해주세요.');
  } else if (!isValidPassword(formData.password)) {
    errors.push('비밀번호는 최소 6자 이상이어야 합니다.');
  }

  // 비밀번호 확인 검증
  if (formData.password !== formData.confirmPassword) {
    errors.push('비밀번호가 일치하지 않습니다.');
  }

  // 학교 검증
  if (!formData.school?.trim()) {
    errors.push('학교를 입력해주세요.');
  }

  // 학년 검증
  if (!formData.grade) {
    errors.push('학년을 선택해주세요.');
  }

  // 부모님 전화번호 검증
  if (!formData.parentPhone?.trim()) {
    errors.push('부모님 전화번호를 입력해주세요.');
  } else if (!isValidPhone(formData.parentPhone)) {
    errors.push('올바른 부모님 전화번호 형식이 아닙니다. (예: 010-1234-5678)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 강사 회원가입 폼 유효성 검사
 * @param {Object} formData - 강사 회원가입 폼 데이터
 * @returns {Object} 검증 결과
 */
export const validateInstructorForm = (formData) => {
  const errors = [];

  // 이름 검증
  if (!formData.name?.trim()) {
    errors.push('이름을 입력해주세요.');
  } else if (!isValidName(formData.name)) {
    errors.push('이름은 2자 이상 50자 이하여야 합니다.');
  }

  // 전화번호 검증
  if (!formData.phone?.trim()) {
    errors.push('전화번호를 입력해주세요.');
  } else if (!isValidPhone(formData.phone)) {
    errors.push('올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)');
  }

  // 이메일 검증
  if (!formData.email?.trim()) {
    errors.push('이메일을 입력해주세요.');
  } else if (!isValidEmail(formData.email)) {
    errors.push('유효한 이메일 주소를 입력해주세요.');
  }

  // 비밀번호 검증
  if (!formData.password) {
    errors.push('비밀번호를 입력해주세요.');
  } else if (!isValidPassword(formData.password)) {
    errors.push('비밀번호는 최소 6자 이상이어야 합니다.');
  }

  // 비밀번호 확인 검증
  if (formData.password !== formData.confirmPassword) {
    errors.push('비밀번호가 일치하지 않습니다.');
  }

  // 전공 검증
  if (!formData.major?.trim()) {
    errors.push('전공을 입력해주세요.');
  }

  // 경력 검증
  if (!formData.experience?.trim()) {
    errors.push('경력을 입력해주세요.');
  }

  // 자기소개 검증
  if (!formData.introduction?.trim()) {
    errors.push('자기소개를 입력해주세요.');
  } else if (formData.introduction.length < 10) {
    errors.push('자기소개는 최소 10자 이상 작성해주세요.');
  } else if (formData.introduction.length > 500) {
    errors.push('자기소개는 500자 이하로 작성해주세요.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 로그인 폼 유효성 검사
 * @param {Object} formData - 로그인 폼 데이터
 * @returns {Object} 검증 결과
 */
export const validateLoginForm = (formData) => {
  const errors = [];

  // 이메일 검증
  if (!formData.email?.trim()) {
    errors.push('이메일을 입력해주세요.');
  } else if (!isValidEmail(formData.email)) {
    errors.push('유효한 이메일 주소를 입력해주세요.');
  }

  // 비밀번호 검증
  if (!formData.password) {
    errors.push('비밀번호를 입력해주세요.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 비밀번호 재설정 폼 유효성 검사
 * @param {Object} formData - 비밀번호 재설정 폼 데이터
 * @returns {Object} 검증 결과
 */
export const validatePasswordResetForm = (formData) => {
  const errors = [];

  // 새 비밀번호 검증
  if (!formData.newPassword) {
    errors.push('새 비밀번호를 입력해주세요.');
  } else if (!isValidPassword(formData.newPassword)) {
    errors.push('새 비밀번호는 최소 6자 이상이어야 합니다.');
  }

  // 새 비밀번호 확인 검증
  if (formData.newPassword !== formData.confirmPassword) {
    errors.push('새 비밀번호가 일치하지 않습니다.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 프로필 수정 폼 유효성 검사
 * @param {Object} formData - 프로필 수정 폼 데이터
 * @returns {Object} 검증 결과
 */
export const validateProfileForm = (formData) => {
  const errors = [];

  // 이름 검증
  if (!formData.name?.trim()) {
    errors.push('이름을 입력해주세요.');
  } else if (!isValidName(formData.name)) {
    errors.push('이름은 2자 이상 50자 이하여야 합니다.');
  }

  // 전화번호 검증 (선택사항)
  if (formData.phone && !isValidPhone(formData.phone)) {
    errors.push('올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 문의 폼 유효성 검사
 * @param {Object} formData - 문의 폼 데이터
 * @returns {Object} 검증 결과
 */
export const validateInquiryForm = (formData) => {
  const errors = [];

  // 이름 검증
  if (!formData.name?.trim()) {
    errors.push('이름을 입력해주세요.');
  } else if (!isValidName(formData.name)) {
    errors.push('이름은 2자 이상 50자 이하여야 합니다.');
  }

  // 이메일 검증
  if (!formData.email?.trim()) {
    errors.push('이메일을 입력해주세요.');
  } else if (!isValidEmail(formData.email)) {
    errors.push('유효한 이메일 주소를 입력해주세요.');
  }

  // 제목 검증
  if (!formData.subject?.trim()) {
    errors.push('제목을 입력해주세요.');
  } else if (formData.subject.length < 5) {
    errors.push('제목은 최소 5자 이상 입력해주세요.');
  } else if (formData.subject.length > 100) {
    errors.push('제목은 100자 이하로 입력해주세요.');
  }

  // 내용 검증
  if (!formData.message?.trim()) {
    errors.push('문의 내용을 입력해주세요.');
  } else if (formData.message.length < 10) {
    errors.push('문의 내용은 최소 10자 이상 입력해주세요.');
  } else if (formData.message.length > 1000) {
    errors.push('문의 내용은 1000자 이하로 입력해주세요.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
