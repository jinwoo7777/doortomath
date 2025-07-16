"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { getDayName } from '@/lib/supabase/fetchSchedules';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign,
  TrendingUp,
  Users,
  BookOpen,
  Calendar,
  ChartBarIcon,
  PieChart,
  ArrowUpIcon,
  ArrowDownIcon,
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  MessageSquare,
  Phone,
  Search,
  Edit2,
  X
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

const SalesManagementContent = () => {
  const { session, userRole } = useAuth();
  const searchParams = useSearchParams();
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
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');

  // 연체 관리 관련 state
  const [overdueStudents, setOverdueStudents] = useState([]);
  const [overdueStats, setOverdueStats] = useState({
    total: 0,
    oneMonth: 0,
    twoMonth: 0,
    threeMonthPlus: 0,
    totalAmount: 0
  });
  const [paidStudents, setPaidStudents] = useState([]);
  const [paidStats, setPaidStats] = useState({
    total: 0,
    totalAmount: 0
  });
  
  // 모달 관련 state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_date: '',
    payment_method: 'cash',
    period_start: '',
    period_end: '',
    notes: ''
  });
  const [isMemoModalOpen, setIsMemoModalOpen] = useState(false);
  const [selectedStudentForMemo, setSelectedStudentForMemo] = useState(null);
  const [memoForm, setMemoForm] = useState({
    content: '',
    type: 'payment_reminder'
  });
  const [consultationHistory, setConsultationHistory] = useState([]);
  
  // 이번달 입금자 등록 모달 관련 state
  const [isCurrentMonthPaymentModalOpen, setIsCurrentMonthPaymentModalOpen] = useState(false);
  const [allActiveStudents, setAllActiveStudents] = useState([]);
  const [selectedStudentsForPayment, setSelectedStudentsForPayment] = useState([]);
  const [bulkPaymentForm, setBulkPaymentForm] = useState({
    payment_date: '',
    payment_method: 'cash',
    notes: ''
  });
  
  // 입금자 수정 모달 관련 state
  const [isEditPaymentModalOpen, setIsEditPaymentModalOpen] = useState(false);
  const [selectedPaymentForEdit, setSelectedPaymentForEdit] = useState(null);
  const [editPaymentForm, setEditPaymentForm] = useState({
    amount: '',
    payment_date: '',
    payment_method: 'cash',
    notes: ''
  });

  const supabase = createClientComponentClient();

  // 컴포넌트 마운트 시 날짜 초기화 (하이드레이션 오류 방지)
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setPaymentForm(prev => ({ ...prev, payment_date: today }));
    setBulkPaymentForm(prev => ({ ...prev, payment_date: today }));
  }, []);

  useEffect(() => {
    fetchSalesData();
  }, [selectedPeriod]);

  useEffect(() => {
    if (activeTab === 'overdue') {
      fetchOverdueData();
    } else if (activeTab === 'paid') {
      fetchPaidStudents();
    } else if (activeTab === 'by-class') {
      fetchSalesData(); // 수업별 매출 데이터 새로고침
    } else if (activeTab === 'by-instructor') {
      fetchSalesData(); // 강사별 매출 데이터 새로고침
    }
  }, [activeTab]);

  // URL 파라미터 변경 시 activeTab 업데이트
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'overdue', 'paid', 'by-class', 'by-instructor'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

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

  // 수업별 매출 탭 렌더링 함수
  const renderByClassTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold">수업별 매출 현황</h2>
            <p className="text-gray-600">각 수업별 매출 성과를 확인할 수 있습니다.</p>
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              수업별 매출 상세
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
                    <TableHead>수업명</TableHead>
                    <TableHead>담당 강사</TableHead>
                    <TableHead>수강생 수</TableHead>
                    <TableHead>총 매출</TableHead>
                    <TableHead>평균 수업료</TableHead>
                    <TableHead>수업 정보</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesData.revenueByClass.map((classData, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge variant={index < 3 ? "default" : "outline"}>
                          #{index + 1}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {classData.grade} {classData.subject}
                        </div>
                      </TableCell>
                      <TableCell>{classData.teacher_name || '미배정'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {classData.students}명
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {formatCurrency(classData.totalRevenue)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(classData.averageFee)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {getDayName(classData.day_of_week)} {classData.time_slot}
                        </div>
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

  // 강사별 매출 탭 렌더링 함수
  const renderByInstructorTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold">강사별 매출 현황</h2>
            <p className="text-gray-600">각 강사별 매출 성과를 확인할 수 있습니다.</p>
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              강사별 매출 상세
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
                    <TableHead>담당 수업 수</TableHead>
                    <TableHead>총 수강생 수</TableHead>
                    <TableHead>총 매출</TableHead>
                    <TableHead>평균 수강생당 매출</TableHead>
                    <TableHead>수업 효율성</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesData.revenueByInstructor.map((instructor, index) => (
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
                      <TableCell className="font-medium text-green-600">
                        {formatCurrency(instructor.totalRevenue)}
                      </TableCell>
                      <TableCell>
                        {instructor.students > 0 ? 
                          formatCurrency(Math.round(instructor.totalRevenue / instructor.students)) : 
                          formatCurrency(0)
                        }
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {instructor.classCount > 0 ? 
                            `${Math.round(instructor.students / instructor.classCount)}명/수업` : 
                            '데이터 없음'
                          }
                        </div>
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

  // 입금자 수정 관련 함수들
  const openEditPaymentModal = (payment) => {
    setSelectedPaymentForEdit(payment);
    setEditPaymentForm({
      amount: payment.amount || '',
      payment_date: payment.payment_date || '',
      payment_method: payment.payment_method || 'cash',
      notes: payment.notes || ''
    });
    setIsEditPaymentModalOpen(true);
  };

  const handleEditPaymentSubmit = async () => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({
          amount: parseFloat(editPaymentForm.amount),
          payment_date: editPaymentForm.payment_date,
          payment_method: editPaymentForm.payment_method,
          notes: editPaymentForm.notes
        })
        .eq('id', selectedPaymentForEdit.id);

      if (error) throw error;

      toast.success('입금 정보가 수정되었습니다.');
      setIsEditPaymentModalOpen(false);
      fetchPaidStudents(); // 입금자 목록 새로고침
      fetchOverdueData(); // 연체 데이터도 새로고침
    } catch (error) {
      console.error('입금 정보 수정 오류:', error);
      toast.error('입금 정보 수정 중 오류가 발생했습니다.');
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!confirm('이 입금 기록을 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId);

      if (error) throw error;

      toast.success('입금 기록이 삭제되었습니다.');
      fetchPaidStudents(); // 입금자 목록 새로고침
      fetchOverdueData(); // 연체 데이터도 새로고침
    } catch (error) {
      console.error('입금 기록 삭제 오류:', error);
      toast.error('입금 기록 삭제 중 오류가 발생했습니다.');
    }
  };

  // 연체 관리 관련 함수들
  const fetchOverdueData = async () => {
    try {
      // 학생 등록 정보와 결제 정보를 가져와서 연체 상태 계산
      const { data: enrollments, error } = await supabase
        .from('student_enrollments')
        .select(`
          *,
          students (id, full_name, email, phone, grade),
          schedules (id, subject, teacher_name, grade, day_of_week, time_slot)
        `)
        .eq('status', 'active');

      if (error) throw error;

      // 각 등록에 대해 연체 상태 계산
      const overdueList = [];
      let stats = { total: 0, oneMonth: 0, twoMonth: 0, threeMonthPlus: 0, totalAmount: 0 };

      for (const enrollment of enrollments) {
        const startDate = new Date(enrollment.start_date);
        const currentDate = new Date();
        
        // 수강 시작일부터 현재까지의 개월 수 계산
        const monthsElapsed = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24 * 30));
        
        // 결제 기록 조회
        const { data: payments } = await supabase
          .from('payments')
          .select('*')
          .eq('student_id', enrollment.student_id)
          .eq('schedule_id', enrollment.schedule_id);

        const paidMonths = payments?.length || 0;
        const overdueMonths = Math.max(0, monthsElapsed - paidMonths);
        
        if (overdueMonths > 0) {
          const overdueAmount = overdueMonths * (enrollment.monthly_fee || 0);
          
          const overdueStudent = {
            ...enrollment,
            student: enrollment.students,
            schedule: enrollment.schedules,
            overdueMonths,
            overdueAmount,
            lastPaymentDate: payments?.length > 0 ? 
              new Date(Math.max(...payments.map(p => new Date(p.payment_date)))) : null
          };

          overdueList.push(overdueStudent);
          stats.total += 1;
          stats.totalAmount += overdueAmount;
          
          if (overdueMonths === 1) stats.oneMonth += 1;
          else if (overdueMonths === 2) stats.twoMonth += 1;
          else if (overdueMonths >= 3) stats.threeMonthPlus += 1;
        }
      }

      setOverdueStudents(overdueList);
      setOverdueStats(stats);
    } catch (error) {
      console.error('연체 데이터 조회 오류:', error);
      toast.error('연체 데이터를 불러오는 중 오류가 발생했습니다.');
    }
  };

  const fetchPaidStudents = async () => {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      // 이번달 결제 기록 조회
      const { data: payments, error } = await supabase
        .from('payments')
        .select(`
          *,
          students (id, full_name, email, phone, grade),
          schedules (id, subject, teacher_name, grade)
        `)
        .gte('payment_date', `${currentMonth}-01`)
        .lte('payment_date', `${currentMonth}-31`);

      if (error) throw error;

      const paidList = payments?.map(payment => ({
        ...payment,
        student: payment.students,
        schedule: payment.schedules
      })) || [];

      const stats = {
        total: paidList.length,
        totalAmount: paidList.reduce((sum, payment) => sum + (payment.amount || 0), 0)
      };

      setPaidStudents(paidList);
      setPaidStats(stats);
    } catch (error) {
      console.error('입금자 데이터 조회 오류:', error);
      toast.error('입금자 데이터를 불러오는 중 오류가 발생했습니다.');
    }
  };

  const getOverdueBadgeVariant = (months) => {
    if (months === 1) return 'secondary';
    if (months === 2) return 'destructive';
    if (months >= 3) return 'destructive';
    return 'default';
  };

  const openPaymentModal = (student) => {
    setSelectedStudentForPayment(student);
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    setPaymentForm({
      ...paymentForm,
      amount: student.monthly_fee || '',
      period_start: today.toISOString().split('T')[0],
      period_end: nextMonth.toISOString().split('T')[0]
    });
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async () => {
    try {
      const { error } = await supabase
        .from('payments')
        .insert([{
          student_id: selectedStudentForPayment.student_id,
          schedule_id: selectedStudentForPayment.schedule_id,
          amount: parseFloat(paymentForm.amount),
          payment_date: paymentForm.payment_date,
          payment_method: paymentForm.payment_method,
          payment_period_start: paymentForm.period_start,
          payment_period_end: paymentForm.period_end,
          notes: paymentForm.notes
        }]);

      if (error) throw error;

      toast.success('결제 기록이 저장되었습니다.');
      setIsPaymentModalOpen(false);
      fetchOverdueData();
      fetchPaidStudents();
    } catch (error) {
      console.error('결제 기록 저장 오류:', error);
      toast.error('결제 기록 저장 중 오류가 발생했습니다.');
    }
  };

  const openMemoModal = (student) => {
    setSelectedStudentForMemo(student);
    setMemoForm({ content: '', type: 'payment_reminder' });
    setConsultationHistory([]);
    setIsMemoModalOpen(true);
  };

  const handleMemoSubmit = async () => {
    try {
      // 상담 기록 저장 로직 (실제 테이블이 있을 때 구현)
      toast.success('상담 기록이 저장되었습니다.');
      setIsMemoModalOpen(false);
    } catch (error) {
      console.error('상담 기록 저장 오류:', error);
      toast.error('상담 기록 저장 중 오류가 발생했습니다.');
    }
  };

  // 이번달 입금자 등록 관련 함수들
  const fetchAllActiveStudents = async () => {
    try {
      const { data: enrollments, error } = await supabase
        .from('student_enrollments')
        .select(`
          *,
          students!inner (id, full_name, email, phone, grade),
          schedules!inner (id, subject, teacher_name, grade, price)
        `)
        .eq('status', 'active');

      if (error) throw error;

      const currentMonth = new Date().toISOString().slice(0, 7);
      const { data: currentPayments, error: paymentError } = await supabase
        .from('payments')
        .select('student_id, schedule_id, payment_date')
        .gte('payment_date', `${currentMonth}-01`)
        .lte('payment_date', `${currentMonth}-31`);

      if (paymentError) {
        console.log('⚠️ payments 테이블 접근 불가, 모든 학생을 미납부로 간주');
        setAllActiveStudents(enrollments || []);
        return;
      }

      const paidStudentKeys = new Set(
        (currentPayments || []).map(p => `${p.student_id}-${p.schedule_id}`)
      );

      const unpaidStudents = (enrollments || []).filter(enrollment => {
        const key = `${enrollment.student_id}-${enrollment.schedule_id}`;
        return !paidStudentKeys.has(key);
      });

      setAllActiveStudents(unpaidStudents);
    } catch (error) {
      console.error('활성 학생 조회 오류:', error);
      toast.error('학생 목록을 불러오는 중 오류가 발생했습니다.');
    }
  };

  const handleStudentSelectForPayment = (student, checked) => {
    setSelectedStudentsForPayment(prev => {
      if (checked) {
        return [...prev, student];
      } else {
        return prev.filter(s => `${s.student_id}-${s.schedule_id}` !== `${student.student_id}-${student.schedule_id}`);
      }
    });
  };

  const handleSelectAllForPayment = (checked) => {
    if (checked) {
      setSelectedStudentsForPayment(allActiveStudents);
    } else {
      setSelectedStudentsForPayment([]);
    }
  };

  const handleBulkPaymentSubmit = async () => {
    if (selectedStudentsForPayment.length === 0) {
      toast.error('결제할 학생을 선택해주세요.');
      return;
    }

    try {
      const payments = selectedStudentsForPayment.map(student => ({
        student_id: student.student_id,
        schedule_id: student.schedule_id,
        amount: student.schedules?.price || student.monthly_fee || 0,
        payment_date: bulkPaymentForm.payment_date,
        payment_method: bulkPaymentForm.payment_method,
        payment_period_start: bulkPaymentForm.payment_date,
        payment_period_end: new Date(new Date(bulkPaymentForm.payment_date).setMonth(new Date(bulkPaymentForm.payment_date).getMonth() + 1)).toISOString().split('T')[0],
        notes: bulkPaymentForm.notes
      }));

      const { error } = await supabase
        .from('payments')
        .insert(payments);

      if (error) throw error;

      toast.success(`${selectedStudentsForPayment.length}명의 결제 기록이 저장되었습니다.`);
      setIsCurrentMonthPaymentModalOpen(false);
      setSelectedStudentsForPayment([]);
      fetchOverdueData();
      fetchPaidStudents();
    } catch (error) {
      console.error('일괄 결제 기록 저장 오류:', error);
      toast.error('결제 기록 저장 중 오류가 발생했습니다.');
    }
  };

  const openCurrentMonthPaymentModal = () => {
    fetchAllActiveStudents();
    setIsCurrentMonthPaymentModalOpen(true);
  };

  const getDayName = (dayNumber) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[dayNumber] || '';
  };

  const renderOverviewTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold">매출 현황</h2>
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
                      <TableCell className="font-medium">
                        {classData.grade} {classData.subject}
                      </TableCell>
                      <TableCell>{classData.teacher || '미배정'}</TableCell>
                      <TableCell>{classData.students}명</TableCell>
                      <TableCell>{formatCurrency(classData.totalRevenue)}</TableCell>
                      <TableCell>
                        {classData.students > 0 ? 
                          formatCurrency(Math.round(classData.totalRevenue / classData.students)) : 
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

        {/* 강사별 매출 TOP 5 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
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
                    <TableHead>평균 수업료</TableHead>
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
                      <TableCell className="font-medium">{instructor.teacher || '미배정'}</TableCell>
                      <TableCell>{instructor.classes}개</TableCell>
                      <TableCell>{instructor.students}명</TableCell>
                      <TableCell>
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

  const renderOverdueTab = () => {
    return (
      <div className="space-y-6">
        {/* 연체 현황 요약 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">전체 연체생</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdueStats.total}명</div>
              <div className="text-xs text-gray-500">
                총 연체금액: {formatCurrency(overdueStats.totalAmount)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">1개월 연체</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{overdueStats.oneMonth}명</div>
              <div className="text-xs text-gray-500">주의 필요</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">2개월 연체</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{overdueStats.twoMonth}명</div>
              <div className="text-xs text-gray-500">경고 단계</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">3개월+ 연체</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdueStats.threeMonthPlus}명</div>
              <div className="text-xs text-gray-500">긴급 처리</div>
            </CardContent>
          </Card>
        </div>

        {/* 연체 관리 도구 */}
        <Card>
          <CardHeader>
            <CardTitle>연체 관리</CardTitle>
            <div className="flex gap-2">
              <Button 
                onClick={fetchOverdueData}
                variant="outline"
                size="sm"
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                연체 현황 새로고침
              </Button>
              <Button 
                onClick={openCurrentMonthPaymentModal}
                variant="default"
                size="sm"
              >
                <CreditCard className="h-4 w-4 mr-1" />
                이번달 입금자 등록
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {overdueStudents.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">현재 연체 중인 학생이 없습니다.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>학생명</TableHead>
                    <TableHead>수업</TableHead>
                    <TableHead>연체 기간</TableHead>
                    <TableHead>연체 금액</TableHead>
                    <TableHead>최종 결제일</TableHead>
                    <TableHead>연락처</TableHead>
                    <TableHead>관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdueStudents.map((student) => (
                    <TableRow key={`${student.student_id}-${student.schedule_id}`}>
                      <TableCell className="font-medium">
                        {student.student?.full_name}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {student.schedule?.grade} {student.schedule?.subject}
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.schedule?.teacher_name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getOverdueBadgeVariant(student.overdueMonths)}>
                          {student.overdueMonths}개월
                        </Badge>
                      </TableCell>
                      <TableCell className="text-red-600 font-medium">
                        {formatCurrency(student.overdueAmount)}
                      </TableCell>
                      <TableCell>
                        {student.lastPaymentDate ? 
                          student.lastPaymentDate.toLocaleDateString('ko-KR') : 
                          '결제 기록 없음'
                        }
                      </TableCell>
                      <TableCell>{student.student?.phone}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openPaymentModal(student)}
                          >
                            <DollarSign className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openMemoModal(student)}
                          >
                            <MessageSquare className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(`tel:${student.student?.phone}`)}
                          >
                            <Phone className="h-3 w-3" />
                          </Button>
                        </div>
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

  const renderPaidTab = () => {
    return (
      <div className="space-y-6">
        {/* 입금자 현황 요약 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">이번달 입금자</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{paidStats.total}명</div>
              <div className="text-xs text-gray-500">결제 완료</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">총 입금액</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(paidStats.totalAmount)}</div>
              <div className="text-xs text-gray-500">이번달 수금액</div>
            </CardContent>
          </Card>
        </div>

        {/* 입금자 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>이번달 입금자 목록</CardTitle>
            <div className="flex gap-2">
              <Button 
                onClick={fetchPaidStudents}
                variant="outline"
                size="sm"
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                목록 새로고침
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {paidStudents.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-muted-foreground">이번달 입금자가 없습니다.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>학생명</TableHead>
                    <TableHead>수업</TableHead>
                    <TableHead>결제일</TableHead>
                    <TableHead>결제 방법</TableHead>
                    <TableHead>결제 금액</TableHead>
                    <TableHead>연락처</TableHead>
                    <TableHead>비고</TableHead>
                    <TableHead>관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paidStudents.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.student?.full_name}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {payment.schedule?.grade} {payment.schedule?.subject}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.schedule?.teacher_name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(payment.payment_date).toLocaleDateString('ko-KR')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {payment.payment_method === 'cash' ? '현금' :
                           payment.payment_method === 'card' ? '카드' :
                           payment.payment_method === 'transfer' ? '계좌이체' :
                           payment.payment_method || '기타'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-green-600 font-medium">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>{payment.student?.phone}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {payment.notes || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openEditPaymentModal(payment)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeletePayment(payment.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
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

  const renderModals = () => {
    return (
      <>
        {/* 결제 기록 추가 모달 */}
        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>결제 기록 추가</DialogTitle>
              <DialogDescription>
                {selectedStudentForPayment && 
                  `${selectedStudentForPayment.student?.full_name}님의 결제 기록을 추가합니다.`
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payment-amount">결제 금액</Label>
                  <Input
                    id="payment-amount"
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    placeholder="결제 금액"
                  />
                </div>
                <div>
                  <Label htmlFor="payment-date">결제일</Label>
                  <Input
                    id="payment-date"
                    type="date"
                    value={paymentForm.payment_date}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="payment-method">결제 방법</Label>
                <Select
                  value={paymentForm.payment_method}
                  onValueChange={(value) => setPaymentForm({ ...paymentForm, payment_method: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">현금</SelectItem>
                    <SelectItem value="card">카드</SelectItem>
                    <SelectItem value="transfer">계좌이체</SelectItem>
                    <SelectItem value="other">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="period-start">결제 기간 시작</Label>
                  <Input
                    id="period-start"
                    type="date"
                    value={paymentForm.period_start}
                    onChange={(e) => setPaymentForm({ ...paymentForm, period_start: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="period-end">결제 기간 종료</Label>
                  <Input
                    id="period-end"
                    type="date"
                    value={paymentForm.period_end}
                    onChange={(e) => setPaymentForm({ ...paymentForm, period_end: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="payment-notes">비고</Label>
                <Textarea
                  id="payment-notes"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="특이사항이나 메모를 입력하세요"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
                취소
              </Button>
              <Button onClick={handlePaymentSubmit}>
                저장
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 상담 메모 모달 */}
        <Dialog open={isMemoModalOpen} onOpenChange={setIsMemoModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>상담 기록</DialogTitle>
              <DialogDescription>
                {selectedStudentForMemo && 
                  `${selectedStudentForMemo.student?.full_name}님의 상담 기록을 추가합니다.`
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="memo-type">상담 유형</Label>
                <Select
                  value={memoForm.type}
                  onValueChange={(value) => setMemoForm({ ...memoForm, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="상담 유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payment_reminder">결제 독촉</SelectItem>
                    <SelectItem value="phone_call">전화 상담</SelectItem>
                    <SelectItem value="in_person">방문 상담</SelectItem>
                    <SelectItem value="payment_plan">분할 계획</SelectItem>
                    <SelectItem value="other">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="memo-content">상담 내용</Label>
                <Textarea
                  id="memo-content"
                  value={memoForm.content}
                  onChange={(e) => setMemoForm({ ...memoForm, content: e.target.value })}
                  placeholder="상담 내용을 입력하세요..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsMemoModalOpen(false)}>
                취소
              </Button>
              <Button onClick={handleMemoSubmit}>
                상담 기록 저장
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 이번달 입금자 등록 모달 */}
        <Dialog open={isCurrentMonthPaymentModalOpen} onOpenChange={setIsCurrentMonthPaymentModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>이번달 입금자 등록</DialogTitle>
              <DialogDescription>
                이번달 수업료를 납부한 학생들을 선택해주세요.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* 결제 정보 설정 */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="bulk-payment-date">결제일</Label>
                  <Input
                    id="bulk-payment-date"
                    type="date"
                    value={bulkPaymentForm.payment_date}
                    onChange={(e) => setBulkPaymentForm({ ...bulkPaymentForm, payment_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="bulk-payment-method">결제 방법</Label>
                  <Select
                    value={bulkPaymentForm.payment_method}
                    onValueChange={(value) => setBulkPaymentForm({ ...bulkPaymentForm, payment_method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">현금</SelectItem>
                      <SelectItem value="card">카드</SelectItem>
                      <SelectItem value="transfer">계좌이체</SelectItem>
                      <SelectItem value="other">기타</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bulk-payment-notes">비고</Label>
                  <Input
                    id="bulk-payment-notes"
                    value={bulkPaymentForm.notes}
                    onChange={(e) => setBulkPaymentForm({ ...bulkPaymentForm, notes: e.target.value })}
                    placeholder="공통 비고 사항"
                  />
                </div>
              </div>

              {/* 학생 선택 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-medium">
                    결제할 학생 선택 ({selectedStudentsForPayment.length}/{allActiveStudents.length}명)
                  </Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="select-all-payments"
                      checked={selectedStudentsForPayment.length === allActiveStudents.length && allActiveStudents.length > 0}
                      onChange={(e) => handleSelectAllForPayment(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="select-all-payments" className="text-sm">전체 선택</Label>
                  </div>
                </div>
                
                {allActiveStudents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>이번달 결제 대상자가 없습니다.</p>
                    <p className="text-sm">모든 학생이 이미 결제를 완료했습니다.</p>
                  </div>
                ) : (
                  <div className="border rounded-lg max-h-60 overflow-y-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-white">
                        <TableRow>
                          <TableHead className="w-12">선택</TableHead>
                          <TableHead>학생명</TableHead>
                          <TableHead>수업</TableHead>
                          <TableHead>강사</TableHead>
                          <TableHead>수업료</TableHead>
                          <TableHead>연락처</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allActiveStudents.map((student) => {
                          const isSelected = selectedStudentsForPayment.some(s => 
                            `${s.student_id}-${s.schedule_id}` === `${student.student_id}-${student.schedule_id}`
                          );
                          return (
                            <TableRow key={`${student.student_id}-${student.schedule_id}`}>
                              <TableCell>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => handleStudentSelectForPayment(student, e.target.checked)}
                                  className="w-4 h-4"
                                />
                              </TableCell>
                              <TableCell className="font-medium">
                                {student.students?.full_name}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {student.schedules?.grade} {student.schedules?.subject}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {student.schedules?.teacher_name}
                              </TableCell>
                              <TableCell>
                                {formatCurrency(student.schedules?.price || student.monthly_fee || 0)}
                              </TableCell>
                              <TableCell>
                                {student.students?.phone}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCurrentMonthPaymentModalOpen(false)}>
                취소
              </Button>
              <Button 
                onClick={handleBulkPaymentSubmit}
                disabled={selectedStudentsForPayment.length === 0}
              >
                {selectedStudentsForPayment.length}명 결제 기록 저장
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 입금자 수정 모달 */}
        <Dialog open={isEditPaymentModalOpen} onOpenChange={setIsEditPaymentModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>입금 정보 수정</DialogTitle>
              <DialogDescription>
                {selectedPaymentForEdit && 
                  `${selectedPaymentForEdit.student?.full_name}님의 입금 정보를 수정합니다.`
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-payment-amount">결제 금액</Label>
                  <Input
                    id="edit-payment-amount"
                    type="number"
                    value={editPaymentForm.amount}
                    onChange={(e) => setEditPaymentForm({ ...editPaymentForm, amount: e.target.value })}
                    placeholder="결제 금액"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-payment-date">결제일</Label>
                  <Input
                    id="edit-payment-date"
                    type="date"
                    value={editPaymentForm.payment_date}
                    onChange={(e) => setEditPaymentForm({ ...editPaymentForm, payment_date: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-payment-method">결제 방법</Label>
                <Select
                  value={editPaymentForm.payment_method}
                  onValueChange={(value) => setEditPaymentForm({ ...editPaymentForm, payment_method: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">현금</SelectItem>
                    <SelectItem value="card">카드</SelectItem>
                    <SelectItem value="transfer">계좌이체</SelectItem>
                    <SelectItem value="other">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-payment-notes">비고</Label>
                <Textarea
                  id="edit-payment-notes"
                  value={editPaymentForm.notes}
                  onChange={(e) => setEditPaymentForm({ ...editPaymentForm, notes: e.target.value })}
                  placeholder="특이사항이나 메모를 입력하세요"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditPaymentModalOpen(false)}>
                취소
              </Button>
              <Button onClick={handleEditPaymentSubmit}>
                수정 완료
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
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
      {/* 페이지 헤더 */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold">매출 관리</h1>
        <p className="text-muted-foreground">학원 매출 현황 및 연체 관리를 확인할 수 있습니다.</p>
      </div>

      {/* 탭 메뉴 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            매출 현황
          </TabsTrigger>
          <TabsTrigger value="overdue" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            연체 관리
          </TabsTrigger>
          <TabsTrigger value="paid" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            입금자 목록
          </TabsTrigger>
          <TabsTrigger value="by-class" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            수업별 매출
          </TabsTrigger>
          <TabsTrigger value="by-instructor" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            강사별 매출
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-6">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4 mt-6">
          {renderOverdueTab()}
        </TabsContent>

        <TabsContent value="paid" className="space-y-4 mt-6">
          {renderPaidTab()}
        </TabsContent>

        <TabsContent value="by-class" className="space-y-4 mt-6">
          {renderByClassTab()}
        </TabsContent>

        <TabsContent value="by-instructor" className="space-y-4 mt-6">
          {renderByInstructorTab()}
        </TabsContent>
      </Tabs>

      {/* 모달들 */}
      {renderModals()}
    </div>
  );

};

export default SalesManagementContent;