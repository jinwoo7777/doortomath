"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign,
  TrendingUp,
  Users,
  BookOpen,
  Calendar,
  ChartBarIcon,
  PieChart,
  ArrowUpIcon,
  ArrowDownIcon
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

const SalesManagementContent = () => {
  const { session, userRole } = useAuth();
  const [salesData, setSalesData] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalStudents: 0,
    activeClasses: 0,
    revenueByClass: [],
    revenueByInstructor: [],
    monthlyTrend: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');

  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchSalesData();
  }, [selectedPeriod]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);

      // 현재 월 설정
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const startDate = new Date(currentYear, currentMonth - 1, 1);
      const endDate = new Date(currentYear, currentMonth, 0);

      // 1. 전체 매출 데이터
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
            price_period
          ),
          students (
            id,
            full_name
          )
        `)
        .eq('status', 'active');

      if (enrollmentsError) throw enrollmentsError;

      // 2. 결제 데이터
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .gte('payment_date', startDate.toISOString().split('T')[0])
        .lte('payment_date', endDate.toISOString().split('T')[0]);

      if (paymentsError) throw paymentsError;

      // 3. 데이터 분석
      const totalRevenue = enrollments.reduce((sum, enrollment) => {
        return sum + (enrollment.monthly_fee || 0);
      }, 0);

      const monthlyRevenue = payments.reduce((sum, payment) => {
        return sum + (payment.amount || 0);
      }, 0);

      // 수업별 매출 분석
      const revenueByClass = {};
      enrollments.forEach(enrollment => {
        if (enrollment.schedules) {
          const classKey = `${enrollment.schedules.grade}_${enrollment.schedules.subject}_${enrollment.schedules.day_of_week}_${enrollment.schedules.time_slot}`;
          if (!revenueByClass[classKey]) {
            revenueByClass[classKey] = {
              ...enrollment.schedules,
              students: 0,
              totalRevenue: 0,
              averageFee: 0
            };
          }
          revenueByClass[classKey].students += 1;
          revenueByClass[classKey].totalRevenue += enrollment.monthly_fee || 0;
        }
      });

      // 강사별 매출 분석
      const revenueByInstructor = {};
      enrollments.forEach(enrollment => {
        if (enrollment.schedules?.teacher_name) {
          const instructor = enrollment.schedules.teacher_name;
          if (!revenueByInstructor[instructor]) {
            revenueByInstructor[instructor] = {
              name: instructor,
              students: 0,
              classes: new Set(),
              totalRevenue: 0
            };
          }
          revenueByInstructor[instructor].students += 1;
          revenueByInstructor[instructor].classes.add(
            `${enrollment.schedules.grade}_${enrollment.schedules.subject}`
          );
          revenueByInstructor[instructor].totalRevenue += enrollment.monthly_fee || 0;
        }
      });

      // 평균 수업료 계산
      Object.values(revenueByClass).forEach(classData => {
        classData.averageFee = classData.students > 0 ? 
          Math.round(classData.totalRevenue / classData.students) : 0;
      });

      // Set에서 Array로 변환
      Object.values(revenueByInstructor).forEach(instructorData => {
        instructorData.classCount = instructorData.classes.size;
        delete instructorData.classes;
      });

      setSalesData({
        totalRevenue,
        monthlyRevenue,
        totalStudents: enrollments.length,
        activeClasses: Object.keys(revenueByClass).length,
        revenueByClass: Object.values(revenueByClass)
          .sort((a, b) => b.totalRevenue - a.totalRevenue),
        revenueByInstructor: Object.values(revenueByInstructor)
          .sort((a, b) => b.totalRevenue - a.totalRevenue),
        monthlyTrend: [] // TODO: 월별 트렌드 데이터 구현
      });

    } catch (error) {
      console.error('Error fetching sales data:', error);
      toast.error('매출 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-2xl font-bold">매출 관리</h1>
          <p className="text-gray-600">학원 매출 현황 및 분석을 확인할 수 있습니다.</p>
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="기간 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current_month">이번 달</SelectItem>
            <SelectItem value="last_month">지난 달</SelectItem>
            <SelectItem value="current_year">올해</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 매출 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 매출 (예상)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(salesData.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              월별 수업료 합계
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">실제 수금</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(salesData.monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              이번 달 결제 완료
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 수강생</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesData.totalStudents}명</div>
            <p className="text-xs text-muted-foreground">
              활성 상태 수강생
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">개설 수업</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesData.activeClasses}개</div>
            <p className="text-xs text-muted-foreground">
              수강생이 있는 수업
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 수업별 매출 TOP 5 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5" />
            수업별 매출 TOP 5
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p>로딩 중...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>순위</TableHead>
                  <TableHead>수업</TableHead>
                  <TableHead>강사</TableHead>
                  <TableHead>수강생</TableHead>
                  <TableHead>총 매출</TableHead>
                  <TableHead>평균 수업료</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesData.revenueByClass.slice(0, 5).map((classData, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Badge variant={index < 3 ? "default" : "outline"}>
                        #{index + 1}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {classData.grade} {classData.subject}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {getDayName(classData.day_of_week)} {classData.time_slot}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{classData.teacher_name || '미배정'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {classData.students}명
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(classData.totalRevenue)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(classData.averageFee)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 강사별 매출 TOP 5 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            강사별 매출 TOP 5
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p>로딩 중...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>순위</TableHead>
                  <TableHead>강사명</TableHead>
                  <TableHead>담당 수업</TableHead>
                  <TableHead>수강생</TableHead>
                  <TableHead>총 매출</TableHead>
                  <TableHead>평균 수강생당 매출</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesData.revenueByInstructor.slice(0, 5).map((instructor, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Badge variant={index < 3 ? "default" : "outline"}>
                        #{index + 1}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {instructor.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {instructor.classCount}개
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {instructor.students}명
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(instructor.totalRevenue)}
                    </TableCell>
                    <TableCell>
                      {instructor.students > 0 ? 
                        formatCurrency(Math.round(instructor.totalRevenue / instructor.students)) : 
                        formatCurrency(0)
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesManagementContent;