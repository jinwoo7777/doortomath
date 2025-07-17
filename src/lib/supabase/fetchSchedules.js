// Supabase에서 수업시간표(schedules)를 관리하는 유틸 함수들
// schedules 테이블에서 데이터를 조회/생성/수정/삭제

import { supabase } from './supabaseClientBrowser.js';

/**
 * 모든 수업시간표를 조회한다.
 * @param {string} grade - 학년 필터 (선택사항)
 * @param {string} branch - 지점 필터 ('daechi', 'bukwirye', 'namwirye')
 * @returns {Promise<Array>} 시간표 배열
 */
export async function fetchAllSchedules(grade = null, branch = 'daechi') {
  let query = supabase
    .from('schedules')
    .select('*');
    
  if (grade) {
    query = query.eq('grade', grade);
  }
  
  if (branch) {
    query = query.eq('branch', branch);
  }
  
  const { data, error } = await query
    .eq('is_active', true)
    .order('day_of_week', { ascending: true })
    .order('time_slot', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * 관리자용: 모든 수업시간표를 조회한다 (비활성 포함).
 * @param {string} grade - 학년 필터 (선택사항)
 * @param {string} branch - 지점 필터 ('daechi', 'bukwirye', 'namwirye')
 * @returns {Promise<Array>} 시간표 배열
 */
export async function fetchAllSchedulesForAdmin(grade = null, branch = 'daechi') {
  console.log('🔍 fetchAllSchedulesForAdmin 호출:', { grade, branch });
  
  let query = supabase
    .from('schedules')
    .select('*');
    
  if (grade) {
    query = query.eq('grade', grade);
  }
  
  if (branch) {
    query = query.eq('branch', branch);
  }
  
  const { data, error } = await query
    .order('day_of_week', { ascending: true })
    .order('time_slot', { ascending: true });

  console.log('🔍 fetchAllSchedulesForAdmin 결과:', { 
    grade, 
    branch, 
    dataLength: data?.length || 0, 
    error: error?.message || null,
    sampleData: data?.slice(0, 2) || []
  });

  if (error) throw error;
  return data ?? [];
}

/**
 * 새로운 수업시간표를 추가한다.
 * @param {Object} scheduleData - 시간표 데이터
 * @returns {Promise<Object>} 생성된 시간표
 */
export async function addSchedule(scheduleData) {
  const { data, error } = await supabase
    .from('schedules')
    .insert([{
      grade: scheduleData.grade,
      day_of_week: scheduleData.day_of_week,
      time_slot: scheduleData.time_slot,
      subject: scheduleData.subject,
      teacher_name: scheduleData.teacher_name || null,
      classroom: scheduleData.classroom || null,
      description: scheduleData.description || null,
      max_students: scheduleData.max_students || 30,
      current_students: scheduleData.current_students || 0,
      is_active: scheduleData.is_active !== false
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * 수업시간표를 업데이트한다.
 * @param {string} id - 시간표 ID
 * @param {Object} updates - 업데이트할 필드들
 * @returns {Promise<Object>} 업데이트된 시간표
 */
export async function updateSchedule(id, updates) {
  const { data, error } = await supabase
    .from('schedules')
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
 * 수업시간표를 삭제한다.
 * @param {string} id - 시간표 ID
 * @returns {Promise<void>}
 */
export async function deleteSchedule(id) {
  const { error } = await supabase
    .from('schedules')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * 수업시간표의 활성화 상태를 토글한다.
 * @param {string} id - 시간표 ID
 * @param {boolean} isActive - 활성화 상태
 * @returns {Promise<Object>} 업데이트된 시간표
 */
export async function toggleScheduleActive(id, isActive) {
  const { data, error } = await supabase
    .from('schedules')
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

/**
 * 요일 번호를 한국어 이름으로 변환
 * @param {number} dayNum - 요일 번호 (1-7)
 * @returns {string} 요일 이름
 */
export function getDayName(dayNum) {
  const days = {
    1: '월요일',
    2: '화요일', 
    3: '수요일',
    4: '목요일',
    5: '금요일',
    6: '토요일',
    7: '일요일'
  };
  return days[dayNum] || '알 수 없음';
}

/**
 * 한국어 요일 이름을 번호로 변환
 * @param {string} dayName - 요일 이름
 * @returns {number} 요일 번호
 */
export function getDayNumber(dayName) {
  const days = {
    '월요일': 1,
    '화요일': 2,
    '수요일': 3,
    '목요일': 4,
    '금요일': 5,
    '토요일': 6,
    '일요일': 7
  };
  return days[dayName] || 1;
}

/**
 * 학년별로 그룹화된 시간표를 반환
 * @returns {Promise<Object>} 학년별 시간표 객체
 */
export async function getSchedulesByGrade() {
  const schedules = await fetchAllSchedules();
  
  return {
    초등부: schedules.filter(s => s.grade === '초등부'),
    중등부: schedules.filter(s => s.grade === '중등부'),
    고등부: schedules.filter(s => s.grade === '고등부')
  };
} 