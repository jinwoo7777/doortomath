"use client";

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { MessageSquare } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useConsultations } from './hooks/useConsultations';
import ConsultationFilters from './components/ConsultationFilters';
import ConsultationTable from './components/ConsultationTable';
import ConsultationDetailModal from './components/ConsultationDetailModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';

const InquiryManagementContent = () => {
  const { userRole } = useAuth();
  const { consultations, loading, updateConsultationStatus, deleteConsultation } = useConsultations();
  
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [consultationToDelete, setConsultationToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openDetailModal = (consultation) => {
    setSelectedConsultation(consultation);
    setIsDetailModalOpen(true);
  };

  const openDeleteModal = (consultation) => {
    setConsultationToDelete(consultation);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async (id) => {
    const success = await deleteConsultation(id);
    if (success) {
      setIsDeleteModalOpen(false);
      setConsultationToDelete(null);
    }
  };

  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch = 
      consultation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.phone.includes(searchTerm) ||
      (consultation.email && consultation.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || consultation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
          <h1 className="text-2xl font-bold">문의 관리</h1>
          <p className="text-gray-600">상담신청 및 문의사항을 관리할 수 있습니다.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <ConsultationFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              totalCount={filteredConsultations.length}
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ConsultationTable
            consultations={filteredConsultations}
            loading={loading}
            formatDate={formatDate}
            onViewDetails={openDetailModal}
            onUpdateStatus={updateConsultationStatus}
            onDelete={openDeleteModal}
          />
        </CardContent>
      </Card>

      {/* 상세보기 모달 */}
      <ConsultationDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        consultation={selectedConsultation}
        formatDate={formatDate}
        onUpdateStatus={updateConsultationStatus}
      />

      {/* 삭제 확인 모달 */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        consultation={consultationToDelete}
        onConfirm={handleDeleteConfirm}
        formatDate={formatDate}
      />
    </div>
  );
};

export default InquiryManagementContent;