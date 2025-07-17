/**
 * 테이블 정렬을 위한 유틸리티 함수
 */

/**
 * 객체에서 중첩된 속성 값을 안전하게 가져오는 함수
 * @param {Object} obj - 대상 객체
 * @param {string} path - 속성 경로 (예: 'user.name', 'schedules.subject')
 * @param {*} defaultValue - 값이 없을 경우 반환할 기본값
 * @returns {*} 속성 값 또는 기본값
 */
export const getNestedValue = (obj, path, defaultValue = null) => {
  if (!obj || !path) return defaultValue;
  
  const keys = path.split('.');
  let value = obj;
  
  for (const key of keys) {
    if (value === null || value === undefined || !Object.prototype.hasOwnProperty.call(value, key)) {
      return defaultValue;
    }
    value = value[key];
  }
  
  return value === null || value === undefined ? defaultValue : value;
};

/**
 * 문자열 값을 비교하는 함수
 * @param {string} a - 첫 번째 문자열
 * @param {string} b - 두 번째 문자열
 * @param {string} direction - 정렬 방향 ('asc' 또는 'desc')
 * @returns {number} 비교 결과 (-1, 0, 1)
 */
export const compareStrings = (a, b, direction = 'asc') => {
  // null, undefined 값 처리
  if (a === null || a === undefined) return direction === 'asc' ? 1 : -1;
  if (b === null || b === undefined) return direction === 'asc' ? -1 : 1;
  
  // 문자열로 변환 후 비교
  const strA = String(a).toLowerCase();
  const strB = String(b).toLowerCase();
  
  return direction === 'asc' 
    ? strA.localeCompare(strB, 'ko') 
    : strB.localeCompare(strA, 'ko');
};

/**
 * 숫자 값을 비교하는 함수
 * @param {number} a - 첫 번째 숫자
 * @param {number} b - 두 번째 숫자
 * @param {string} direction - 정렬 방향 ('asc' 또는 'desc')
 * @returns {number} 비교 결과 (-1, 0, 1)
 */
export const compareNumbers = (a, b, direction = 'asc') => {
  // null, undefined 값 처리
  if (a === null || a === undefined) return direction === 'asc' ? 1 : -1;
  if (b === null || b === undefined) return direction === 'asc' ? -1 : 1;
  
  // 숫자로 변환 후 비교
  const numA = Number(a);
  const numB = Number(b);
  
  // NaN 처리
  if (isNaN(numA)) return direction === 'asc' ? 1 : -1;
  if (isNaN(numB)) return direction === 'asc' ? -1 : 1;
  
  return direction === 'asc' ? numA - numB : numB - numA;
};

/**
 * 날짜 값을 비교하는 함수
 * @param {Date|string} a - 첫 번째 날짜
 * @param {Date|string} b - 두 번째 날짜
 * @param {string} direction - 정렬 방향 ('asc' 또는 'desc')
 * @returns {number} 비교 결과 (-1, 0, 1)
 */
export const compareDates = (a, b, direction = 'asc') => {
  // null, undefined 값 처리
  if (a === null || a === undefined) return direction === 'asc' ? 1 : -1;
  if (b === null || b === undefined) return direction === 'asc' ? -1 : 1;
  
  // 날짜 객체로 변환
  const dateA = a instanceof Date ? a : new Date(a);
  const dateB = b instanceof Date ? b : new Date(b);
  
  // 유효하지 않은 날짜 처리
  if (isNaN(dateA.getTime())) return direction === 'asc' ? 1 : -1;
  if (isNaN(dateB.getTime())) return direction === 'asc' ? -1 : 1;
  
  return direction === 'asc' 
    ? dateA.getTime() - dateB.getTime() 
    : dateB.getTime() - dateA.getTime();
};

/**
 * 불리언 값을 비교하는 함수
 * @param {boolean} a - 첫 번째 불리언
 * @param {boolean} b - 두 번째 불리언
 * @param {string} direction - 정렬 방향 ('asc' 또는 'desc')
 * @returns {number} 비교 결과 (-1, 0, 1)
 */
export const compareBooleans = (a, b, direction = 'asc') => {
  // null, undefined 값 처리
  if (a === null || a === undefined) return direction === 'asc' ? 1 : -1;
  if (b === null || b === undefined) return direction === 'asc' ? -1 : 1;
  
  // 불리언 비교 (true가 더 큰 값으로 처리)
  const boolA = Boolean(a);
  const boolB = Boolean(b);
  
  if (boolA === boolB) return 0;
  
  return direction === 'asc'
    ? (boolA ? 1 : -1)
    : (boolA ? -1 : 1);
};

/**
 * 값의 타입에 따라 적절한 비교 함수를 선택하여 비교하는 함수
 * @param {*} a - 첫 번째 값
 * @param {*} b - 두 번째 값
 * @param {string} direction - 정렬 방향 ('asc' 또는 'desc')
 * @returns {number} 비교 결과 (-1, 0, 1)
 */
export const compareValues = (a, b, direction = 'asc') => {
  // null, undefined 값 처리
  if (a === null || a === undefined) return direction === 'asc' ? 1 : -1;
  if (b === null || b === undefined) return direction === 'asc' ? -1 : 1;
  
  // 타입에 따른 비교
  const typeA = typeof a;
  const typeB = typeof b;
  
  // 타입이 다른 경우 문자열로 변환하여 비교
  if (typeA !== typeB) {
    return compareStrings(String(a), String(b), direction);
  }
  
  // 타입별 비교
  switch (typeA) {
    case 'number':
      return compareNumbers(a, b, direction);
    case 'string':
      // 날짜 형식 문자열인지 확인
      if (
        /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/.test(a) &&
        /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/.test(b)
      ) {
        return compareDates(a, b, direction);
      }
      return compareStrings(a, b, direction);
    case 'boolean':
      return compareBooleans(a, b, direction);
    case 'object':
      if (a instanceof Date && b instanceof Date) {
        return compareDates(a, b, direction);
      }
      // 객체는 문자열로 변환하여 비교
      return compareStrings(JSON.stringify(a), JSON.stringify(b), direction);
    default:
      return compareStrings(String(a), String(b), direction);
  }
};