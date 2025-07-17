// components/ManagementSystemSection.jsx - 탭6: 관리 시스템
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ListEditor } from './ListEditor';
import { ClipboardCheck, BarChart3, Settings, Users, BookOpen, Target } from 'lucide-react';

export const ManagementSystemSection = ({ formData, handleChange, addListItem, removeListItem }) => {
  return (
    <div className="space-y-6">
      {/* 평가 방법 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            평가 방법
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            학생들의 학습 진도와 성과를 평가하는 방법을 설정하세요.
          </p>
        </CardHeader>
        <CardContent>
          <ListEditor
            title="평가 방법"
            items={formData.assessment_methods || []}
            onAdd={(value) => addListItem('assessment_methods', value)}
            onRemove={(index) => removeListItem('assessment_methods', index)}
            placeholder="예: 주간 테스트를 통한 학습 진도 확인"
          />
        </CardContent>
      </Card>

      {/* 학습 관리 시스템 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            학습 관리 시스템
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            학원에서 사용하는 학습 관리 도구와 시스템을 설명하세요.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lms_description">학습 관리 시스템 설명</Label>
            <Textarea
              id="lms_description"
              value={formData.lms_description || ''}
              onChange={(e) => handleChange('lms_description', e.target.value)}
              placeholder="학원에서 사용하는 학습 관리 시스템에 대해 설명해주세요"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="progress_tracking">진도 관리 방식</Label>
              <Input
                id="progress_tracking"
                value={formData.progress_tracking || ''}
                onChange={(e) => handleChange('progress_tracking', e.target.value)}
                placeholder="예: 개별 진도표 작성 및 주간 점검"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback_system">피드백 시스템</Label>
              <Input
                id="feedback_system"
                value={formData.feedback_system || ''}
                onChange={(e) => handleChange('feedback_system', e.target.value)}
                placeholder="예: 즉석 질의응답 및 개별 상담"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 학생 관리 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            학생 관리
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_enrollment">최대 수강 인원</Label>
              <Input
                id="max_enrollment"
                type="number"
                value={formData.max_enrollment || ''}
                onChange={(e) => handleChange('max_enrollment', parseInt(e.target.value) || 999)}
                placeholder="999"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="class_size">반별 정원</Label>
              <Input
                id="class_size"
                type="number"
                value={formData.class_size || ''}
                onChange={(e) => handleChange('class_size', parseInt(e.target.value) || 0)}
                placeholder="15"
              />
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <Label htmlFor="student_management">학생 관리 방식</Label>
            <Textarea
              id="student_management"
              value={formData.student_management || ''}
              onChange={(e) => handleChange('student_management', e.target.value)}
              placeholder="학생들을 어떻게 관리하고 지도하는지 설명해주세요"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* 성과 추적 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            성과 추적 및 분석
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="performance_tracking">성과 추적 방법</Label>
              <Textarea
                id="performance_tracking"
                value={formData.performance_tracking || ''}
                onChange={(e) => handleChange('performance_tracking', e.target.value)}
                placeholder="학생들의 성과를 어떻게 추적하고 분석하는지 설명해주세요"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="report_frequency">성과 보고 주기</Label>
                <select
                  id="report_frequency"
                  value={formData.report_frequency || 'weekly'}
                  onChange={(e) => handleChange('report_frequency', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="daily">매일</option>
                  <option value="weekly">주간</option>
                  <option value="monthly">월간</option>
                  <option value="quarterly">분기별</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent_communication">학부모 소통 방식</Label>
                <Input
                  id="parent_communication"
                  value={formData.parent_communication || ''}
                  onChange={(e) => handleChange('parent_communication', e.target.value)}
                  placeholder="예: 주간 보고서, 개별 상담"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 교육과정 관리 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            교육과정 관리
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="curriculum_updates">교육과정 업데이트 방식</Label>
              <Textarea
                id="curriculum_updates"
                value={formData.curriculum_updates || ''}
                onChange={(e) => handleChange('curriculum_updates', e.target.value)}
                placeholder="교육과정을 어떻게 업데이트하고 개선하는지 설명해주세요"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="material_updates">교재 업데이트 주기</Label>
                <select
                  id="material_updates"
                  value={formData.material_updates || 'semester'}
                  onChange={(e) => handleChange('material_updates', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="monthly">매월</option>
                  <option value="semester">학기별</option>
                  <option value="yearly">연간</option>
                  <option value="as_needed">필요시</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="curriculum_flexibility">커리큘럼 유연성</Label>
                <select
                  id="curriculum_flexibility"
                  value={formData.curriculum_flexibility || 'moderate'}
                  onChange={(e) => handleChange('curriculum_flexibility', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="fixed">고정형</option>
                  <option value="moderate">보통</option>
                  <option value="flexible">유연함</option>
                  <option value="adaptive">적응형</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 목표 설정 및 달성 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            목표 설정 및 달성 관리
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goal_setting">목표 설정 방법</Label>
              <Textarea
                id="goal_setting"
                value={formData.goal_setting || ''}
                onChange={(e) => handleChange('goal_setting', e.target.value)}
                placeholder="학생 개별 목표를 어떻게 설정하고 관리하는지 설명해주세요"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="milestone_tracking">중간 목표 관리</Label>
                <Input
                  id="milestone_tracking"
                  value={formData.milestone_tracking || ''}
                  onChange={(e) => handleChange('milestone_tracking', e.target.value)}
                  placeholder="예: 월별 성취도 점검"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="success_metrics">성공 지표</Label>
                <Input
                  id="success_metrics"
                  value={formData.success_metrics || ''}
                  onChange={(e) => handleChange('success_metrics', e.target.value)}
                  placeholder="예: 성적 향상률, 목표 달성률"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};