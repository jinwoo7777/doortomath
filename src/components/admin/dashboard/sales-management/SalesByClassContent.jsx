"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search,
  Users,
  DollarSign,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  BookOpen,
  GraduationCap,
  Eye,
  Calculator
} from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

const SalesByClassContent = () => {
  const { session, userRole } = useAuth();
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
  }, []);

  useEffect(() => {
    filterData();
  }, [classData, searchTerm, gradeFilter, teacherFilter]);

  const fetchClassSalesData = async () => {
    try {
      setLoading(true);

      // 1. 수업별 등록 정보 조회
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
            description
          ),
          students (
            id,
            full_name,
            email,
            phone
          )
        `)
        .eq('status', 'active');

      if (enrollmentsError) throw enrollmentsError;

      // 2. 결제 정보 조회
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .gte('payment_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);

      if (paymentsError) throw paymentsError;

      // 3. 수업별 데이터 집계
      const classMap = {};
      const teacherSet = new Set();

      enrollments.forEach(enrollment => {
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  const getDayName = (dayNumber) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[dayNumber] || '';
  };

  const openDetailModal = (classInfo) => {
    setSelectedClass(classInfo);
    setIsDetailModalOpen(true);
  };

  const getRevenueStatusColor = (paymentRate) => {
    if (paymentRate >= 80) return 'text-green-600';
    if (paymentRate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

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
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="학년 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 학년</SelectItem>
                <SelectItem value="초등부">초등부</SelectItem>
                <SelectItem value="중등부">중등부</SelectItem>
                <SelectItem value="고등부">고등부</SelectItem>
              </SelectContent>
            </Select>
            <Select value={teacherFilter} onValueChange={setTeacherFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="강사 선택" />
              </SelectTrigger>
              <SelectContent>
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
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p>로딩 중...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>수업 정보</TableHead>
                    <TableHead>강사</TableHead>
                    <TableHead>수강생</TableHead>
                    <TableHead>예상 매출</TableHead>
                    <TableHead>실제 수금</TableHead>
                    <TableHead>수금률</TableHead>
                    <TableHead>평균 수업료</TableHead>
                    <TableHead>상세</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((classInfo) => (
                    <TableRow key={classInfo.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {classInfo.grade} {classInfo.subject}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {getDayName(classInfo.day_of_week)} {classInfo.time_slot}
                          </div>
                          {classInfo.classroom && (
                            <div className="text-xs text-muted-foreground">
                              {classInfo.classroom}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <GraduationCap className="h-3 w-3 text-muted-foreground" />
                          {classInfo.teacher_name || '미배정'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span className={
                            classInfo.enrollmentCount >= (classInfo.max_students || 30) 
                              ? 'text-red-600 font-medium' : ''
                          }>
                            {classInfo.enrollmentCount}/{classInfo.max_students || 30}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(classInfo.totalRevenue)}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className={getRevenueStatusColor(classInfo.paymentRate)}>
                          {formatCurrency(classInfo.paidAmount)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`font-medium ${getRevenueStatusColor(classInfo.paymentRate)}`}>
                            {classInfo.paymentRate}%
                          </div>
                          {classInfo.paymentRate >= 80 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(classInfo.averageFee)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetailModal(classInfo)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
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
          
          {selectedClass && (
            <div className="space-y-6">
              {/* 수업 정보 요약 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">수강생 수</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedClass.enrollmentCount}명</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">예상 매출</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(selectedClass.totalRevenue)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">실제 수금</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(selectedClass.paidAmount)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">수금률</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getRevenueStatusColor(selectedClass.paymentRate)}`}>
                      {selectedClass.paymentRate}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 수강생 목록 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">수강생 목록</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>학생명</TableHead>
                        <TableHead>연락처</TableHead>
                        <TableHead>시작일</TableHead>
                        <TableHead>월 수업료</TableHead>
                        <TableHead>결제 상태</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedClass.students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">
                            {student.student?.full_name}
                          </TableCell>
                          <TableCell>
                            {student.student?.phone || student.student?.email}
                          </TableCell>
                          <TableCell>
                            {new Date(student.start_date).toLocaleDateString('ko-KR')}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(student.monthly_fee || 0)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              student.payment_status === 'paid' ? 'default' : 
                              student.payment_status === 'pending' ? 'secondary' : 'destructive'
                            }>
                              {student.payment_status === 'paid' ? '완료' : 
                               student.payment_status === 'pending' ? '대기' : '연체'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesByClassContent;