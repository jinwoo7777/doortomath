'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Save, ArrowLeft, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase/supabaseClientBrowser';
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import ExcelUpload from './ExcelUpload';

export default function AnswerKeyForm({ onBack, onSave, initialData = null }) {
  const [formData, setFormData] = useState({
    exam_date: '',
    subject: '',
    teacher_id: '',
    schedule_id: '',
    exam_type: 'regular',
    exam_title: '',
    exam_description: '',
    total_score: 100,
    answers: []
  });

  const [teachers, setTeachers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showExcelUpload, setShowExcelUpload] = useState(false);
  const [showExcelDialog, setShowExcelDialog] = useState(false);

  useEffect(() => {
    fetchTeachersAndSchedules();
    if (initialData) {
      setFormData({
        ...initialData,
        exam_date: initialData.exam_date || '',
        subject: initialData.subject || '',
        teacher_id: initialData.teacher_id || '',
        schedule_id: initialData.schedule_id || '',
        exam_type: initialData.exam_type || 'regular',
        exam_title: initialData.exam_title || '',
        exam_description: initialData.exam_description || '',
        total_score: initialData.total_score || 100,
        answers: (initialData.answers || []).map(answer => ({
          ...answer,
          question: answer.question || 1,
          answer: answer.answer || '',
          score: answer.score || 5,
          description: answer.description || ''
        }))
      });
    }
  }, [initialData]);

  const fetchTeachersAndSchedules = async () => {
    try {
      const [teachersResult, schedulesResult] = await Promise.all([
        supabase.from('teachers').select('*').eq('is_active', true).order('name'),
        supabase.from('schedules').select('*').eq('is_active', true).order('subject')
      ]);

      setTeachers(teachersResult.data || []);
      setSchedules(schedulesResult.data || []);
    } catch (error) {
      console.error('데이터 로딩 중 오류:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === null ? '' : value
    }));
    
    // 에러 메시지 초기화
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleAnswerChange = (index, field, value) => {
    const newAnswers = [...formData.answers];
    newAnswers[index] = {
      ...newAnswers[index],
      [field]: value === null ? '' : value
    };
    
    setFormData(prev => ({
      ...prev,
      answers: newAnswers
    }));
  };

  const addAnswer = () => {
    setFormData(prev => ({
      ...prev,
      answers: [
        ...prev.answers,
        {
          question: prev.answers.length + 1,
          answer: '',
          score: 5,
          description: ''
        }
      ]
    }));
  };

  const removeAnswer = (index) => {
    setFormData(prev => ({
      ...prev,
      answers: prev.answers.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.exam_date) newErrors.exam_date = '시험 날짜를 선택하세요';
    if (!formData.subject) newErrors.subject = '과목을 입력하세요';
    if (!formData.teacher_id) newErrors.teacher_id = '강사를 선택하세요';
    if (!formData.schedule_id) newErrors.schedule_id = '스케줄을 선택하세요';
    if (!formData.exam_title) newErrors.exam_title = '시험 제목을 입력하세요';
    if (formData.answers.length === 0) newErrors.answers = '최소 1개의 문제를 추가하세요';

    // 답안 유효성 검사
    const answerErrors = [];
    formData.answers.forEach((answer, index) => {
      if (!answer.answer.trim()) {
        answerErrors.push(`${index + 1}번 문제의 답을 입력하세요`);
      }
      if (answer.score <= 0) {
        answerErrors.push(`${index + 1}번 문제의 점수는 0보다 커야 합니다`);
      }
    });

    if (answerErrors.length > 0) {
      newErrors.answers = answerErrors.join(', ');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // 사용자 인증 확인
      const { data: { user } } = await supabase.auth.getUser();
      console.log('인증된 사용자:', user);
      
      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      // 데이터 준비 (created_at과 updated_at 제거)
      const insertData = {
        exam_date: formData.exam_date,
        subject: formData.subject,
        teacher_id: formData.teacher_id,
        schedule_id: formData.schedule_id,
        exam_type: formData.exam_type,
        exam_title: formData.exam_title,
        exam_description: formData.exam_description,
        total_score: formData.total_score,
        answers: formData.answers
      };

      console.log('삽입할 데이터:', insertData);
      
      const { data, error } = await supabase
        .from('exam_answer_keys')
        .insert([insertData])
        .select();

      if (error) {
        console.error('Supabase 오류 상세:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(error.message || '데이터베이스 오류가 발생했습니다.');
      }

      console.log('저장 성공:', data);
      alert('답안 키가 성공적으로 저장되었습니다!');
      onSave?.(data[0]);
      onBack?.();
    } catch (error) {
      console.error('답안 키 저장 중 오류:', error);
      alert(error.message || '답안 키 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalScore = () => {
    return formData.answers.reduce((sum, answer) => sum + (answer.score || 0), 0);
  };

  const handleExcelDataParsed = (excelData) => {
    const newAnswers = excelData.map((item) => ({
      question: item.question,
      answer: item.answer,
      score: item.score,
      description: item.description || ''
    }));
    
    // 기존 답안이 있다면 확인
    if (formData.answers.length > 0) {
      if (confirm('기존 답안을 모두 삭제하고 새로운 답안으로 대체하시겠습니까?')) {
        setFormData(prev => ({
          ...prev,
          answers: newAnswers,
          total_score: newAnswers.reduce((sum, answer) => sum + answer.score, 0)
        }));
      } else {
        // 기존 답안에 추가
        setFormData(prev => ({
          ...prev,
          answers: [...prev.answers, ...newAnswers],
          total_score: [...prev.answers, ...newAnswers].reduce((sum, answer) => sum + answer.score, 0)
        }));
      }
    } else {
      // 기존 답안이 없으면 바로 추가
      setFormData(prev => ({
        ...prev,
        answers: newAnswers,
        total_score: newAnswers.reduce((sum, answer) => sum + answer.score, 0)
      }));
    }
    
    setShowExcelUpload(false);
    setShowExcelDialog(false);
  };

  const filteredSchedules = schedules.filter(schedule => 
    !formData.teacher_id || schedule.teacher_name === teachers.find(t => t.id === formData.teacher_id)?.name
  );

  if (showExcelUpload) {
    return (
      <ExcelUpload
        onDataParsed={handleExcelDataParsed}
        onBack={() => setShowExcelUpload(false)}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">답안 키 생성</h2>
          <p className="text-gray-600">시험 답안 키를 생성하여 자동 채점을 설정하세요</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>시험의 기본 정보를 입력하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="exam_date">시험 날짜 *</Label>
                <Input
                  id="exam_date"
                  type="date"
                  value={formData.exam_date}
                  onChange={(e) => handleInputChange('exam_date', e.target.value)}
                  className={errors.exam_date ? 'border-red-500' : ''}
                />
                {errors.exam_date && <p className="text-red-500 text-sm mt-1">{errors.exam_date}</p>}
              </div>

              <div>
                <Label htmlFor="subject">과목 *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="예: 수학, 영어, 과학"
                  className={errors.subject ? 'border-red-500' : ''}
                />
                {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
              </div>

              <div>
                <Label htmlFor="teacher_id">담당 강사 *</Label>
                <Select value={formData.teacher_id} onValueChange={(value) => handleInputChange('teacher_id', value)}>
                  <SelectTrigger className={errors.teacher_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="강사 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map(teacher => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name} ({teacher.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.teacher_id && <p className="text-red-500 text-sm mt-1">{errors.teacher_id}</p>}
              </div>

              <div>
                <Label htmlFor="schedule_id">수강 과목 *</Label>
                <Select value={formData.schedule_id} onValueChange={(value) => handleInputChange('schedule_id', value)}>
                  <SelectTrigger className={errors.schedule_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="수강 과목 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSchedules.map(schedule => (
                      <SelectItem key={schedule.id} value={schedule.id}>
                        {schedule.subject} - {schedule.grade} ({schedule.time_slot})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.schedule_id && <p className="text-red-500 text-sm mt-1">{errors.schedule_id}</p>}
              </div>

              <div>
                <Label htmlFor="exam_type">시험 유형</Label>
                <Select value={formData.exam_type} onValueChange={(value) => handleInputChange('exam_type', value)}>
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

              <div>
                <Label htmlFor="total_score">총 점수</Label>
                <Input
                  id="total_score"
                  type="number"
                  value={formData.total_score}
                  onChange={(e) => handleInputChange('total_score', parseInt(e.target.value))}
                  min="1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="exam_title">시험 제목 *</Label>
              <Input
                id="exam_title"
                value={formData.exam_title}
                onChange={(e) => handleInputChange('exam_title', e.target.value)}
                placeholder="예: 2024년 1학기 중간고사"
                className={errors.exam_title ? 'border-red-500' : ''}
              />
              {errors.exam_title && <p className="text-red-500 text-sm mt-1">{errors.exam_title}</p>}
            </div>

            <div>
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

        {/* 답안 입력 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>답안 입력</span>
              <div className="flex items-center space-x-4">
                <Badge variant="outline">
                  총 {formData.answers.length}문제 / {calculateTotalScore()}점
                </Badge>
                <AlertDialog open={showExcelDialog} onOpenChange={setShowExcelDialog}>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex items-center"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      엑셀 업로드
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    <AlertDialogHeader>
                      <div className="flex items-center justify-between">
                        <AlertDialogTitle>엑셀로 답안 일괄 등록</AlertDialogTitle>
                        <button
                          type="button"
                          className="ml-1 p-0 bg-transparent border-none cursor-pointer hover:text-red-500 transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowExcelDialog(false);
                          }}
                          aria-label="엑셀 업로드 대화상자 닫기"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </AlertDialogHeader>
                    <ExcelUpload
                      onDataParsed={handleExcelDataParsed}
                      onBack={() => setShowExcelDialog(false)}
                    />
                  </AlertDialogContent>
                </AlertDialog>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addAnswer}
                  className="flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  문제 추가
                </Button>
              </div>
            </CardTitle>
            <CardDescription>각 문제의 답과 점수를 입력하세요</CardDescription>
          </CardHeader>
          <CardContent>
            {errors.answers && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{errors.answers}</p>
              </div>
            )}
            
            {formData.answers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>아직 추가된 문제가 없습니다.</p>
                <p className="text-sm mt-2">문제 추가 버튼을 클릭하거나 엑셀 업로드를 사용하여 답안을 입력하세요.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.answers.sort((a, b) => (a.question || 0) - (b.question || 0)).map((answer, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">문제 {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeAnswer(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`answer-${index}`}>정답 *</Label>
                        <Input
                          id={`answer-${index}`}
                          value={answer.answer || ''}
                          onChange={(e) => handleAnswerChange(index, 'answer', e.target.value)}
                          placeholder="정답을 입력하세요"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`score-${index}`}>점수 *</Label>
                        <Input
                          id={`score-${index}`}
                          type="number"
                          value={answer.score || ''}
                          onChange={(e) => handleAnswerChange(index, 'score', parseInt(e.target.value) || 0)}
                          min="1"
                          max="100"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`description-${index}`}>설명</Label>
                        <Input
                          id={`description-${index}`}
                          value={answer.description || ''}
                          onChange={(e) => handleAnswerChange(index, 'description', e.target.value)}
                          placeholder="답에 대한 설명 (선택사항)"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 저장 버튼 */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onBack}>
            취소
          </Button>
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            {loading ? '저장 중...' : '답안 키 저장'}
          </Button>
        </div>
      </form>
    </div>
  );
}