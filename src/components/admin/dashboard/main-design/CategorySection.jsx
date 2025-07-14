'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, PlusCircle } from 'lucide-react';

export function CategorySection({
  categories,
  handleCategoryChange,
  addCategory,
  removeCategory,
}) {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>카테고리 관리</CardTitle>
        <CardDescription>
          메인 페이지의 카테고리 데이터를 관리합니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((category) => (
          <Card key={category.id} className="p-4 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`categoryTitle-${category.id}`}>제목</Label>
                <Input
                  id={`categoryTitle-${category.id}`}
                  value={category.title || ''}
                  onChange={(e) => handleCategoryChange(category.id, 'title', e.target.value)}
                  placeholder="카테고리 제목"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`categoryIcon-${category.id}`}>아이콘 (URL)</Label>
                <Input
                  id={`categoryIcon-${category.id}`}
                  value={category.icon || ''}
                  onChange={(e) => handleCategoryChange(category.id, 'icon', e.target.value)}
                  placeholder="아이콘 이미지 URL"
                />
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="mt-4 ml-auto h-7 px-2.5"
              onClick={() => removeCategory(category.id)}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> 카테고리 삭제
            </Button>
          </Card>
        ))}
        </div>
        <Button onClick={addCategory} className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" /> 새 카테고리 추가
        </Button>
      </CardContent>
    </Card>
  );
}
