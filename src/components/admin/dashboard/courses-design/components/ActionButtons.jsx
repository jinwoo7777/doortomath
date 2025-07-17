// components/ActionButtons.jsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Save } from 'lucide-react';

export const ActionButtons = ({ isSaving, primaryAction, handleSave, handlePreview, formData, editingCourse }) => {
  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={handlePreview} disabled={!editingCourse}>
        <Eye className="h-4 w-4 mr-2" />
        {formData.status === 'published' ? '실제 페이지 보기' : '관리자 미리보기'}
      </Button>
      
      {/* 주요 액션 버튼 */}
      <Button 
        onClick={() => {
          console.log(`🖱️ ${primaryAction.label} 버튼 클릭됨`);
          handleSave(primaryAction.status);
        }} 
        disabled={isSaving}
        className={primaryAction.className}
      >
        <Save className="h-4 w-4 mr-2" />
        {isSaving ? '저장 중...' : primaryAction.label}
      </Button>
    </div>
  );
};
