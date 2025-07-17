/**
 * 학생 관리 모듈에서 사용하는 포맷팅 유틸리티 함수
 */

/**
 * 요일 번호를 한글 요일명으로 변환
 * @param {number} dayOfWeek - 요일 번호 (1: 월요일, 2: 화요일, ...)
 * @returns {string} 한글 요일명
 */
export const getDayName = (dayOfWeek) => {
  const days = ['', '월', '화', '수', '목', '금', '토', '일'];
  return days[dayOfWeek] || '';
};

/**
 * 지점 코드를 한글 지점명으로 변환
 * @param {string} branch - 지점 코드 (daechi, bukwirye, namwirye)
 * @returns {string} 한글 지점명
 */
export const getBranchName = (branch) => {
  switch (branch) {
    case 'bukwirye': return '북위례';
    case 'namwirye': return '남위례';
    case 'daechi': return '대치';
    default: return '대치';
  }
};

/**
 * 학생 상태 코드를 한글 상태명으로 변환
 * @param {string} status - 상태 코드 (active, inactive, etc)
 * @returns {string} 한글 상태명
 */
export const getStatusText = (status) => {
  switch (status) {
    case 'active': return '수강중';
    case 'inactive': return '휴강';
    default: return status;
  }
};

/**
 * 날짜 문자열을 한국 날짜 형식으로 변환
 * @param {string} dateString - ISO 형식 날짜 문자열
 * @returns {string} 한국 날짜 형식 문자열
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('날짜 형식 오류:', error);
    return dateString;
  }
};

/**
 * 날짜 문자열을 한국 날짜 및 시간 형식으로 변환
 * @param {string} dateString - ISO 형식 날짜 문자열
 * @returns {string} 한국 날짜 및 시간 형식 문자열
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('날짜 시간 형식 오류:', error);
    return dateString;
  }
};

/**
 * 초 단위 시간을 시간, 분, 초 형식으로 변환
 * @param {number} seconds - 초 단위 시간
 * @returns {string} 시간, 분, 초 형식 문자열
 */
export const formatDuration = (seconds) => {
  if (!seconds) return '-';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}시간 ${minutes}분 ${remainingSeconds}초`;
  } else if (minutes > 0) {
    return `${minutes}분 ${remainingSeconds}초`;
  } else {
    return `${remainingSeconds}초`;
  }
};

/**
 * 학년 코드에 따른 학년 목록 반환
 * @param {string} grade - 학년 코드 (초등부, 중등부, 고등부)
 * @returns {string[]} 해당 학년에 속하는 학년 목록
 */
export const getAvailableSchoolGrades = (grade) => {
  if (!grade) return [];

  switch (grade) {
    case '초등부':
      return ['1학년', '2학년', '3학년', '4학년', '5학년', '6학년'];
    case '중등부':
      return ['1학년', '2학년', '3학년'];
    case '고등부':
      return ['1학년', '2학년', '3학년'];
    default:
      return [];
  }
};