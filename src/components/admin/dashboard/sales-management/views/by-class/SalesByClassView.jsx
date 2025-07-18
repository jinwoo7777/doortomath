"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { useBranch } from '../../context/BranchContext';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search,
  Users,
  BookOpen,
  GraduationCap,
  Eye
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import DataTable from '../../components/tables/DataTable';
import { formatCurrency, getDayName, getRevenueStatusColor } from '../../utils/formatters';
import ClassDetailView from './ClassDetailView';

/**
 * 수업별 매출 분석 컴포넌트
 * @returns {React.ReactElement} 수업별 매출 분석 컴포넌트
 */
const SalesByClassView = () => {
  const { userRole } = useAuth();
  const { selectedBranch } = useBranch();
  const [classData, setClassData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [teacherFilter, setTeacherFilter] = useState('all');
  const [selectedClass, setSelectedClass] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [teachers, setTeachers] = useState([]);

  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchClassSalesData();
  }, [selectedBranch]);

  useEffect(() => {
    filterData();
  }, [classData, searchTerm, gradeFilter, teacherFilter]);

  const fetchClassSalesData = async () => {
    try {
      setLoading(true);

      // 1. 수업별 등록 정보 조회
      let query = supabase
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
            description,
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
        .eq('status', 'active');
      
      const { data: enrollments, error: enrollmentsError } = await query;

      if (enrollmentsError) throw enrollmentsError;

      // 2. 결제 정보 조회
      let paymentsQuery = supabase
        .from('payments')
        .select('*')
        .gte('payment_date', '2025-03-01')
        .lte('payment_date', '2025-03-31');
        
      // 지점별 필터링
      if (selectedBranch !== 'all') {
        paymentsQuery = paymentsQuery.eq('branch', selectedBranch);
      }
      
      const { data: payments, error: paymentsError } = await paymentsQuery;

      if (paymentsError) throw paymentsError;

      // 3. 수업별 데이터 집계
      const classMap = {};
      const teacherSet = new Set();
      
      // 지점별 필터링
      let filteredEnrollments = enrollments;
      if (selectedBranch !== 'all') {
        filteredEnrollments = enrollments.filter(enrollment => 
          enrollment.schedules?.branch === selectedBranch || 
          enrollment.students?.branch === selectedBranch
        );
      }

      filteredEnrollments.forEach(enrollment => {
        if (enrollment.schedules) {
          const schedule = enrollment.schedules;
          const classKey = `${schedule.id}`;
          
          if (schedule.teacher_name) {
            teacherSet.add(schedule.teacher_name);
          }

          if (!classMap[classKey]) {
            classMap[classKey] = {
              ...schedule,
              students: [],
              totalRevenue: 0,
              averageFee: 0,
              paidAmount: 0,
              unpaidAmount: 0,
              paymentRate: 0,
              enrollmentCount: 0
            };
          }

          classMap[classKey].students.push({
            ...enrollment,
            student: enrollment.students
          });
          classMap[classKey].totalRevenue += enrollment.monthly_fee || 0;
          classMap[classKey].enrollmentCount += 1;
        }
      });

      // 4. 결제 정보 매칭
      Object.values(classMap).forEach(classInfo => {
        const classPaidAmount = payments
          .filter(payment => 
            classInfo.students.some(student => 
              student.student_id === payment.student_id && 
              student.schedule_id === payment.schedule_id
            )
          )
          .reduce((sum, payment) => sum + (payment.amount || 0), 0);

        classInfo.paidAmount = classPaidAmount;
        classInfo.unpaidAmount = classInfo.totalRevenue - classPaidAmount;
        classInfo.paymentRate = classInfo.totalRevenue > 0 ? 
          Math.round((classPaidAmount / classInfo.totalRevenue) * 100) : 0;
        classInfo.averageFee = classInfo.enrollmentCount > 0 ? 
          Math.round(classInfo.totalRevenue / classInfo.enrollmentCount) : 0;
      });

      setClassData(Object.values(classMap).sort((a, b) => b.totalRevenue - a.totalRevenue));
      setTeachers(Array.from(teacherSet).sort());

    } catch (error) {
      console.error('Error fetching class sales data:', error);
      toast.error('수업별 매출 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = classData;

    if (searchTerm) {
      filtered = filtered.filter(classInfo =>
        classInfo.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classInfo.teacher_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classInfo.grade.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (gradeFilter !== 'all') {
      filtered = filtered.filter(classInfo => classInfo.grade === gradeFilter);
    }

    if (teacherFilter !== 'all') {
      filtered = filtered.filter(classInfo => classInfo.teacher_name === teacherFilter);
    }

    setFilteredData(filtered);
  };

  const openDetailModal = (classInfo) => {
    setSelectedClass(classInfo);
    setIsDetailModalOpen(true);
  };

  // 테이블 컬럼 정의
  const columns = [
    {
      key: 'classInfo',
      header: '수업 정보',
      cell: (row) => (
        <div>
          <div className="font-medium">
            {row.grade} {row.subject}
          </div>
          <div className="text-sm text-muted-foreground">
            {getDayName(row.day_of_week)} {row.time_slot}
          </div>
          {row.classroom && (
            <div className="text-xs text-muted-foreground">
              {row.classroom}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'teacher',
      header: '강사',
      cell: (row) => (
        <div className="flex items-center gap-1">
          <GraduationCap className="h-3 w-3 text-muted-foreground" />
          {row.teacher_name || '미배정'}
        </div>
      )
    },
    {
      key: 'students',
      header: '수강생',
      cell: (row) => (
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3 text-muted-foreground" />
          <span className={
            row.enrollmentCount >= (row.max_students || 30) 
              ? 'text-red-600 font-medium' : ''
          }>
            {row.enrollmentCount}/{row.max_students || 30}
          </span>
        </div>
      )
    },
    {
      key: 'totalRevenue',
      header: '예상 매출',
      cell: (row) => formatCurrency(row.totalRevenue),
      cellClassName: 'font-medium'
    },
    {
      key: 'paidAmount',
      header: '실제 수금',
      cell: (row) => (
        <div className={getRevenueStatusColor(row.paymentRate)}>
          {formatCurrency(row.paidAmount)}
        </div>
      ),
      cellClassName: 'font-medium'
    },
    {
      key: 'paymentRate',
      header: '수금률',
      cell: (row) => (
        <div className={`font-medium ${getRevenueStatusColor(row.paymentRate)}`}>
          {row.paymentRate}%
        </div>
      )
    },
    {
      key: 'averageFee',
      header: '평균 수업료',
      cell: (row) => formatCurrency(row.averageFee)
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
          <h1 className="text-2xl font-bold">수업별 매출 분석</h1>
          <p className="text-gray-600">각 수업의 매출 현황과 수강생 정보를 확인할 수 있습니다.</p>
        </div>
      </div>

      {/* 필터 */}
      <Card>
        <CardHeader>
          <CardTitle>필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="수업명, 강사명, 학년 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-full sm:w-40 shrink-0">
                <SelectValue placeholder="학년 선택" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className="z-[100]">
                <SelectItem value="all">전체 학년</SelectItem>
                <SelectItem value="초등부">초등부</SelectItem>
                <SelectItem value="중등부">중등부</SelectItem>
                <SelectItem value="고등부">고등부</SelectItem>
              </SelectContent>
            </Select>
            <Select value={teacherFilter} onValueChange={setTeacherFilter}>
              <SelectTrigger className="w-full sm:w-40 shrink-0">
                <SelectValue placeholder="강사 선택" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className="z-[100]">
                <SelectItem value="all">전체 강사</SelectItem>
                {teachers.map(teacher => (
                  <SelectItem key={teacher} value={teacher}>{teacher}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 수업별 매출 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            수업별 매출 현황 ({filteredData.length}개)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={filteredData} 
            loading={loading} 
            emptyMessage="조회된 수업이 없습니다."
          />
        </CardContent>
      </Card>

      {/* 상세 정보 모달 */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>수업 상세 정보</DialogTitle>
            <DialogDescription>
              {selectedClass && `${selectedClass.grade} ${selectedClass.subject} (${getDayName(selectedClass.day_of_week)} ${selectedClass.time_slot})`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedClass && <ClassDetailView classInfo={selectedClass} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesByClassView;