'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Star, BarChart3 } from 'lucide-react';

/**
 * 학생 관리 탭 컴포넌트
 */
const StudentTabs = ({ activeTab, setActiveTab, children }) => {
  return (
    <div className="w-full layout-shift-fix tabs-no-shift fixed-height-tabs">
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <div className="relative w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="all" className="flex items-center justify-center gap-2">
              <Users className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">전체 학생</span>
            </TabsTrigger>
            <TabsTrigger value="by-score" className="flex items-center justify-center gap-2">
              <BarChart3 className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">성적순</span>
            </TabsTrigger>
            <TabsTrigger value="priority" className="flex items-center justify-center gap-2">
              <Star className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">관심 관리</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div className="w-full mt-4">
          {children}
        </div>
      </Tabs>
    </div>
  );
};

export default StudentTabs;