'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

import { AppSidebar } from "@/components/admin/shadcn-dashborard/app-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoadingSpinner, InlineSpinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Save, Image as ImageIcon, PlusCircle, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

// 데이터 및 API 함수 가져오기
import { DEFAULT_TEAM_DESCRIPTION, fetchTeamDescriptionData, saveTeamDescriptionData } from './mockData.js';

// 이미지 미리보기 컴포넌트
const ImagePreview = ({ src, alt, className = "w-full h-32" }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    setImageError(false);
    setImageLoading(true);
  }, [src]);

  if (!src || imageError) {
    return (
      <div className={`${className} bg-muted rounded border-2 border-dashed border-muted-foreground/20 flex items-center justify-center`}>
        <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
        <span className="ml-2 text-sm text-muted-foreground">이미지 없음</span>
      </div>
    );
  }

  return (
    <div className={`${className} bg-muted rounded border overflow-hidden flex items-center justify-center relative`}>
      {imageLoading && (
        <div className="absolute inset-0 bg-muted/50 flex items-center justify-center">
          <InlineSpinner size="md" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
      />
    </div>
  );
};

export default function Page() {
  const router = useRouter();
  const { updateAuthState } = useAuth();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [teamDescription, setTeamDescription] = useState(DEFAULT_TEAM_DESCRIPTION);
  const [isDirty, setIsDirty] = useState(false);
  
  // 데이터 로드 함수
  const loadTeamDescriptionData = useCallback(async () => {
    setIsPageLoading(true);
    try {
      const data = await fetchTeamDescriptionData();
      
      if (data) {
        setTeamDescription(prev => ({
          ...DEFAULT_TEAM_DESCRIPTION,
          ...data,
          teamMembers: data.teamMembers || DEFAULT_TEAM_DESCRIPTION.teamMembers
        }));
      } else {
        setTeamDescription(DEFAULT_TEAM_DESCRIPTION);
      }
      setIsDirty(false);
    } catch (error) {
      console.error('팀 소개 데이터 로드 중 오류 발생:', error);
      toast.error('팀 소개 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsPageLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadTeamDescriptionData();
  }, [loadTeamDescriptionData]);

  // 기본 정보 변경 핸들러
  const handleBasicInfoChange = (field, value) => {
    setTeamDescription(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
  };

  // 팀 멤버 변경 핸들러
  const handleTeamMemberChange = (index, field, value) => {
    setTeamDescription(prev => {
      const updatedMembers = [...prev.teamMembers];
      updatedMembers[index] = {
        ...updatedMembers[index],
        [field]: field === 'students' || field === 'courses' ? parseInt(value) || 0 : value
      };
      return {
        ...prev,
        teamMembers: updatedMembers
      };
    });
    setIsDirty(true);
  };

  // 팀 멤버 추가 핸들러
  const handleAddTeamMember = () => {
    const newMember = {
      id: Date.now(),
      name: '',
      designation: '',
      image: '',
      students: 0,
      courses: 0
    };
    setTeamDescription(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, newMember]
    }));
    setIsDirty(true);
  };

  // 팀 멤버 삭제 핸들러
  const handleRemoveTeamMember = (index) => {
    setTeamDescription(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index)
    }));
    setIsDirty(true);
  };

  // 저장 함수
  const handleSave = async () => {
    if (isSaving || !isDirty) return;
    
    setIsSaving(true);
    
    try {
      const savedData = await saveTeamDescriptionData(teamDescription);
      
      if (savedData && savedData.content) {
        setTeamDescription(prev => ({
          ...prev,
          ...savedData.content
        }));
      }
      
      setIsDirty(false);
      toast.success('팀 소개 정보가 성공적으로 저장되었습니다.');
      updateAuthState({ lastActivity: new Date().toISOString() });
    } catch (error) {
      console.error('저장 중 오류 발생:', error);
      toast.error(error.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 초기화 핸들러
  const handleReset = () => {
    if (confirm('변경사항을 취소하고 마지막으로 저장된 상태로 되돌리시겠습니까?')) {
      loadTeamDescriptionData();
    }
  };

  // 로딩 상태 렌더링
  if (isPageLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="xl" text="팀 소개 데이터를 불러오는 중..." />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          <div className="border-b pb-4">
            <h1 className="text-3xl font-bold">팀 소개 관리</h1>
            <p className="text-muted-foreground">메인 페이지의 팀 소개 섹션을 관리합니다.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 팀 섹션 예시 이미지 카드 */}
            <Card className="bg-muted/50 rounded-xl">
              <CardHeader>
                <CardTitle>팀 섹션 예시</CardTitle>
                <CardDescription>메인 페이지에 표시되는 팀 섹션 예시입니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full pt-[50%] rounded-lg overflow-hidden">
                  <img 
                    src="/admin_images/team-description.png" 
                    alt="팀 섹션 미리보기" 
                    className="absolute top-0 left-0 w-full h-full object-cover rounded-md shadow-sm"
                  />
                </div>
              </CardContent>
            </Card>
            <div></div>

            {/* 기본 정보 편집 카드 */}
            <Card className="bg-muted/50 rounded-xl">
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
                <CardDescription>팀 섹션의 좌측 콘텐츠를 설정하세요.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>부제목</Label>
                  <Input
                    value={teamDescription.subtitle || ''}
                    onChange={(e) => handleBasicInfoChange('subtitle', e.target.value)}
                    placeholder="수학의 문을 열어드리는 전문 강사진"
                  />
                </div>
                <div className="space-y-2">
                  <Label>제목</Label>
                  <Textarea
                    value={teamDescription.title || ''}
                    onChange={(e) => handleBasicInfoChange('title', e.target.value)}
                    placeholder="10년 차 이상 수학 전문가가..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>설명</Label>
                  <Textarea
                    value={teamDescription.description || ''}
                    onChange={(e) => handleBasicInfoChange('description', e.target.value)}
                    placeholder="팀에 대한 상세 설명을 입력하세요"
                    rows={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label>버튼 텍스트</Label>
                  <Input
                    value={teamDescription.buttonText || ''}
                    onChange={(e) => handleBasicInfoChange('buttonText', e.target.value)}
                    placeholder="전체 강사 프로필 보기"
                  />
                </div>
                <div className="space-y-2">
                  <Label>버튼 링크</Label>
                  <Input
                    value={teamDescription.buttonLink || ''}
                    onChange={(e) => handleBasicInfoChange('buttonLink', e.target.value)}
                    placeholder="/team-members"
                  />
                </div>
              </CardContent>
            </Card>
            <div></div>

            {/* 팀 멤버 관리 카드 */}
            <Card className="bg-muted/50 rounded-xl col-span-1">
              <CardHeader>
                <CardTitle>팀 멤버 관리</CardTitle>
                <CardDescription>팀 멤버를 추가, 수정, 삭제할 수 있습니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {teamDescription.teamMembers.map((member, index) => (
                    <Card key={member.id || index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold">팀 멤버 {index + 1}</h3>
                        <button
                          type="button"
                          className="ml-1 p-0 bg-transparent border-none cursor-pointer hover:text-red-500 transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveTeamMember(index);
                          }}
                          aria-label="팀 멤버 삭제"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        {/* 이미지 */}
                        <div className="space-y-2">
                          <Label>프로필 이미지</Label>
                          <ImagePreview 
                            src={member.image} 
                            alt={`${member.name} 프로필`} 
                            className="w-full h-48"
                          />
                          <Input
                            value={member.image || ''}
                            onChange={(e) => handleTeamMemberChange(index, 'image', e.target.value)}
                            placeholder="/home_3/team_member_1.jpg"
                          />
                        </div>

                        {/* 이름 */}
                        <div className="space-y-2">
                          <Label>이름</Label>
                          <Input
                            value={member.name || ''}
                            onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                            placeholder="박 진우"
                          />
                        </div>

                        {/* 직책 */}
                        <div className="space-y-2">
                          <Label>직책</Label>
                          <Input
                            value={member.designation || ''}
                            onChange={(e) => handleTeamMemberChange(index, 'designation', e.target.value)}
                            placeholder="20년 운영 원장직강"
                          />
                        </div>

                        {/* 학생 수와 코스 수 */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>학생 수</Label>
                            <Input
                              type="number"
                              value={member.students || 0}
                              onChange={(e) => handleTeamMemberChange(index, 'students', e.target.value)}
                              placeholder="20"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>코스 수</Label>
                            <Input
                              type="number"
                              value={member.courses || 0}
                              onChange={(e) => handleTeamMemberChange(index, 'courses', e.target.value)}
                              placeholder="2"
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={handleAddTeamMember}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    새 팀 멤버 추가
                  </Button>

                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleReset}
                      disabled={!isDirty || isSaving}
                    >
                      취소
                    </Button>
                    <Button 
                      size="sm"
                      onClick={handleSave} 
                      disabled={!isDirty || isSaving}
                      className="flex items-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <InlineSpinner />
                          저장 중...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          변경사항 저장
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
