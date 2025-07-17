// components/ListEditor.jsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

export const ListEditor = ({ title, items, onAdd, onRemove, placeholder }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{title}</Label>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button type="button" onClick={handleAdd} variant="outline" size="sm">
          추가
        </Button>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 border rounded">
            <span className="text-sm">{item}</span>
            <button
              type="button"
              className="ml-1 p-0 bg-transparent border-none cursor-pointer hover:text-red-500 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemove(index);
              }}
              aria-label="항목 삭제"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">{title}을 추가해보세요.</p>
      )}
    </div>
  );
};
