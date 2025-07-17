// components/CourseSettingsSection.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Settings } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const CourseSettingsSection = ({ formData, handleChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          수업 정보 설정
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="difficulty_level">수업 난이도</Label>
          <Select value={formData.difficulty_level} onValueChange={(value) => handleChange('difficulty_level', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">기초</SelectItem>
              <SelectItem value="intermediate">중급</SelectItem>
              <SelectItem value="advanced">심화</SelectItem>
              <SelectItem value="expert">최상위</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="course_level">대상 학년</Label>
          <Select value={formData.course_level} onValueChange={(value) => handleChange('course_level', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="elementary">초등부</SelectItem>
              <SelectItem value="middle">중등부</SelectItem>
              <SelectItem value="high">고등부</SelectItem>
              <SelectItem value="adult">재수생</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="course_format">수업 형태</Label>
          <Select value={formData.course_format} onValueChange={(value) => handleChange('course_format', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online">화상 수업</SelectItem>
              <SelectItem value="offline">대면 수업</SelectItem>
              <SelectItem value="hybrid">대면+화상 병행</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="course_duration">수업 기간</Label>
          <Input
            id="course_duration"
            value={formData.course_duration}
            onChange={(e) => handleChange('course_duration', e.target.value)}
            placeholder="예: 정규반 1년, 단기집중 3개월"
          />
        </div>
      </CardContent>
    </Card>
  );
};
