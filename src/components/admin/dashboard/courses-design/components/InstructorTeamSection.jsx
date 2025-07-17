// components/InstructorTeamSection.jsx - 탭3: 강사진
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ListEditor } from './ListEditor';
import { UserCheck, Briefcase, GraduationCap, Award } from 'lucide-react';

export const InstructorTeamSection = ({ formData, handleChange, addListItem, removeListItem }) => {
  return (
    <div className="space-y-6">
      {/* 대표 강사 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            대표 강사 정보
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            학원의 대표 강사 정보를 입력하세요. 디테일 페이지에서 강사 프로필로 표시됩니다.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="author_name">강사 이름 *</Label>
              <Input
                id="author_name"
                value={formData.author_name || ''}
                onChange={(e) => handleChange('author_name', e.target.value)}
                placeholder="예: 김수학 선생님"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author_image_url">강사 프로필 이미지 URL</Label>
              <Input
                id="author_image_url"
                value={formData.author_image_url || ''}
                onChange={(e) => handleChange('author_image_url', e.target.value)}
                placeholder="https://example.com/instructor-photo.jpg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructor_education">학력 및 전공</Label>
            <Input
              id="instructor_education"
              value={formData.instructor_education || ''}
              onChange={(e) => handleChange('instructor_education', e.target.value)}
              placeholder="예: 서울대학교 수학교육과 졸업"
            />
          </div>
        </CardContent>
      </Card>

      {/* 강사 소개 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            강사 소개
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="instructor_bio">강사 상세 소개</Label>
            <Textarea
              id="instructor_bio"
              value={formData.instructor_bio || ''}
              onChange={(e) => handleChange('instructor_bio', e.target.value)}
              placeholder="강사의 교육 철학, 특징, 학생들에게 전하고 싶은 말씀을 입력하세요..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* 주요 경력 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            주요 경력
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="instructor_experience">경력사항</Label>
            <Textarea
              id="instructor_experience"
              value={formData.instructor_experience || ''}
              onChange={(e) => handleChange('instructor_experience', e.target.value)}
              placeholder="주요 경력사항을 입력하세요 (예: 대치동 10년 이상 강의 경험, XX학원 수학과 팀장 등)"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* 전문 분야 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            전문 분야
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            강사의 전문 분야를 태그 형태로 입력하세요. 디테일 페이지에서 배지로 표시됩니다.
          </p>
        </CardHeader>
        <CardContent>
          <ListEditor
            title="전문 분야"
            items={formData.instructor_specialization || []}
            onAdd={(value) => addListItem('instructor_specialization', value)}
            onRemove={(index) => removeListItem('instructor_specialization', index)}
            placeholder="예: 내신 관리, 수능 수학, 심화 과정"
          />
        </CardContent>
      </Card>

      {/* 수강 후 얻을 수 있는 것 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            수강 후 얻을 수 있는 것
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            학생들이 이 강사의 수업을 듣고 얻을 수 있는 구체적인 성과를 나열하세요.
          </p>
        </CardHeader>
        <CardContent>
          <ListEditor
            title="학습 성과"
            items={formData.what_you_will_learn || []}
            onAdd={(value) => addListItem('what_you_will_learn', value)}
            onRemove={(index) => removeListItem('what_you_will_learn', index)}
            placeholder="예: 수학 내신 1등급 달성 능력"
          />
        </CardContent>
      </Card>

      {/* 수강 요건 */}
      <Card>
        <CardHeader>
          <CardTitle>수강 요건</CardTitle>
          <p className="text-sm text-muted-foreground">
            이 강사의 수업을 듣기 위한 전제 조건이나 권장사항을 입력하세요.
          </p>
        </CardHeader>
        <CardContent>
          <ListEditor
            title="수강 요건"
            items={formData.requirements || []}
            onAdd={(value) => addListItem('requirements', value)}
            onRemove={(index) => removeListItem('requirements', index)}
            placeholder="예: 기본적인 대수 개념 이해"
          />
        </CardContent>
      </Card>

      {/* 강사 통계 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>강사 성과 정보</CardTitle>
          <p className="text-sm text-muted-foreground">
            강사의 교육 성과와 관련된 통계 정보를 입력하세요.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="enrollment_count">총 수강생 수</Label>
              <Input
                id="enrollment_count"
                type="number"
                value={formData.enrollment_count || ''}
                onChange={(e) => handleChange('enrollment_count', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">강사 평점 (5점 만점)</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating || ''}
                onChange={(e) => handleChange('rating', parseFloat(e.target.value) || 0)}
                placeholder="0.0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="completion_rate">수료율 (%)</Label>
              <Input
                id="completion_rate"
                type="number"
                min="0"
                max="100"
                value={formData.completion_rate || ''}
                onChange={(e) => handleChange('completion_rate', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};