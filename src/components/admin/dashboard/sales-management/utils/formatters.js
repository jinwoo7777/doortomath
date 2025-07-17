/**
 * 금액을 한국 원화 형식으로 포맷팅합니다.
 * @param {number} amount - 포맷팅할 금액
 * @returns {string} 포맷팅된 금액 문자열
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(amount);
};

/**
 * 요일 번호를 한글 요일명으로 변환합니다.
 * @param {number} dayNumber - 요일 번호 (0: 일요일, 6: 토요일)
 * @returns {string} 한글 요일명
 */
export const getDayName = (dayNumber) => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[dayNumber] || '';
};

/**
 * 결제율에 따른 텍스트 색상 클래스를 반환합니다.
 * @param {number} paymentRate - 결제율 (0-100)
 * @returns {string} CSS 클래스명
 */
export const getRevenueStatusColor = (paymentRate) => {
  if (paymentRate >= 80) return 'text-green-600';
  if (paymentRate >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

/**
 * 연체 개월 수에 따른 배지 변형을 반환합니다.
 * @param {number} months - 연체 개월 수
 * @returns {string} 배지 변형 타입
 */
export const getOverdueBadgeVariant = (months) => {
  if (months === 1) return 'secondary';
  if (months === 2) return 'destructive';
  if (months >= 3) return 'destructive';
  return 'default';
};