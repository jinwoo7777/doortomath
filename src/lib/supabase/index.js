// Supabase 관련 유틸리티 함수들을 모아서 내보냅니다.

// Supabase 클라이언트 (클라이언트 환경용)
import { supabase as supabaseBrowser, getSupabaseClient as getSupabaseClientBrowser } from './supabaseClientBrowser.js';

// 유틸리티 함수들
import { fetchCourseMenu, updateCourseMenu } from './fetchCourseMenu.js';
import { fetchCourses } from './fetchCourses.js';

const supabase = supabaseBrowser;
const getSupabaseClient = getSupabaseClientBrowser;

export {
  // Supabase 클라이언트
  supabase,
  getSupabaseClient,
  
  // 유틸리티 함수들
  fetchCourseMenu,
  updateCourseMenu,
  fetchCourses
};

// 기본 내보내기로 supabase 클라이언트 내보내기
export default supabase;
