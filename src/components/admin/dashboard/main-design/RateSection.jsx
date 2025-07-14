'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, MinusCircle } from 'lucide-react';

export const RateSection = ({ rate, handleSectionChange, handleRateItemChange, addRateItem, removeRateItem }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>입학 현황 섹션</CardTitle>
        <CardDescription>메인 페이지에 표시될 입학 현황 텍스트와 항목들을 설정합니다.</CardDescription>
        <img src="/admin_images/rate_section.png" alt="입학 현황 섹션 미리보기" className="mt-4 rounded-md shadow-sm" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <Label htmlFor="rate-heading">섹션 제목</Label>
          <Input
            id="rate-heading"
            value={rate.heading || ''}
            onChange={(e) => handleSectionChange('rate', 'heading', e.target.value)}
            placeholder="2025년 수학의문 | 명문대 입학현황"
          />
        </div>

        <h3 className="text-lg font-semibold mt-6">입학 현황 항목</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rate.items && rate.items.map((item, index) => (
            <Card key={item.id} className="p-4 space-y-1 border">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">항목 {index + 1}</h4>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeRateItem(item.id)}
                >
                  <MinusCircle className="h-4 w-4 mr-2" />
                  항목 삭제
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`rate-item-title-${index}`}>제목</Label>
                <Input
                  id={`rate-item-title-${index}`}
                  value={item.title || ''}
                  onChange={(e) => handleRateItemChange(index, 'title', e.target.value)}
                  placeholder="고려대 경영학과 5명"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`rate-item-image-${index}`}>이미지</Label>
                <div className="flex flex-row gap-4 mt-2">
                  {[ 
                    "/home_2/university_korea.png",
                    "/home_2/university_seoul.png",
                    "/home_2/university_yensei.png",
                    "/home_2/university_KAIST.png",
                  ].map((imagePath, imageIndex) => (
                    <div key={imageIndex} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`image-${item.id}-${imageIndex}`}
                        name={`image-${item.id}`}
                        value={imagePath}
                        checked={item.image === imagePath}
                        onChange={() =>
                          handleRateItemChange(index, "image", imagePath)
                        }
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <label htmlFor={`image-${item.id}-${imageIndex}`}>
                        <img src={imagePath} alt={`Option ${imageIndex + 1}`} className="w-12 h-12 object-cover rounded" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`rate-item-description-${index}`}>설명</Label>
                <Textarea
                  id={`rate-item-description-${index}`}
                  value={item.description || ''}
                  onChange={(e) => handleRateItemChange(index, 'description', e.target.value)}
                  placeholder="Solid Questions Solving & Fresh Topics"
                />
              </div>

            </Card>
          ))}
        </div>
        <Button onClick={addRateItem} className="w-full">
          <PlusCircle className="h-4 w-4 mr-2" />
          새 항목 추가
        </Button>
      </CardContent>
    </Card>
  );
};
