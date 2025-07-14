'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';

export const AboutSection = ({ about, handleSectionChange }) => {
  return (
    <>
 



      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {/* 학원 소개 이미지 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>학원 소개 이미지</CardTitle>
            <CardDescription>학원 소개 섹션에 사용될 이미지들을 관리합니다.</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <img src="/admin_images/about_section.png" alt="학원 소개 섹션 미리보기" className="mt-4 rounded-md shadow-sm w-full h-full object-cover" />
          </CardContent>
        </Card>

        {/* 학원 소개 섹션 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>학원 소개 섹션</CardTitle>
            <CardDescription>회사 소개를 작성하는 섹션입니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>제목</Label>
              <Textarea
                className="min-h-[100px]"
                value={about.title || ''}
                onChange={(e) => handleSectionChange('about', 'title', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>내용</Label>
              <Textarea
                className="min-h-[150px]"
                value={about.content || ''}
                onChange={(e) => handleSectionChange('about', 'content', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 이미지 URL 입력 및 미리보기 섹션 */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>이미지 URL 관리</CardTitle>
          <CardDescription>학원 소개 섹션에 사용될 이미지들의 URL을 입력하고 미리봅니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 w-full">
            <Label>이미지 1 URL</Label>
            <Input
              value={about.image1 || ''}
              onChange={(e) => handleSectionChange('about', 'image1', e.target.value)}
            />
            {about.image1 && (
              <div className="mt-2 p-2 border rounded-md flex items-center justify-center bg-gray-50 h-40">
                <img
                  src={about.image1}
                  alt="Image 1 Preview"
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => { e.target.src = '/placeholder-image.svg'; }}
                />
              </div>
            )}
          </div>

          <div className="space-y-2 w-full">
            <Label>이미지 2 URL</Label>
            <Input
              value={about.image2 || ''}
              onChange={(e) => handleSectionChange('about', 'image2', e.target.value)}
            />
            {about.image2 && (
              <div className="mt-2 p-2 border rounded-md flex items-center justify-center bg-gray-50 h-40">
                <img
                  src={about.image2}
                  alt="Image 2 Preview"
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => { e.target.src = '/placeholder-image.svg'; }}
                />
              </div>
            )}
          </div>

          <div className="space-y-2 w-full">
            <Label>이미지 3 URL</Label>
            <Input
              value={about.image3 || ''}
              onChange={(e) => handleSectionChange('about', 'image3', e.target.value)}
            />
            {about.image3 && (
              <div className="mt-2 p-2 border rounded-md flex items-center justify-center bg-gray-50 h-40">
                <img
                  src={about.image3}
                  alt="Image 3 Preview"
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => { e.target.src = '/placeholder-image.svg'; }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 학원 소개 특징 섹션 */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>학원 소개 특징 관리</CardTitle>
          <CardDescription>학원 소개 섹션에 표시될 특징들을 추가, 수정, 삭제합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {about.features.map((feature, index) => (
            <Card key={feature.id || index} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="md:col-span-1 flex items-center justify-center p-2 border rounded-md bg-gray-50 h-24 w-24 mx-auto">
                  {feature.icon ? (
                    <img
                      src={feature.icon}
                      alt="Icon Preview"
                      className="w-12 h-12 object-contain"
                      onError={(e) => { e.target.src = '/placeholder-icon.svg'; }}
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">아이콘 미리보기</span>
                  )}
                </div>
                <div className="md:col-span-3 space-y-2">
                  <div className="space-y-2">
                    <Label htmlFor={`feature-icon-${index}`}>아이콘 URL</Label>
                    <Input
                      id={`feature-icon-${index}`}
                      value={feature.icon || ''}
                      onChange={(e) => handleSectionChange('about', `features.${index}.icon`, e.target.value)}
                      placeholder="아이콘 이미지 URL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`feature-title-${index}`}>제목</Label>
                    <Input
                      id={`feature-title-${index}`}
                      value={feature.title || ''}
                      onChange={(e) => handleSectionChange('about', `features.${index}.title`, e.target.value)}
                      placeholder="특징 제목"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`feature-description-${index}`}>설명</Label>
                    <Textarea
                      id={`feature-description-${index}`}
                      value={feature.description || ''}
                      onChange={(e) => handleSectionChange('about', `features.${index}.description`, e.target.value)}
                      placeholder="특징 설명"
                      className="min-h-[60px]"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="mt-4 ml-auto h-7 px-2.5"
                    onClick={() => {
                      const updatedFeatures = about.features.filter((_, i) => i !== index);
                      handleSectionChange('about', 'features', updatedFeatures);
                    }}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" /> 특징 삭제
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          <Button
            onClick={() => {
              const newFeature = { id: Date.now(), icon: '', title: '', description: '' };
              handleSectionChange('about', 'features', [...about.features, newFeature]);
            }}
            className="w-full"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> 새 특징 추가
          </Button>
        </CardContent>
      </Card>


    </>
  );
};
