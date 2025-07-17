// components/AcademyOverviewSection.jsx - 탭1: 학원 소개
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MinimalTiptapEditor } from '@/components/ui/minimal-tiptap';
import { ListEditor } from './ListEditor';
import { Building2, Target, Users, GraduationCap } from 'lucide-react';

export const AcademyOverviewSection = ({ formData, handleChange, addListItem, removeListItem }) => {
  return (
    <div className="space-y-6">
      {/* 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            학원 기본 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">학원 프로그램 제목 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="예: 대치동 수학의문 - 개별오답관리 전문 학원"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">부제목</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                placeholder="학원 프로그램의 간단한 부제목"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">학원 소개 및 프로그램 설명 *</Label>
            <MinimalTiptapEditor
              id="description"
              value={formData.description}
              onChange={(value) => handleChange('description', value)}
              placeholder="학원 소개 및 프로그램 설명을 자세히 입력하세요..."
              className="w-full"
              editorClassName="min-h-[200px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* 교육 목표 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            교육 목표
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            학원에서 추구하는 교육 목표를 설정하세요. 디테일 페이지에서 강조 표시됩니다.
          </p>
        </CardHeader>
        <CardContent>
          <ListEditor
            title="학습 목표"
            items={formData.learning_objectives || []}
            onAdd={(value) => addListItem('learning_objectives', value)}
            onRemove={(index) => removeListItem('learning_objectives', index)}
            placeholder="예: 수학 내신 1등급 달성을 위한 체계적 관리"
          />
        </CardContent>
      </Card>

      {/* 대상 학생 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            대상 학생
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            이 프로그램에 적합한 학생들의 특성을 기술하세요.
          </p>
        </CardHeader>
        <CardContent>
          <ListEditor
            title="대상 학생"
            items={formData.target_audience || []}
            onAdd={(value) => addListItem('target_audience', value)}
            onRemove={(index) => removeListItem('target_audience', index)}
            placeholder="예: 대치동에서 수학 성적을 확실히 올리고 싶은 학생"
          />
        </CardContent>
      </Card>

      {/* 코스 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            코스 기본 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weeks">총 수업 기간 (주)</Label>
              <Input
                id="weeks"
                type="number"
                value={formData.weeks || ''}
                onChange={(e) => handleChange('weeks', parseInt(e.target.value) || 0)}
                placeholder="12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seats">수강 정원</Label>
              <Input
                id="seats"
                type="number"
                value={formData.seats || ''}
                onChange={(e) => handleChange('seats', parseInt(e.target.value) || 0)}
                placeholder="30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty_level">난이도</Label>
              <select
                id="difficulty_level"
                value={formData.difficulty_level || 'beginner'}
                onChange={(e) => handleChange('difficulty_level', e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="beginner">초급</option>
                <option value="intermediate">중급</option>
                <option value="advanced">고급</option>
                <option value="expert">전문가</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="course_format">수업 방식</Label>
              <select
                id="course_format"
                value={formData.course_format || 'offline'}
                onChange={(e) => handleChange('course_format', e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="offline">오프라인</option>
                <option value="online">온라인</option>
                <option value="hybrid">혼합형</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 수강 레벨 및 언어 */}
      <Card>
        <CardHeader>
          <CardTitle>추가 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course_level">수강 레벨</Label>
              <select
                id="course_level"
                value={formData.course_level || 'all'}
                onChange={(e) => handleChange('course_level', e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">전체</option>
                <option value="elementary">초등부</option>
                <option value="middle">중등부</option>
                <option value="high">고등부</option>
                <option value="adult">성인</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="course_language">수업 언어</Label>
              <select
                id="course_language"
                value={formData.course_language || 'ko'}
                onChange={(e) => handleChange('course_language', e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="ko">한국어</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="semesters">학기 수</Label>
              <Input
                id="semesters"
                type="number"
                value={formData.semesters || ''}
                onChange={(e) => handleChange('semesters', parseInt(e.target.value) || 1)}
                placeholder="1"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};