'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Clock, User, Phone, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase/supabaseClientBrowser';

export default function StudentExamAuthPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const answerKeyId = resolvedParams.answerKeyId;
  
  const [examInfo, setExamInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [examStatus, setExamStatus] = useState({
    completedStudents: [],
    notCompletedStudents: [],
    totalStudents: 0,
    completionRate: 0
  });

  useEffect(() => {
    if (answerKeyId) {
      fetchExamInfo();
      fetchExamStatus();
    }
  }, [answerKeyId]);

  const fetchExamInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('exam_answer_keys')
        .select(`
          *,
          teachers:teacher_id (
            name,
            email
          ),
          schedules:schedule_id (
            subject,
            grade,
            time_slot
          )
        `)
        .eq('id', answerKeyId)
        .single();

      if (error) throw error;
      setExamInfo(data);
    } catch (error) {
      console.error('시험 정보 로딩 오류:', error);
      setError('시험 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchExamStatus = async () => {
    try {
      // 1. 전체 활성 학생 조회
      const { data: allStudents, error: studentsError } = await supabase
        .from('students')
        .select('id, full_name')
        .eq('status', 'active');

      if (studentsError) throw studentsError;

      // 2. 완료한 학생들 조회
      const { data: completedSessions, error: sessionsError } = await supabase
        .from('student_answer_sessions')
        .select(`
          student_id,
          submitted_at,
          students!inner (
            full_name
          )
        `)
        .eq('answer_key_id', answerKeyId)
        .eq('is_completed', true)
        .order('submitted_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      const completedStudents = completedSessions?.map(session => ({
        name: session.students.full_name,
        completedAt: session.submitted_at
      })) || [];

      // 3. 완료한 학생 ID 목록 생성
      const completedStudentIds = new Set(completedSessions?.map(session => session.student_id) || []);

      // 4. 미완료 학생들 필터링
      const notCompletedStudents = allStudents?.filter(student => 
        !completedStudentIds.has(student.id)
      ).map(student => ({
        name: student.full_name
      })) || [];

      const totalStudents = allStudents?.length || 0;
      const completionRate = totalStudents > 0 ? Math.round((completedStudents.length / totalStudents) * 100) : 0;

      setExamStatus({
        completedStudents,
        notCompletedStudents,
        totalStudents,
        completionRate
      });

    } catch (error) {
      console.error('시험 현황 조회 오류:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      setError('이름과 전화번호를 모두 입력해주세요.');
      return;
    }

    setAuthLoading(true);
    setError('');

    try {
      console.log('학생 검증 시작:', {
        name: formData.name.trim(),
        phone: formData.phone.trim()
      });

      // 1. 학생 정보 확인 (안전한 함수 사용)
      const { data: studentData, error: studentError } = await supabase
        .rpc('authenticate_student', {
          p_full_name: formData.name.trim(),
          p_phone: formData.phone.trim()
        });

      console.log('학생 검증 결과:', {
        studentData,
        studentError,
        hasStudent: studentData && studentData.length > 0
      });

      if (studentError || !studentData || studentData.length === 0) {
        console.error('학생 검증 실패:', studentError);
        throw new Error('등록된 학원생을 찾을 수 없습니다. 이름과 전화번호를 확인해주세요.');
      }

      const student = {
        id: studentData[0].student_id,
        full_name: studentData[0].student_name,
        phone: studentData[0].student_phone,
        email: studentData[0].student_email,
        grade: studentData[0].student_grade,
        school: studentData[0].student_school
      };

      // 2. 답안 키 접근 권한 확인 (옵션)
      const { data: accessData } = await supabase
        .from('answer_key_access')
        .select('*')
        .eq('answer_key_id', answerKeyId)
        .eq('student_id', student.id)
        .eq('is_active', true);

      // 접근 권한이 설정되어 있지 않으면 모든 학생에게 접근 허용
      // 접근 권한이 설정되어 있으면 해당 학생만 접근 가능
      if (accessData && accessData.length === 0) {
        // 접근 권한이 설정된 다른 학생들이 있는지 확인
        const { data: otherAccess } = await supabase
          .from('answer_key_access')
          .select('id')
          .eq('answer_key_id', answerKeyId)
          .eq('is_active', true)
          .limit(1);

        if (otherAccess && otherAccess.length > 0) {
          throw new Error('이 시험에 대한 접근 권한이 없습니다.');
        }
      }

      // 3. 기존 세션 확인 (이미 제출한 경우)
      const { data: existingSessions, error: sessionCheckError } = await supabase
        .from('student_answer_sessions')
        .select('*')
        .eq('answer_key_id', answerKeyId)
        .eq('student_id', student.id)
        .eq('is_completed', true);

      // 세션 체크 오류가 발생하지 않았고, 완료된 세션이 있는 경우
      if (!sessionCheckError && existingSessions && existingSessions.length > 0) {
        throw new Error('이미 이 시험을 완료하셨습니다.');
      }

      // 4. 새로운 세션 생성
      const { data: session, error: sessionError } = await supabase
        .from('student_answer_sessions')
        .insert([{
          answer_key_id: answerKeyId,
          student_id: student.id,
          started_at: new Date().toISOString(),
          ip_address: null, // 클라이언트에서는 IP 주소를 직접 가져올 수 없음
          user_agent: navigator.userAgent
        }])
        .select()
        .single();

      if (sessionError) throw sessionError;

      // 5. 답안 입력 페이지로 리다이렉트
      router.push(`/student-exam/${answerKeyId}/answer?session=${session.session_token}`);

    } catch (error) {
      console.error('학생 인증 오류:', error);
      setError(error.message || '인증 중 오류가 발생했습니다.');
    } finally {
      setAuthLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getExamTypeBadge = (type) => {
    const types = {
      regular: { label: '정기시험', color: 'bg-blue-500' },
      midterm: { label: '중간고사', color: 'bg-green-500' },
      final: { label: '기말고사', color: 'bg-red-500' },
      quiz: { label: '퀴즈', color: 'bg-yellow-500' }
    };
    
    const typeInfo = types[type] || { label: type, color: 'bg-gray-500' };
    return (
      <Badge className={`text-white ${typeInfo.color}`}>
        {typeInfo.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">시험 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!examInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">시험을 찾을 수 없습니다</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-4">
              요청하신 시험 정보를 찾을 수 없습니다.
            </p>
            <Button 
              onClick={() => router.push('/')}
              className="w-full"
            >
              홈으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* 시험 정보 카드 */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800">
                  {examInfo.exam_title}
                </CardTitle>
                <CardDescription className="text-gray-600 mt-2">
                  {examInfo.exam_description}
                </CardDescription>
              </div>
              {getExamTypeBadge(examInfo.exam_type)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">과목</p>
                  <p className="font-medium">{examInfo.subject}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">담당 강사</p>
                  <p className="font-medium">{examInfo.teachers?.name || '알 수 없음'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">시험 날짜</p>
                  <p className="font-medium">{formatDate(examInfo.exam_date)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  <div>
                    <p className="text-sm text-gray-500">문제 수</p>
                    <p className="font-medium">{examInfo.answers?.length || 0}문제</p>
                  </div>
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 학생 인증 폼 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">학원생 인증</CardTitle>
            <CardDescription>
              시험에 참여하려면 등록된 학원생 정보를 입력해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">이름 *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="등록된 이름을 입력하세요"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">전화번호 *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="등록된 전화번호를 입력하세요"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                disabled={authLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    인증 중...
                  </>
                ) : (
                  <>
                    시험 시작하기
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">📋 시험 안내</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 등록된 학원생만 시험에 참여할 수 있습니다</li>
                <li>• 시험 시작 시간부터 제출 시간까지 자동으로 측정됩니다</li>
                <li>• 한 번 제출하면 재시도할 수 없습니다</li>
                <li>• 문제가 있으면 담당 강사에게 문의하세요</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 시험 현황 */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">📊 시험 현황</CardTitle>
            <CardDescription className="text-blue-700">
              현재 시험 참여 현황을 확인하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{examStatus.totalStudents}</div>
                <div className="text-sm text-blue-700">전체 학원생</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-green-600">{examStatus.completedStudents.length}</div>
                <div className="text-sm text-green-700">완료</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-red-600">{examStatus.notCompletedStudents.length}</div>
                <div className="text-sm text-red-700">미완료</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{examStatus.completionRate}%</div>
                <div className="text-sm text-orange-700">완료율</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {examStatus.completedStudents.length > 0 && (
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">✅ 시험 완료 학원생 ({examStatus.completedStudents.length}명)</h4>
                  <div className="max-h-32 overflow-y-auto">
                    <div className="grid grid-cols-1 gap-1">
                      {examStatus.completedStudents.slice(0, 8).map((student, index) => (
                        <div key={index} className="text-sm text-green-700 bg-green-50 px-2 py-1 rounded">
                          {student.name}
                        </div>
                      ))}
                    </div>
                    {examStatus.completedStudents.length > 8 && (
                      <div className="text-sm text-gray-600 mt-2">
                        외 {examStatus.completedStudents.length - 8}명...
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {examStatus.notCompletedStudents.length > 0 && (
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">❌ 시험 미완료 학원생 ({examStatus.notCompletedStudents.length}명)</h4>
                  <div className="max-h-48 overflow-y-auto">
                    <div className="grid grid-cols-1 gap-1">
                      {examStatus.notCompletedStudents.map((student, index) => (
                        <div key={index} className="text-sm text-red-700 bg-red-50 px-2 py-1 rounded">
                          {student.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}