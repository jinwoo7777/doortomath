// hooks/useCourseSubmission.js
import { useState } from 'react';
import { supabase } from '@/lib/supabase/supabaseClientBrowser.js';
import { toast } from 'sonner';

export const useCourseSubmission = (formData, onSaveSuccess, editingCourse, session, userRole) => {
  const [isSaving, setIsSaving] = useState(false);

  // 현재 선택된 상태에 따른 액션 결정
  const getPrimaryAction = () => {
    switch (formData.status) {
      case 'draft':
        return {
          label: '초안으로 저장',
          status: 'draft',
          className: 'bg-gray-600 hover:bg-gray-700 text-white',
          icon: '💾'
        };
      case 'published':
        return {
          label: '발행하기',
          status: 'published',
          className: 'bg-green-600 hover:bg-green-700 text-white',
          icon: '🚀'
        };
      default:
        return {
          label: '초안으로 저장',
          status: 'draft',
          className: 'bg-gray-600 hover:bg-gray-700 text-white',
          icon: '💾'
        };
    }
  };

  const primaryAction = getPrimaryAction();

  // 수업 저장
  const handleSave = async (status = formData.status) => {
    // 중복 클릭 방지
    if (isSaving) {
      console.log('⚠️ 중복 클릭 방지: 이미 저장 중');
      toast.error('이미 저장 중입니다. 잠시 기다려주세요.');
      return;
    }

    console.log('=== 🔄 수업 저장 시작 ===');
    console.log('저장 모드:', editingCourse ? '편집' : '새 수업');
    console.log('💾 저장될 상태:', status);
    console.log('📋 현재 폼 상태:', formData.status);

    // 상태 값 검증
    if (!['draft', 'published'].includes(status)) {
      console.error('❌ 잘못된 상태 값:', status);
      toast.error('잘못된 상태 값입니다. 다시 시도해주세요.');
      return;
    }

    // 유효성 검사
    if (!formData.title.trim()) {
      console.log('❌ 제목이 비어있음');
      toast.error('제목을 입력해주세요.');
      return;
    }

    if (!formData.description.trim()) {
      console.log('❌ 설명이 비어있음');
      toast.error('설명을 입력해주세요.');
      return;
    }

    // 세션 확인
    if (!session || !session.user) {
      console.log('❌ 세션이 없음:', session);
      toast.error('로그인이 필요합니다. 다시 로그인해주세요.');
      return;
    }

    // 권한 확인
    if (userRole !== 'admin') {
      console.log('❌ 권한 부족:', userRole);
      toast.error('관리자 권한이 필요합니다.');
      return;
    }

    console.log('✅ 유효성 검사 통과');
    console.log('현재 세션:', session.user);

    setIsSaving(true);

    try {
      const savePromise = async () => {
        // 인증된 Supabase 클라이언트는 이미 사용 가능
        console.log('🔐 인증된 Supabase 클라이언트 사용');
        
        // 현재 세션 확인
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('🔍 현재 세션:', {
          hasSession: !!currentSession,
          userId: currentSession?.user?.id,
          userRole: currentSession?.user?.user_metadata?.role
        });

        const courseData = {
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
          tags: (formData.tags && formData.tags.length > 0) ? formData.tags : null,  // Array field for tags
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

        console.log('📋 전송할 데이터:', courseData);
        
        // 배열 필드 디버깅
        console.log('🔍 배열 필드 확인:', {
          tags: formData.tags,
          instructor_specialization: formData.instructor_specialization,
          target_audience: formData.target_audience,
          learning_objectives: formData.learning_objectives,
          assessment_methods: formData.assessment_methods,
          materials_provided: formData.materials_provided,
          software_required: formData.software_required
        });
        
        let result;
        if (editingCourse) {
          console.log('📝 기존 수업 업데이트:', editingCourse.id);
          console.log('🔄 업데이트 쿼리 실행...');
          
          result = await supabase
            .from('courses')
            .update(courseData)
            .eq('id', editingCourse.id)
            .select()
            .single(); // single() 사용 (업데이트는 항상 하나의 결과를 반환해야 함)
        } else {
          console.log('🆕 새 수업 생성');
          courseData.created_at = new Date().toISOString();
          console.log('🔄 삽입 쿼리 실행...');
          
          result = await supabase
            .from('courses')
            .insert([courseData])
            .select()
            .single(); // single() 사용 (삽입은 항상 하나의 결과를 반환해야 함)
        }
        
        console.log('🔍 쿼리 결과:', {
          hasError: !!result.error,
          hasData: !!result.data,
          status: result.status,
          statusText: result.statusText
        });

        if (result.error) {
          console.error('💥 Supabase 오류 상세:', {
            error: result.error,
            message: result.error?.message || 'Unknown error',
            code: result.error?.code || 'Unknown code',
            details: result.error?.details || 'No details',
            hint: result.error?.hint || 'No hint'
          });
          
          // JSON.stringify에서 에러가 발생할 수 있으므로 try-catch로 감싸기
          try {
            console.error('Full error object:', JSON.stringify(result.error, null, 2));
          } catch (jsonError) {
            console.error('Could not stringify error object:', result.error);
          }
          
          throw result.error;
        }

        if (!result.data) {
          console.error('💥 데이터가 반환되지 않음');
          throw new Error('수업 데이터가 반환되지 않았습니다.');
        }

        console.log('✅ 데이터 반환됨:', result.data);
        return result.data;
      };

      const savedCourse = await savePromise();
      
      const statusMessages = {
        'draft': '초안으로 저장',
        'published': '발행'
      };

      toast.success(`✅ 수업이 ${statusMessages[status]}되었습니다.`);
      console.log('✅ 수업 저장 성공:', savedCourse);

      if (onSaveSuccess) {
        await onSaveSuccess(savedCourse);
      }

    } catch (error) {
      console.error('💥 수업 저장 오류:', error);
      
      let errorMessage = '수업 저장 중 오류가 발생했습니다.';
      
      // RLS 관련 오류 구분
      if (error.message?.includes('RLS') || error.message?.includes('policy') || error.code === '42501') {
        errorMessage = '권한이 없습니다. 관리자로 로그인했는지 확인해주세요.';
      } else if (error.code === 'PGRST116') {
        errorMessage = '데이터를 찾을 수 없습니다.';
      } else if (error.code === '23505') {
        errorMessage = '이미 존재하는 수업 제목입니다.';
      } else if (error.code === '23514') {
        errorMessage = '입력한 데이터 형식이 올바르지 않습니다.';
      } else if (error.message) {
        errorMessage = `오류: ${error.message}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
      console.log('🏁 수업 저장 완료');
    }
  };

  // 미리보기 (수업 상태에 따라 적절한 페이지로)
  const handlePreview = () => {
    if (!editingCourse?.id) {
      toast.info('수업을 먼저 저장한 후 미리보기가 가능합니다.');
      return;
    }

    // 발행된 수업은 실제 수업 페이지로, 나머지는 관리자 미리보기로
    if (formData.status === 'published') {
      window.open(`/course-details/${editingCourse.id}`, '_blank');
    } else {
      window.open(`/dashboard2/admin/class-description/preview/${editingCourse.id}`, '_blank');
    }
  };

  return {
    isSaving,
    primaryAction,
    handleSave,
    handlePreview
  };
};
