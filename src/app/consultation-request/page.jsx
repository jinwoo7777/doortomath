'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/supabaseClientBrowser.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Mail, 
  GraduationCap, 
  MessageSquare, 
  User, 
  CheckCircle,
  Clock,
  Calculator,
  Target,
  Users,
  Award,
  BookOpen,
  Loader2
} from 'lucide-react';

export default function ConsultationRequestPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    student_grade: '',
    subject: '',
    inquiry_type: 'consultation',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (value, name) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('consultations')
        .insert([{
          ...formData,
          status: 'pending',
          created_at: new Date().toISOString()
        }]);

      if (error) {
        throw error;
      }

      setCurrentStep(3); // 성공 단계로 이동
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (error) {
      console.error('Error submitting consultation request:', error);
      alert('상담신청 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep1Valid = formData.name && formData.phone && formData.student_grade;
  const isStep2Valid = formData.message;

  // 성공 페이지
  if (currentStep === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">상담신청 완료!</h2>
            <p className="text-gray-600 mb-6">
              상담신청이 성공적으로 제출되었습니다.<br />
              빠른 시일 내에 연락드리겠습니다.
            </p>
            <div className="flex items-center justify-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              3초 후 메인페이지로 이동합니다...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 헤더 영역 */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Calculator className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">상담신청</h1>
            <p className="text-xl text-gray-600 mb-8">
              대치수학의문에서 수학 실력 향상을 위한 맞춤 상담을 받아보세요
            </p>
            
            {/* 진행 단계 표시 */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  currentStep >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
                }`}>
                  1
                </div>
                <span className="ml-2 font-medium">기본정보</span>
              </div>
              <div className={`w-8 h-0.5 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  currentStep >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
                }`}>
                  2
                </div>
                <span className="ml-2 font-medium">상담내용</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* 왼쪽 정보 영역 */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2 text-blue-600" />
                      상담 혜택
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">개인별 맞춤 학습법</p>
                        <p className="text-sm text-gray-600">학생의 수준에 맞는 최적의 학습 방향 제시</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">수학 전문 컨설팅</p>
                        <p className="text-sm text-gray-600">20년 경력의 수학 전문가가 직접 상담</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">학습 로드맵 제공</p>
                        <p className="text-sm text-gray-600">목표 달성을 위한 단계별 학습 계획</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="w-5 h-5 mr-2 text-green-600" />
                      대치수학의문 특장점
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Badge variant="outline" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      소수정예 수업
                    </Badge>
                    <Badge variant="outline" className="w-full justify-start">
                      <BookOpen className="w-4 h-4 mr-2" />
                      체계적 커리큘럼
                    </Badge>
                    <Badge variant="outline" className="w-full justify-start">
                      <Target className="w-4 h-4 mr-2" />
                      입시 전문 관리
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* 오른쪽 폼 영역 */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {currentStep === 1 ? '기본정보 입력' : '상담내용 작성'}
                  </CardTitle>
                  <p className="text-gray-600">
                    {currentStep === 1 
                      ? '상담을 위한 기본정보를 입력해주세요' 
                      : '구체적인 상담 내용을 작성해주세요'
                    }
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="flex items-center">
                              <User className="w-4 h-4 mr-2" />
                              성명 *
                            </Label>
                            <Input
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              placeholder="성명을 입력해주세요"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone" className="flex items-center">
                              <Phone className="w-4 h-4 mr-2" />
                              연락처 *
                            </Label>
                            <Input
                              id="phone"
                              name="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={handleChange}
                              placeholder="010-0000-0000"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center">
                              <Mail className="w-4 h-4 mr-2" />
                              이메일
                            </Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleChange}
                              placeholder="이메일을 입력해주세요 (선택)"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="student_grade" className="flex items-center">
                              <GraduationCap className="w-4 h-4 mr-2" />
                              학년 *
                            </Label>
                            <Select onValueChange={(value) => handleSelectChange(value, 'student_grade')}>
                              <SelectTrigger>
                                <SelectValue placeholder="학년을 선택해주세요" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="초등학교">초등학교</SelectItem>
                                <SelectItem value="중학교 1학년">중학교 1학년</SelectItem>
                                <SelectItem value="중학교 2학년">중학교 2학년</SelectItem>
                                <SelectItem value="중학교 3학년">중학교 3학년</SelectItem>
                                <SelectItem value="고등학교 1학년">고등학교 1학년</SelectItem>
                                <SelectItem value="고등학교 2학년">고등학교 2학년</SelectItem>
                                <SelectItem value="고등학교 3학년">고등학교 3학년</SelectItem>
                                <SelectItem value="재수생">재수생</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subject">상담 주제</Label>
                          <Input
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="예) 수학 성적 향상, 내신 관리, 수능 대비 등"
                          />
                        </div>

                        <div className="flex justify-end">
                          <Button 
                            type="button"
                            onClick={() => setCurrentStep(2)}
                            disabled={!isStep1Valid}
                            className="px-8"
                          >
                            다음 단계
                          </Button>
                        </div>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="message" className="flex items-center">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            상담 내용 *
                          </Label>
                          <Textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="상담받고 싶은 내용을 구체적으로 작성해주세요.&#10;예시:&#10;- 현재 수학 성적과 목표&#10;- 어려워하는 수학 영역&#10;- 학습 습관이나 고민거리&#10;- 원하는 상담 일정 등"
                            rows={8}
                            className="resize-none"
                            required
                          />
                          <p className="text-sm text-gray-500">
                            자세한 내용을 작성해주시면 더 정확한 상담을 받으실 수 있습니다.
                          </p>
                        </div>

                        <div className="flex justify-between">
                          <Button 
                            type="button"
                            variant="outline"
                            onClick={() => setCurrentStep(1)}
                          >
                            이전 단계
                          </Button>
                          <Button 
                            type="submit"
                            disabled={!isStep2Valid || isSubmitting}
                            className="px-8"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                제출 중...
                              </>
                            ) : (
                              '상담신청 완료'
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 정보 영역 */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">상담 문의</h3>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8">
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-medium">02-2564-0903</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-medium">doortomath@naver.com</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              상담 시간: 평일 오전 9시 ~ 오후 6시 (점심시간 12시 ~ 1시 제외)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}