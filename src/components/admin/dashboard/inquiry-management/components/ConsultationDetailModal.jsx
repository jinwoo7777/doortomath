import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from "@/components/ui/label";
import { 
  MailIcon, 
  Phone, 
  User, 
  GraduationCap,
  Calendar
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ConsultationDetailModal = ({ 
  isOpen, 
  onClose, 
  consultation, 
  formatDate, 
  onUpdateStatus 
}) => {
  if (!consultation) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>문의 상세정보</DialogTitle>
          <DialogDescription>
            문의 내용을 확인하고 상태를 관리할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" />
                성명
              </Label>
              <p className="font-medium">{consultation.name}</p>
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                연락처
              </Label>
              <p className="font-medium">{consultation.phone}</p>
            </div>
            
            {consultation.email && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MailIcon className="h-4 w-4" />
                  이메일
                </Label>
                <p className="font-medium">{consultation.email}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                학년
              </Label>
              <p className="font-medium">{consultation.student_grade}</p>
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                신청일시
              </Label>
              <p className="font-medium">{formatDate(consultation.created_at)}</p>
            </div>
            
            <div className="space-y-2">
              <Label>현재 상태</Label>
              <div>{getStatusBadge(consultation.status)}</div>
            </div>
          </div>
          
          {consultation.subject && (
            <div className="space-y-2">
              <Label>상담 주제</Label>
              <p className="font-medium">{consultation.subject}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label>상담 내용</Label>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="whitespace-pre-wrap">{consultation.message}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>상태 변경</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateStatus(consultation.id, 'pending')}
                disabled={consultation.status === 'pending'}
              >
                대기중
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateStatus(consultation.id, 'contacted')}
                disabled={consultation.status === 'contacted'}
              >
                연락완료
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateStatus(consultation.id, 'completed')}
                disabled={consultation.status === 'completed'}
              >
                완료
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateStatus(consultation.id, 'cancelled')}
                disabled={consultation.status === 'cancelled'}
              >
                취소
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConsultationDetailModal;