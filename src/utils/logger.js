/**
 * 로깅 유틸리티
 * - 개발 환경: 모든 로그 출력
 * - 프로덕션 환경: 에러 및 경고만 출력 (로그 레벨 조절 가능)
 * - 성능 측정 및 그룹화 기능 제공
 */

// 환경 변수에서 로깅 레벨 가져오기 (기본값: 'debug')
const LOG_LEVEL = (() => {
  if (typeof process !== 'undefined' && process.env.LOG_LEVEL) {
    return process.env.LOG_LEVEL.toLowerCase();
  }
  if (typeof window !== 'undefined' && window.ENV?.LOG_LEVEL) {
    return window.ENV.LOG_LEVEL.toLowerCase();
  }
  return 'debug';
})();

// 로그 레벨 우선순위
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4
};

// 현재 로그 레벨에 따른 출력 여부 확인
const shouldLog = (level) => {
  const currentLevel = LOG_LEVELS[LOG_LEVEL] ?? LOG_LEVELS.debug;
  const messageLevel = LOG_LEVELS[level] ?? LOG_LEVELS.debug;
  return messageLevel <= currentLevel;
};

// 개발 환경 여부 판단
const isDev = (() => {
  if (typeof process !== 'undefined' && process.env.NODE_ENV) {
    return process.env.NODE_ENV === 'development';
  }
  if (typeof window !== 'undefined' && window.ENV && window.ENV.NODE_ENV) {
    return window.ENV.NODE_ENV === 'development';
  }
  // 환경 정보를 알 수 없을 때는 콘솔이 풍부한 개발 환경이라고 가정
  return true;
})();

// 로그 스타일
const STYLES = {
  error: 'color: #ff4d4f; font-weight: bold;',
  warn: 'color: #faad14; font-weight: bold;',
  info: 'color: #1890ff;',
  debug: 'color: #52c41a;',
  trace: 'color: #8c8c8c;',
  group: 'color: #722ed1; font-weight: bold;',
  time: 'color: #13c2c2;',
  label: 'background: #f0f5ff; color: #2f54eb; padding: 2px 6px; border-radius: 4px; font-size: 0.85em;',
  value: 'background: #f6ffed; color: #52c41a; padding: 2px 6px; border-radius: 4px; font-size: 0.85em;',
};

/**
 * 로그 메시지 포맷팅
 */
const formatMessage = (level, args) => {
  const timestamp = new Date().toISOString();
  const prefix = `%c[${timestamp}] [${level.toUpperCase()}]`;
  const style = STYLES[level] || '';
  
  // 첫 번째 인자가 객체이고 message 속성이 있으면 포맷팅
  if (args.length > 0 && typeof args[0] === 'object' && args[0] !== null && 'message' in args[0]) {
    const { message, ...rest } = args[0];
    return [
      `${prefix} ${message}`,
      style,
      ...Object.entries(rest).flatMap(([key, value]) => [
        `\n%c${key}:`, 
        STYLES.label,
        value,
        '' // 줄바꿈
      ]).slice(0, -1) // 마지막 빈 문자열 제거
    ];
  }
  
  // Ensure no undefined or null values are passed directly to console
  const cleanedArgs = args.map(arg => (arg === undefined || arg === null) ? String(arg) : arg);
  return [`${prefix}`, style, ...cleanedArgs];
};

/**
 * 에러 로그 (모든 환경에서 출력)
 * @param {...any} args - 로그에 출력할 인자들
 */
export const logError = (...args) => {
  if (shouldLog('error')) {
    console.error(...formatMessage('error', args));
  }
}

/**
 * 경고 로그 (개발 환경에서만 기본 출력, 프로덕션에서는 설정에 따라 출력)
 * @param {...any} args - 로그에 출력할 인자들
 */
export const logWarn = (...args) => {
  if (shouldLog('warn')) {
    console.warn(...formatMessage('warn', args));
  }
}

/**
 * 정보 로그 (개발 환경에서만 기본 출력)
 * @param {...any} args - 로그에 출력할 인자들
 */
export const logInfo = (...args) => {
  if (shouldLog('info')) {
    console.info(...formatMessage('info', args));
  }
}

/**
 * 디버그 로그 (개발 환경에서만 출력)
 * @param {...any} args - 로그에 출력할 인자들
 */
export const logDebug = (...args) => {
  if (shouldLog('debug')) {
    console.debug(...formatMessage('debug', args));
  }
}

/**
 * 트레이스 로그 (상세 디버깅용, 개발 환경에서만 출력)
 * @param {...any} args - 로그에 출력할 인자들
 */
export const logTrace = (...args) => {
  if (shouldLog('trace')) {
    console.trace(...formatMessage('trace', args));
  }
}

/**
 * 로그 그룹 시작
 * @param {string} label - 그룹 라벨
 * @param {boolean} [collapsed=true] - 접을지 여부
 */
export const logGroupStart = (label, collapsed = true) => {
  if (!shouldLog('debug')) return;
  
  if (typeof console === 'undefined' || typeof console.group === 'undefined' || typeof console.groupCollapsed === 'undefined') return;
  const method = collapsed ? console.groupCollapsed : console.group;
  method.call(console, `%c[${new Date().toISOString()}] ${label}`, STYLES.group);
}

/**
 * 로그 그룹 종료
 */
export const logGroupEnd = () => {
  if (!shouldLog('debug')) return;
  console.groupEnd();
}

/**
 * 성능 측정 시작
 * @param {string} label - 측정 라벨
 * @returns {string} 측정 ID
 */
export const timeStart = (label) => {
  if (!shouldLog('debug')) return null;
  
  const id = `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  console.time(id);
  console.log(`%c[${new Date().toISOString()}] ⏱️ ${label} 시작`, STYLES.time);
  return id;
}

/**
 * 성능 측정 종료
 * @param {string} id - 측정 ID
 * @param {string} [label] - 종료 메시지 라벨 (기본: '완료')
 */
export const timeEnd = (id, label = '완료') => {
  if (!id || !shouldLog('debug')) return;
  
  console.timeEnd(id);
  console.log(`%c[${new Date().toISOString()}] ✅ ${label}`, STYLES.time);
}

/**
 * 조건부 로깅
 * @param {boolean} condition - 로깅 여부
 * @param {Function} loggerFn - 사용할 로거 함수 (log, warn, error 등)
 * @param {...any} args - 로그에 출력할 인자들
 */
export const logIf = (condition, loggerFn, ...args) => {
  if (condition) {
    loggerFn(...args);
  }
}

// 각 로깅 함수는 이미 export function으로 정의되어 있으므로, 별도로 export 할 필요가 없습니다.
// 필요한 경우, logger 객체를 재구성하여 export 할 수 있습니다.

// logger 객체 생성 및 export
export const logger = {
  error: logError,
  warn: logWarn,
  info: logInfo,
  debug: logDebug,
  trace: logTrace,
  groupStart: logGroupStart,
  groupEnd: logGroupEnd,
  timeStart: timeStart,
  timeEnd: timeEnd,
  logIf: logIf
};

// 기본 export도 제공
export default logger;

// logger 객체는 내부적으로만 사용하거나, 필요에 따라 별도로 export 할 수 있습니다.
// 현재는 명명된 export를 통해 개별 함수를 사용하는 것을 권장합니다.
// const logger = { ... };

