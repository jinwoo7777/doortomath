// components/AchievementsSection.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Award } from 'lucide-react';

export const AchievementsSection = ({ formData, handleChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          성과 및 관리 시스템
        </CardTitle>
        <p className="text-sm text-muted-foreground">학원의 교육 성과와 학생 관리 시스템을 소개하세요</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="certificate_available"
            checked={formData.certificate_available}
            onCheckedChange={(checked) => handleChange('certificate_available', checked)}
          />
          <Label htmlFor="certificate_available">수료증 발급</Label>
        </div>

        {formData.certificate_available && (
          <div className="space-y-2">
            <Label htmlFor="certificate_requirements">수료 조건</Label>
            <Textarea
              id="certificate_requirements"
              value={formData.certificate_requirements}
              onChange={(e) => handleChange('certificate_requirements', e.target.value)}
              placeholder="예: 80% 이상 출석, 월 평균 80점 이상, 최종 평가 통과..."
              rows={3}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
