'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Search, Key, Info } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// 하위 컴포넌트 가져오기
import FindIdTab from './components/FindIdTab';
import ResetPasswordTab from './components/ResetPasswordTab';

export default function FindAccountPage({ params }) {
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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [publicConfig, setPublicConfig] = useState(null);
  const [activeTab, setActiveTab] = useState('find-id');

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
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
                <Search className="h-5 w-5 text-blue-500" />
                <span>계정 찾기</span>
              </CardTitle>
            </div>
            <p className="text-center text-gray-600">
              아이디를 찾거나 비밀번호를 재설정할 수 있습니다.
            </p>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="find-id" className="flex items-center space-x-1">
                  <Search className="h-4 w-4" />
                  <span>아이디 찾기</span>
                </TabsTrigger>
                <TabsTrigger value="reset-password" className="flex items-center space-x-1">
                  <Key className="h-4 w-4" />
                  <span>비밀번호 재설정</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="find-id" className="space-y-4">
                <FindIdTab supabase={supabase} />
              </TabsContent>

              <TabsContent value="reset-password" className="space-y-4">
                <ResetPasswordTab supabase={supabase} token={token} />
              </TabsContent>
            </Tabs>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2 flex items-center space-x-1">
                <Info className="h-4 w-4" />
                <span>안내사항</span>
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 학원에 등록된 정보와 일치해야 계정을 찾을 수 있습니다</li>
                <li>• 아이디 찾기: 이름 + 본인 전화번호</li>
                <li>• 비밀번호 재설정: 아이디 + 이름 + 본인 전화번호 + 부모님 전화번호</li>
                <li>• 정보가 일치하지 않으면 관리자에게 문의해주세요</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}