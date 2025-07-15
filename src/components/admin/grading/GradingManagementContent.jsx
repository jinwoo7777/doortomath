'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, BookOpen, User, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase/supabaseClientBrowser';
import { useAuth } from '@/hooks/useAuth';
import AnswerKeyForm from '@/components/admin/grading/AnswerKeyForm';
import ClientOnly from '@/components/ui/ClientOnly';

export default function GradingManagementContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [answerKeys, setAnswerKeys] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');
  const [selectedAnswerKey, setSelectedAnswerKey] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState({
    teacher: 'all',
    subject: 'all',
    examType: 'all',
    date: ''
  });

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  useEffect(() => {
    if (mounted) {
      // URL 파라미터에서 탭 정보 가져오기
      const tabParam = searchParams.get('tab');
      if (tabParam) {
        const validTabs = ['list', 'create', 'excel'];
        if (validTabs.includes(tabParam)) {
          setActiveTab(tabParam);
        }
      }
    }
  }, [searchParams, mounted]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 답안 키 데이터 조회 (간단한 쿼리부터 시작)
      const { data: answerKeysData, error: answerKeysError } = await supabase
        .from('exam_answer_keys')
        .select('*')
        .order('exam_date', { ascending: false });

      if (answerKeysError) {
        console.error('답안 키 데이터 조회 오류:', answerKeysError);
        throw answerKeysError;
      }

      // 강사 데이터 조회
      const { data: teachersData, error: teachersError } = await supabase
        .from('teachers')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (teachersError) {
        console.error('강사 데이터 조회 오류:', teachersError);
        throw teachersError;
      }

      // 스케줄 데이터 조회
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('schedules')
        .select('*')
        .eq('is_active', true)
        .order('subject');

      if (schedulesError) {
        console.error('스케줄 데이터 조회 오류:', schedulesError);
        throw schedulesError;
      }

      // 답안 키 데이터에 강사 정보 추가
      const enrichedAnswerKeys = (answerKeysData || []).map(key => ({
        ...key,
        teachers: teachersData?.find(t => t.id === key.teacher_id) || null,
        schedules: schedulesData?.find(s => s.id === key.schedule_id) || null
      }));

      setAnswerKeys(enrichedAnswerKeys);
      setTeachers(teachersData || []);
      setSchedules(schedulesData || []);
    } catch (error) {
      console.error('데이터 로딩 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnswerKeys = answerKeys.filter(key => {
    if (filters.teacher !== 'all' && key.teacher_id !== filters.teacher) return false;
    if (filters.subject !== 'all' && key.subject !== filters.subject) return false;
    if (filters.examType !== 'all' && key.exam_type !== filters.examType) return false;
    if (filters.date && key.exam_date !== filters.date) return false;
    return true;
  });

  const formatDate = (dateString) => {
    if (!dateString || !mounted) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      return dateString;
    }
  };

  const getExamTypeBadge = (type) => {
    if (!mounted) return null;
    
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

  const handleDeleteAnswerKey = async (id) => {
    if (!confirm('정말로 이 답안 키를 삭제하시겠습니까?')) return;
    
    try {
      const { error } = await supabase
        .from('exam_answer_keys')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setAnswerKeys(prev => prev.filter(key => key.id !== id));
    } catch (error) {
      console.error('답안 키 삭제 중 오류:', error);
      alert('답안 키 삭제에 실패했습니다.');
    }
  };

  const handleSaveAnswerKey = (newAnswerKey) => {
    setAnswerKeys(prev => [newAnswerKey, ...prev]);
    setActiveTab('list');
  };


  const handleViewDetail = (answerKey) => {
    router.push(`/dashboard2/admin/grading/${answerKey.id}`);
  };

  const handleEditAnswerKey = (answerKey) => {
    router.push(`/dashboard2/admin/grading/edit/${answerKey.id}`);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">자동 채점 관리</h1>
          <p className="text-gray-600 mt-2">시험 답안 키를 관리하고 자동 채점을 설정하세요</p>
        </div>
        <Button 
          onClick={() => setActiveTab('create')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          답안 키 추가
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">답안 키 목록</TabsTrigger>
          <TabsTrigger value="create">답안 키 생성</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          {/* 필터 섹션 */}
          <Card>
            <CardHeader>
              <CardTitle>검색 및 필터</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="teacher-filter">강사</Label>
                  <Select value={filters.teacher} onValueChange={(value) => setFilters({...filters, teacher: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="강사 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      {teachers.map(teacher => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subject-filter">과목</Label>
                  <Select value={filters.subject} onValueChange={(value) => setFilters({...filters, subject: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="과목 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      {[...new Set(schedules.map(s => s.subject))].map(subject => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="exam-type-filter">시험 유형</Label>
                  <Select value={filters.examType} onValueChange={(value) => setFilters({...filters, examType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="시험 유형 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="regular">정기시험</SelectItem>
                      <SelectItem value="midterm">중간고사</SelectItem>
                      <SelectItem value="final">기말고사</SelectItem>
                      <SelectItem value="quiz">퀴즈</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date-filter">시험 날짜</Label>
                  <Input
                    id="date-filter"
                    type="date"
                    value={filters.date}
                    onChange={(e) => setFilters({...filters, date: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 답안 키 목록 */}
          <Card>
            <CardHeader>
              <CardTitle>답안 키 목록</CardTitle>
              <CardDescription>
                총 {filteredAnswerKeys.length}개의 답안 키가 있습니다.
                {loading && <span className="ml-2 text-blue-600">데이터 로딩 중...</span>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>시험 날짜</TableHead>
                    <TableHead>과목</TableHead>
                    <TableHead>강사</TableHead>
                    <TableHead>시험 유형</TableHead>
                    <TableHead>총 점수</TableHead>
                    <TableHead>문제 수</TableHead>
                    <TableHead>생성일</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAnswerKeys.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="text-gray-500">
                          <p>답안 키 데이터가 없습니다.</p>
                          <p className="text-sm mt-2">답안 키를 추가하거나 필터를 조정해보세요.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAnswerKeys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                            {formatDate(key.exam_date)}
                          </div>
                        </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-2 text-gray-500" />
                          {key.subject}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-500" />
                          {key.teachers?.name || '알 수 없음'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getExamTypeBadge(key.exam_type)}
                      </TableCell>
                      <TableCell>{key.total_score}점</TableCell>
                      <TableCell>{key.answers?.length || 0}문제</TableCell>
                      <TableCell>{formatDate(key.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetail(key)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAnswerKey(key)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteAnswerKey(key.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <AnswerKeyForm
            onBack={() => setActiveTab('list')}
            onSave={handleSaveAnswerKey}
          />
        </TabsContent>


      </Tabs>
    </div>
  );
}