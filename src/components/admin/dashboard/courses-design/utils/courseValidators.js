// utils/courseValidators.js
/**
 * 폼 데이터의 유효성을 검사하는 함수
 * @param {Object} formData - 검사할 폼 데이터
 * @returns {Object} - { isValid: boolean, errors: Array }
 */
export const validateCourseForm = (formData) => {
    const errors = [];
  
    // 필수 필드 검사
    if (!formData.title.trim()) {
      errors.push('제목을 입력해주세요.');
    }
  
    if (!formData.description.trim()) {
      errors.push('설명을 입력해주세요.');
    }
  
    // 상태 값 검증
    if (!['draft', 'published'].includes(formData.status)) {
      errors.push('잘못된 상태 값입니다.');
    }
  
    // 숫자 필드 검증
    if (formData.seats < 1) {
      errors.push('정원은 1명 이상이어야 합니다.');
    }
  
    if (formData.weeks < 1) {
      errors.push('기간은 1주 이상이어야 합니다.');
    }
  
    if (formData.semesters < 1) {
      errors.push('학기는 1학기 이상이어야 합니다.');
    }
  
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  