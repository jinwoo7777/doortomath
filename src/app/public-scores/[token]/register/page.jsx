'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UserPlus, User, Phone, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

export default function StudentRegisterPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  
  // 공개 페이지용 Supabase 클라이언트 (인증 없음)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  );

  const [step, setStep] = useState('verify'); // 'verify' | 'register'
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [publicConfig, setPublicConfig] = useState(null);
  const [verifiedStudent, setVerifiedStudent] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [verifyData, setVerifyData] = useState({
    name: '',
    phone: ''
  });

  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (token) {
      validateToken();
    }
  }, [token]);

  const validateToken = async () => {
    try {
      // 공개 설정 확인
      const { data: publicData, error: publicError } = await supabase
        .from('student_public_scores')
        .select(`
          *,
          students:student_id (
            id,
            full_name,
            phone,
            email,
            grade,
            school,
            status
          )
        `)
        .eq('url_token', token)
        .eq('is_active', true)
        .single();

      if (publicError || !publicData) {
        setError('유효하지 않은 접속 주소입니다.');
        setLoading(false);
        return;
      }

      // 만료일 확인
      if (publicData.expires_at && new Date(publicData.expires_at) < new Date()) {
        setError('접속 기간이 만료되었습니다.');
        setLoading(false);
        return;
      }

      setPublicConfig(publicData);
      setLoading(false);
    } catch (error) {
      console.error('토큰 검증 오류:', error);
      setError('페이지를 불러올 수 없습니다.');
      setLoading(false);
    }
  };

  const handleInputChange = (field, value, type = 'verify') => {
    if (type === 'verify') {
      setVerifyData(prev => ({
        ...prev,
        [field]: value
      }));
    } else {
      setRegisterData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    setError('');
  };

  const handleVerifyStudent = async (e) => {
    e.preventDefault();
    
    if (!verifyData.name.trim() || !verifyData.phone.trim()) {
      setError('이름과 전화번호를 모두 입력해주세요.');
      return;
    }

    setRegistering(true);
    setError('');

    try {
      // 1. 등록된 학원생 정보 확인
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('full_name', verifyData.name.trim())
        .eq('phone', verifyData.phone.trim())
        .eq('status', 'active')
        .single();

      if (studentError || !studentData) {
        throw new Error('등록된 학원생 정보를 찾을 수 없습니다. 이름과 전화번호를 확인해주세요.');
      }

      // 2. 이미 계정이 있는지 확인
      const { data: existingAccount, error: accountCheckError } = await supabase
        .from('student_accounts')
        .select('username')
        .eq('student_id', studentData.id)
        .single();

      if (existingAccount) {
        throw new Error(`이미 계정이 존재합니다. 기존 아이디(${existingAccount.username})로 로그인해주세요.`);
      }

      // 3. 검증 성공
      setVerifiedStudent(studentData);
      setStep('register');
      setSuccess('학원생 정보가 확인되었습니다. 계정을 생성해주세요.');
    } catch (error) {
      console.error('학생 검증 오류:', error);
      setError(error.message || '학생 정보 확인 중 오류가 발생했습니다.');
    } finally {
      setRegistering(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!registerData.username.trim() || !registerData.password.trim() || !registerData.confirmPassword.trim()) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    if (registerData.username.length < 4) {
      setError('아이디는 4자 이상이어야 합니다.');
      return;
    }

    if (registerData.password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setRegistering(true);
    setError('');

    try {
      // 1. 아이디 중복 확인
      const { data: existingUser, error: duplicateError } = await supabase
        .from('student_accounts')
        .select('username')
        .eq('username', registerData.username.trim())
        .single();

      if (existingUser) {
        throw new Error('이미 사용 중인 아이디입니다.');
      }

      // 2. 비밀번호 해시화
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(registerData.password, saltRounds);

      // 3. 계정 생성
      const { data: newAccount, error: createError } = await supabase
        .from('student_accounts')
        .insert([{
          student_id: verifiedStudent.id,
          username: registerData.username.trim(),
          password_hash: hashedPassword,
          is_active: true
        }])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // 4. 회원가입 성공
      setSuccess('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
      
      setTimeout(() => {
        router.push(`/public-scores/${token}`);
      }, 2000);

    } catch (error) {
      console.error('회원가입 오류:', error);
      setError(error.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">페이지를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error && !publicConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">접속 불가</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-4">{error}</p>
            <Button 
              onClick={() => router.push('/')}
              className="w-full"
            >
              홈으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/public-scores/${token}`)}
                className="p-1"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-xl font-semibold flex items-center space-x-2">
                <UserPlus className="h-5 w-5 text-green-500" />
                <span>학생 회원가입</span>
              </CardTitle>
            </div>
            <p className="text-center text-gray-600">
              {step === 'verify' ? 
                '먼저 등록된 학원생 정보를 확인합니다.' : 
                '계정 정보를 설정해주세요.'
              }
            </p>
          </CardHeader>
          <CardContent>
            {success && (
              <Alert className="border-green-200 bg-green-50 mb-4">
                <AlertDescription className="text-green-700">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            {step === 'verify' ? (
              // 학생 정보 확인 단계
              <form onSubmit={handleVerifyStudent} className="space-y-4">
                <div>
                  <Label htmlFor="name">이름 *</Label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User style={{ width: '16px', height: '16px', color: '#9ca3af', flexShrink: 0 }} />
                    <Input
                      id="name"
                      type="text"
                      placeholder="학원에 등록된 이름"
                      value={verifyData.name}
                      onChange={(e) => handleInputChange('name', e.target.value, 'verify')}
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
                      placeholder="학원에 등록된 전화번호"
                      value={verifyData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value, 'verify')}
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
                  disabled={registering}
                  className="w-full"
                >
                  {registering ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      확인 중...
                    </>
                  ) : (
                    '학원생 정보 확인'
                  )}
                </Button>
              </form>
            ) : (
              // 계정 생성 단계
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="p-3 bg-green-50 rounded-lg mb-4">
                  <p className="text-sm text-green-700">
                    <strong>{verifiedStudent?.full_name}</strong> 학원생으로 확인되었습니다.
                  </p>
                </div>

                <div>
                  <Label htmlFor="username">아이디 *</Label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User style={{ width: '16px', height: '16px', color: '#9ca3af', flexShrink: 0 }} />
                    <Input
                      id="username"
                      type="text"
                      placeholder="4자 이상의 아이디"
                      value={registerData.username}
                      onChange={(e) => handleInputChange('username', e.target.value, 'register')}
                      style={{ flex: 1 }}
                      required
                      minLength={4}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">비밀번호 *</Label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Lock style={{ width: '16px', height: '16px', color: '#9ca3af', flexShrink: 0 }} />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="6자 이상의 비밀번호"
                      value={registerData.password}
                      onChange={(e) => handleInputChange('password', e.target.value, 'register')}
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
                      value={registerData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value, 'register')}
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
                  disabled={registering}
                  className="w-full"
                >
                  {registering ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      회원가입 중...
                    </>
                  ) : (
                    '회원가입 완료'
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
            )}

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">📋 회원가입 안내</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 학원에 등록된 학생만 회원가입이 가능합니다</li>
                <li>• 한 학생당 하나의 계정만 생성할 수 있습니다</li>
                <li>• 아이디는 4자 이상, 비밀번호는 6자 이상이어야 합니다</li>
                <li>• 계정 생성 후 바로 로그인하여 성적을 확인하실 수 있습니다</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}