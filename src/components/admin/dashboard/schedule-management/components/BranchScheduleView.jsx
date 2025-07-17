// src/components/admin/dashboard/schedule-management/components/BranchScheduleView.jsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Printer, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import SchedulePageView from './SchedulePageView';
import { getBranchName } from '../utils/scheduleUtils';

/**
 * 지점별 전체 시간표 페이지 뷰 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {Object} props.schedules - 학년별 시간표 데이터
 * @param {string} props.branch - 지점명
 * @returns {React.ReactElement} 지점별 전체 시간표 페이지 뷰
 */
const BranchScheduleView = ({ schedules, branch }) => {
  const [activeTab, setActiveTab] = useState('초등부');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState('all'); // 'all', '5', '10', '15'

  // 시간표 인쇄 기능
  const handlePrint = () => {
    window.print();
  };

  // 시간표 PDF 다운로드 기능 (실제 구현은 별도로 필요)
  const handleDownload = () => {
    alert('PDF 다운로드 기능은 준비 중입니다.');
  };

  // 페이지 이동 처리
  const handlePageChange = (direction) => {
    if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (direction === 'next') {
      setCurrentPage(currentPage + 1);
    }
  };

  // 페이지 크기에 따라 시간표 필터링
  const getPagedSchedules = (gradeSchedules) => {
    if (pageSize === 'all') {
      return gradeSchedules;
    }
    
    const size = parseInt(pageSize);
    const start = (currentPage - 1) * size;
    return gradeSchedules.slice(start, start + size);
  };

  // 총 페이지 수 계산
  const getTotalPages = (gradeSchedules) => {
    if (pageSize === 'all') return 1;
    const size = parseInt(pageSize);
    return Math.ceil(gradeSchedules.length / size);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{getBranchName(branch)} 시간표</h2>
          <p className="text-muted-foreground">
            {getBranchName(branch)} 지점의 전체 시간표를 확인할 수 있습니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            인쇄
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            PDF 저장
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>시간표 보기</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={pageSize} onValueChange={setPageSize}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="페이지 크기" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 보기</SelectItem>
                  <SelectItem value="5">5개씩 보기</SelectItem>
                  <SelectItem value="10">10개씩 보기</SelectItem>
                  <SelectItem value="15">15개씩 보기</SelectItem>
                </SelectContent>
              </Select>
              
              {pageSize !== 'all' && (
                <div className="flex items-center gap-1">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handlePageChange('prev')}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    {currentPage} / {getTotalPages(schedules[activeTab])}
                  </span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handlePageChange('next')}
                    disabled={currentPage >= getTotalPages(schedules[activeTab])}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="초등부">초등부</TabsTrigger>
              <TabsTrigger value="중등부">중등부</TabsTrigger>
              <TabsTrigger value="고등부">고등부</TabsTrigger>
            </TabsList>

            {['초등부', '중등부', '고등부'].map((grade) => (
              <TabsContent key={grade} value={grade} className="mt-4">
                <div className="print-container">
                  <div className="print-header">
                    <h2 className="text-xl font-bold">{getBranchName(branch)} {grade} 시간표</h2>
                  </div>
                  <SchedulePageView 
                    schedules={getPagedSchedules(schedules[grade])} 
                    grade={grade} 
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* 인쇄용 스타일 */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print-header {
            text-align: center;
            margin-bottom: 20px;
          }
          button, select, .pagination {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BranchScheduleView;