'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Trophy, User, Phone, Lock, Eye, Calendar, LogOut } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// StudentExamScoresModal의 컴포넌트들 재사용
import ExamScoreFilters from '@/components/admin/dashboard/student-management/components/ExamScoreFilters';
import ExamScoreStats from '@/components/admin/dashboard/student-management/components/ExamScoreStats';
import ManualScoreTable from '@/components/admin/dashboard/student-management/components/ManualScoreTable';
import AutoScoreTable from '@/components/admin/dashboard/student-management/components/AutoScoreTable';
import useExamScores from '@/components/admin/dashboard/student-management/hooks/useExamScores';
import { getScoreBadge, getExamTypeBadge } from '@/components/admin/dashboard/student-management/utils/scoreUtils';

// 강사 코멘트 컴포넌트
import StudentCommentsSection from './components/StudentCommentsSection_Simple';

export default function PublicScoresPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  
  // 공개 페이지용 Supabase 클라이언트 (인증 없음)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  );
  
  const [step, setStep] = useState('login'); // 'login' | 'scores'
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState('');
  const [student, setStudent] = useState(null);
  const [publicConfig, setPublicConfig] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  // 탭 상태 관리
  const [activeTab, setActiveTab] = useState('scores');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  // 성적 데이터 상태 (직접 관리)
  const [examScoresData, setExamScoresData] = useState({
    examScores: [],
    examSessions: [],
    loading: false,
    mounted: true,
    getSubjects: () => [],
    filteredScores: [],
    filteredSessions: [],
    getAverageScore: () => 0,
    getRecentTrend: () => 'stable'
  });

  useEffect(() => {
    if (token) {
      validateToken();
    }
  }, [token]);

  // 필터링된 데이터 업데이트
  useEffect(() => {
    if (examScoresData.examScores || examScoresData.examSessions) {
      const filteredScores = examScoresData.examScores.filter(score => {
        if (selectedSubject !== 'all' && score.schedules?.subject !== selectedSubject) return false;
        if (selectedPeriod !== 'all') {
          const examDate = new Date(score.exam_date);
          const now = new Date();
          const monthsAgo = parseInt(selectedPeriod);
          const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
          if (examDate < cutoffDate) return false;
        }
        return true;
      });

      const filteredSessions = examScoresData.examSessions.filter(session => {
        if (selectedSubject !== 'all' && session.exam_answer_keys?.subject !== selectedSubject) return false;
        if (selectedPeriod !== 'all') {
          const examDate = new Date(session.exam_answer_keys?.exam_date);
          const now = new Date();
          const monthsAgo = parseInt(selectedPeriod);
          const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
          if (examDate < cutoffDate) return false;
        }
        return true;
      });

      // getSubjects 함수 업데이트
      const getSubjects = () => {
        const subjects = new Set();
        examScoresData.examScores.forEach(score => {
          if (score.schedules?.subject) {
            subjects.add(score.schedules.subject);
          }
        });
        examScoresData.examSessions.forEach(session => {
          if (session.exam_answer_keys?.subject) {
            subjects.add(session.exam_answer_keys.subject);
          }
        });
        return Array.from(subjects);
      };

      // getAverageScore 함수 업데이트
      const getAverageScore = () => {
        if (filteredScores.length === 0) return 0;
        const total = filteredScores.reduce((sum, score) => sum + (score.score || 0), 0);
        return Math.round(total / filteredScores.length);
      };

      // getRecentTrend 함수 업데이트
      const getRecentTrend = () => {
        if (filteredScores.length < 2) return null;
        const recent = filteredScores.slice(0, 2);
        const current = recent[0]?.score || 0;
        const previous = recent[1]?.score || 0;
        const diff = current - previous;
        return { current, previous, diff };
      };

      setExamScoresData(prev => ({
        ...prev,
        filteredScores,
        filteredSessions,
        getSubjects,
        getAverageScore,
        getRecentTrend
      }));
    }
  }, [examScoresData.examScores, examScoresData.examSessions, selectedSubject, selectedPeriod]);

  const validateToken = async () => {
    try {
      // 공개 설정 확인
      const { data: publicData, error: publicError } = await supabase
        .from('student_public_scores')
        .select(`
          *,
          students:student_id (
            id,
            full_name,
            phone,
            email,
            grade,
            school,
            status
          )
        `)
        .eq('url_token', token)
        .eq('is_active', true)
        .single();

      if (publicError || !publicData) {
        setError('유효하지 않은 접속 주소입니다.');
        setLoading(false);
        return;
      }

      // 만료일 확인
      if (publicData.expires_at && new Date(publicData.expires_at) < new Date()) {
        setError('접속 기간이 만료되었습니다.');
        setLoading(false);
        return;
      }

      // 학생 상태 확인
      if (publicData.students.status !== 'active') {
        setError('해당 학생의 정보를 조회할 수 없습니다.');
        setLoading(false);
        return;
      }

      setPublicConfig(publicData);
      setLoading(false);
    } catch (error) {
      console.error('토큰 검증 오류:', error);
      setError('페이지를 불러올 수 없습니다.');
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const loadExamScoresData = async (studentId) => {
    try {
      // 기존 성적 데이터 조회
      const { data: gradesData } = await supabase
        .from('student_grades')
        .select(`
          *,
          schedules (
            subject,
            teacher_name,
            grade
          )
        `)
        .eq('student_id', studentId)
        .order('exam_date', { ascending: false });

      // 자동 채점 결과 조회
      const { data: sessionsData } = await supabase
        .from('student_answer_sessions')
        .select(`
          *,
          exam_answer_keys (
            exam_title,
            exam_type,
            exam_date,
            subject,
            total_score,
            teacher_id,
            teachers (
              name
            )
          )
        `)
        .eq('student_id', studentId)
        .eq('is_completed', true)
        .order('started_at', { ascending: false });

      // 데이터 업데이트
      setExamScoresData(prev => ({
        ...prev,
        examScores: gradesData || [],
        examSessions: sessionsData || [],
        filteredScores: gradesData || [],
        filteredSessions: sessionsData || []
      }));

    } catch (error) {
      console.error('성적 데이터 로드 오류:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    setAuthLoading(true);
    setError('');

    try {
      // 1. 학생 계정 조회 및 비밀번호 확인
      const { data: accountData, error: accountError } = await supabase
        .from('student_accounts')
        .select(`
          id,
          student_id,
          username,
          password_hash,
          is_active,
          login_attempts,
          locked_until,
          students!inner (
            id,
            full_name,
            phone,
            email,
            grade,
            school,
            status
          )
        `)
        .eq('username', formData.username.trim())
        .eq('is_active', true)
        .single();

      if (accountError || !accountData) {
        throw new Error('등록되지 않은 아이디이거나 비활성화된 계정입니다.');
      }

      // 2. 계정 잠금 확인
      if (accountData.locked_until && new Date(accountData.locked_until) > new Date()) {
        throw new Error('계정이 잠겨있습니다. 잠시 후 다시 시도해주세요.');
      }

      // 3. 비밀번호 확인
      const isPasswordValid = await verifyPassword(formData.password, accountData.password_hash);
      
      if (!isPasswordValid) {
        // 로그인 실패 횟수 증가
        await supabase
          .from('student_accounts')
          .update({ 
            login_attempts: (accountData.login_attempts || 0) + 1,
            locked_until: (accountData.login_attempts || 0) >= 4 ? 
              new Date(Date.now() + 30 * 60 * 1000).toISOString() : null // 5번 실패 시 30분 잠금
          })
          .eq('id', accountData.id);
          
        throw new Error('비밀번호가 올바르지 않습니다.');
      }

      // 4. 학생 상태 확인
      if (accountData.students.status !== 'active') {
        throw new Error('비활성화된 학생 계정입니다.');
      }

      // 5. 로그인 성공 처리
      await supabase
        .from('student_accounts')
        .update({ 
          last_login_at: new Date().toISOString(),
          login_attempts: 0,
          locked_until: null
        })
        .eq('id', accountData.id);

      // 6. 접속 통계 업데이트
      await supabase.rpc('update_access_stats', {
        p_student_id: accountData.student_id
      });

      setStudent(accountData.students);
      
      // 성적 데이터 로드
      await loadExamScoresData(accountData.student_id);
      
      setStep('scores');
    } catch (error) {
      console.error('로그인 오류:', error);
      setError(error.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setAuthLoading(false);
    }
  };

  // bcrypt를 사용한 비밀번호 검증 함수
  const verifyPassword = async (plainPassword, hashedPassword) => {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('비밀번호 검증 오류:', error);
      return false;
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

  const handleLogout = () => {
    // 상태 초기화
    setStep('login');
    setStudent(null);
    setFormData({ username: '', password: '' });
    setActiveTab('scores');
    setSelectedSubject('all');
    setSelectedPeriod('all');
    setExamScoresData({
      examScores: [],
      examSessions: [],
      loading: false,
      mounted: true,
      getSubjects: () => [],
      filteredScores: [],
      filteredSessions: [],
      getAverageScore: () => 0,
      getRecentTrend: () => 'stable'
    });
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">페이지를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error && !publicConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">접속 불가</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-4">{error}</p>
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

  // 로그인 단계
  if (step === 'login') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-md mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-xl font-semibold flex items-center justify-center space-x-2">
                <Lock className="h-5 w-5 text-blue-500" />
                <span>학생 로그인</span>
              </CardTitle>
              <p className="text-center text-gray-600 mt-2">
                성적 조회를 위해 계정으로 로그인해주세요.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="username">아이디 *</Label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User style={{ width: '16px', height: '16px', color: '#9ca3af', flexShrink: 0 }} />
                    <Input
                      id="username"
                      type="text"
                      placeholder="아이디를 입력하세요"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      style={{ flex: 1 }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">비밀번호 *</Label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Lock style={{ width: '16px', height: '16px', color: '#9ca3af', flexShrink: 0 }} />
                    <Input
                      id="password"
                      type="password"
                      placeholder="비밀번호를 입력하세요"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      style={{ flex: 1 }}
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
                  className="w-full"
                >
                  {authLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      로그인 중...
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      로그인
                    </>
                  )}
                </Button>

                {/* 계정 관련 링크들 */}
                <div className="space-y-3 pt-4 border-t">
                  {/* 아이디/비밀번호 찾기 */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      아이디나 비밀번호를 잊으셨나요?
                    </p>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="w-full text-blue-600 hover:text-blue-700"
                      onClick={() => router.push(`/public-scores/${token}/find-account`)}
                    >
                      아이디/비밀번호 찾기
                    </Button>
                  </div>

                  {/* 회원가입 */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      계정이 없으신가요?
                    </p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => router.push(`/public-scores/${token}/register`)}
                    >
                      학생 회원가입
                    </Button>
                  </div>
                </div>
              </form>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">📋 안내사항</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 학원생 계정으로만 성적 조회가 가능합니다</li>
                  <li>• 계정이 없으신 경우 회원가입을 먼저 진행해주세요</li>
                  <li>• 5회 이상 로그인 실패 시 30분간 계정이 잠깁니다</li>
                  {publicConfig?.expires_at && (
                    <li>• 조회 가능 기간: {formatDate(publicConfig.expires_at)}까지</li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 성적 조회 단계
  if (step === 'scores' && student && examScoresData) {
    const {
      loading: scoresLoading,
      mounted,
      getSubjects,
      filteredScores,
      filteredSessions,
      getAverageScore,
      getRecentTrend
    } = examScoresData;

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* 헤더 */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span>{student.full_name} 학생 학습현황</span>
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                >
                  <LogOut className="h-4 w-4" />
                  <span>로그아웃</span>
                </Button>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{student.grade} • {student.school}</span>
                </div>
                {publicConfig?.expires_at && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>조회 가능 기간: {formatDate(publicConfig.expires_at)}까지</span>
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>

          <div className="space-y-6">
            {/* 필터 섹션 */}
            <ExamScoreFilters
              selectedSubject={selectedSubject}
              setSelectedSubject={setSelectedSubject}
              selectedPeriod={selectedPeriod}
              setSelectedPeriod={setSelectedPeriod}
              getSubjects={getSubjects}
            />

            {/* 성적 요약 카드 */}
            <ExamScoreStats
              getAverageScore={getAverageScore}
              filteredScores={filteredScores}
              filteredSessions={filteredSessions}
              getRecentTrend={getRecentTrend}
              mounted={mounted}
            />

            {/* 탭 컨텐츠 */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="scores">성적 이력</TabsTrigger>
                <TabsTrigger value="sessions">자동 채점 결과</TabsTrigger>
                <TabsTrigger value="comments">강사 코멘트</TabsTrigger>
              </TabsList>

              <TabsContent value="scores" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>수동 입력 성적</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ManualScoreTable
                      filteredScores={filteredScores}
                      loading={scoresLoading}
                      getScoreBadge={getScoreBadge}
                      getExamTypeBadge={getExamTypeBadge}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sessions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>자동 채점 결과</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AutoScoreTable
                      filteredSessions={filteredSessions}
                      loading={scoresLoading}
                      getScoreBadge={getScoreBadge}
                      getExamTypeBadge={getExamTypeBadge}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comments" className="space-y-4">
                <StudentCommentsSection 
                  supabase={supabase}
                  studentId={student.id}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* 푸터 정보 */}
          <Card className="mt-8 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="text-center text-sm text-blue-700">
                <p className="font-medium">솔루션 개발은 CodeBoost가 도와드립니다.</p>
                <p>개발문의: codeboost7@gmail.com / Tel: 010-5682-7859</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}