'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Star, UserCheck, School } from 'lucide-react';

/**
 * 학생 통계 정보 카드 컴포넌트
 */
const StudentStats = ({ stats }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">전체 학원생</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalStudents}명</div>
          <p className="text-xs text-muted-foreground">
            활성 {stats.activeStudents}명
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">관심 관리 대상</CardTitle>
          <Star className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.priorityStudents}명</div>
          <p className="text-xs text-muted-foreground">
            전체의 {stats.totalStudents > 0 ? Math.round((stats.priorityStudents / stats.totalStudents) * 100) : 0}%
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">학년별 분포</CardTitle>
          <School className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm">
            <div className="flex justify-between mb-1">
              <span>초등부:</span>
              <span className="font-medium">{stats.gradeStats.초등부}명</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>중등부:</span>
              <span className="font-medium">{stats.gradeStats.중등부}명</span>
            </div>
            <div className="flex justify-between">
              <span>고등부:</span>
              <span className="font-medium">{stats.gradeStats.고등부}명</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">지점별 분포</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm">
            <div className="flex justify-between mb-1">
              <span>대치:</span>
              <span className="font-medium">{stats.branchStats.daechi}명</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>북위례:</span>
              <span className="font-medium">{stats.branchStats.bukwirye}명</span>
            </div>
            <div className="flex justify-between">
              <span>남위례:</span>
              <span className="font-medium">{stats.branchStats.namwirye}명</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentStats;