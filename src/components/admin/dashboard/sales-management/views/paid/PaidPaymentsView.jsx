"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  Users,
  Edit2,
  X,
  Plus
} from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { useBranch } from '../../context/BranchContext';

import { usePaidData } from '../../hooks/usePaidData';
import { formatCurrency } from '../../utils/formatters';
import MetricCard from '../../components/cards/MetricCard';
import DataTable from '../../components/tables/DataTable';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

/**
 * 입금 관리 컴포넌트
 * @returns {React.ReactElement} 입금 관리 컴포넌트
 */
const PaidPaymentsView = () => {
  const { selectedBranch } = useBranch();
  const { paidStudents, paidStats, loading, refetch } = usePaidData(selectedBranch);
  const [isEditPaymentModalOpen, setIsEditPaymentModalOpen] = useState(false);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [selectedPaymentForEdit, setSelectedPaymentForEdit] = useState(null);
  const [editPaymentForm, setEditPaymentForm] = useState({
    amount: '',
    payment_date: '',
    payment_method: 'cash',
    notes: ''
  });
  const [addPaymentForm, setAddPaymentForm] = useState({
    student_id: '',
    schedule_id: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    notes: ''
  });
  const [students, setStudents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  const supabase = createClientComponentClient();

  // 학생 목록 조회
  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const { data, error } = await supabase
        .from('students')
        .select('id, full_name, grade')
        .eq('status', 'active')
        .order('full_name');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('학생 목록 조회 오류:', error);
      toast.error('학생 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoadingStudents(false);
    }
  };

  // 수업 목록 조회
  const fetchSchedules = async () => {
    try {
      setLoadingSchedules(true);
      const { data, error } = await supabase
        .from('schedules')
        .select('id, subject, grade, teacher_name, day_of_week, time_slot')
        .order('subject');

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('수업 목록 조회 오류:', error);
      toast.error('수업 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoadingSchedules(false);
    }
  };

  // 입금 등록 모달 열기
  const openAddPaymentModal = () => {
    fetchStudents();
    fetchSchedules();
    setAddPaymentForm({
      student_id: '',
      schedule_id: '',
      amount: '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      notes: ''
    });
    setIsAddPaymentModalOpen(true);
  };

  // 입금 등록 처리
  const handleAddPaymentSubmit = async () => {
    try {
      // 필수 입력값 검증
      if (!addPaymentForm.student_id || !addPaymentForm.amount || !addPaymentForm.payment_date) {
        toast.error('학생, 금액, 결제일은 필수 입력 항목입니다.');
        return;
      }

      // 수업 ID 처리 - "none"을 선택한 경우 null로 설정
      const scheduleId = addPaymentForm.schedule_id === 'none' ? null : addPaymentForm.schedule_id;

      const { error } = await supabase
        .from('payments')
        .insert({
          student_id: addPaymentForm.student_id,
          schedule_id: scheduleId,
          amount: parseFloat(addPaymentForm.amount),
          payment_date: addPaymentForm.payment_date,
          payment_method: addPaymentForm.payment_method,
          notes: addPaymentForm.notes,
          status: 'completed'
        });

      if (error) throw error;

      toast.success('입금이 성공적으로 등록되었습니다.');
      setIsAddPaymentModalOpen(false);
      refetch();
    } catch (error) {
      console.error('입금 등록 오류:', error);
      toast.error('입금 등록 중 오류가 발생했습니다.');
    }
  };

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
      refetch();
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
      refetch();
    } catch (error) {
      console.error('입금 기록 삭제 오류:', error);
      toast.error('입금 기록 삭제 중 오류가 발생했습니다.');
    }
  };

  // 테이블 컬럼 정의
  const columns = [
    {
      key: 'student',
      header: '학생 정보',
      cell: (row) => (
        <div>
          <div className="font-medium">{row.student?.full_name}</div>
          <div className="text-sm text-muted-foreground">
            {row.student?.grade || '학년 정보 없음'}
          </div>
        </div>
      )
    },
    {
      key: 'class',
      header: '수업 정보',
      cell: (row) => (
        <div>
          <div className="font-medium">
            {row.schedule?.grade} {row.schedule?.subject}
          </div>
          <div className="text-sm text-muted-foreground">
            {row.schedule?.teacher_name || '강사 미배정'}
          </div>
        </div>
      )
    },
    {
      key: 'payment_date',
      header: '결제일',
      cell: (row) => new Date(row.payment_date).toLocaleDateString('ko-KR')
    },
    {
      key: 'amount',
      header: '결제 금액',
      cell: (row) => formatCurrency(row.amount),
      cellClassName: 'font-medium text-green-600'
    },
    {
      key: 'payment_method',
      header: '결제 방법',
      cell: (row) => {
        const methods = {
          'cash': '현금',
          'card': '카드',
          'transfer': '계좌이체'
        };
        return methods[row.payment_method] || row.payment_method;
      }
    },
    {
      key: 'actions',
      header: '관리',
      cell: (row) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEditPaymentModal(row)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeletePayment(row.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">입금 관리</h2>
          <p className="text-gray-600">이번 달 입금 현황을 확인하고 관리할 수 있습니다.</p>
        </div>
        <Button onClick={openAddPaymentModal}>
          <Plus className="h-4 w-4 mr-2" />
          입금 등록
        </Button>
      </div>

      {/* 입금 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="총 입금자 수"
          value={`${paidStats.total}명`}
          description="이번 달 입금 완료 학생 수"
          icon={<Users className="h-4 w-4" />}
        />

        <MetricCard
          title="총 입금액"
          value={formatCurrency(paidStats.totalAmount)}
          description="이번 달 총 입금액"
          icon={<DollarSign className="h-4 w-4" />}
        />

        <MetricCard
          title="평균 입금액"
          value={formatCurrency(paidStats.total > 0 ? paidStats.totalAmount / paidStats.total : 0)}
          description="학생당 평균 입금액"
          icon={<DollarSign className="h-4 w-4" />}
        />
      </div>

      {/* 입금자 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            이번 달 입금 목록
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={paidStudents}
            loading={loading}
            emptyMessage="이번 달 입금 내역이 없습니다."
          />
        </CardContent>
      </Card>

      {/* 입금 등록 모달 */}
      <Dialog open={isAddPaymentModalOpen} onOpenChange={setIsAddPaymentModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>입금 등록</DialogTitle>
            <DialogDescription>
              학생의 수업료 입금 정보를 등록합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* 학생 선택 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="student" className="text-right">
                학생 *
              </Label>
              <div className="col-span-3">
                <Select
                  value={addPaymentForm.student_id}
                  onValueChange={(value) => setAddPaymentForm({ ...addPaymentForm, student_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="학생을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingStudents ? (
                      <SelectItem value="loading" disabled>로딩 중...</SelectItem>
                    ) : students.length === 0 ? (
                      <SelectItem value="empty" disabled>학생 정보가 없습니다</SelectItem>
                    ) : (
                      students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.full_name} ({student.grade || '학년 미정'})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 수업 선택 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="schedule" className="text-right">
                수업
              </Label>
              <div className="col-span-3">
                <Select
                  value={addPaymentForm.schedule_id}
                  onValueChange={(value) => setAddPaymentForm({ ...addPaymentForm, schedule_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="수업을 선택하세요 (선택사항)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">선택 안함</SelectItem>
                    {loadingSchedules ? (
                      <SelectItem value="loading" disabled>로딩 중...</SelectItem>
                    ) : schedules.length === 0 ? (
                      <SelectItem value="empty" disabled>수업 정보가 없습니다</SelectItem>
                    ) : (
                      schedules.map((schedule) => (
                        <SelectItem key={schedule.id} value={schedule.id}>
                          {schedule.grade} {schedule.subject} ({schedule.teacher_name || '강사 미정'})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 금액 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                금액 *
              </Label>
              <div className="col-span-3">
                <Input
                  id="amount"
                  type="number"
                  value={addPaymentForm.amount}
                  onChange={(e) => setAddPaymentForm({ ...addPaymentForm, amount: e.target.value })}
                  placeholder="금액을 입력하세요"
                />
              </div>
            </div>

            {/* 결제일 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payment_date" className="text-right">
                결제일 *
              </Label>
              <div className="col-span-3">
                <Input
                  id="payment_date"
                  type="date"
                  value={addPaymentForm.payment_date}
                  onChange={(e) => setAddPaymentForm({ ...addPaymentForm, payment_date: e.target.value })}
                />
              </div>
            </div>

            {/* 결제 방법 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payment_method" className="text-right">
                결제 방법
              </Label>
              <div className="col-span-3">
                <Select
                  value={addPaymentForm.payment_method}
                  onValueChange={(value) => setAddPaymentForm({ ...addPaymentForm, payment_method: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="결제 방법을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">현금</SelectItem>
                    <SelectItem value="card">카드</SelectItem>
                    <SelectItem value="transfer">계좌이체</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 메모 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                메모
              </Label>
              <div className="col-span-3">
                <Input
                  id="notes"
                  value={addPaymentForm.notes}
                  onChange={(e) => setAddPaymentForm({ ...addPaymentForm, notes: e.target.value })}
                  placeholder="메모를 입력하세요 (선택사항)"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPaymentModalOpen(false)}>
              취소
            </Button>
            <Button onClick={handleAddPaymentSubmit}>
              등록하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 입금 수정 모달 */}
      <Dialog open={isEditPaymentModalOpen} onOpenChange={setIsEditPaymentModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>입금 정보 수정</DialogTitle>
            <DialogDescription>
              입금 정보를 수정합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* 금액 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_amount" className="text-right">
                금액 *
              </Label>
              <div className="col-span-3">
                <Input
                  id="edit_amount"
                  type="number"
                  value={editPaymentForm.amount}
                  onChange={(e) => setEditPaymentForm({ ...editPaymentForm, amount: e.target.value })}
                  placeholder="금액을 입력하세요"
                />
              </div>
            </div>

            {/* 결제일 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_payment_date" className="text-right">
                결제일 *
              </Label>
              <div className="col-span-3">
                <Input
                  id="edit_payment_date"
                  type="date"
                  value={editPaymentForm.payment_date}
                  onChange={(e) => setEditPaymentForm({ ...editPaymentForm, payment_date: e.target.value })}
                />
              </div>
            </div>

            {/* 결제 방법 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_payment_method" className="text-right">
                결제 방법
              </Label>
              <div className="col-span-3">
                <Select
                  value={editPaymentForm.payment_method}
                  onValueChange={(value) => setEditPaymentForm({ ...editPaymentForm, payment_method: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="결제 방법을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">현금</SelectItem>
                    <SelectItem value="card">카드</SelectItem>
                    <SelectItem value="transfer">계좌이체</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 메모 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_notes" className="text-right">
                메모
              </Label>
              <div className="col-span-3">
                <Input
                  id="edit_notes"
                  value={editPaymentForm.notes}
                  onChange={(e) => setEditPaymentForm({ ...editPaymentForm, notes: e.target.value })}
                  placeholder="메모를 입력하세요 (선택사항)"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditPaymentModalOpen(false)}>
              취소
            </Button>
            <Button onClick={handleEditPaymentSubmit}>
              수정하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaidPaymentsView;