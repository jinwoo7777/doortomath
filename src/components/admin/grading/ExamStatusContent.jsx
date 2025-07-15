'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar,
  Phone,
  School,
  Timer,
  Trophy,
  Search,
  RefreshCw,
  Download
} from 'lucide-react';
import { supabase } from '@/lib/supabase/supabaseClientBrowser';

export default function ExamStatusContent({ answerKey, onBack }) {
  const [studentsData, setStudentsData] = useState({
    completed: [],
    notCompleted: [],
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [activeStatusTab, setActiveStatusTab] = useState('completed');

  useEffect(() => {
    if (answerKey) {
      fetchStudentsStatus();
    }
  }, [answerKey]);

  const fetchStudentsStatus = async () => {
    try {
      setLoading(true);
      
      // 1. 모든 활성 학생 조회
      const { data: allStudents, error: studentsError } = await supabase
        .from('students')
        .select('id, full_name, phone, email, grade, school, school_grade')
        .eq('status', 'active')
        .order('full_name');

      if (studentsError) throw studentsError;

      // 2. 해당 시험에 참여한 학생들 조회
      const { data: completedSessions, error: sessionsError } = await supabase
        .from('student_answer_sessions')
        .select(`
          *,
          student_answer_submissions!inner (
            id,
            submitted_at,
            total_score,
            percentage_score,
            answers
          )
        `)
        .eq('answer_key_id', answerKey.id)
        .eq('is_completed', true)
        .order('submitted_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      // 3. 완료된 학생 ID 목록 생성
      const completedStudentIds = new Set(
        completedSessions?.map(session => session.student_id) || []
      );

      // 4. 데이터 분류
      const completedStudents = [];
      const notCompletedStudents = [];

      allStudents.forEach(student => {
        if (completedStudentIds.has(student.id)) {
          // 완료된 학생 - 세션 정보와 함께
          const session = completedSessions.find(s => s.student_id === student.id);
          completedStudents.push({
            ...student,
            session: session,
            submission: session?.student_answer_submissions?.[0] || null,
            completedAt: session?.submitted_at,
            duration: session?.duration_seconds,
            score: session?.student_answer_submissions?.[0]?.total_score || 0,
            percentage: session?.student_answer_submissions?.[0]?.percentage_score || 0
          });
        } else {
          // 미완료 학생
          notCompletedStudents.push({
            ...student,
            session: null,
            submission: null,
            completedAt: null,
            duration: null,
            score: null,
            percentage: null
          });
        }
      });

      setStudentsData({
        completed: completedStudents,
        notCompleted: notCompletedStudents,
        total: allStudents.length
      });

    } catch (error) {
      console.error('학생 응시 현황 조회 오류:', error);
    } finally {
      setLoading(false);
    }
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

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filterStudents = (students) => {
    return students.filter(student => {
      const matchesSearch = student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.phone.includes(searchTerm) ||
                          (student.school && student.school.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesGrade = filterGrade === 'all' || student.grade === filterGrade;
      
      return matchesSearch && matchesGrade;
    });
  };

  const getGradeOptions = () => {
    const grades = new Set([
      ...studentsData.completed.map(s => s.grade),
      ...studentsData.notCompleted.map(s => s.grade)
    ]);
    return Array.from(grades).filter(Boolean);
  };

  const getScoreBadge = (percentage) => {
    if (percentage >= 90) return <Badge className="bg-green-500 text-white">우수</Badge>;
    if (percentage >= 80) return <Badge className="bg-blue-500 text-white">양호</Badge>;
    if (percentage >= 70) return <Badge className="bg-yellow-500 text-white">보통</Badge>;
    if (percentage >= 60) return <Badge className="bg-orange-500 text-white">미흡</Badge>;
    return <Badge className="bg-red-500 text-white">불량</Badge>;
  };

  if (!answerKey) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">응시 현황</h2>
          <p className="text-gray-600">{answerKey.exam_title}</p>
        </div>
        <Button
          variant="outline"
          onClick={fetchStudentsStatus}
          disabled={loading}
          className="flex items-center"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 학생</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentsData.total}</div>
            <p className="text-xs text-muted-foreground">등록된 학원생</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">시험 완료</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{studentsData.completed.length}</div>
            <p className="text-xs text-muted-foreground">
              {studentsData.total > 0 ? Math.round((studentsData.completed.length / studentsData.total) * 100) : 0}% 완료
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">미완료</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{studentsData.notCompleted.length}</div>
            <p className="text-xs text-muted-foreground">
              {studentsData.total > 0 ? Math.round((studentsData.notCompleted.length / studentsData.total) * 100) : 0}% 미완료
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 점수</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {studentsData.completed.length > 0 
                ? Math.round(studentsData.completed.reduce((sum, s) => sum + (s.percentage || 0), 0) / studentsData.completed.length)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">완료 학생 평균</p>
          </CardContent>
        </Card>
      </div>

      {/* 필터 */}
      <Card>
        <CardHeader>
          <CardTitle>검색 및 필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">검색</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="이름, 전화번호, 학교 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="grade-filter">학년</Label>
              <Select value={filterGrade} onValueChange={setFilterGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="학년 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {getGradeOptions().map(grade => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 학생 목록 탭 */}
      <Card>
        <CardHeader>
          <CardTitle>학생 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeStatusTab} onValueChange={setActiveStatusTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="completed">
                시험 완료 ({filterStudents(studentsData.completed).length})
              </TabsTrigger>
              <TabsTrigger value="notCompleted">
                미완료 ({filterStudents(studentsData.notCompleted).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="completed" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>학년</TableHead>
                    <TableHead>학교</TableHead>
                    <TableHead>전화번호</TableHead>
                    <TableHead>완료시간</TableHead>
                    <TableHead>소요시간</TableHead>
                    <TableHead>점수</TableHead>
                    <TableHead>등급</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterStudents(studentsData.completed).map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.full_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{student.grade} {student.school_grade}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <School className="w-4 h-4 mr-1 text-gray-500" />
                          {student.school || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-1 text-gray-500" />
                          {student.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-gray-500" />
                          {formatDateTime(student.completedAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Timer className="w-4 h-4 mr-1 text-gray-500" />
                          {formatDuration(student.duration)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="font-medium">{student.score || 0}점</div>
                          <div className="text-sm text-gray-500">{student.percentage || 0}%</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getScoreBadge(student.percentage || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="notCompleted" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>학년</TableHead>
                    <TableHead>학교</TableHead>
                    <TableHead>전화번호</TableHead>
                    <TableHead>상태</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterStudents(studentsData.notCompleted).map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.full_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{student.grade} {student.school_grade}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <School className="w-4 h-4 mr-1 text-gray-500" />
                          {student.school || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-1 text-gray-500" />
                          {student.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-red-600 border-red-600">
                          <Clock className="w-3 h-3 mr-1" />
                          미완료
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}