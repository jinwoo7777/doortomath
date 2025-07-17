import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

export const useConsultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
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
      return true;
    } catch (error) {
      console.error('Error deleting consultation:', error);
      toast.error('삭제 중 오류가 발생했습니다.');
      return false;
    }
  };

  return {
    consultations,
    loading,
    updateConsultationStatus,
    deleteConsultation
  };
};