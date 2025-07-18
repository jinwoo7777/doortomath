import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { withRefreshTokenErrorHandling } from '@/lib/auth/refreshTokenErrorHandler';

/**
 * 엑셀 업로드 관련 훅
 */
export const useExcelUpload = () => {
  const [uploading, setUploading] = useState(false);
  const supabase = createClientComponentClient();

  /**
   * 시간표 데이터 일괄 업로드
   * @param {Array} scheduleData - 업로드할 시간표 데이터 배열
   * @returns {Object} 업로드 결과 { success: boolean, error?: string, data?: Array }
   */
  const uploadSchedules = async (scheduleData) => {
    try {
      setUploading(true);

      // 데이터 유효성 재검사
      if (!Array.isArray(scheduleData) || scheduleData.length === 0) {
        throw new Error('업로드할 데이터가 없습니다.');
      }

      // 각 데이터 항목에 타임스탬프 추가
      const dataWithTimestamps = scheduleData.map(item => ({
        ...item,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      console.log('업로드할 데이터:', dataWithTimestamps);

      // Supabase에 일괄 삽입 (리프레시 토큰 오류 처리 포함)
      const { data, error } = await withRefreshTokenErrorHandling(async () => {
        const result = await supabase
          .from('schedules')
          .insert(dataWithTimestamps)
          .select();
        
        if (result.error) {
          throw new Error(`데이터베이스 오류: ${result.error.message}`);
        }
        
        return result;
      });

      if (error) {
        console.error('업로드 오류:', error);
        throw error;
      }

      console.log('업로드 성공:', data);

      return {
        success: true,
        data: data,
        message: `${data.length}개의 시간표가 성공적으로 업로드되었습니다.`
      };

    } catch (error) {
      console.error('엑셀 업로드 오류:', error);
      return {
        success: false,
        error: error.message || '업로드 중 오류가 발생했습니다.'
      };
    } finally {
      setUploading(false);
    }
  };

  /**
   * 중복 시간표 검사
   * @param {Array} scheduleData - 검사할 시간표 데이터
   * @param {string} branch - 지점명
   * @returns {Object} 검사 결과 { duplicates: Array, conflicts: Array }
   */
  const checkDuplicates = async (scheduleData, branch) => {
    try {
      // 해당 지점의 기존 시간표 조회 (리프레시 토큰 오류 처리 포함)
      const { data: existingSchedules, error } = await withRefreshTokenErrorHandling(async () => {
        const result = await supabase
          .from('schedules')
          .select('grade, day_of_week, time_slot, subject, teacher_name, classroom')
          .eq('branch', branch)
          .eq('is_active', true);
        
        if (result.error) {
          throw new Error(`기존 시간표 조회 오류: ${result.error.message}`);
        }
        
        return result;
      });

      if (error) {
        console.error('기존 시간표 조회 오류:', error);
        return { duplicates: [], conflicts: [] };
      }

      const duplicates = [];
      const conflicts = [];

      scheduleData.forEach((newSchedule, index) => {
        // 완전 중복 검사 (모든 필드가 동일)
        const exactDuplicate = existingSchedules.find(existing => 
          existing.grade === newSchedule.grade &&
          existing.day_of_week === newSchedule.day_of_week &&
          existing.time_slot === newSchedule.time_slot &&
          existing.subject === newSchedule.subject &&
          existing.teacher_name === newSchedule.teacher_name &&
          existing.classroom === newSchedule.classroom
        );

        if (exactDuplicate) {
          duplicates.push({
            index: index + 1,
            schedule: newSchedule,
            reason: '동일한 시간표가 이미 존재합니다.'
          });
          return;
        }

        // 시간/교실 충돌 검사
        const timeConflict = existingSchedules.find(existing => 
          existing.day_of_week === newSchedule.day_of_week &&
          existing.time_slot === newSchedule.time_slot &&
          existing.classroom === newSchedule.classroom
        );

        if (timeConflict) {
          conflicts.push({
            index: index + 1,
            schedule: newSchedule,
            existing: timeConflict,
            reason: '같은 시간, 같은 교실에 다른 수업이 있습니다.'
          });
          return;
        }

        // 강사 시간 충돌 검사
        if (newSchedule.teacher_name) {
          const teacherConflict = existingSchedules.find(existing => 
            existing.teacher_name === newSchedule.teacher_name &&
            existing.day_of_week === newSchedule.day_of_week &&
            existing.time_slot === newSchedule.time_slot
          );

          if (teacherConflict) {
            conflicts.push({
              index: index + 1,
              schedule: newSchedule,
              existing: teacherConflict,
              reason: '강사의 시간이 겹칩니다.'
            });
          }
        }
      });

      return { duplicates, conflicts };

    } catch (error) {
      console.error('중복 검사 오류:', error);
      return { duplicates: [], conflicts: [] };
    }
  };

  /**
   * 업로드 전 데이터 검증 및 충돌 검사
   * @param {Array} scheduleData - 검증할 시간표 데이터
   * @param {string} branch - 지점명
   * @returns {Object} 검증 결과
   */
  const validateUploadData = async (scheduleData, branch) => {
    try {
      // 중복 및 충돌 검사
      const { duplicates, conflicts } = await checkDuplicates(scheduleData, branch);
      
      const hasIssues = duplicates.length > 0 || conflicts.length > 0;
      
      return {
        success: !hasIssues,
        duplicates,
        conflicts,
        message: hasIssues 
          ? `${duplicates.length}개의 중복과 ${conflicts.length}개의 충돌이 발견되었습니다.`
          : '모든 데이터가 유효합니다.'
      };

    } catch (error) {
      console.error('데이터 검증 오류:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  /**
   * 강제 업로드 (중복/충돌 무시)
   * @param {Array} scheduleData - 업로드할 시간표 데이터
   * @param {Object} options - 업로드 옵션
   * @returns {Object} 업로드 결과
   */
  const forceUpload = async (scheduleData, options = {}) => {
    try {
      const { 
        skipDuplicates = true, 
        updateConflicts = false 
      } = options;

      if (skipDuplicates || updateConflicts) {
        // 중복/충돌 검사 후 필터링
        const { duplicates, conflicts } = await checkDuplicates(scheduleData, scheduleData[0]?.branch);
        
        let filteredData = [...scheduleData];
        
        if (skipDuplicates) {
          const duplicateIndices = duplicates.map(d => d.index - 1);
          filteredData = filteredData.filter((_, index) => !duplicateIndices.includes(index));
        }

        if (!updateConflicts) {
          const conflictIndices = conflicts.map(c => c.index - 1);
          filteredData = filteredData.filter((_, index) => !conflictIndices.includes(index));
        }

        if (filteredData.length === 0) {
          return {
            success: false,
            error: '업로드할 유효한 데이터가 없습니다.'
          };
        }

        return await uploadSchedules(filteredData);
      }

      return await uploadSchedules(scheduleData);

    } catch (error) {
      console.error('강제 업로드 오류:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  return {
    uploading,
    uploadSchedules,
    checkDuplicates,
    validateUploadData,
    forceUpload
  };
};