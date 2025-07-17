// components/CourseInfoSection.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Users, Clock, Calendar } from 'lucide-react';

export const CourseInfoSection = ({ formData, handleChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          학원 수업 정보
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="seats">정원</Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="seats"
                type="number"
                value={formData.seats}
                onChange={(e) => handleChange('seats', parseInt(e.target.value) || 0)}
                className="pl-10"
                min="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weeks">기간(주)</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="weeks"
                type="number"
                value={formData.weeks}
                onChange={(e) => handleChange('weeks', parseInt(e.target.value) || 0)}
                className="pl-10"
                min="1"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="semesters">학기</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="semesters"
                type="number"
                value={formData.semesters}
                onChange={(e) => handleChange('semesters', parseInt(e.target.value) || 0)}
                className="pl-10"
                min="1"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
