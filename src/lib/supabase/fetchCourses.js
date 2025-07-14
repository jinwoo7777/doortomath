// 'use client';
// Supabase 강의 데이터를 가져오는 유틸 함수
// 카테고리별 필터링은 컴포넌트에서 수행합니다.

import { supabase } from './supabaseClientBrowser.js';

/**
 * Supabase 에서 모든 강의를 불러온다.
 * @returns {Promise<Array>} courses
 */
export async function fetchCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
