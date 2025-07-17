// components/MediaSection.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

export const MediaSection = ({ formData, handleChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>미디어</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="image_url">대표 이미지 URL</Label>
          <Input
            id="image_url"
            value={formData.image_url}
            onChange={(e) => handleChange('image_url', e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>
        {formData.image_url && (
          <div className="mt-2">
            <img 
              src={formData.image_url} 
              alt="대표 이미지 미리보기" 
              className="w-full h-32 object-cover rounded-md border"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="video_url">소개 동영상 URL</Label>
          <Input
            id="video_url"
            value={formData.video_url}
            onChange={(e) => handleChange('video_url', e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>

        <Button variant="outline" className="w-full" disabled>
          <Upload className="h-4 w-4 mr-2" />
          파일 업로드 (준비 중)
        </Button>
      </CardContent>
    </Card>
  );
};
