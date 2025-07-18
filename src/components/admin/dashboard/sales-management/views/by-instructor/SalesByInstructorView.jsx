"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { useBranch } from '../../context/BranchContext';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchInput } from '@/components/ui/search-input';
import { 
  Users,
  BookOpen,
  GraduationCap,
  Eye,
  Percent
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import DataTable from '../../components/tables/DataTable';
import { formatCurrency } from '../../utils/formatters';
import InstructorDetailView from './InstructorDetailView';

/**
 * 강사별 매출 분석 컴포넌트
 * @returns {React.ReactElement} 강사별 매출 분석 컴포넌트
 */
const SalesByInstructorView = () => {
  const { userRole } = useAuth();
  const { selectedBranch } = useBranch();
  const [instructorData, setInstructorData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchInstructorSalesData();
  }, [selectedBranch]);

  useEffect(() => {
    filterData();
  }, [instructorData, searchTerm]);

  const fetchInstructorSalesData = async () => {
    try {
      setLoading(true);

      // 1. 강사별 수업 및 수강생 정보 조회
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('student_enrollments')
        .select(`
          *,
          schedules (
            id,
            subject,
            teacher_name,
            grade,
            day_of_week,
            time_slot,
            price,
            price_period,
            max_students,
            current_students,
            classroom,
            branch
          ),
          students (
            id,
            full_name,
            email,
            phone,
            branch
          )
        `)
        .eq('status', 'active')
        .not('schedules.teacher_name', 'is', null);

      if (enrollmentsError) throw enrollmentsError;

      // 2. 강사별 매출 설정 조회
      const { data: instructorSettings, error: settingsError } = await supabase
        .from('instructor_revenue_settings')
        .select('*');

      if (settingsError) throw settingsError;

      // 3. 결제 정보 조회
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .gte('payment_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);

      if (paymentsError) throw paymentsError;

      // 4. 강사별 데이터 집계
      const instructorMap = {};

      // 지점별 필터링
      let filteredEnrollments = enrollments;
      if (selectedBranch !== 'all') {
        filteredEnrollments = enrollments.filter(enrollment => 
          enrollment.schedules?.branch === selectedBranch || 
          enrollment.students?.branch === selectedBranch
        );
      }

      filteredEnrollments.forEach(enrollment => {
        if (enrollment.schedules?.teacher_name) {
          const teacherName = enrollment.schedules.teacher_name;
          
          if (!instructorMap[teacherName]) {
            const settings = instructorSettings.find(s => s.teacher_name === teacherName);
            instructorMap[teacherName] = {
              name: teacherName,
              revenuePercentage: settings?.revenue_percentage || 50,
              baseSalary: settings?.base_salary || 0,
              classes: {},
              students: [],
              totalRevenue: 0,
              instructorRevenue: 0,
              paidAmount: 0,
              classCount: 0,
              studentCount: 0
            };
          }

          // 수업별 정보 집계
          const classKey = `${enrollment.schedules.id}`;
          if (!instructorMap[teacherName].classes[classKey]) {
            instructorMap[teacherName].classes[classKey] = {
              ...enrollment.schedules,
              students: [],
              classRevenue: 0
            };
            instructorMap[teacherName].classCount += 1;
          }

          instructorMap[teacherName].classes[classKey].students.push({
            ...enrollment,
            student: enrollment.students
          });
          instructorMap[teacherName].classes[classKey].classRevenue += enrollment.monthly_fee || 0;

          // 학생 정보 추가
          instructorMap[teacherName].students.push({
            ...enrollment,
            student: enrollment.students,
            class: enrollment.schedules
          });
          instructorMap[teacherName].totalRevenue += enrollment.monthly_fee || 0;
          instructorMap[teacherName].studentCount += 1;
        }
      });

      // 5. 강사별 실제 수입 계산
      Object.values(instructorMap).forEach(instructor => {
        // 실제 결제된 금액 계산
        const instructorPaidAmount = payments
          .filter(payment => 
            instructor.students.some(student => 
              student.student_id === payment.student_id && 
              student.schedule_id === payment.schedule_id
            )
          )
          .reduce((sum, payment) => sum + (payment.amount || 0), 0);

        instructor.paidAmount = instructorPaidAmount;
        
        // 강사 수입 계산 (기본급 + 매출의 일정 비율)
        instructor.instructorRevenue = instructor.baseSalary + 
          (instructor.totalRevenue * instructor.revenuePercentage / 100);
        
        // 실제 지급되어야 할 강사 수입 (실제 결제 기준)
        instructor.actualInstructorRevenue = instructor.baseSalary + 
          (instructorPaidAmount * instructor.revenuePercentage / 100);

        // 수업 배열로 변환
        instructor.classesArray = Object.values(instructor.classes);
      });

      setInstructorData(Object.values(instructorMap).sort((a, b) => b.totalRevenue - a.totalRevenue));

    } catch (error) {
      console.error('Error fetching instructor sales data:', error);
      toast.error('강사별 매출 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = instructorData;

    if (searchTerm) {
      filtered = filtered.filter(instructor =>
        instructor.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredData(filtered);
  };

  const openDetailModal = (instructor) => {
    setSelectedInstructor(instructor);
    setIsDetailModalOpen(true);
  };

  // 테이블 컬럼 정의
  const columns = [
    {
      key: 'name',
      header: '강사명',
      cell: (row) => row.name,
      cellClassName: 'font-medium'
    },
    {
      key: 'classCount',
      header: '담당 수업',
      cell: (row) => (
        <div className="flex items-center gap-1">
          <BookOpen className="h-3 w-3 text-muted-foreground" />
          {row.classCount}개
        </div>
      )
    },
    {
      key: 'studentCount',
      header: '수강생',
      cell: (row) => (
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3 text-muted-foreground" />
          {row.studentCount}명
        </div>
      )
    },
    {
      key: 'totalRevenue',
      header: '총 매출',
      cell: (row) => formatCurrency(row.totalRevenue),
      cellClassName: 'font-medium'
    },
    {
      key: 'paidAmount',
      header: '실제 수금',
      cell: (row) => formatCurrency(row.paidAmount),
      cellClassName: 'font-medium text-green-600'
    },
    {
      key: 'revenuePercentage',
      header: '강사 수입률',
      cell: (row) => (
        <div className="flex items-center gap-1">
          <Percent className="h-3 w-3 text-muted-foreground" />
          {row.revenuePercentage}%
        </div>
      )
    },
    {
      key: 'instructorRevenue',
      header: '예상 수입',
      cell: (row) => formatCurrency(row.instructorRevenue),
      cellClassName: 'font-medium text-blue-600'
    },
    {
      key: 'actualInstructorRevenue',
      header: '실제 수입',
      cell: (row) => formatCurrency(row.actualInstructorRevenue),
      cellClassName: 'font-medium text-purple-600'
    },
    {
      key: 'actions',
      header: '상세',
      cell: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openDetailModal(row)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      )
    }
  ];

  if (userRole !== 'admin') {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <p className="text-center text-gray-500">관리자 권한이 필요합니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">강사별 매출 분석</h1>
          <p className="text-gray-600">각 강사의 매출 현황과 수입 정보를 확인할 수 있습니다.</p>
        </div>
      </div>

      {/* 검색 필터 */}
      <Card>
        <CardHeader>
          <CardTitle>필터</CardTitle>
        </CardHeader>
        <CardContent>
          <SearchInput
            placeholder="강사명 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* 강사별 매출 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            강사별 매출 현황 ({filteredData.length}명)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={filteredData} 
            loading={loading} 
            emptyMessage="조회된 강사가 없습니다."
          />
        </CardContent>
      </Card>

      {/* 상세 정보 모달 */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>강사 상세 정보</DialogTitle>
            <DialogDescription>
              {selectedInstructor && `${selectedInstructor.name} 강사의 매출 및 수입 상세 정보`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedInstructor && <InstructorDetailView instructor={selectedInstructor} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesByInstructorView;