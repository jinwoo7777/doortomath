'use client';

import React from 'react';

import CourseForm from '@/components/admin/dashboard/courses-design/CourseForm';

export default function AdminCourseEditPage({ params }) {
  const { courseId } = React.use(params);

  return (
    <CourseForm courseId={courseId} />
  );
}
