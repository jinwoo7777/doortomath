'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

import GradingFilters from './GradingFilters';
import AnswerKeysList from './AnswerKeysList';
import AnswerKeyForm from '../answer-key/AnswerKeyForm';
import { useGradingData } from '../hooks/useGradingData';

/**
 * 채점 관리 메인 컴포넌트
 * @returns {JSX.Element} 채점 관리 메인 컴포넌트
 */
const GradingManagementContent = () => {
  const {
    answerKeys,
    teachers,
    loading,
    error,
    deleteAnswerKey,
    addAnswerKey
  } = useGradingData();

  const [activeTab, setActiveTab] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');

  // 과목 목록 추출
  const subjects = [...new Set(answerKeys.map(key => key.subject))].sort();

  // 필터링된 답안 키 목록
  const filteredAnswerKeys = answerKeys.filter(key => {
    const matchesSearch = searchTerm === '' || 
      key.exam_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTeacher = selectedTeacher === 'all' || 
      key.teacher_id === selectedTeacher;
    
    const matchesSubject = selectedSubject === 'all' || 
      key.subject === selectedSubject;
    
    return matchesSearch && matchesTeacher && matchesSubject;
  });

  // 답안 키 저장 완료 처리
  const handleAnswerKeySaved = (newAnswerKey) => {
    addAnswerKey(newAnswerKey);
    setActiveTab('list');
  };

  // 로딩 상태 표시
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>답안 키 목록 로딩 중...</CardTitle>
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>자동 채점 관리</CardTitle>
          <Button onClick={() => setActiveTab('create')}>
            <Plus className="mr-2 h-4 w-4" />
            새 답안 키 생성
          </Button>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">답안 키 목록</TabsTrigger>
          <TabsTrigger value="create">새 답안 키 생성</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-4">
          <div className="space-y-6">
            <GradingFilters
              searchTerm={searchTerm}
              selectedTeacher={selectedTeacher}
              selectedSubject={selectedSubject}
              teachers={teachers}
              subjects={subjects}
              onSearchChange={setSearchTerm}
              onTeacherChange={setSelectedTeacher}
              onSubjectChange={setSelectedSubject}
            />
            
            <AnswerKeysList
              answerKeys={filteredAnswerKeys}
              onDelete={deleteAnswerKey}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="create" className="mt-4">
          <AnswerKeyForm
            onSave={handleAnswerKeySaved}
            onBack={() => setActiveTab('list')}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GradingManagementContent;
