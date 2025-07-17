"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageSquare } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const InquiriesTab = ({ recentInquiries, navigateToPage }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">최근 문의</h3>
        <Button variant="outline" size="sm" onClick={() => navigateToPage('/dashboard2/admin?path=/dashboard2/admin/inquiry-management')}>
          전체 보기 <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      {recentInquiries.length > 0 ? (
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
            {recentInquiries.map((inquiry) => (
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
    </div>
  );
};

export default InquiriesTab;