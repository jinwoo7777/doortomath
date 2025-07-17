"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * 결제 정보 입력 다이얼로그 컴포넌트
 * @param {object} props - 컴포넌트 속성
 * @param {boolean} props.open - 다이얼로그 열림 상태
 * @param {function} props.onOpenChange - 다이얼로그 상태 변경 핸들러
 * @param {object} props.student - 선택된 학생 정보
 * @param {object} props.form - 폼 상태
 * @param {function} props.setForm - 폼 상태 변경 함수
 * @param {function} props.onSubmit - 제출 핸들러
 * @returns {React.ReactElement} 결제 다이얼로그 컴포넌트
 */
const PaymentDialog = ({ open, onOpenChange, student, form, setForm, onSubmit }) => {
  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>결제 정보 입력</DialogTitle>
          <DialogDescription>
            {student.student?.full_name} 학생의 결제 정보를 입력하세요.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              금액
            </Label>
            <Input
              id="amount"
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payment_date" className="text-right">
              결제일
            </Label>
            <Input
              id="payment_date"
              type="date"
              value={form.payment_date}
              onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payment_method" className="text-right">
              결제 방법
            </Label>
            <Select
              value={form.payment_method}
              onValueChange={(value) => setForm({ ...form, payment_method: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="결제 방법 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">현금</SelectItem>
                <SelectItem value="card">카드</SelectItem>
                <SelectItem value="transfer">계좌이체</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="period_start" className="text-right">
              시작일
            </Label>
            <Input
              id="period_start"
              type="date"
              value={form.period_start}
              onChange={(e) => setForm({ ...form, period_start: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="period_end" className="text-right">
              종료일
            </Label>
            <Input
              id="period_end"
              type="date"
              value={form.period_end}
              onChange={(e) => setForm({ ...form, period_end: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              메모
            </Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={onSubmit}>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;