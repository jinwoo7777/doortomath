"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    AlertTriangle,
    MessageSquare,
    Phone,
    CreditCard
} from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { useBranch } from '../../context/BranchContext';

import { useOverdueData } from '../../hooks/useOverdueData';
import { formatCurrency, getOverdueBadgeVariant } from '../../utils/formatters';
import MetricCard from '../../components/cards/MetricCard';
import DataTable from '../../components/tables/DataTable';
import PaymentDialog from '../../components/dialogs/PaymentDialog';

/**
 * 연체 관리 컴포넌트
 * @returns {React.ReactElement} 연체 관리 컴포넌트
 */
const OverduePaymentsView = () => {
    const { selectedBranch } = useBranch();
    const { overdueStudents, overdueStats, loading, refetch } = useOverdueData(selectedBranch);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedStudentForPayment, setSelectedStudentForPayment] = useState(null);
    const [paymentForm, setPaymentForm] = useState({
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        period_start: '',
        period_end: '',
        notes: ''
    });

    const supabase = createClientComponentClient();

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
            refetch();
        } catch (error) {
            console.error('결제 기록 저장 오류:', error);
            toast.error('결제 기록 저장 중 오류가 발생했습니다.');
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
            key: 'contact',
            header: '연락처',
            cell: (row) => row.student?.phone || row.student?.email || '-'
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
            key: 'overdueMonths',
            header: '연체 기간',
            cell: (row) => (
                <Badge variant={getOverdueBadgeVariant(row.overdueMonths)}>
                    {row.overdueMonths}개월
                    {row.isUnpaid && ' (미입금)'}
                </Badge>
            )
        },
        {
            key: 'overdueAmount',
            header: '연체 금액',
            cell: (row) => formatCurrency(row.overdueAmount),
            cellClassName: 'font-medium text-red-600'
        },
        {
            key: 'actions',
            header: '관리',
            cell: (row) => (
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openPaymentModal(row)}
                    >
                        <CreditCard className="h-4 w-4 mr-1" />
                        결제
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                    >
                        <Phone className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                    >
                        <MessageSquare className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold">연체 관리</h2>
                <p className="text-gray-600">수업료 연체 학생 관리 및 결제 처리를 할 수 있습니다.</p>
            </div>

            {/* 연체 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="총 연체 학생"
                    value={`${overdueStats.total}명`}
                    description="전체 연체 학생 수"
                    icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
                />

                <MetricCard
                    title="1개월 연체"
                    value={`${overdueStats.oneMonth}명`}
                    description="1개월 연체 학생 수"
                    icon={<AlertTriangle className="h-4 w-4 text-yellow-500" />}
                />

                <MetricCard
                    title="2개월 이상 연체"
                    value={`${overdueStats.twoMonth + overdueStats.threeMonthPlus}명`}
                    description="장기 연체 학생 수"
                    icon={<AlertTriangle className="h-4 w-4 text-red-600" />}
                />

                <MetricCard
                    title="총 연체 금액"
                    value={formatCurrency(overdueStats.totalAmount)}
                    description="전체 연체 금액"
                    icon={<CreditCard className="h-4 w-4 text-red-500" />}
                />
            </div>

            {/* 연체 학생 목록 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        연체 학생 목록
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={overdueStudents}
                        loading={loading}
                        emptyMessage="연체 학생이 없습니다."
                    />
                </CardContent>
            </Card>

            {/* 결제 모달 */}
            <PaymentDialog
                open={isPaymentModalOpen}
                onOpenChange={setIsPaymentModalOpen}
                student={selectedStudentForPayment}
                form={paymentForm}
                setForm={setPaymentForm}
                onSubmit={handlePaymentSubmit}
            />
        </div>
    );
};

export default OverduePaymentsView;