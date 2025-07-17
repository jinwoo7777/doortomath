'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

/**
 * 답안 키 기본 정보 입력 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {Object} props.formData - 폼 데이터
 * @param {Array} props.teachers - 강사 목록
 * @param {Array} props.filteredSchedules - 필터링된 스케줄 목록
 * @param {Object} props.errors - 유효성 검사 오류
 * @param {Function} props.handleInputChange - 입력 필드 변경 핸들러
 * @returns {JSX.Element} 답안 키 기본 정보 입력 컴포넌트
 */
const AnswerKeyBasicInfo = ({ formData, teachers, filteredSchedules, errors, handleInputChange }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 시험 날짜 */}
          <div className="space-y-2">
            <Label htmlFor="exam_date">시험 날짜 <span className="text-red-500">*</span></Label>
            <Input
              id="exam_date"
              type="date"
              value={formData.exam_date}
              onChange={(e) => handleInputChange('exam_date', e.target.value)}
              className={errors.exam_date ? 'border-red-500' : ''}
            />
            {errors.exam_date && <p className="text-red-500 text-xs">{errors.exam_date}</p>}
          </div>

          {/* 과목 */}
          <div className="space-y-2">
            <Label htmlFor="subject">과목 <span className="text-red-500">*</span></Label>
            <Input
              id="subject"
              type="text"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              className={errors.subject ? 'border-red-500' : ''}
              placeholder="수학, 영어 등"
            />
            {errors.subject && <p className="text-red-500 text-xs">{errors.subject}</p>}
          </div>

          {/* 강사 */}
          <div className="space-y-2">
            <Label htmlFor="teacher_id">강사 <span className="text-red-500">*</span></Label>
            <Select
              value={formData.teacher_id}
              onValueChange={(value) => handleInputChange('teacher_id', value)}
            >
              <SelectTrigger className={errors.teacher_id ? 'border-red-500' : ''}>
                <SelectValue placeholder="강사 선택" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.teacher_id && <p className="text-red-500 text-xs">{errors.teacher_id}</p>}
          </div>

          {/* 스케줄 */}
          <div className="space-y-2">
            <Label htmlFor="schedule_id">스케줄 <span className="text-red-500">*</span></Label>
            <Select
              value={formData.schedule_id}
              onValueChange={(value) => handleInputChange('schedule_id', value)}
              disabled={!formData.teacher_id}
            >
              <SelectTrigger className={errors.schedule_id ? 'border-red-500' : ''}>
                <SelectValue placeholder="스케줄 선택" />
              </SelectTrigger>
              <SelectContent>
                {filteredSchedules.map((schedule) => (
                  <SelectItem key={schedule.id} value={schedule.id}>
                    {schedule.subject} - {schedule.grade}학년 {schedule.class_name}반
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.schedule_id && <p className="text-red-500 text-xs">{errors.schedule_id}</p>}
          </div>

          {/* 시험 유형 */}
          <div className="space-y-2">
            <Label htmlFor="exam_type">시험 유형</Label>
            <Select
              value={formData.exam_type}
              onValueChange={(value) => handleInputChange('exam_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="시험 유형 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">정기시험</SelectItem>
                <SelectItem value="midterm">중간고사</SelectItem>
                <SelectItem value="final">기말고사</SelectItem>
                <SelectItem value="quiz">퀴즈</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 시험 제목 */}
          <div className="space-y-2">
            <Label htmlFor="exam_title">시험 제목 <span className="text-red-500">*</span></Label>
            <Input
              id="exam_title"
              type="text"
              value={formData.exam_title}
              onChange={(e) => handleInputChange('exam_title', e.target.value)}
              className={errors.exam_title ? 'border-red-500' : ''}
              placeholder="2023년 1학기 중간고사"
            />
            {errors.exam_title && <p className="text-red-500 text-xs">{errors.exam_title}</p>}
          </div>

          {/* 총점 */}
          <div className="space-y-2">
            <Label htmlFor="total_score">총점</Label>
            <Input
              id="total_score"
              type="number"
              value={formData.total_score}
              onChange={(e) => handleInputChange('total_score', parseInt(e.target.value) || 0)}
              readOnly
            />
            <p className="text-xs text-gray-500">총점은 문제 점수의 합계로 자동 계산됩니다.</p>
          </div>
        </div>

        {/* 시험 설명 */}
        <div className="space-y-2 mt-4">
          <Label htmlFor="exam_description">시험 설명</Label>
          <Textarea
            id="exam_description"
            value={formData.exam_description}
            onChange={(e) => handleInputChange('exam_description', e.target.value)}
            placeholder="시험에 대한 추가 설명을 입력하세요"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AnswerKeyBasicInfo;
