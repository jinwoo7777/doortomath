/**
 * @file 통합 유틸리티 함수들
 * @description 공통으로 사용되는 유틸리티 함수들을 제공합니다.
 */

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind CSS 클래스 병합 함수
 * @param {...string} inputs - 병합할 클래스명들
 * @returns {string} 병합된 클래스명
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * 숫자를 두 자리로 패딩하는 함수
 * @param {number} num - 패딩할 숫자
 * @returns {string} 패딩된 문자열
 */
export const padNumber = (num) => String(num).padStart(2, "0");

/**
 * URL 유효성 검사 함수
 * @param {string} url - 검사할 URL
 * @returns {boolean} 유효한 URL인지 여부
 */
export const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * 깊은 복사 함수
 * @param {any} obj - 복사할 객체
 * @returns {any} 깊은 복사된 객체
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  return obj;
};

/**
 * 랜덤 ID 생성 함수
 * @param {number} length - ID 길이 (기본값: 8)
 * @returns {string} 랜덤 ID
 */
export const generateRandomId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * 객체에서 빈 값 제거 함수
 * @param {Object} obj - 정리할 객체
 * @returns {Object} 빈 값이 제거된 객체
 */
export const removeEmptyValues = (obj) => {
  const cleaned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (value !== null && value !== undefined && value !== '') {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
};

/**
 * 배열을 청크로 나누는 함수
 * @param {Array} array - 나눌 배열
 * @param {number} size - 청크 크기
 * @returns {Array} 청크로 나뉜 배열
 */
export const chunk = (array, size) => {
  if (!Array.isArray(array)) return [];
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * 배열에서 중복 제거 함수
 * @param {Array} array - 중복을 제거할 배열
 * @param {string} key - 객체 배열의 경우 중복 체크할 키
 * @returns {Array} 중복이 제거된 배열
 */
export const removeDuplicates = (array, key = null) => {
  if (!Array.isArray(array)) return [];
  
  if (key) {
    // 객체 배열의 경우
    const seen = new Set();
    return array.filter(item => {
      if (!seen.has(item[key])) {
        seen.add(item[key]);
        return true;
      }
      return false;
    });
  } else {
    // 일반 배열의 경우
    return [...new Set(array)];
  }
};

/**
 * 금액 포맷팅 함수
 * @param {number} amount - 포맷팅할 금액
 * @param {string} currency - 통화 기호 (기본값: '₩')
 * @returns {string} 포맷팅된 금액
 */
export const formatCurrency = (amount, currency = '₩') => {
  if (typeof amount !== 'number') return `${currency}0`;
  return `${currency}${amount.toLocaleString()}`;
};

/**
 * 날짜 포맷팅 함수
 * @param {Date|string} date - 포맷팅할 날짜
 * @param {string} format - 포맷 형식 (기본값: 'YYYY-MM-DD')
 * @returns {string} 포맷팅된 날짜
 */
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = padNumber(d.getMonth() + 1);
  const day = padNumber(d.getDate());
  const hours = padNumber(d.getHours());
  const minutes = padNumber(d.getMinutes());
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes);
};

/**
 * 상대 시간 표시 함수
 * @param {Date|string} date - 기준 날짜
 * @returns {string} 상대 시간 표시
 */
export const timeAgo = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const past = new Date(date);
  const diff = now - past;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (years > 0) return `${years}년 전`;
  if (months > 0) return `${months}개월 전`;
  if (weeks > 0) return `${weeks}주 전`;
  if (days > 0) return `${days}일 전`;
  if (hours > 0) return `${hours}시간 전`;
  if (minutes > 0) return `${minutes}분 전`;
  return '방금 전';
};

/**
 * 파일 크기 포맷팅 함수
 * @param {number} bytes - 바이트 수
 * @returns {string} 포맷팅된 파일 크기
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * 로컬 스토리지 안전 접근 함수
 * @param {string} key - 저장 키
 * @param {any} defaultValue - 기본값
 * @returns {any} 저장된 값 또는 기본값
 */
export const getLocalStorage = (key, defaultValue = null) => {
  try {
    if (typeof window === 'undefined') return defaultValue;
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('로컬 스토리지 읽기 오류:', error);
    return defaultValue;
  }
};

/**
 * 로컬 스토리지 안전 저장 함수
 * @param {string} key - 저장 키
 * @param {any} value - 저장할 값
 * @returns {boolean} 저장 성공 여부
 */
export const setLocalStorage = (key, value) => {
  try {
    if (typeof window === 'undefined') return false;
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('로컬 스토리지 저장 오류:', error);
    return false;
  }
};

/**
 * 로컬 스토리지 삭제 함수
 * @param {string} key - 삭제할 키
 * @returns {boolean} 삭제 성공 여부
 */
export const removeLocalStorage = (key) => {
  try {
    if (typeof window === 'undefined') return false;
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('로컬 스토리지 삭제 오류:', error);
    return false;
  }
};
