'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { User, Phone, Lock, Eye, EyeOff, Loader2, CheckCircle, Key } from 'lucide-react';
import bcrypt from 'bcryptjs';

export default function ResetPasswordTab({ supabase, token }) {
  const router = useRouter();
  const [step, setStep] = useState('verify'); // 'verify' | 'reset' | 'success'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verifiedAccount, setVerifiedAccount] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [verifyData, setVerifyData] = useState({
    username: '',
    name: '',
    phone: '',
    parentPhone: ''
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (field, value, type = 'verify') => {
    if (type === 'verify') {
      setVerifyData(prev => ({
        ...prev,
        [field]: value
      }));
    } else {
      setPasswordData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    setError('');
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!verifyData.username.trim() || !verifyData.name.trim() || 
        !verifyData.phone.trim() || !verifyData.parentPhone.trim()) {
      setError('모든 정보를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. 계정 정보 조회
      const { data: accountData, error: accountError } = await supabase
        .from('student_accounts')
        .select(`
          id,
          student_id,
          username,
          is_active,
          students!inner (
            id,
            full_name,
            phone,
            parent_phone,
            status
          )
        `)
        .eq('username', verifyData.username.trim())
        .eq('is_active', true)
        .single();

      if (accountError || !accountData) {
        throw new Error('등록되지 않은 아이디이거나 비활성화된 계정입니다.');
      }

      // 2. 학생 정보 확인
      const student = accountData.students;
      if (student.status !== 'active') {
        throw new Error('비활성화된 학생 계정입니다.');
      }

      // 3. 이름, 전화번호, 부모님 전화번호 확인
      if (student.full_name !== verifyData.name.trim()) {
        throw new Error('이름이 일치하지 않습니다.');
      }

      if (student.phone !== verifyData.phone.trim()) {
        throw new Error('전화번호가 일치하지 않습니다.');
      }

      if (student.parent_phone !== verifyData.parentPhone.trim()) {
        throw new Error('부모님 전화번호가 일치하지 않습니다.');
      }

      // 4. 검증 성공
      setVerifiedAccount(accountData);
      setStep('reset');

    } catch (error) {
      console.error('계정 검증 오류:', error);
      setError(error.message || '계정 검증 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!passwordData.newPassword.trim() || !passwordData.confirmPassword.trim()) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. 비밀번호 해시화
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(passwordData.newPassword, saltRounds);

      // 2. 비밀번호 업데이트
      const { error: updateError } = await supabase
        .from('student_accounts')
        .update({
          password_hash: hashedPassword,
          login_attempts: 0,
          locked_until: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', verifiedAccount.id);

      if (updateError) {
        throw updateError;
      }

      // 3. 성공
      setStep('success');

    } catch (error) {
      console.error('비밀번호 재설정 오류:', error);
      setError(error.message || '비밀번호 재설정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    router.push(`/public-scores/${token}`);
  };

  // 성공 화면
  if (step === 'success') {
    return (
      <div className="space-y-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <h3 className="text-lg font-semibold text-green-800">
                비밀번호가 성공적으로 재설정되었습니다!
              </h3>
              <p className="text-green-700">
                새로운 비밀번호로 로그인하실 수 있습니다.
              </p>
              <Button 
                onClick={handleGoToLogin}
                className="w-full"
              >
                로그인 페이지로 이동
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 비밀번호 재설정 화면
  if (step === 'reset') {
    return (
      <div className="space-y-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-blue-700">
                <strong>{verifiedAccount?.students?.full_name}</strong> 학생 계정이 확인되었습니다.
              </p>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <Label htmlFor="newPassword">새 비밀번호 *</Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock style={{ width: '16px', height: '16px', color: '#9ca3af', flexShrink: 0 }} />
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="6자 이상의 새 비밀번호"
                value={passwordData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value, 'password')}
                style={{ flex: 1 }}
                required
                minLength={6}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword">비밀번호 확인 *</Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock style={{ width: '16px', height: '16px', color: '#9ca3af', flexShrink: 0 }} />
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호 재입력"
                value={passwordData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value, 'password')}
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
                비밀번호 재설정 중...
              </>
            ) : (
              <>
                <Key className="mr-2 h-4 w-4" />
                비밀번호 재설정
              </>
            )}
          </Button>

          <Button 
            type="button" 
            variant="outline"
            onClick={() => setStep('verify')}
            className="w-full"
          >
            이전 단계로
          </Button>
        </form>
      </div>
    );
  }

  // 검증 화면 (기본)
  return (
    <form onSubmit={handleVerify} className="space-y-4">
      <div>
        <Label htmlFor="username">아이디 *</Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User style={{ width: '16px', height: '16px', color: '#9ca3af', flexShrink: 0 }} />
          <Input
            id="username"
            type="text"
            placeholder="계정 아이디"
            value={verifyData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            style={{ flex: 1 }}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="name">이름 *</Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User style={{ width: '16px', height: '16px', color: '#9ca3af', flexShrink: 0 }} />
          <Input
            id="name"
            type="text"
            placeholder="학원에 등록된 이름"
            value={verifyData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            style={{ flex: 1 }}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="phone">본인 전화번호 *</Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Phone style={{ width: '16px', height: '16px', color: '#9ca3af', flexShrink: 0 }} />
          <Input
            id="phone"
            type="tel"
            placeholder="본인 전화번호"
            value={verifyData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            style={{ flex: 1 }}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="parentPhone">부모님 전화번호 *</Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Phone style={{ width: '16px', height: '16px', color: '#9ca3af', flexShrink: 0 }} />
          <Input
            id="parentPhone"
            type="tel"
            placeholder="부모님 전화번호"
            value={verifyData.parentPhone}
            onChange={(e) => handleInputChange('parentPhone', e.target.value)}
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
            정보 확인 중...
          </>
        ) : (
          <>
            <Key className="mr-2 h-4 w-4" />
            정보 확인
          </>
        )}
      </Button>
    </form>
  );
}