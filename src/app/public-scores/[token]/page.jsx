'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Trophy, User, Phone, Lock, Eye, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase/supabaseClientBrowser';

// StudentExamScoresModal의 컴포넌트들 재사용
import ExamScoreFilters from '@/components/admin/dashboard/student-management/components/ExamScoreFilters';
import ExamScoreStats from '@/components/admin/dashboard/student-management/components/ExamScoreStats';
import ManualScoreTable from '@/components/admin/dashboard/student-management/components/ManualScoreTable';
import AutoScoreTable from '@/components/admin/dashboard/student-management/components/AutoScoreTable';
import useExamScores from '@/components/admin/dashboard/student-management/hooks/useExamScores';
import { getScoreBadge, getExamTypeBadge } from '@/components/admin/dashboard/student-management/utils/scoreUtils';

export default function PublicScoresPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  
  const [step, setStep] = useState('auth'); // 'auth' | 'scores'
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState('');
  const [student, setStudent] = useState(null);
  const [publicConfig, setPublicConfig] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });

  // 성적 데이터 훅 (student가 설정된 후에만 사용)
  const examScoresData = useExamScores(student, step === 'scores');

  useEffect(() => {
    if (token) {
      validateToken();
    }
  }, [token]);

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

  const handleAuth = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      setError('이름과 전화번호를 모두 입력해주세요.');
      return;
    }

    setAuthLoading(true);
    setError('');

    try {
      const studentData = publicConfig.students;
      
      // 이름과 전화번호 확인
      if (studentData.full_name.trim() !== formData.name.trim()) {
        throw new Error('등록된 학생 이름과 일치하지 않습니다.');
      }

      if (studentData.phone.trim() !== formData.phone.trim()) {
        throw new Error('등록된 전화번호와 일치하지 않습니다.');
      }

      // 접속 통계 업데이트 (데이터베이스 함수 사용)
      await supabase.rpc('update_access_stats', {
        p_student_id: studentData.id
      });

      setStudent(studentData);
      setStep('scores');
    } catch (error) {
      console.error('인증 오류:', error);
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

  // 인증 단계
  if (step === 'auth') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-md mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-xl font-semibold flex items-center justify-center space-x-2">
                <Lock className="h-5 w-5 text-blue-500" />
                <span>학생 인증</span>
              </CardTitle>
              <p className="text-center text-gray-600 mt-2">
                성적 조회를 위해 학생 정보를 입력해주세요.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <Label htmlFor="name">이름 *</Label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User style={{ width: '16px', height: '16px', color: '#9ca3af', flexShrink: 0 }} />
                    <Input
                      id="name"
                      type="text"
                      placeholder="등록된 이름을 입력하세요"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      style={{ flex: 1 }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">전화번호 *</Label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone style={{ width: '16px', height: '16px', color: '#9ca3af', flexShrink: 0 }} />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="등록된 전화번호를 입력하세요"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
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
                      인증 중...
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      성적 조회하기
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">📋 안내사항</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 학원에 등록된 정확한 이름과 전화번호를 입력해주세요</li>
                  <li>• 개인정보 보호를 위해 본인 확인 후 조회 가능합니다</li>
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
      examScores,
      examSessions,
      loading: scoresLoading,
      selectedSubject,
      setSelectedSubject,
      selectedPeriod,
      setSelectedPeriod,
      activeTab,
      setActiveTab,
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
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span>{student.full_name} 학생 학습현황</span>
              </CardTitle>
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
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="scores">성적 이력</TabsTrigger>
                <TabsTrigger value="sessions">자동 채점 결과</TabsTrigger>
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
            </Tabs>
          </div>

          {/* 푸터 정보 */}
          <Card className="mt-8 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="text-center text-sm text-blue-700">
                <p className="font-medium">수학의 문 학원</p>
                <p>문의사항이 있으시면 학원으로 연락해주세요.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}