// components/PublishSettings.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const PublishSettings = ({ formData, handleChange, primaryAction }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>발행 설정</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="status">게시 상태</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value) => {
              console.log('📋 상태 변경:', formData.status, '→', value);
              handleChange('status', value);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">
                <div className="flex flex-col">
                  <span className="font-medium">초안</span>
                  <span className="text-xs text-muted-foreground">작성 중인 학원 정보 (공개되지 않음)</span>
                </div>
              </SelectItem>
              <SelectItem value="published">
                <div className="flex flex-col">
                  <span className="font-medium">발행됨</span>
                  <span className="text-xs text-muted-foreground">공개된 학원 정보 (모든 사용자가 볼 수 있음)</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            💡 팁: 상태를 선택하면 상단의 버튼이 <strong>{primaryAction.label}</strong>로 바뀝니다.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="featured"
            checked={formData.featured}
            onCheckedChange={(checked) => handleChange('featured', checked)}
          />
          <Label htmlFor="featured">추천 학원 프로그램</Label>
        </div>
      </CardContent>
    </Card>
  );
};
