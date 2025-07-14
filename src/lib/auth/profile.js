/**
 * @file 사용자 프로필 관련 함수
 * @description 사용자 프로필 조회 및 업데이트와 관련된 함수들을 제공합니다.
 */

import { supabase } from './client.js';
import { ROLES } from './constants.js';
import * as logger from '../../utils/logger.js';

/**
 * 사용자 프로필을 조회합니다.
 * @param {string} userId - 조회할 사용자 ID
 * @returns {Promise<Object|null>} 사용자 프로필 정보 또는 null (에러 시)
 */
export const fetchUserProfile = async (userId) => {
  if (!userId) {
    logger.logDebug('[Auth] fetchUserProfile: 사용자 ID가 없어 null 역할 반환 (경로 1)');
    return { role: null };
  }
  
  logger.logDebug(`[Auth] fetchUserProfile 호출: userId=${userId}`);
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, role')
      .eq('id', userId)
      .single();

    if (error) {
      // 406 에러 또는 다른 에러가 발생해도 기본 프로필 정보 반환
      logger.logWarn(`[Auth] 프로필 조회 에러 (${error.code}): ${error.message}`);
      
      // 기본 관리자 프로필 정보 반환 (임시)
      if (userId === 'ec53ade3-5d2d-49b6-b939-4ba2b1d952db') {
        logger.logInfo('[Auth] 관리자 계정으로 기본 프로필 반환');
        return {
          id: userId,
          full_name: '관리자',
          avatar_url: null,
          role: 'admin'
        };
      }
      
      logger.logDebug(`[Auth] fetchUserProfile: 에러로 인해 기본 역할 반환: ${error.message}`);
      return { id: userId, role: 'student' }; // 기본 역할 반환
    }

    if (!data) {
      logger.logWarn(`[Auth] 프로필 데이터가 비어있습니다: ${userId}`);
      return { id: userId, role: 'student' }; // 기본 역할 반환
    }

    // 역할이 없는 경우 기본 역할 설정
    if (!data.role) {
      logger.logWarn(`[Auth] 프로필에 역할이 정의되지 않았습니다: ${userId}, 기본 역할 사용`);
      data.role = 'student';
    }

    logger.logDebug(`[Auth] fetchUserProfile 반환 (성공): role=${data.role}`);
    return data;
  } catch (error) {
    logger.logError(`[Auth] 프로필 조회 오류 (catch 블록): ${error.message}`, error);
    
    // 관리자 계정에 대한 특별 처리
    if (userId === 'ec53ade3-5d2d-49b6-b939-4ba2b1d952db') {
      logger.logInfo('[Auth] 관리자 계정 catch 블록에서 기본 프로필 반환');
      return {
        id: userId,
        full_name: '관리자',
        avatar_url: null,
        role: 'admin'
      };
    }
    
    return { id: userId, role: 'student' }; // 오류 발생 시 기본 역할 반환
  }
};

/**
 * 사용자 프로필을 업데이트합니다.
 * @param {string} userId - 업데이트할 사용자 ID
 * @param {Object} updates - 업데이트할 프로필 필드
 * @returns {Promise<Object>} 업데이트 결과
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    logger.logDebug('프로필 업데이트 중...', { userId, updates });
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
      
    if (error) {
      logger.logError('기본 프로필 생성 실패:', error);
      throw error;
    }
    
    logger.logDebug('프로필 업데이트 성공:', data);
    return { success: true, data };
  } catch (error) {
    logger.logError('프로필 업데이트 중 오류 발생:', error);
    return { success: false, error };
  }
};
