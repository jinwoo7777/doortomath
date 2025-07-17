import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  consultation, 
  onConfirm, 
  formatDate 
}) => {
  if (!consultation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>문의 삭제</DialogTitle>
          <DialogDescription>
            이 문의를 정말 삭제하시겠습니까? 삭제된 문의는 복구할 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>성명:</strong> {consultation.name}</div>
              <div><strong>연락처:</strong> {consultation.phone}</div>
              <div><strong>학년:</strong> {consultation.student_grade}</div>
              <div><strong>신청일:</strong> {formatDate(consultation.created_at)}</div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => onConfirm(consultation.id)}
          >
            삭제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmationModal;