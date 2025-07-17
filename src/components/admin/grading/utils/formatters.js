/**
 * 날짜 문자열을 YYYY-MM-DD 형식으로 포맷팅합니다.
 * @param {string} dateString - 포맷팅할 날짜 문자열
 * @returns {string} 포맷팅된 날짜 문자열
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    return dateString;
  }
};

/**
 * 날짜 문자열을 YYYY-MM-DD HH:MM 형식으로 포맷팅합니다.
 * @param {string} dateString - 포맷팅할 날짜 문자열
 * @returns {string} 포맷팅된 날짜와 시간 문자열
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * 초 단위 시간을 시간, 분, 초 형식으로 포맷팅합니다.
 * @param {number} seconds - 포맷팅할 초 단위 시간
 * @returns {string} 포맷팅된 시간 문자열
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
