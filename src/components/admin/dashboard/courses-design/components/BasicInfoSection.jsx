// components/BasicInfoSection.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen } from 'lucide-react';
import { MinimalTiptapEditor } from '@/components/ui/minimal-tiptap';

export const BasicInfoSection = ({ formData, handleChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          학원 기본 정보
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">학원 프로그램 제목 *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="예: 대치동 수학의문 - 개별오답관리 전문 현습"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subtitle">부제목</Label>
          <Input
            id="subtitle"
            value={formData.subtitle}
            onChange={(e) => handleChange('subtitle', e.target.value)}
            placeholder="학원 프로그램의 간단한 부제목을 입력하세요"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">학원 소개 및 프로그램 설명 *</Label>
          <MinimalTiptapEditor
            id="description"
            value={formData.description}
            onChange={(value) => handleChange('description', value)}
            placeholder="학원 소개 및 프로그램 설명을 자세히 입력하세요..."
            className="w-full"
            editorClassName="min-h-[300px]"
          />
        </div>
      </CardContent>
    </Card>
  );
};
