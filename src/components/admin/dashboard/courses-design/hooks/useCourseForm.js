// hooks/useCourseForm.js
import { useState, useEffect } from 'react';

export const useCourseForm = (editingCourse = null) => {
  const [formData, setFormData] = useState({
    // 학원 기본 정보
    title: '',
    subtitle: '',
    description: '',
    image_url: '',
    video_url: '',
    category: '학습분석',
    tags: [],
    status: 'draft',
    featured: false,
    
    // 수업 기본 정보
    author_name: '',
    author_image_url: '',
    course_label: '',
    seats: 30,
    weeks: 12,
    semesters: 1,
    
    // 수업 내용
    curriculum: [],
    reviews: [],
    
    // 강사 정보
    instructor_bio: '',
    instructor_experience: '',
    instructor_specialization: [],
    instructor_education: '',
    
    // 수업 상세 설정
    difficulty_level: 'beginner',
    course_duration: '',
    course_language: 'ko',
    course_level: 'all',
    course_format: 'offline',
    
    // 대상 및 목표
    target_audience: [],
    learning_objectives: [],
    assessment_methods: [],
    
    // 일정 관리
    schedule_type: 'flexible',
    class_schedule: [],
    start_date: '',
    end_date: '',
    enrollment_deadline: '',
    
    // 학원 제공 서비스
    course_outline: '',
    materials_provided: [],
    software_required: [],
    certificate_available: false,
    certificate_requirements: '',
    refund_policy: '',
    trial_available: false,
    
    // 홍보 자료
    social_image_url: '',
    promotional_video_url: '',
  });
  
  const [tagInput, setTagInput] = useState('');

  // 수업 데이터 로드 (편집 모드일 때)
  useEffect(() => {
    if (editingCourse) {
      console.log('📝 편집 모드: 기존 수업 데이터 로드', editingCourse);
      
      // JSON 필드 파싱
      const parseJsonField = (field) => {
        if (!field) return [];
        if (Array.isArray(field)) return field;
        try {
          return JSON.parse(field);
        } catch {
          return [field];
        }
      };

      setFormData({
        title: editingCourse.title || '',
        subtitle: editingCourse.subtitle || '',
        description: editingCourse.description || '',
        image_url: editingCourse.image_url || '',
        video_url: editingCourse.video_url || '',
        category: editingCourse.category || '학습분석',
        tags: Array.isArray(editingCourse.tags) ? editingCourse.tags : [],
        status: editingCourse.status || 'draft',
        featured: editingCourse.featured || false,
        
        author_name: editingCourse.author_name || '',
        author_image_url: editingCourse.author_image_url || '',
        course_label: editingCourse.course_label || '',
        seats: editingCourse.seats || 30,
        weeks: editingCourse.weeks || 12,
        semesters: editingCourse.semesters || 1,
        
        curriculum: parseJsonField(editingCourse.curriculum),
        reviews: parseJsonField(editingCourse.reviews),
        
        // 강사 관련 필드
        instructor_bio: editingCourse.instructor_bio || '',
        instructor_experience: editingCourse.instructor_experience || '',
        instructor_specialization: parseJsonField(editingCourse.instructor_specialization),
        instructor_education: editingCourse.instructor_education || '',
        
        // 강의 상세 정보
        difficulty_level: editingCourse.difficulty_level || 'beginner',
        course_duration: editingCourse.course_duration || '',
        course_language: editingCourse.course_language || 'ko',
        course_level: editingCourse.course_level || 'all',
        course_format: editingCourse.course_format || 'offline',
        
        // 수강 관련
        max_enrollment: editingCourse.max_enrollment || 999,
        target_audience: parseJsonField(editingCourse.target_audience),
        learning_objectives: parseJsonField(editingCourse.learning_objectives),
        assessment_methods: parseJsonField(editingCourse.assessment_methods),
        
        // 스케줄 관련
        schedule_type: editingCourse.schedule_type || 'flexible',
        class_schedule: parseJsonField(editingCourse.class_schedule),
        start_date: editingCourse.start_date || '',
        end_date: editingCourse.end_date || '',
        enrollment_deadline: editingCourse.enrollment_deadline || '',
        
        // 추가 컨텐츠
        course_outline: editingCourse.course_outline || '',
        materials_provided: parseJsonField(editingCourse.materials_provided),
        software_required: parseJsonField(editingCourse.software_required),
        certificate_available: editingCourse.certificate_available || false,
        certificate_requirements: editingCourse.certificate_requirements || '',
        
        // 학원 서비스
        refund_policy: editingCourse.refund_policy || '',
        trial_available: editingCourse.trial_available || false,
        
        // 홍보 자료
        social_image_url: editingCourse.social_image_url || '',
        promotional_video_url: editingCourse.promotional_video_url || '',
      });
    }
  }, [editingCourse]);

  // 폼 데이터 변경 핸들러
  const handleChange = (field, value) => {
    console.log(`📝 ${field} 변경:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 중첩 필드 변경 핸들러
  const handleNestedChange = (parent, field, value) => {
    console.log(`📝 ${parent}.${field} 변경:`, value);
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  // 태그 추가
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      const newTags = [...formData.tags, tagInput.trim()];
      handleChange('tags', newTags);
      setTagInput('');
      console.log('🏷️ 태그 추가:', tagInput.trim());
    }
  };

  // 태그 제거
  const removeTag = (tagToRemove) => {
    const newTags = formData.tags.filter(tag => tag !== tagToRemove);
    handleChange('tags', newTags);
    console.log('🗑️ 태그 제거:', tagToRemove);
  };

  // 태그 입력 키 처리
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // 배열 항목 추가
  const addListItem = (listType, item) => {
    if (item.trim()) {
      const newList = [...formData[listType], item.trim()];
      handleChange(listType, newList);
      console.log(`➕ ${listType} 항목 추가:`, item.trim());
    }
  };

  // 배열 항목 제거
  const removeListItem = (listType, index) => {
    const newList = formData[listType].filter((_, i) => i !== index);
    handleChange(listType, newList);
    console.log(`➖ ${listType} 항목 제거:`, index);
  };

  return {
    formData,
    tagInput,
    setTagInput,
    handleChange,
    handleNestedChange,
    addTag,
    removeTag,
    handleTagKeyPress,
    addListItem,
    removeListItem
  };
};
