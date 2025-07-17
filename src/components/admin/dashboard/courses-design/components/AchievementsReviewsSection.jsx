// components/AchievementsReviewsSection.jsx - 탭5: 성과 및 후기
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ListEditor } from './ListEditor';
import { Trophy, Star, TrendingUp, MessageSquare } from 'lucide-react';

export const AchievementsReviewsSection = ({ formData, handleChange, addListItem, removeListItem }) => {
  return (
    <div className="space-y-6">
      {/* 학원 성과 통계 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            학원 성과 통계
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            학원의 주요 성과와 통계를 입력하세요. 디테일 페이지에서 통계 카드로 표시됩니다.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rating">평점 (5점 만점)</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating || ''}
                onChange={(e) => handleChange('rating', parseFloat(e.target.value) || 0)}
                placeholder="4.9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="review_count">후기 개수</Label>
              <Input
                id="review_count"
                type="number"
                value={formData.review_count || ''}
                onChange={(e) => handleChange('review_count', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="completion_rate">목표 달성률 (%)</Label>
              <Input
                id="completion_rate"
                type="number"
                min="0"
                max="100"
                value={formData.completion_rate || ''}
                onChange={(e) => handleChange('completion_rate', parseFloat(e.target.value) || 0)}
                placeholder="98"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 합격 후기 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            합격 후기 및 수강생 평가
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            실제 수강생들의 합격 후기와 평가를 입력하세요. 각 후기는 디테일 페이지에서 카드 형태로 표시됩니다.
          </p>
        </CardHeader>
        <CardContent>
          <ListEditor
            title="합격 후기"
            items={formData.reviews || []}
            onAdd={(value) => addListItem('reviews', value)}
            onRemove={(index) => removeListItem('reviews', index)}
            placeholder="예: 수학의문 학원 덕분에 내신 1등급을 달성할 수 있었습니다. 개별 관리가 정말 철저해요!"
          />
        </CardContent>
      </Card>

      {/* 주요 성취 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            주요 성취 및 수상 내역
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            학원의 주요 성취, 수상 내역, 인증 등을 입력하세요.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="achievement_title">주요 성취 제목</Label>
              <Input
                id="achievement_title"
                value={formData.achievement_title || ''}
                onChange={(e) => handleChange('achievement_title', e.target.value)}
                placeholder="예: 대치동 우수 학원 선정"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="achievement_year">달성 연도</Label>
              <Input
                id="achievement_year"
                type="number"
                value={formData.achievement_year || ''}
                onChange={(e) => handleChange('achievement_year', parseInt(e.target.value) || new Date().getFullYear())}
                placeholder={new Date().getFullYear().toString()}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="achievement_description">성취 상세 설명</Label>
            <Input
              id="achievement_description"
              value={formData.achievement_description || ''}
              onChange={(e) => handleChange('achievement_description', e.target.value)}
              placeholder="성취에 대한 상세한 설명을 입력하세요"
            />
          </div>
        </CardContent>
      </Card>

      {/* 학생 만족도 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            학생 만족도 및 피드백
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="satisfaction_score">만족도 점수 (5점 만점)</Label>
              <Input
                id="satisfaction_score"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.satisfaction_score || ''}
                onChange={(e) => handleChange('satisfaction_score', parseFloat(e.target.value) || 0)}
                placeholder="4.9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recommendation_rate">추천율 (%)</Label>
              <Input
                id="recommendation_rate"
                type="number"
                min="0"
                max="100"
                value={formData.recommendation_rate || ''}
                onChange={(e) => handleChange('recommendation_rate', parseFloat(e.target.value) || 0)}
                placeholder="95"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 성과 하이라이트 */}
      <Card>
        <CardHeader>
          <CardTitle>성과 하이라이트</CardTitle>
          <p className="text-sm text-muted-foreground">
            학원의 대표적인 성과나 특별한 사례를 입력하세요.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pass_rate">합격률 (%)</Label>
              <Input
                id="pass_rate"
                type="number"
                min="0"
                max="100"
                value={formData.pass_rate || ''}
                onChange={(e) => handleChange('pass_rate', parseFloat(e.target.value) || 0)}
                placeholder="98"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade_improvement">평균 성적 향상 (점)</Label>
              <Input
                id="grade_improvement"
                type="number"
                value={formData.grade_improvement || ''}
                onChange={(e) => handleChange('grade_improvement', parseFloat(e.target.value) || 0)}
                placeholder="15"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student_count">총 지도 학생 수</Label>
              <Input
                id="student_count"
                type="number"
                value={formData.student_count || ''}
                onChange={(e) => handleChange('student_count', parseInt(e.target.value) || 0)}
                placeholder="500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 언론 보도 및 인증 */}
      <Card>
        <CardHeader>
          <CardTitle>언론 보도 및 외부 인증</CardTitle>
          <p className="text-sm text-muted-foreground">
            학원이 받은 언론 보도나 외부 기관 인증 정보를 입력하세요.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="media_coverage">언론 보도 내역</Label>
              <Input
                id="media_coverage"
                value={formData.media_coverage || ''}
                onChange={(e) => handleChange('media_coverage', e.target.value)}
                placeholder="예: 조선일보 교육 우수 학원 소개 (2023)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="certifications">인증 및 자격</Label>
              <Input
                id="certifications"
                value={formData.certifications || ''}
                onChange={(e) => handleChange('certifications', e.target.value)}
                placeholder="예: 교육청 공인 우수 학원"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};