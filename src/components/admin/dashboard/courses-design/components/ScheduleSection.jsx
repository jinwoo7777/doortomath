// components/ScheduleSection.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ListEditor } from './ListEditor';

export const ScheduleSection = ({ formData, handleChange, addListItem, removeListItem }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          수업 시간
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="schedule_type">수업 방식</Label>
          <Select value={formData.schedule_type} onValueChange={(value) => handleChange('schedule_type', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flexible">시간 조정 가능</SelectItem>
              <SelectItem value="fixed">고정 시간</SelectItem>
              <SelectItem value="self_paced">개별 진도</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_date">개강일</Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => handleChange('start_date', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date">종강일</Label>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => handleChange('end_date', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="enrollment_deadline">등록 마감일</Label>
            <Input
              id="enrollment_deadline"
              type="date"
              value={formData.enrollment_deadline}
              onChange={(e) => handleChange('enrollment_deadline', e.target.value)}
            />
          </div>
        </div>

        <ListEditor
          title="수업 시간표"
          items={formData.class_schedule}
          onAdd={(value) => addListItem('class_schedule', value)}
          onRemove={(index) => removeListItem('class_schedule', index)}
          placeholder="예: 매주 월/수/금 19:00-21:00, 토요일 14:00-18:00"
        />
      </CardContent>
    </Card>
  );
};
