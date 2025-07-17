// components/CategoryTagsSection.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const CategoryTagsSection = ({ 
  formData, 
  categories, 
  tagInput, 
  setTagInput, 
  handleChange, 
  addTag, 
  removeTag, 
  handleTagKeyPress 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>카테고리 및 태그</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="category">카테고리</Label>
          <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))
              ) : (
                <>
                  <SelectItem value="학습분석">학습분석</SelectItem>
                  <SelectItem value="시험대비">시험대비</SelectItem>
                  <SelectItem value="내신,모의 기출분석">내신,모의 기출분석</SelectItem>
                  <SelectItem value="선행수업">선행수업</SelectItem>
                  <SelectItem value="개별오답관리">개별오답관리</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>태그</Label>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleTagKeyPress}
              placeholder="태그 입력 후 Enter"
            />
            <Button type="button" onClick={addTag} variant="outline">
              추가
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                <span>{tag}</span>
                <button
                  type="button"
                  className="ml-1 p-0 bg-transparent border-none cursor-pointer hover:text-red-500 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeTag(tag);
                  }}
                  aria-label={`${tag} 태그 삭제`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
