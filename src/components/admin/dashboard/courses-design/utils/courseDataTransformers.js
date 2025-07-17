// utils/courseDataTransformers.js
/**
 * JSON 필드를 파싱하는 유틸리티 함수
 * @param {any} field - 파싱할 필드
 * @returns {Array} - 파싱된 배열
 */
export const parseJsonField = (field) => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    try {
      return JSON.parse(field);
    } catch {
      return [field];
    }
  };
  
  /**
   * 폼 데이터를 API 요청 형식으로 변환
   * @param {Object} formData - 폼 데이터
   * @param {string} status - 저장 상태
   * @returns {Object} - API 요청용 데이터
   */
  export const transformFormDataToApiRequest = (formData, status) => {
    return {
      title: formData.title.trim(),
      subtitle: formData.subtitle?.trim() || null,
      description: formData.description.trim(),
      image_url: formData.image_url?.trim() || null,
      video_url: formData.video_url?.trim() || null,
      category: formData.category,
      author_name: formData.author_name?.trim() || null,
      author_image_url: formData.author_image_url?.trim() || null,
      course_label: formData.course_label?.trim() || null,
      seats: Number(formData.seats) || 30,
      weeks: Number(formData.weeks) || 12,
      semesters: Number(formData.semesters) || 1,
      status: status,
      featured: formData.featured,
      curriculum: JSON.stringify(formData.curriculum),
      reviews: JSON.stringify(formData.reviews),
      tags: (formData.tags && formData.tags.length > 0) ? formData.tags : null,
      updated_at: new Date().toISOString(),
      
      // 강사 관련 필드
      instructor_bio: formData.instructor_bio?.trim() || null,
      instructor_experience: formData.instructor_experience?.trim() || null,
      instructor_specialization: (formData.instructor_specialization && formData.instructor_specialization.length > 0) ? formData.instructor_specialization : null,
      instructor_education: formData.instructor_education?.trim() || null,
      
      // 강의 상세 정보
      difficulty_level: formData.difficulty_level || 'beginner',
      course_duration: formData.course_duration?.trim() || null,
      course_language: formData.course_language || 'ko',
      course_level: formData.course_level || 'all',
      course_format: formData.course_format || 'offline',
      
      // 학원 관련
      target_audience: (formData.target_audience && formData.target_audience.length > 0) ? formData.target_audience : null,
      learning_objectives: (formData.learning_objectives && formData.learning_objectives.length > 0) ? formData.learning_objectives : null,
      assessment_methods: (formData.assessment_methods && formData.assessment_methods.length > 0) ? formData.assessment_methods : null,
      
      // 스케줄 관련
      schedule_type: formData.schedule_type || 'flexible',
      class_schedule: JSON.stringify(formData.class_schedule || []),
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      enrollment_deadline: formData.enrollment_deadline || null,
      
      // 추가 컨텐츠
      course_outline: formData.course_outline?.trim() || null,
      materials_provided: (formData.materials_provided && formData.materials_provided.length > 0) ? formData.materials_provided : null,
      software_required: (formData.software_required && formData.software_required.length > 0) ? formData.software_required : null,
      certificate_available: Boolean(formData.certificate_available),
      certificate_requirements: formData.certificate_requirements?.trim() || null,
      
      // 학원 서비스
      refund_policy: formData.refund_policy?.trim() || null,
      trial_available: Boolean(formData.trial_available),
      
      // 홍보 자료
      social_image_url: formData.social_image_url?.trim() || null,
      promotional_video_url: formData.promotional_video_url?.trim() || null,
    };
  };
  