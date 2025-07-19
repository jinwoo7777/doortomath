'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { User, Phone, Loader2, CheckCircle, EyeOff } from 'lucide-react';

export default function FindIdTab({ supabase }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [foundId, setFoundId] = useState('');
  const [step, setStep] = useState('input'); // 'input' | 'result'

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const maskId = (id) => {
    if (id.length <= 4) return id;
    const visiblePart = id.substring(0, Math.ceil(id.length / 3));
    const maskedPart = '*'.repeat(id.length - visiblePart.length);
    return visiblePart + maskedPart;
  };

  const handleFindId = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      setError('이름과 전화번호를 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. 학원생 정보 확인
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id, full_name, phone')
        .eq('full_name', formData.name.trim())
        .eq('phone', formData.phone.trim())
        .eq('status', 'active')
        .single();

      if (studentError || !studentData) {
        throw new Error('등록된 학원생 정보를 찾을 수 없습니다. 이름과 전화번호를 확인해주세요.');
      }

      // 2. 해당 학생의 계정 정보 확인
      const { data: accountData, error: accountError } = await supabase
        .from('student_accounts')
        .select('username')
        .eq('student_id', studentData.id)
        .eq('is_active', true)
        .single();

      if (accountError || !accountData) {
        throw new Error('등록된 계정이 없습니다. 회원가입을 먼저 진행해주세요.');
      }

      // 3. 아이디 찾기 성공
      setFoundId(accountData.username);
      setStep('result');

    } catch (error) {
      console.error('아이디 찾기 오류:', error);
      setError(error.message || '아이디 찾기 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setStep('input');
    setFoundId('');
    setFormData({ name: '', phone: '' });
    setError('');
  };

  if (step === 'result') {
    return (
      <div className="space-y-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <h3 className="text-lg font-semibold text-green-800">아이디를 찾았습니다!</h3>
              
              <div className="p-4 bg-white rounded-lg border border-green-200">
                <div className="flex items-center justify-center space-x-2">
                  <EyeOff className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">등록된 아이디</span>
                </div>
                <div className="text-xl font-mono font-bold text-gray-800 mt-2">
                  {maskId(foundId)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  (보안을 위해 일부 문자는 마스킹 처리됩니다)
                </div>
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={handleRetry}
                  variant="outline"
                  className="w-full"
                >
                  다시 찾기
                </Button>
                <p className="text-sm text-gray-600">
                  이제 찾은 아이디로 로그인할 수 있습니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={handleFindId} className="space-y-4">
      <div>
        <Label htmlFor="name">이름 *</Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User style={{ width: '16px', height: '16px', color: '#9ca3af', flexShrink: 0 }} />
          <Input
            id="name"
            type="text"
            placeholder="학원에 등록된 이름"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            style={{ flex: 1 }}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="phone">전화번호 *</Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Phone style={{ width: '16px', height: '16px', color: '#9ca3af', flexShrink: 0 }} />
          <Input
            id="phone"
            type="tel"
            placeholder="본인 전화번호"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            style={{ flex: 1 }}
            required
          />
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <Button 
        type="submit" 
        disabled={loading}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            아이디 찾는 중...
          </>
        ) : (
          <>
            <User className="mr-2 h-4 w-4" />
            아이디 찾기
          </>
        )}
      </Button>
    </form>
  );
}