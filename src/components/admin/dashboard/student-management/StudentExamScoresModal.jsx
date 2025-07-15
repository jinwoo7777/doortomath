'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Calendar, 
  BookOpen, 
  Trophy, 
  TrendingUp, 
  Clock,
  FileText,
  BarChart3,
  CheckCircle,
  XCircle,
  Target,
  Award
} from 'lucide-react';

export default function StudentExamScoresModal({ student, isOpen, onClose }) {
  const [examScores, setExamScores] = useState([]);
  const [examSessions, setExamSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [activeTab, setActiveTab] = useState('scores');
  const [mounted, setMounted] = useState(false);
  const supabase = createClientComponentClient();

  // 컴포넌트가 마운트되었는지 확인
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && student && mounted) {
      fetchExamData();
    }
  }, [isOpen, student, mounted]);

  const fetchExamData = async () => {
    if (!student?.id) {
      console.error('학생 ID가 없습니다.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // 1. 기존 성적 데이터 조회 (student_grades) - 스케줄과 조인
      const { data: gradesData, error: gradesError } = await supabase
        .from('student_grades')
        .select(`
          *,
          schedules (
            subject,
            teacher_name,
            grade,
            time_slot
          )
        `)
        .eq('student_id', student.id)
        .order('exam_date', { ascending: false });

      if (gradesError) {
        console.error('성적 데이터 조회 오류:', gradesError);
        throw gradesError;
      }

      // 2. 자동 채점 시스템 결과 조회 (student_answer_submissions) - exam_answer_keys와 조인
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('student_answer_submissions')
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
        .eq('student_id', student.id)
        .order('submitted_at', { ascending: false });

      if (submissionsError) {
        console.error('자동 채점 데이터 조회 오류:', submissionsError);
        throw submissionsError;
      }

      // 3. 시험 세션 데이터 조회 (완료되지 않은 시험 포함) - exam_answer_keys와 조인
      const { data: sessionsData, error: sessionsError } = await supabase
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
        .eq('student_id', student.id)
        .order('started_at', { ascending: false });

      if (sessionsError) {
        console.error('시험 세션 데이터 조회 오류:', sessionsError);
        throw sessionsError;
      }

      // 데이터 설정 및 로깅
      setExamScores(gradesData || []);
      setExamSessions(submissionsData || []);
      
      console.log('데이터 로딩 성공:', {
        gradesCount: gradesData?.length || 0,
        submissionsCount: submissionsData?.length || 0,
        sessionsCount: sessionsData?.length || 0,
        studentId: student.id
      });
      
    } catch (error) {
      console.error('시험 데이터 로딩 오류:', error);
      toast.error(`시험 데이터를 불러오는 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  const getSubjects = () => {
    const subjects = new Set();
    examScores.forEach(score => {
      if (score.schedules?.subject) {
        subjects.add(score.schedules.subject);
      }
    });
    examSessions.forEach(session => {
      if (session.exam_answer_keys?.subject) {
        subjects.add(session.exam_answer_keys.subject);
      }
    });
    return Array.from(subjects);
  };

  const filteredScores = examScores.filter(score => {
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

  const filteredSessions = examSessions.filter(session => {
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

  const getScoreBadge = (score, maxScore = 100) => {
    if (!mounted) return null;
    const percentage = ((score || 0) / (maxScore || 100)) * 100;
    if (percentage >= 90) return <Badge className="bg-green-500 text-white">우수</Badge>;
    if (percentage >= 80) return <Badge className="bg-blue-500 text-white">양호</Badge>;
    if (percentage >= 70) return <Badge className="bg-yellow-500 text-white">보통</Badge>;
    if (percentage >= 60) return <Badge className="bg-orange-500 text-white">미흡</Badge>;
    return <Badge className="bg-red-500 text-white">불량</Badge>;
  };

  const getExamTypeBadge = (type) => {
    if (!mounted) return null;
    const types = {
      regular: { label: '정기시험', color: 'bg-blue-500' },
      midterm: { label: '중간고사', color: 'bg-green-500' },
      final: { label: '기말고사', color: 'bg-red-500' },
      quiz: { label: '퀴즈', color: 'bg-yellow-500' }
    };
    
    const typeInfo = types[type] || { label: type || '시험', color: 'bg-gray-500' };
    return (
      <Badge className={`text-white ${typeInfo.color}`}>
        {typeInfo.label}
      </Badge>
    );
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '-';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}시간 ${minutes}분 ${remainingSeconds}초`;
    } else if (minutes > 0) {
      return `${minutes}분 ${remainingSeconds}초`;
    } else {
      return `${remainingSeconds}초`;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || !mounted) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('날짜 형식 오류:', error);
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString || !mounted) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('날짜 시간 형식 오류:', error);
      return dateString;
    }
  };

  const getAverageScore = () => {
    if (!mounted || filteredScores.length === 0) return 0;
    const total = filteredScores.reduce((sum, score) => sum + (score.score || 0), 0);
    return Math.round(total / filteredScores.length);
  };

  const getRecentTrend = () => {
    if (!mounted || filteredScores.length < 2) return null;
    const recent = filteredScores.slice(0, 2);
    const current = recent[0]?.score || 0;
    const previous = recent[1]?.score || 0;
    const diff = current - previous;
    return { current, previous, diff };
  };

  if (!student || !mounted) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span>{student.full_name}님의 시험 성적</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 필터 섹션 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">과목</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="과목 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 과목</SelectItem>
                  {getSubjects().map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">기간</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="기간 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 기간</SelectItem>
                  <SelectItem value="1">최근 1개월</SelectItem>
                  <SelectItem value="3">최근 3개월</SelectItem>
                  <SelectItem value="6">최근 6개월</SelectItem>
                  <SelectItem value="12">최근 1년</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 성적 요약 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">평균 점수</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getAverageScore()}점</div>
                <p className="text-xs text-muted-foreground">전체 시험 평균</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">응시 횟수</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredScores.length + filteredSessions.length}</div>
                <p className="text-xs text-muted-foreground">총 응시 횟수</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">최고 점수</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mounted && (filteredScores.length > 0 || filteredSessions.length > 0) ? 
                    Math.max(
                      ...filteredScores.map(s => s.score || 0),
                      ...filteredSessions.map(s => s.total_score || 0),
                      0
                    ) : 0}점
                </div>
                <p className="text-xs text-muted-foreground">최고 기록</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">최근 경향</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {mounted ? (() => {
                  const trend = getRecentTrend();
                  if (!trend) return <div className="text-sm text-gray-500">데이터 부족</div>;
                  return (
                    <div className="text-2xl font-bold">
                      {trend.diff > 0 ? '+' : ''}{trend.diff}점
                      <p className="text-xs text-muted-foreground">이전 시험 대비</p>
                    </div>
                  );
                })() : <div className="text-sm text-gray-500">로딩 중...</div>}
              </CardContent>
            </Card>
          </div>

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
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-600">데이터 로딩 중...</p>
                    </div>
                  ) : filteredScores.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>시험 날짜</TableHead>
                          <TableHead>과목</TableHead>
                          <TableHead>담당 강사</TableHead>
                          <TableHead>시험 유형</TableHead>
                          <TableHead>점수</TableHead>
                          <TableHead>등급</TableHead>
                          <TableHead>비고</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredScores.map((score, index) => (
                          <TableRow key={index}>
                            <TableCell>{formatDate(score.exam_date)}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <BookOpen className="w-4 h-4 mr-1 text-gray-500" />
                                {score.schedules?.subject || '-'}
                              </div>
                            </TableCell>
                            <TableCell>{score.schedules?.teacher_name || '-'}</TableCell>
                            <TableCell>{getExamTypeBadge(score.exam_type)}</TableCell>
                            <TableCell>
                              <div className="font-medium">{score.score || 0}점</div>
                              <div className="text-sm text-gray-500">
                                {Math.round(((score.score || 0) / (score.max_score || 100)) * 100)}%
                              </div>
                            </TableCell>
                            <TableCell>{getScoreBadge(score.score, score.max_score)}</TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-600">{score.notes || '-'}</span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">수동 입력 성적이 없습니다.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sessions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>자동 채점 결과</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-600">데이터 로딩 중...</p>
                    </div>
                  ) : filteredSessions.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>시험 제목</TableHead>
                          <TableHead>과목</TableHead>
                          <TableHead>시험 날짜</TableHead>
                          <TableHead>담당 강사</TableHead>
                          <TableHead>제출 시간</TableHead>
                          <TableHead>소요 시간</TableHead>
                          <TableHead>점수</TableHead>
                          <TableHead>등급</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSessions.map((session, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div className="font-medium">{session.exam_answer_keys?.exam_title || '시험 제목 없음'}</div>
                              <div className="text-sm text-gray-500">
                                {getExamTypeBadge(session.exam_answer_keys?.exam_type)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <BookOpen className="w-4 h-4 mr-1 text-gray-500" />
                                {session.exam_answer_keys?.subject || '-'}
                              </div>
                            </TableCell>
                            <TableCell>{formatDate(session.exam_answer_keys?.exam_date)}</TableCell>
                            <TableCell>{session.exam_answer_keys?.teachers?.name || '-'}</TableCell>
                            <TableCell>{formatDateTime(session.submitted_at)}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1 text-gray-500" />
                                {formatDuration(session.duration_seconds)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{session.total_score || 0}점</div>
                              <div className="text-sm text-gray-500">
                                {Math.round(((session.total_score || 0) / (session.exam_answer_keys?.total_score || 100)) * 100)}%
                              </div>
                            </TableCell>
                            <TableCell>
                              {getScoreBadge(session.total_score, session.exam_answer_keys?.total_score)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">자동 채점 결과가 없습니다.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}