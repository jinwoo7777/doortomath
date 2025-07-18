'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

// 커스텀 훅 및 컴포넌트 가져오기
import useExamScores from './hooks/useExamScores';
import ExamScoreFilters from './components/ExamScoreFilters';
import ExamScoreStats from './components/ExamScoreStats';
import ManualScoreTable from './components/ManualScoreTable';
import AutoScoreTable from './components/AutoScoreTable';
import { getScoreBadge, getExamTypeBadge } from './utils/scoreUtils';

/**
 * 학생 시험 성적 모달 컴포넌트
 */
export default function StudentExamScoresModal({ student, isOpen, onClose }) {
  const {
    examScores,
    examSessions,
    loading,
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
  } = useExamScores(student, isOpen);

  if (!student || !mounted) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span>{student.full_name} 학생 학습현황</span>
          </DialogTitle>
        </DialogHeader>

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
                    loading={loading}
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
                    loading={loading}
                    getScoreBadge={getScoreBadge}
                    getExamTypeBadge={getExamTypeBadge}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}