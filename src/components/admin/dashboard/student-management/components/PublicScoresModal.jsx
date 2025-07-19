'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  Lock, 
  Copy, 
  Check, 
  ExternalLink,
  Calendar,
  Eye,
  EyeOff,
  Info
} from 'lucide-react';
import { supabase } from '@/lib/supabase/supabaseClientBrowser';

/**
 * 학생 성적 공개 설정 모달 컴포넌트
 */
export default function PublicScoresModal({ student, isOpen, onClose, studentData, onSettingsUpdate }) {
  const [isPublic, setIsPublic] = useState(false);
  const [publicUrl, setPublicUrl] = useState('');
  const [accessCount, setAccessCount] = useState(0);
  const [todayAccessCount, setTodayAccessCount] = useState(0);
  const [lastAccessedAt, setLastAccessedAt] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // 컴포넌트 마운트 시 기존 공개 설정 확인
  useEffect(() => {
    if (student && isOpen) {
      fetchPublicSettings();
    }
  }, [student, isOpen]);

  const fetchPublicSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('student_public_scores')
        .select('*')
        .eq('student_id', student.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116은 레코드가 없을 때의 에러코드
        throw error;
      }

      if (data) {
        setIsPublic(data.is_active);
        setPublicUrl(data.public_url);
        setAccessCount(data.access_count || 0);
        setTodayAccessCount(data.today_access_count || 0);
        setLastAccessedAt(data.last_accessed_at || '');
        setExpiryDate(data.expires_at ? data.expires_at.split('T')[0] : '');
        
        // 오늘 날짜가 다르면 today_access_count 리셋 체크
        if (data.last_access_date && data.last_access_date !== new Date().toISOString().split('T')[0]) {
          setTodayAccessCount(0);
        }
      } else {
        // 기본값 설정
        const defaultExpiryDate = new Date();
        defaultExpiryDate.setMonth(defaultExpiryDate.getMonth() + 3); // 3개월 후
        setExpiryDate(defaultExpiryDate.toISOString().split('T')[0]);
      }
    } catch (error) {
      console.error('공개 설정 조회 오류:', error);
      setError('설정을 불러올 수 없습니다.');
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '접속 기록 없음';
    const date = new Date(dateTimeString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const generatePublicUrl = () => {
    const token = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    return `${origin}/public-scores/${token}`;
  };

  const handleTogglePublic = async () => {
    if (!isPublic && !publicUrl) {
      // 처음 공개할 때 URL 생성
      const newUrl = generatePublicUrl();
      setPublicUrl(newUrl);
    }
    setIsPublic(!isPublic);
  };

  const handleSave = async () => {
    if (!student) return;

    setLoading(true);
    setError('');

    try {
      const token = publicUrl.split('/').pop();
      const publicData = {
        student_id: student.id,
        public_url: publicUrl,
        url_token: token,
        is_active: isPublic,
        expires_at: expiryDate ? new Date(expiryDate).toISOString() : null,
        access_count: accessCount,
        today_access_count: todayAccessCount,
        last_accessed_at: lastAccessedAt || null,
        updated_at: new Date().toISOString()
      };

      // 기존 레코드 확인
      const { data: existing } = await supabase
        .from('student_public_scores')
        .select('id')
        .eq('student_id', student.id)
        .single();

      if (existing) {
        // 업데이트
        const { error } = await supabase
          .from('student_public_scores')
          .update(publicData)
          .eq('student_id', student.id);

        if (error) throw error;
      } else {
        // 신규 생성
        const { error } = await supabase
          .from('student_public_scores')
          .insert([publicData]);

        if (error) throw error;
      }

      // 상위 컴포넌트에 설정 업데이트 알림
      if (onSettingsUpdate) {
        onSettingsUpdate({
          isPublic,
          publicUrl,
          accessCount,
          todayAccessCount,
          lastAccessedAt,
          expiryDate
        });
      }

      onClose();
    } catch (error) {
      console.error('설정 저장 오류:', error);
      setError('설정을 저장할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('URL 복사 오류:', error);
    }
  };

  const handleOpenUrl = () => {
    if (publicUrl) {
      window.open(publicUrl, '_blank');
    }
  };

  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-blue-500" />
            <span>{student.full_name} 학생 성적 공개 설정</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* 공개 설정 스위치 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                {isPublic ? (
                  <Eye className="h-4 w-4 text-green-500" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                )}
                <span>성적 공개 설정</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="public-toggle">성적 정보 공개</Label>
                  <p className="text-sm text-gray-500">
                    학생과 학부모가 웹에서 성적을 조회할 수 있도록 설정합니다.
                  </p>
                </div>
                <Switch
                  id="public-toggle"
                  checked={isPublic}
                  onCheckedChange={handleTogglePublic}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Badge variant={isPublic ? "default" : "secondary"}>
                    {isPublic ? (
                      <>
                        <Globe className="h-3 w-3 mr-1" />
                        공개됨
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3 mr-1" />
                        비공개
                      </>
                    )}
                  </Badge>
                </div>

                {/* 접속 통계 */}
                {isPublic && (
                  <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{todayAccessCount}</div>
                      <div className="text-sm text-gray-600">오늘 접속</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{accessCount}</div>
                      <div className="text-sm text-gray-600">총 접속</div>
                    </div>
                    {lastAccessedAt && (
                      <div className="col-span-2 text-center pt-2 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                          최근 접속: {formatDateTime(lastAccessedAt)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* URL 정보 (공개 설정 시에만 표시) */}
          {isPublic && publicUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <ExternalLink className="h-4 w-4 text-blue-500" />
                  <span>공개 URL</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>학생/학부모 접속 주소</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={publicUrl}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyUrl}
                      title="URL 복사"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleOpenUrl}
                      title="새 창에서 열기"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    이 URL을 학생이나 학부모에게 공유하면, 이름과 전화번호 입력 후 성적을 확인할 수 있습니다.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* 만료일 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-orange-500" />
                <span>접속 만료일</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="expiry-date">만료일 설정</Label>
                <Input
                  id="expiry-date"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-sm text-gray-500">
                  설정한 날짜 이후에는 공개 URL로 접속할 수 없습니다.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 에러 메시지 */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* 버튼 그룹 - 하단 고정 */}
        <div className="flex-shrink-0 flex justify-end space-x-2 pt-4 border-t bg-white">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? '저장 중...' : '설정 저장'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}