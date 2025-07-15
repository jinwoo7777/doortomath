'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  Clock, 
  User, 
  BookOpen, 
  CheckCircle,
  AlertCircle,
  Send,
  Timer,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '@/lib/supabase/supabaseClientBrowser';

export default function StudentAnswerPage({ params }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resolvedParams = use(params);
  const answerKeyId = resolvedParams.answerKeyId;
  const sessionToken = searchParams.get('session');
  
  const [examInfo, setExamInfo] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [answers, setAnswers] = useState({});
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  
  const timerRef = useRef(null);

  useEffect(() => {
    if (answerKeyId && sessionToken) {
      fetchExamData();
    } else {
      setError('잘못된 접근입니다.');
      setLoading(false);
    }
  }, [answerKeyId, sessionToken]);

  // 실시간 시간 업데이트
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const fetchExamData = async () => {
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

      if (session.is_completed) {
        throw new Error('이미 완료된 시험입니다.');
      }

      setSessionInfo(session);
      setStudentInfo(session.students);
      setStartTime(new Date(session.started_at));

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

      // 3. 답안 초기화
      const initialAnswers = {};
      examData.answers.forEach((q, index) => {
        initialAnswers[index] = '';
      });
      setAnswers(initialAnswers);

    } catch (error) {
      console.error('시험 데이터 로딩 오류:', error);
      setError(error.message || '시험 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: value
    }));
  };

  const calculateProgress = () => {
    const totalQuestions = examInfo?.answers?.length || 0;
    const answeredQuestions = Object.values(answers).filter(answer => answer.trim() !== '').length;
    return totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
  };

  const formatElapsedTime = () => {
    if (!startTime) return '00:00:00';
    
    const elapsed = Math.floor((currentTime - startTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (!sessionInfo || !examInfo) return;

    setSubmitLoading(true);
    setError('');

    try {
      const submittedAt = new Date().toISOString();
      const durationSeconds = Math.floor((new Date() - startTime) / 1000);

      // 답안 데이터 준비
      const answerData = examInfo.answers.map((question, index) => ({
        question: question.question,
        student_answer: answers[index] || '',
        correct_answer: question.answer,
        score: question.score,
        is_correct: false // 나중에 채점 시 업데이트
      }));

      // 1. 답안 제출 데이터 저장
      const { error: submissionError } = await supabase
        .from('student_answer_submissions')
        .insert([{
          session_id: sessionInfo.id,
          answer_key_id: answerKeyId,
          student_id: sessionInfo.student_id,
          student_name: studentInfo.full_name,
          student_phone: studentInfo.phone,
          answers: answerData,
          submitted_at: submittedAt
        }]);

      if (submissionError) throw submissionError;

      // 2. 세션 완료 처리
      const { error: sessionError } = await supabase
        .from('student_answer_sessions')
        .update({
          submitted_at: submittedAt,
          duration_seconds: durationSeconds,
          is_completed: true,
          updated_at: submittedAt
        })
        .eq('id', sessionInfo.id);

      if (sessionError) throw sessionError;

      // 3. 완료 페이지로 리다이렉트
      router.push(`/student-exam/${answerKeyId}/complete?session=${sessionToken}`);

    } catch (error) {
      console.error('답안 제출 오류:', error);
      setError('답안 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const getAnsweredCount = () => {
    return Object.values(answers).filter(answer => answer.trim() !== '').length;
  };

  const getTotalQuestions = () => {
    return examInfo?.answers?.length || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">시험 준비 중...</p>
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
              <AlertCircle className="h-4 w-4" />
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
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-4xl mx-auto px-4">
        {/* 헤더 - 시험 정보 및 타이머 */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  뒤로가기
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">{examInfo.exam_title}</h1>
                  <p className="text-gray-600 flex items-center mt-1">
                    <User className="w-4 h-4 mr-1" />
                    {studentInfo.full_name}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 text-lg font-mono">
                  <Timer className="w-5 h-5 text-blue-500" />
                  <span className="text-blue-600 font-bold">{formatElapsedTime()}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">경과 시간</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 진행률 표시 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">답안 작성 진행률</span>
              <span className="text-sm text-gray-600">
                {getAnsweredCount()} / {getTotalQuestions()}
              </span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>시작</span>
              <span>{Math.round(calculateProgress())}% 완료</span>
              <span>완료</span>
            </div>
          </CardContent>
        </Card>

        {/* 답안 입력 폼 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              답안 입력
            </CardTitle>
            <CardDescription>
              각 문제의 답안을 입력하세요. 모든 답안을 작성한 후 제출 버튼을 눌러주세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {examInfo.answers.map((question, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {question.question}번
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {question.score}점
                      </span>
                    </div>
                    {answers[index] && answers[index].trim() !== '' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <Label htmlFor={`answer-${index}`} className="text-base font-medium">
                      문제 {question.question}
                    </Label>
                    {question.description && (
                      <p className="text-sm text-gray-600 mt-1">{question.description}</p>
                    )}
                  </div>
                  
                  <Input
                    id={`answer-${index}`}
                    type="text"
                    placeholder="답안을 입력하세요"
                    value={answers[index] || ''}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    className="text-lg"
                  />
                </div>
              ))}
            </div>

            <Separator className="my-8" />

            {/* 제출 버튼 */}
            <div className="flex justify-center">
              {!showConfirmSubmit ? (
                <Button
                  onClick={() => setShowConfirmSubmit(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                  disabled={getAnsweredCount() === 0}
                >
                  <Send className="w-5 h-5 mr-2" />
                  답안 제출하기
                </Button>
              ) : (
                <div className="text-center space-y-4">
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-yellow-700">
                      <strong>제출 확인</strong><br />
                      답안을 제출하면 수정할 수 없습니다. 정말 제출하시겠습니까?<br />
                      <span className="text-sm">
                        답안 완료: {getAnsweredCount()} / {getTotalQuestions()}개 
                        ({Math.round(calculateProgress())}%)
                      </span>
                    </AlertDescription>
                  </Alert>
                  <div className="flex space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowConfirmSubmit(false)}
                      disabled={submitLoading}
                    >
                      취소
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={submitLoading}
                      className="bg-green-600 hover:bg-green-700 text-white px-6"
                    >
                      {submitLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          제출 중...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          최종 제출
                        </>
                      )}
                    </Button>
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