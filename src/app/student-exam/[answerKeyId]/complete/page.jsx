'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Clock, 
  User, 
  BookOpen, 
  Calendar,
  Timer,
  FileText,
  Home,
  Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase/supabaseClientBrowser';

export default function ExamCompletePage({ params }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resolvedParams = use(params);
  const answerKeyId = resolvedParams.answerKeyId;
  const sessionToken = searchParams.get('session');
  
  const [examInfo, setExamInfo] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [submissionInfo, setSubmissionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (answerKeyId && sessionToken) {
      fetchCompletionData();
    } else {
      setError('잘못된 접근입니다.');
      setLoading(false);
    }
  }, [answerKeyId, sessionToken]);

  const fetchCompletionData = async () => {
    try {
      // 1. 세션 정보 확인
      const { data: session, error: sessionError } = await supabase
        .from('student_answer_sessions')
        .select(`
          *,
          students (
            id,
            full_name,
            phone,
            email,
            school,
            grade
          )
        `)
        .eq('session_token', sessionToken)
        .eq('answer_key_id', answerKeyId)
        .single();

      if (sessionError || !session) {
        throw new Error('유효하지 않은 세션입니다.');
      }

      if (!session.is_completed) {
        throw new Error('아직 완료되지 않은 시험입니다.');
      }

      setSessionInfo(session);
      setStudentInfo(session.students);

      // 2. 시험 정보 로드
      const { data: examData, error: examError } = await supabase
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

      if (examError) throw examError;
      setExamInfo(examData);

      // 3. 제출 정보 로드
      const { data: submissionData, error: submissionError } = await supabase
        .from('student_answer_submissions')
        .select('*')
        .eq('session_id', session.id)
        .single();

      if (submissionError) throw submissionError;
      setSubmissionInfo(submissionData);

    } catch (error) {
      console.error('완료 데이터 로딩 오류:', error);
      setError(error.message || '시험 완료 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0초';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    const parts = [];
    if (hours > 0) parts.push(`${hours}시간`);
    if (minutes > 0) parts.push(`${minutes}분`);
    if (remainingSeconds > 0) parts.push(`${remainingSeconds}초`);
    
    return parts.join(' ');
  };

  const getAnsweredCount = () => {
    if (!submissionInfo?.answers) return 0;
    return submissionInfo.answers.filter(answer => answer.student_answer && answer.student_answer.trim() !== '').length;
  };

  const getTotalQuestions = () => {
    return examInfo?.answers?.length || 0;
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
          <p className="text-gray-600">시험 결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">오류가 발생했습니다</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="border-red-200 bg-red-50 mb-4">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
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
      <div className="max-w-3xl mx-auto px-4">
        {/* 완료 확인 메시지 */}
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-green-800 mb-2">
                시험이 성공적으로 완료되었습니다!
              </h1>
              <p className="text-green-700">
                답안이 정상적으로 제출되었습니다. 채점 결과는 담당 강사를 통해 확인하실 수 있습니다.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 시험 정보 */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">시험 정보</CardTitle>
              {examInfo && getExamTypeBadge(examInfo.exam_type)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">시험 제목</p>
                  <p className="font-medium">{examInfo?.exam_title}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <BookOpen className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">과목</p>
                  <p className="font-medium">{examInfo?.subject}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">담당 강사</p>
                  <p className="font-medium">{examInfo?.teachers?.name || '알 수 없음'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-500">시험 날짜</p>
                  <p className="font-medium">{examInfo?.exam_date}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 응시자 정보 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">응시자 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">이름</p>
                <p className="font-medium">{studentInfo?.full_name}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">전화번호</p>
                <p className="font-medium">{studentInfo?.phone}</p>
              </div>
              
              {studentInfo?.school && (
                <div>
                  <p className="text-sm text-gray-500">학교</p>
                  <p className="font-medium">{studentInfo.school}</p>
                </div>
              )}
              
              {studentInfo?.grade && (
                <div>
                  <p className="text-sm text-gray-500">학년</p>
                  <p className="font-medium">{studentInfo.grade}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 시험 결과 요약 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">시험 결과 요약</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">시험 시작 시간</p>
                    <p className="font-medium">{formatDateTime(sessionInfo?.started_at)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">시험 완료 시간</p>
                    <p className="font-medium">{formatDateTime(sessionInfo?.submitted_at)}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Timer className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-500">총 소요 시간</p>
                    <p className="font-medium text-lg text-purple-600">
                      {formatDuration(sessionInfo?.duration_seconds)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-500">답안 작성 현황</p>
                    <p className="font-medium">
                      {getAnsweredCount()} / {getTotalQuestions()}문제 
                      <span className="text-sm text-gray-600 ml-2">
                        ({Math.round((getAnsweredCount() / getTotalQuestions()) * 100)}%)
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 안내 메시지 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-700">
                <strong>📋 안내사항</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• 답안 채점은 담당 강사가 진행합니다</li>
                  <li>• 채점 결과는 별도로 안내드릴 예정입니다</li>
                  <li>• 문의사항이 있으시면 담당 강사에게 연락주세요</li>
                  <li>• 시험 관련 자료는 안전하게 보관됩니다</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* 홈으로 가기 버튼 */}
        <div className="text-center">
          <Button 
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            <Home className="w-5 h-5 mr-2" />
            메인 페이지로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
}