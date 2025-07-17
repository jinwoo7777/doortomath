'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase/supabaseClientBrowser';

import ExamStatusStats from './ExamStatusStats';
import ExamStatusFilters from './ExamStatusFilters';
import CompletedStudentsList from './CompletedStudentsList';
import NotCompletedStudentsList from './NotCompletedStudentsList';

/**
 * 시험 응시 현황 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {string} props.answerKeyId - 답안 키 ID
 * @param {number} props.totalScore - 시험 총점
 * @returns {JSX.Element} 시험 응시 현황 컴포넌트
 */
const ExamStatusContent = ({ answerKeyId, totalScore }) => {
  const [activeStudents, setActiveStudents] = useState([]);
  const [completedStudents, setCompletedStudents] = useState([]);
  const [notCompletedStudents, setNotCompletedStudents] = useState([]);
  const [averageScore, setAverageScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 필터링 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [availableGrades, setAvailableGrades] = useState([]);
  const [activeTab, setActiveTab] = useState('completed');

  // 데이터 로딩
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 활성 학생 조회
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('*')
          .eq('is_active', true)
          .order('grade')
          .order('class_name')
          .order('name');
        
        if (studentsError) throw studentsError;
        
        // 시험 완료 데이터 조회
        const { data: examCompletionData, error: examCompletionError } = await supabase
          .from('exam_completions')
          .select('*')
          .eq('answer_key_id', answerKeyId);
        
        if (examCompletionError) throw examCompletionError;
        
        // 학생 데이터와 시험 완료 데이터 결합
        const completedStudentsData = [];
        const notCompletedStudentsData = [];
        
        // 사용 가능한 학년 목록 추출
        const grades = [...new Set(studentsData.map(student => student.grade))].sort();
        setAvailableGrades(grades);
        
        // 학생 데이터 분류
        studentsData.forEach(student => {
          const completion = examCompletionData.find(
            completion => completion.student_id === student.id
          );
          
          if (completion) {
            completedStudentsData.push({
              ...student,
              score: completion.score,
              duration_seconds: completion.duration_seconds,
              submitted_at: completion.submitted_at
            });
          } else {
            notCompletedStudentsData.push(student);
          }
        });
        
        // 평균 점수 계산
        const totalScoreSum = completedStudentsData.reduce(
          (sum, student) => sum + student.score, 0
        );
        const calculatedAverage = completedStudentsData.length > 0 
          ? totalScoreSum / completedStudentsData.length 
          : 0;
        
        setActiveStudents(studentsData);
        setCompletedStudents(completedStudentsData);
        setNotCompletedStudents(notCompletedStudentsData);
        setAverageScore(calculatedAverage);
      } catch (err) {
        console.error('데이터 로딩 중 오류:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [answerKeyId]);

  // 필터링된 학생 목록
  const getFilteredStudents = (students) => {
    return students.filter(student => {
      const matchesSearch = searchTerm === '' || 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGrade = selectedGrade === 'all' || 
        student.grade.toString() === selectedGrade;
      
      return matchesSearch && matchesGrade;
    });
  };

  const filteredCompletedStudents = getFilteredStudents(completedStudents);
  const filteredNotCompletedStudents = getFilteredStudents(notCompletedStudents);

  // 로딩 상태 표시
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>학생 응시 현황 로딩 중...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  // 오류 상태 표시
  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-red-500">데이터 로딩 중 오류가 발생했습니다</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <ExamStatusStats
        totalStudents={activeStudents.length}
        completedCount={completedStudents.length}
        notCompletedCount={notCompletedStudents.length}
        averageScore={averageScore}
      />

      <ExamStatusFilters
        searchTerm={searchTerm}
        selectedGrade={selectedGrade}
        availableGrades={availableGrades}
        onSearchChange={setSearchTerm}
        onGradeChange={setSelectedGrade}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="completed">
            응시 완료 ({filteredCompletedStudents.length})
          </TabsTrigger>
          <TabsTrigger value="not-completed">
            미응시 ({filteredNotCompletedStudents.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="completed" className="mt-4">
          <CompletedStudentsList 
            completedStudents={filteredCompletedStudents} 
            totalScore={totalScore} 
          />
        </TabsContent>
        
        <TabsContent value="not-completed" className="mt-4">
          <NotCompletedStudentsList 
            notCompletedStudents={filteredNotCompletedStudents} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExamStatusContent;
