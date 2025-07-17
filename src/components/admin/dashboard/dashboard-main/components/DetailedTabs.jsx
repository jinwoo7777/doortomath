"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import tab components
import ClassesTab from './tabs/ClassesTab';
import StudentsTab from './tabs/StudentsTab';
import RevenueTab from './tabs/RevenueTab';
import InquiriesTab from './tabs/InquiriesTab';

const DetailedTabs = ({ dashboardData, navigateToPage }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>상세 현황</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="classes" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="classes">📚 수업 현황</TabsTrigger>
            <TabsTrigger value="students">👥 학생 현황</TabsTrigger>
            <TabsTrigger value="revenue">💰 매출 현황</TabsTrigger>
            <TabsTrigger value="inquiries">📞 문의 현황</TabsTrigger>
          </TabsList>
          
          <TabsContent value="classes">
            <ClassesTab topClasses={dashboardData.topClasses} navigateToPage={navigateToPage} />
          </TabsContent>
          
          <TabsContent value="students">
            <StudentsTab 
              recentStudents={dashboardData.recentStudents} 
              dashboardData={dashboardData}
              navigateToPage={navigateToPage} 
            />
          </TabsContent>
          
          <TabsContent value="revenue">
            <RevenueTab dashboardData={dashboardData} navigateToPage={navigateToPage} />
          </TabsContent>
          
          <TabsContent value="inquiries">
            <InquiriesTab recentInquiries={dashboardData.recentInquiries} navigateToPage={navigateToPage} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DetailedTabs;