/**
 * @file 세션 관리 유틸리티
 * @description 세션 관리와 관련된 유틸리티 함수들을 제공합니다.
 */

import { supabase } from './client.js';
import { SESSION_TIMEOUT_MS, SESSION_REFRESH_THRESHOLD } from './constants.js';
import { logError, logInfo, logDebug } from '../../utils/logger.js';

/**
 * 현재 활성 세션을 가져옵니다.
 * @returns {Promise<Object|null>} 현재 세션 또는 null
 */
export const getCurrentSession = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    logError('세션 조회 중 오류 발생:', error);
    return null;
  }
};

/**
 * 세션을 갱신합니다.
 * @returns {Promise<Object|null>} 갱신된 세션 또는 null
 */
export const refreshSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    
    if (error) {
      logError('세션 갱신 실패:', error);
      throw error;
    }
    
    logInfo('세션 갱신 성공');
    return session;
  } catch (error) {
    logError('세션 갱신 중 오류 발생:', error);
    return null;
  }
};

/**
 * 세션 만료 여부를 확인합니다.
 * @param {number} expiresAt - 세션 만료 시간 (초 단위 타임스탬프)
 * @returns {boolean} 만료 여부
 */
export const isSessionExpired = (expiresAt) => {
  if (!expiresAt) return true;
  return Date.now() >= expiresAt * 1000;
};

/**
 * 세션 갱신이 필요한지 확인합니다.
 * @param {number} expiresAt - 세션 만료 시간 (초 단위 타임스탬프)
 * @returns {boolean} 갱신 필요 여부
 */
export const needsRefresh = (expiresAt) => {
  if (!expiresAt) return true;
  return (expiresAt * 1000) - Date.now() < SESSION_REFRESH_THRESHOLD;
};

/**
 * 세션 타임아웃 여부를 확인합니다.
 * @param {string} lastActivity - 마지막 활동 시간 (ISO 문자열)
 * @returns {boolean} 타임아웃 여부
 */
export const isSessionTimedOut = (session, lastActivity) => {
  if (!lastActivity) return false;
  
  const now = new Date();
  const lastActiveTime = new Date(lastActivity);
  const timeDiff = now - lastActiveTime;
  
  return timeDiff >= SESSION_TIMEOUT_MS;
};
