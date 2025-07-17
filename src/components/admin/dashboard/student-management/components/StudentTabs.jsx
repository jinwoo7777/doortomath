'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Star, User, BarChart3 } from 'lucide-react';

/**
 * 학생 관리 탭 컴포넌트
 */
const StudentTabs = ({ activeTab, setActiveTab, children }) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid grid-cols-4 md:grid-cols-3">
        <TabsTrigger value="all" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">전체 학생</span>
        </TabsTrigger>
        {/* <TabsTrigger value="by-teacher" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">강사별</span>
        </TabsTrigger>
        <TabsTrigger value="by-grade" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">학년별</span>
        </TabsTrigger>*/}
        <TabsTrigger value="by-score" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">성적순</span>
        </TabsTrigger>
        <TabsTrigger value="priority" className="flex items-center gap-2">
          <Star className="h-4 w-4" />
          <span className="hidden sm:inline">관심 관리</span>
        </TabsTrigger>
      </TabsList>
      
      {children}
    </Tabs>
  );
};

export default StudentTabs;