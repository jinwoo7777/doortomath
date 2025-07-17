import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Check, Trash2 } from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ConsultationTable = ({ 
  consultations, 
  loading,
  formatDate, 
  onViewDetails, 
  onUpdateStatus, 
  onDelete 
}) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: '대기중', variant: 'default' },
      contacted: { label: '연락완료', variant: 'secondary' },
      completed: { label: '완료', variant: 'success' },
      cancelled: { label: '취소', variant: 'destructive' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (consultations.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-gray-500">문의가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>신청일시</TableHead>
            <TableHead>성명</TableHead>
            <TableHead>연락처</TableHead>
            <TableHead>학년</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {consultations.map((consultation) => (
            <TableRow key={consultation.id}>
              <TableCell className="font-mono text-sm">
                {formatDate(consultation.created_at)}
              </TableCell>
              <TableCell className="font-medium">
                {consultation.name}
              </TableCell>
              <TableCell>{consultation.phone}</TableCell>
              <TableCell>{consultation.student_grade}</TableCell>
              <TableCell>
                {getStatusBadge(consultation.status)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(consultation)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {consultation.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateStatus(consultation.id, 'contacted')}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(consultation)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ConsultationTable;