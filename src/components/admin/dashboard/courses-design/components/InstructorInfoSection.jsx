// components/InstructorInfoSection.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const InstructorInfoSection = ({ formData, handleChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>담당 강사 정보</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="author_name">담당 강사명</Label>
          <Input
            id="author_name"
            value={formData.author_name}
            onChange={(e) => handleChange('author_name', e.target.value)}
            placeholder="예: 김수학 원장"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="author_image_url">강사 프로필 이미지</Label>
          <Input
            id="author_image_url"
            value={formData.author_image_url}
            onChange={(e) => handleChange('author_image_url', e.target.value)}
            placeholder="강사 프로필 사진 URL"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="course_label">수업 유형</Label>
          <Input
            id="course_label"
            value={formData.course_label}
            onChange={(e) => handleChange('course_label', e.target.value)}
            placeholder="예: 정규반, 특강반, 개별맞춤반"
          />
        </div>
      </CardContent>
    </Card>
  );
};
