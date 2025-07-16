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
  BookOpen,
  TrendingUp,
  Eye,
  GraduationCap,
  Calculator,
  Percent,
  Calendar
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SalesByInstructorContent = () => {
  const { session, userRole } = useAuth();
  const [instructorData, setInstructorData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchInstructorSalesData();
  }, []);

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
            classroom
          ),
          students (
            id,
            full_name,
            email,
            phone
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

      enrollments.forEach(enrollment => {
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

  const openDetailModal = (instructor) => {
    setSelectedInstructor(instructor);
    setIsDetailModalOpen(true);
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
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="강사명 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
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
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p>로딩 중...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>강사명</TableHead>
                    <TableHead>담당 수업</TableHead>
                    <TableHead>수강생</TableHead>
                    <TableHead>총 매출</TableHead>
                    <TableHead>실제 수금</TableHead>
                    <TableHead>강사 수입률</TableHead>
                    <TableHead>예상 수입</TableHead>
                    <TableHead>실제 수입</TableHead>
                    <TableHead>상세</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((instructor) => (
                    <TableRow key={instructor.name}>
                      <TableCell className="font-medium">
                        {instructor.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3 text-muted-foreground" />
                          {instructor.classCount}개
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          {instructor.studentCount}명
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(instructor.totalRevenue)}
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {formatCurrency(instructor.paidAmount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Percent className="h-3 w-3 text-muted-foreground" />
                          {instructor.revenuePercentage}%
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-blue-600">
                        {formatCurrency(instructor.instructorRevenue)}
                      </TableCell>
                      <TableCell className="font-medium text-purple-600">
                        {formatCurrency(instructor.actualInstructorRevenue)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetailModal(instructor)}
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
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>강사 상세 정보</DialogTitle>
            <DialogDescription>
              {selectedInstructor && `${selectedInstructor.name} 강사의 매출 및 수입 상세 정보`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedInstructor && (
            <div className="space-y-6">
              {/* 강사 정보 요약 */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">담당 수업</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedInstructor.classCount}개</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">수강생 수</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedInstructor.studentCount}명</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">총 매출</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(selectedInstructor.totalRevenue)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">예상 수입</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(selectedInstructor.instructorRevenue)}</div>
                    <div className="text-xs text-muted-foreground">
                      기본급 + {selectedInstructor.revenuePercentage}%
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">실제 수입</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">{formatCurrency(selectedInstructor.actualInstructorRevenue)}</div>
                    <div className="text-xs text-muted-foreground">
                      실제 결제 기준
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 담당 수업 목록 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">담당 수업 목록</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>수업 정보</TableHead>
                        <TableHead>수강생</TableHead>
                        <TableHead>수업 매출</TableHead>
                        <TableHead>강사 수입</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInstructor.classesArray.map((classInfo) => (
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
                              <Users className="h-3 w-3 text-muted-foreground" />
                              {classInfo.students.length}명
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(classInfo.classRevenue)}
                          </TableCell>
                          <TableCell className="font-medium text-blue-600">
                            {formatCurrency(classInfo.classRevenue * selectedInstructor.revenuePercentage / 100)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* 수강생 목록 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">담당 수강생 목록</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>학생명</TableHead>
                        <TableHead>수업</TableHead>
                        <TableHead>시작일</TableHead>
                        <TableHead>월 수업료</TableHead>
                        <TableHead>결제 상태</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInstructor.students.map((student) => (
                        <TableRow key={`${student.student_id}-${student.schedule_id}`}>
                          <TableCell className="font-medium">
                            {student.student?.full_name}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm font-medium">
                                {student.class?.grade} {student.class?.subject}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {getDayName(student.class?.day_of_week)} {student.class?.time_slot}
                              </div>
                            </div>
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

export default SalesByInstructorContent;