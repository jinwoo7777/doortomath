// components/ProgramCurriculumSection.jsx - 탭2: 수업 프로그램
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ListEditor } from './ListEditor';
import { Book, Calendar, Clock, FileText } from 'lucide-react';

export const ProgramCurriculumSection = ({ formData, handleChange, addListItem, removeListItem }) => {
  return (
    <div className="space-y-6">
      {/* 커리큘럼 개요 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            커리큘럼 개요
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            전체 커리큘럼에 대한 개요를 작성하세요. 디테일 페이지에서 안내 메시지로 표시됩니다.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="course_outline">커리큘럼 개요</Label>
            <Textarea
              id="course_outline"
              value={formData.course_outline || ''}
              onChange={(e) => handleChange('course_outline', e.target.value)}
              placeholder="체계적으로 구성된 단계별 시험 준비 과정을 통해 수학 실력을 향상시킬 수 있습니다."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* 주차별 커리큘럼 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            주차별 커리큘럼
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            각 주차별 수업 내용을 작성하세요. 디테일 페이지에서 아코디언으로 표시됩니다.
          </p>
        </CardHeader>
        <CardContent>
          <ListEditor
            title="주차별 수업 내용"
            items={formData.curriculum || []}
            onAdd={(value) => addListItem('curriculum', value)}
            onRemove={(index) => removeListItem('curriculum', index)}
            placeholder="예: 1주차: 기본 개념 정립 및 기초 문제 풀이"
          />
        </CardContent>
      </Card>

      {/* 수업 일정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            수업 일정
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            구체적인 수업 일정과 시간표를 설정하세요.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schedule_type">스케줄 유형</Label>
                <select
                  id="schedule_type"
                  value={formData.schedule_type || 'flexible'}
                  onChange={(e) => handleChange('schedule_type', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="flexible">유연한 일정</option>
                  <option value="fixed">고정 일정</option>
                  <option value="self_paced">자율 진도</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_date">수업 시작일</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date || ''}
                  onChange={(e) => handleChange('start_date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">수업 종료일</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date || ''}
                  onChange={(e) => handleChange('end_date', e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="enrollment_deadline">신청 마감일</Label>
              <Input
                id="enrollment_deadline"
                type="date"
                value={formData.enrollment_deadline || ''}
                onChange={(e) => handleChange('enrollment_deadline', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="course_duration">수업 기간 설명</Label>
              <Input
                id="course_duration"
                value={formData.course_duration || ''}
                onChange={(e) => handleChange('course_duration', e.target.value)}
                placeholder="예: 12주 과정, 주 3회 수업"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 세부 수업 일정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            세부 수업 일정
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            요일별, 시간별 상세 수업 일정을 입력하세요. JSON 형태로 저장됩니다.
          </p>
        </CardHeader>
        <CardContent>
          <ListEditor
            title="수업 일정"
            items={formData.class_schedule || []}
            onAdd={(value) => addListItem('class_schedule', value)}
            onRemove={(index) => removeListItem('class_schedule', index)}
            placeholder="예: 월/수/금 19:00-21:00 또는 {'day': '월요일', 'time': '19:00-21:00', 'content': '기본개념'}"
          />
        </CardContent>
      </Card>

      {/* 수업 구성 통계 */}
      <Card>
        <CardHeader>
          <CardTitle>수업 구성 정보</CardTitle>
          <p className="text-sm text-muted-foreground">
            디테일 페이지 통계 섹션에서 표시될 수업 구성 정보를 설정하세요.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="live_session_count">라이브 세션 수</Label>
              <Input
                id="live_session_count"
                type="number"
                value={formData.live_session_count || ''}
                onChange={(e) => handleChange('live_session_count', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recorded_session_count">녹화 세션 수</Label>
              <Input
                id="recorded_session_count"
                type="number"
                value={formData.recorded_session_count || ''}
                onChange={(e) => handleChange('recorded_session_count', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignment_count">과제 수</Label>
              <Input
                id="assignment_count"
                type="number"
                value={formData.assignment_count || ''}
                onChange={(e) => handleChange('assignment_count', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quiz_count">퀴즈 수</Label>
              <Input
                id="quiz_count"
                type="number"
                value={formData.quiz_count || ''}
                onChange={(e) => handleChange('quiz_count', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};