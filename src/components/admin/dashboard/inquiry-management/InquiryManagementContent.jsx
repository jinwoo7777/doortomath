"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MailIcon, 
  Phone, 
  User, 
  GraduationCap,
  Calendar,
  MessageSquare,
  Eye,
  Check,
  X,
  Search,
  Filter,
  Trash2
} from 'lucide-react';
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

const InquiryManagementContent = () => {
  const { session, userRole } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [consultationToDelete, setConsultationToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setConsultations(data || []);
    } catch (error) {
      console.error('Error fetching consultations:', error);
      toast.error('문의 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const updateConsultationStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('consultations')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) {
        throw error;
      }

      setConsultations(prev => prev.map(consultation => 
        consultation.id === id ? { ...consultation, status: newStatus } : consultation
      ));

      toast.success('상담 상태가 업데이트되었습니다.');
    } catch (error) {
      console.error('Error updating consultation status:', error);
      toast.error('상태 업데이트 중 오류가 발생했습니다.');
    }
  };

  const deleteConsultation = async (id) => {
    try {
      const { error } = await supabase
        .from('consultations')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setConsultations(prev => prev.filter(consultation => consultation.id !== id));
      toast.success('문의가 삭제되었습니다.');
      setIsDeleteModalOpen(false);
      setConsultationToDelete(null);
    } catch (error) {
      console.error('Error deleting consultation:', error);
      toast.error('삭제 중 오류가 발생했습니다.');
    }
  };

  const openDeleteModal = (consultation) => {
    setConsultationToDelete(consultation);
    setIsDeleteModalOpen(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch = 
      consultation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.phone.includes(searchTerm) ||
      (consultation.email && consultation.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || consultation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const openDetailModal = (consultation) => {
    setSelectedConsultation(consultation);
    setIsDetailModalOpen(true);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">문의 관리</h1>
          <p className="text-gray-600">상담신청 및 문의사항을 관리할 수 있습니다.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              문의 목록 ({filteredConsultations.length}건)
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="이름, 전화번호, 이메일 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="상태 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="pending">대기중</SelectItem>
                  <SelectItem value="contacted">연락완료</SelectItem>
                  <SelectItem value="completed">완료</SelectItem>
                  <SelectItem value="cancelled">취소</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p>로딩 중...</p>
            </div>
          ) : filteredConsultations.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-500">문의가 없습니다.</p>
            </div>
          ) : (
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
                  {filteredConsultations.map((consultation) => (
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
                            onClick={() => openDetailModal(consultation)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {consultation.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateConsultationStatus(consultation.id, 'contacted')}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteModal(consultation)}
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
          )}
        </CardContent>
      </Card>

      {/* 상세보기 모달 */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>문의 상세정보</DialogTitle>
            <DialogDescription>
              문의 내용을 확인하고 상태를 관리할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          
          {selectedConsultation && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    성명
                  </Label>
                  <p className="font-medium">{selectedConsultation.name}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    연락처
                  </Label>
                  <p className="font-medium">{selectedConsultation.phone}</p>
                </div>
                
                {selectedConsultation.email && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MailIcon className="h-4 w-4" />
                      이메일
                    </Label>
                    <p className="font-medium">{selectedConsultation.email}</p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    학년
                  </Label>
                  <p className="font-medium">{selectedConsultation.student_grade}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    신청일시
                  </Label>
                  <p className="font-medium">{formatDate(selectedConsultation.created_at)}</p>
                </div>
                
                <div className="space-y-2">
                  <Label>현재 상태</Label>
                  <div>{getStatusBadge(selectedConsultation.status)}</div>
                </div>
              </div>
              
              {selectedConsultation.subject && (
                <div className="space-y-2">
                  <Label>상담 주제</Label>
                  <p className="font-medium">{selectedConsultation.subject}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>상담 내용</Label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedConsultation.message}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>상태 변경</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateConsultationStatus(selectedConsultation.id, 'pending')}
                    disabled={selectedConsultation.status === 'pending'}
                  >
                    대기중
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateConsultationStatus(selectedConsultation.id, 'contacted')}
                    disabled={selectedConsultation.status === 'contacted'}
                  >
                    연락완료
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateConsultationStatus(selectedConsultation.id, 'completed')}
                    disabled={selectedConsultation.status === 'completed'}
                  >
                    완료
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateConsultationStatus(selectedConsultation.id, 'cancelled')}
                    disabled={selectedConsultation.status === 'cancelled'}
                  >
                    취소
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 모달 */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>문의 삭제</DialogTitle>
            <DialogDescription>
              이 문의를 정말 삭제하시겠습니까? 삭제된 문의는 복구할 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          
          {consultationToDelete && (
            <div className="py-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>성명:</strong> {consultationToDelete.name}</div>
                  <div><strong>연락처:</strong> {consultationToDelete.phone}</div>
                  <div><strong>학년:</strong> {consultationToDelete.student_grade}</div>
                  <div><strong>신청일:</strong> {formatDate(consultationToDelete.created_at)}</div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              취소
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteConsultation(consultationToDelete?.id)}
            >
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InquiryManagementContent;