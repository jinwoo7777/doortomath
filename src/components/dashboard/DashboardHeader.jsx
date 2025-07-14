"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, Lock, User, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/client';

const supabaseClient = createClient();

// 학년 정보 매핑
const gradeMapping = {
  'kindergarten': '유치원',
  'elementary_1': '초등 1학년',
  'elementary_2': '초등 2학년',
  'elementary_3': '초등 3학년',
  'elementary_4': '초등 4학년',
  'elementary_5': '초등 5학년',
  'elementary_6': '초등 6학년',
  'middle_1': '중학 1학년',
  'middle_2': '중학 2학년',
  'middle_3': '중학 3학년',
  'high_1': '고등 1학년',
  'high_2': '고등 2학년',
  'high_3': '고등 3학년',
  'adult': '성인',
  'other': '기타'
};

import { useAuth } from '@/hooks/useAuth';

const DashboardHeader = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    school: '',
    grade: '',
    parent_name: '',
    parent_phone: '',
    address: '',
    notes: ''
  });

  // 프로필 데이터 가져오기
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // 프로필이 없는 경우 기본값 설정
          setProfile({
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
            phone: '',
            school: '',
            grade: '',
            parent_name: '',
            parent_phone: '',
            address: '',
            notes: ''
          });
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('프로필 로드 오류:', err);
      setError('프로필을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        school: profile.school || '',
        grade: profile.grade || '',
        parent_name: profile.parent_name || '',
        parent_phone: profile.parent_phone || '',
        address: profile.address || '',
        notes: profile.notes || ''
      });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabaseClient
        .from('profiles')
        .upsert({
          id: user.id,
          ...formData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      await loadProfile();
      setIsEditing(false);
      toast.success('프로필이 성공적으로 업데이트되었습니다.');
    } catch (err) {
      console.error('프로필 저장 오류:', err);
      toast.error('프로필 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: '',
      phone: '',
      school: '',
      grade: '',
      parent_name: '',
      parent_phone: '',
      address: '',
      notes: ''
    });
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">프로필 정보</CardTitle>
              <p className="text-sm text-muted-foreground">
                개인 정보를 관리하고 수정할 수 있습니다.
              </p>
            </div>
          </div>
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleEdit}>
                수정
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>프로필 수정</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">이름 *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="이름을 입력하세요"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">연락처</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="연락처를 입력하세요"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="school">학교</Label>
                    <Input
                      id="school"
                      value={formData.school}
                      onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                      placeholder="학교명을 입력하세요"
                    />
                  </div>
                  <div>
                    <Label htmlFor="grade">학년</Label>
                    <Select value={formData.grade} onValueChange={(value) => setFormData({ ...formData, grade: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="학년을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(gradeMapping).map(([key, value]) => (
                          <SelectItem key={key} value={key}>{value}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="parent_name">보호자 이름</Label>
                    <Input
                      id="parent_name"
                      value={formData.parent_name}
                      onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                      placeholder="보호자 이름을 입력하세요"
                    />
                  </div>
                  <div>
                    <Label htmlFor="parent_phone">보호자 연락처</Label>
                    <Input
                      id="parent_phone"
                      value={formData.parent_phone}
                      onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                      placeholder="보호자 연락처를 입력하세요"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">주소</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="주소를 입력하세요"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">특이사항</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="특이사항이 있으면 입력하세요"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  취소
                </Button>
                <Button onClick={handleSave}>
                  저장
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* 기본 정보 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">이름</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {profile?.name || '정보 없음'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">이메일</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {user?.email || '정보 없음'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">연락처</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {profile?.phone || '정보 없음'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">학교</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {profile?.school || '정보 없음'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">학년</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {profile?.grade ? gradeMapping[profile.grade] || profile.grade : '정보 없음'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">가입일</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '정보 없음'}
              </p>
            </div>
          </div>

          <Separator />

          {/* 보호자 정보 */}
          <div>
            <Label className="text-sm font-medium mb-2 block">보호자 정보</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">보호자 이름</Label>
                <p className="text-sm mt-1">
                  {profile?.parent_name || '정보 없음'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">보호자 연락처</Label>
                <p className="text-sm mt-1">
                  {profile?.parent_phone || '정보 없음'}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* 주소 */}
          <div>
            <Label className="text-sm font-medium">주소</Label>
            <p className="text-sm text-muted-foreground mt-1">
              {profile?.address || '정보 없음'}
            </p>
          </div>

          {/* 특이사항 */}
          {profile?.notes && (
            <div>
              <Label className="text-sm font-medium">특이사항</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {profile.notes}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardHeader;
