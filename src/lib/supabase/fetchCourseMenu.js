// Supabase에서 CourseMenu(강의 메뉴)를 가져오는 유틸 함수
// course_menu 테이블에서 데이터를 조회/업데이트
// 반환값: [{ id, name, slug, description, icon, color, order, is_active }, ...]

import { supabase } from './supabaseClientBrowser.js';

/**
 * course_menu 테이블에서 CourseMenu 정보를 조회한다.
 * @returns {Promise<Array>} CourseMenu 배열 (id, name, slug, description, icon, color, order, is_active 포함)
 */
export async function fetchCourseMenu() {
  const { data, error } = await supabase
    .from('course_menu')
    .select('*')
    .eq('is_active', true)
    .order('order', { ascending: true });

  if (error) throw error;

  return data ?? [];
}

/**
 * 메뉴 관리용: course_menu 테이블에서 모든 CourseMenu 정보를 조회한다 (활성/비활성 포함).
 * @returns {Promise<Array>} CourseMenu 배열 (id, name, slug, description, icon, color, order, is_active 포함)
 */
export async function fetchAllCourseMenu() {
  const { data, error } = await supabase
    .from('course_menu')
    .select('*')
    .order('order', { ascending: true });

  if (error) throw error;

  return data ?? [];
}

/**
 * 새로운 CourseMenu 항목을 추가한다.
 * @param {Object} menuItem - { name, slug?, description?, icon?, color?, order? }
 * @returns {Promise<Object>} 생성된 메뉴 항목
 */
export async function addCourseMenu(menuItem) {
  const { data, error } = await supabase
    .from('course_menu')
    .insert([{
      name: menuItem.name,
      slug: menuItem.slug || menuItem.name.toLowerCase().replace(/\s+/g, '-'),
      description: menuItem.description || null,
      icon: menuItem.icon || '📚',
      color: menuItem.color || '#6B7280',
      order: menuItem.order || 0,
      is_active: true
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * CourseMenu 항목을 업데이트한다.
 * @param {string} id - 메뉴 항목 ID
 * @param {Object} updates - 업데이트할 필드들
 * @returns {Promise<Object>} 업데이트된 메뉴 항목
 */
export async function updateCourseMenuItem(id, updates) {
  const { data, error } = await supabase
    .from('course_menu')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * CourseMenu 항목을 삭제한다.
 * @param {string} id - 메뉴 항목 ID
 * @returns {Promise<void>}
 */
export async function deleteCourseMenuItem(id) {
  const { error } = await supabase
    .from('course_menu')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * CourseMenu 배열의 순서를 일괄 업데이트한다.
 * @param {Array} menuItems - 순서가 변경된 메뉴 배열 (id와 order 필드 포함)
 * @returns {Promise<void>}
 */
export async function updateCourseMenu(menuItems) {
  // 각 메뉴 항목의 순서를 개별적으로 업데이트
  const updatePromises = menuItems.map((item, index) => 
    supabase
      .from('course_menu')
      .update({ 
        order: index + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', item.id)
  );

  const results = await Promise.all(updatePromises);
  
  // 모든 업데이트에서 에러가 없는지 확인
  const errors = results.filter(result => result.error);
  if (errors.length > 0) {
    throw new Error(`메뉴 순서 업데이트 실패: ${errors.map(e => e.error.message).join(', ')}`);
  }
}

/**
 * 특정 메뉴 항목의 활성화 상태를 토글한다.
 * @param {string} id - 메뉴 항목 ID
 * @param {boolean} isActive - 활성화 상태
 * @returns {Promise<Object>} 업데이트된 메뉴 항목
 */
export async function toggleCourseMenuActive(id, isActive) {
  const { data, error } = await supabase
    .from('course_menu')
    .update({ 
      is_active: isActive,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
