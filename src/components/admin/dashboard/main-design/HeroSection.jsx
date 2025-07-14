'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HexColorPicker } from 'react-colorful';

export const HeroSection = ({ hero, handleSectionChange, FONT_WEIGHTS }) => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>히어로 섹션</CardTitle>
          <CardDescription>메인 상단에 표시되는 섹션입니다.</CardDescription>
          <img src="/admin_images/hero_section.png" alt="히어로 섹션 미리보기" className="mt-4 rounded-md shadow-sm" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hero-subtitle-up">상단 문구</Label>
              <Textarea
                id="hero-subtitle-up"
                value={hero.subtitleUp || ''}
                onChange={(e) => handleSectionChange('hero', 'subtitleUp', e.target.value)}
              />
              <div className="mt-2">
                <Label>상단 문구 색상</Label>
                <div className="relative flex items-center space-x-2">
                  <div
                    className="w-8 h-8 rounded-full border shadow-md cursor-pointer"
                    style={{ backgroundColor: hero.subtitleUpColor || '#8B5CF6' }}
                    onClick={() => document.getElementById('color-picker-popover').classList.toggle('hidden')}
                  />
                  <Input
                    value={hero.subtitleUpColor || '#8B5CF6'}
                    onChange={(e) => handleSectionChange('hero', 'subtitleUpColor', e.target.value)}
                    className="w-[120px]"
                  />
                  <div id="color-picker-popover" className="absolute z-10 p-2 bg-white border rounded-md shadow-lg hidden top-full mt-2">
                    <HexColorPicker
                      color={hero.subtitleUpColor || '#8B5CF6'}
                      onChange={(color) => handleSectionChange('hero', 'subtitleUpColor', color)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hero-title">제목</Label>
              <Textarea
                id="hero-title"
                value={hero.title || ''}
                onChange={(e) => handleSectionChange('hero', 'title', e.target.value)}
              />
              <div className="mt-2">
                <Label>제목 폰트 두께</Label>
                <Select
                  value={hero.titleFontWeight || 'font-bold'}
                  onValueChange={(value) => {
                    handleSectionChange('hero', 'titleFontWeight', value);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue>
                      <span className={`${hero.titleFontWeight || 'font-bold'}`}>폰트두께 선택</span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_WEIGHTS.map((weight) => (
                      <SelectItem key={weight.value} value={weight.value}>
                        <span className={weight.value}>{weight.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hero-subtitle">부제목</Label>
              <Textarea
                id="hero-subtitle"
                value={hero.subtitle || ''}
                onChange={(e) => handleSectionChange('hero', 'subtitle', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hero-button">버튼 텍스트</Label>
              <Input
                id="hero-button"
                value={hero.buttonText || ''}
                onChange={(e) => handleSectionChange('hero', 'buttonText', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hero-button-link">버튼 링크 (URL)</Label>
              <Input
                id="hero-button-link"
                value={hero.buttonLink || ''}
                onChange={(e) => handleSectionChange('hero', 'buttonLink', e.target.value)}
                placeholder="https://example.com/courses"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hero-bg">배경 이미지 URL</Label>
              <Input
                id="hero-bg"
                value={hero.backgroundImage || ''}
                onChange={(e) => handleSectionChange('hero', 'backgroundImage', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              {hero.backgroundImage ? (
                <div className="mt-2 rounded-md overflow-hidden border">
                  <img src={hero.backgroundImage} alt="배경 이미지 미리보기" className="w-full h-auto object-cover" />
                </div>
              ) : (
                <div className="mt-2 text-sm text-muted-foreground">배경 이미지가 없습니다.</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>동영상 섹션</CardTitle>
          <CardDescription>메인 페이지에 표시될 동영상 URL과 텍스트를 설정합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video-url">동영상 URL (유튜브 링크)</Label>
            <Input
              id="video-url"
              value={hero.videoUrl || ''}
              onChange={(e) => handleSectionChange('video', 'videoUrl', e.target.value)}
              placeholder="https://www.youtube.com/watch?v=your-video-id"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="video-text">동영상 버튼 텍스트</Label>
            <Input
              id="video-text"
              value={hero.videoText || ''}
              onChange={(e) => handleSectionChange('video', 'videoText', e.target.value)}
              placeholder="이달의 온라인 특강!"
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
};
