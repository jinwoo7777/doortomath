// components/StatusBanner.jsx
import React from 'react';

export const StatusBanner = ({ formData, primaryAction }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center gap-4">
        <div className="text-sm text-blue-700">
          <strong>현재 상태:</strong>
          <span className="ml-2 px-3 py-1 rounded-full text-xs font-medium">
            {formData.status === 'draft' && (
              <span className="bg-gray-200 text-gray-800">📝 초안</span>
            )}
            {formData.status === 'published' && (
              <span className="bg-green-200 text-green-800">✅ 발행됨</span>
            )}
          </span>
        </div>
        
        <div className="text-sm text-blue-600">
          <strong>선택된 액션:</strong>
          <span className="ml-2 px-2 py-1 bg-blue-100 rounded text-blue-800 font-medium">
            {primaryAction.icon} {primaryAction.label}
          </span>
        </div>
      </div>
      
      <div className="text-xs text-blue-500">
        💡 우측 상단의 <strong>{primaryAction.label}</strong> 버튼을 클릭하거나 아래 상태를 변경한 후 저장하세요.
      </div>
    </div>
  );
};
