"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  DollarSign, 
  BookOpen, 
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Eye,
  ArrowRight,
  GraduationCap,
  Star,
  Phone,
  Mail
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DashboardMainContent = () => {
  const { userRole, session } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    monthlyRevenue: 0,
    totalClasses: 0,
    pendingInquiries: 0,
    recentStudents: [],
    topClasses: [],
    recentInquiries: [],
    monthlyTrend: 0,
    attendanceRate: 0,
    paymentRate: 0
  });

  const supabase = createClientComponentClient();

  useEffect(() => {
    if (userRole === 'admin') {
      fetchDashboardData();
    }
  }, [userRole]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 병렬로 데이터 가져오기
      const [
        studentsData,
        enrollmentsData,
        schedulesData,
        paymentsData,
        inquiriesData
      ] = await Promise.all([
        supabase.from('students').select('*').eq('status', 'active'),
        supabase.from('student_enrollments').select(`
          *,
          students (id, full_name, email, phone, enrollment_date),
          schedules (id, subject, teacher_name, grade, day_of_week, time_slot)
        `).eq('status', 'active'),
        supabase.from('schedules').select('*').not('teacher_name', 'is', null),
        supabase.from('payments').select('*').gte('payment_date', (() => {
          const now = new Date();
          return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        })()),
        supabase.from('consultations').select('*').eq('status', 'pending')
      ]);

      // 주요 지표 계산
      const totalStudents = studentsData.data?.length || 0;
      const monthlyRevenue = paymentsData.data?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
      const totalClasses = schedulesData.data?.length || 0;
      const pendingInquiries = inquiriesData.data?.length || 0;

      // 최근 학생 (최근 7일 이내 등록)
      const recentStudents = studentsData.data?.filter(student => {
        const enrollmentDate = new Date(student.enrollment_date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return enrollmentDate >= weekAgo;
      }).slice(0, 5) || [];

      // 인기 수업 TOP 5
      const classEnrollmentCount = {};
      enrollmentsData.data?.forEach(enrollment => {
        if (enrollment.schedules) {
          const classKey = `${enrollment.schedules.grade}_${enrollment.schedules.subject}`;
          classEnrollmentCount[classKey] = (classEnrollmentCount[classKey] || 0) + 1;
        }
      });

      const topClasses = Object.entries(classEnrollmentCount)
        .map(([classKey, count]) => {
          const [grade, subject] = classKey.split('_');
          const schedule = schedulesData.data?.find(s => s.grade === grade && s.subject === subject);
          return {
            grade,
            subject,
            enrollmentCount: count,
            teacher: schedule?.teacher_name || '미배정'
          };
        })
        .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
        .slice(0, 5);

      // 최근 문의 (최근 5개)
      const recentInquiries = inquiriesData.data?.slice(0, 5) || [];

      // 출석률 계산 (임시 데이터)
      const attendanceRate = 92;

      // 결제율 계산
      const totalEnrollments = enrollmentsData.data?.length || 0;
      const paidEnrollments = enrollmentsData.data?.filter(e => e.payment_status === 'paid').length || 0;
      const paymentRate = totalEnrollments > 0 ? Math.round((paidEnrollments / totalEnrollments) * 100) : 0;

      setDashboardData({
        totalStudents,
        monthlyRevenue,
        totalClasses,
        pendingInquiries,
        recentStudents,
        topClasses,
        recentInquiries,
        monthlyTrend: 12, // 임시 데이터
        attendanceRate,
        paymentRate
      });

    } catch (error) {
      console.error('대시보드 데이터 로딩 오류:', error);
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

  const navigateToPage = (path) => {
    router.push(path);
  };

  if (userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-center text-gray-500">관리자 권한이 필요합니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">관리자 대시보드</h1>
          <p className="text-gray-600 mt-2">수학의문 학원 통합 관리 시스템</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>마지막 업데이트: {new Date().toLocaleString('ko-KR')}</span>
        </div>
      </div>

      {/* 주요 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateToPage('/dashboard2/admin/student-management')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 수강생</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{dashboardData.totalStudents}명</div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              전월 대비 +{dashboardData.monthlyTrend}%
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateToPage('/dashboard2/admin?path=/dashboard2/admin/sales-management')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번달 매출</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(dashboardData.monthlyRevenue)}</div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <div className="flex items-center">
                <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                  <div className="bg-green-600 h-1.5 rounded-full" style={{width: `${dashboardData.paymentRate}%`}}></div>
                </div>
                수금률 {dashboardData.paymentRate}%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateToPage('/dashboard2/admin?path=/dashboard2/admin/schedule-management')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">개설 수업</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{dashboardData.totalClasses}개</div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <CheckCircle className="h-3 w-3 mr-1" />
              평균 출석률 {dashboardData.attendanceRate}%
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateToPage('/dashboard2/admin?path=/dashboard2/admin/inquiry-management')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">미처리 문의</CardTitle>
            <MessageSquare className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dashboardData.pendingInquiries}건</div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <AlertCircle className="h-3 w-3 mr-1" />
              빠른 답변 필요
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 빠른 액션 & 실시간 현황 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              오늘의 할 일
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">미처리 문의</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">{dashboardData.pendingInquiries}건</Badge>
                  <Button size="sm" variant="outline" onClick={() => navigateToPage('/dashboard2/admin?path=/dashboard2/admin/inquiry-management')}>
                    확인
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">연체 학생 관리</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">확인 필요</Badge>
                  <Button size="sm" variant="outline" onClick={() => navigateToPage('/dashboard2/admin?path=/dashboard2/admin/sales-management&tab=overdue')}>
                    보기
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">오늘 수업 일정</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">정상</Badge>
                  <Button size="sm" variant="outline" onClick={() => navigateToPage('/dashboard2/admin?path=/dashboard2/admin/schedule-management')}>
                    확인
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              실시간 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">오늘 출석률</span>
                <div className="flex items-center gap-2">
                  <Progress value={dashboardData.attendanceRate} className="w-20" />
                  <span className="text-sm font-medium">{dashboardData.attendanceRate}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">이번주 신규 등록</span>
                <span className="text-sm font-medium text-green-600">{dashboardData.recentStudents.length}명</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">수업료 수금률</span>
                <div className="flex items-center gap-2">
                  <Progress value={dashboardData.paymentRate} className="w-20" />
                  <span className="text-sm font-medium">{dashboardData.paymentRate}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">활성 수업 수</span>
                <span className="text-sm font-medium text-blue-600">{dashboardData.totalClasses}개</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 상세 정보 탭 */}
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
            
            <TabsContent value="classes" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">인기 수업 TOP 5</h3>
                <Button variant="outline" size="sm" onClick={() => navigateToPage('/dashboard2/admin?path=/dashboard2/admin/schedule-management')}>
                  전체 보기 <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>순위</TableHead>
                    <TableHead>수업명</TableHead>
                    <TableHead>담당 강사</TableHead>
                    <TableHead>수강생 수</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData.topClasses.map((classItem, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge variant={index < 3 ? "default" : "outline"}>
                          #{index + 1}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {classItem.grade} {classItem.subject}
                      </TableCell>
                      <TableCell>{classItem.teacher}</TableCell>
                      <TableCell>{classItem.enrollmentCount}명</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="students" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">최근 등록 학생</h3>
                <Button variant="outline" size="sm" onClick={() => navigateToPage('/dashboard2/admin/student-management')}>
                  전체 보기 <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>학년</TableHead>
                    <TableHead>연락처</TableHead>
                    <TableHead>등록일</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData.recentStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.full_name}</TableCell>
                      <TableCell>{student.grade}</TableCell>
                      <TableCell>{student.phone}</TableCell>
                      <TableCell>{new Date(student.enrollment_date).toLocaleDateString('ko-KR')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="revenue" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">매출 요약</h3>
                <Button variant="outline" size="sm" onClick={() => navigateToPage('/dashboard2/admin?path=/dashboard2/admin/sales-management')}>
                  전체 보기 <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">이번달 매출</div>
                  <div className="text-2xl font-bold text-green-700">{formatCurrency(dashboardData.monthlyRevenue)}</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">평균 수업료</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {formatCurrency(dashboardData.totalStudents > 0 ? dashboardData.monthlyRevenue / dashboardData.totalStudents : 0)}
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-purple-600 font-medium">수금률</div>
                  <div className="text-2xl font-bold text-purple-700">{dashboardData.paymentRate}%</div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="inquiries" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">최근 문의</h3>
                <Button variant="outline" size="sm" onClick={() => navigateToPage('/dashboard2/admin?path=/dashboard2/admin/inquiry-management')}>
                  전체 보기 <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              {dashboardData.recentInquiries.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>이름</TableHead>
                      <TableHead>연락처</TableHead>
                      <TableHead>문의 유형</TableHead>
                      <TableHead>등록일</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardData.recentInquiries.map((inquiry) => (
                      <TableRow key={inquiry.id}>
                        <TableCell className="font-medium">{inquiry.name}</TableCell>
                        <TableCell>{inquiry.phone}</TableCell>
                        <TableCell>{inquiry.consultation_type}</TableCell>
                        <TableCell>{new Date(inquiry.created_at).toLocaleDateString('ko-KR')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>최근 문의가 없습니다.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardMainContent;