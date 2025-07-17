import CourseDetailContent from "@/components/courses/CourseDetailContent";
import { Layout } from "@/layouts/Layout";
import { supabase } from '@/lib/supabase';

import { notFound } from 'next/navigation';

// UUID 형식 검증을 위한 정규식
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function CourseDetailsPage({ params }) {
  const { courseId } = await params;
  
  // courseId가 유효한 UUID 형식인지 확인
  if (!courseId || !UUID_REGEX.test(courseId)) {
    notFound();
  }

  let course = null;
  let error = null;

  try {
    const { data, error: fetchError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') { // No rows found
        notFound();
      }
      throw fetchError;
    }
    
    if (!data) {
      notFound();
    }
    
    course = data;
  } catch (err) {
    console.error('Error fetching course:', err);
    error = err.message;
  }

  if (error) {
    return (
      <Layout
        breadcrumbTitle={"Error"}
        breadcrumbSubtitle={"Error"}
      >
        <div className="container py-5">
          <p className="text-red-500">코스 데이터를 불러오는 중 오류가 발생했습니다: {error}</p>
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout
        breadcrumbTitle={"Course Not Found"}
        breadcrumbSubtitle={"Course Not Found"}
      >
        <div className="container py-5">
          <p>요청하신 코스를 찾을 수 없습니다.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      breadcrumbTitle={course.title || "Course Details"}
      breadcrumbSubtitle={course.title || "Course Details"}
    >
      {/* details */}
      <CourseDetailContent course={course} />

    </Layout>
  );
}
