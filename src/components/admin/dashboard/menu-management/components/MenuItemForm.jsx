// src/components/admin/dashboard/menu-management/components/MenuItemForm.jsx
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const MenuItemForm = ({ 
  isOpen, 
  onClose, 
  currentMenuItem, 
  menuForm, 
  onInputChange, 
  onSubmit 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {currentMenuItem ? '카테고리 수정' : '새 카테고리 추가'}
          </DialogTitle>
          <DialogDescription>
            수업 카테고리의 정보를 입력하세요. 이 카테고리는 수업 생성 시 선택할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              이름 *
            </Label>
            <Input
              id="name"
              name="name"
              value={menuForm.name}
              onChange={onInputChange}
              className="col-span-3"
              placeholder="예: 학습분석"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="slug" className="text-right">
              슬러그
            </Label>
            <Input
              id="slug"
              name="slug"
              value={menuForm.slug}
              onChange={onInputChange}
              className="col-span-3"
              placeholder="자동 생성됨 (비워두면 이름에서 생성)"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">
              설명
            </Label>
            <Textarea
              id="description"
              name="description"
              value={menuForm.description}
              onChange={onInputChange}
              className="col-span-3"
              placeholder="카테고리에 대한 간단한 설명"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="icon" className="text-right">
              아이콘
            </Label>
            <Input
              id="icon"
              name="icon"
              value={menuForm.icon}
              onChange={onInputChange}
              className="col-span-3"
              placeholder="📚"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="color" className="text-right">
              색상
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Input
                id="color"
                name="color"
                type="color"
                value={menuForm.color}
                onChange={onInputChange}
                className="w-12 h-8 p-0 border rounded"
              />
              <Input
                name="color"
                value={menuForm.color}
                onChange={onInputChange}
                className="flex-1"
                placeholder="#6B7280"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="is_active" className="text-right">
              활성화
            </Label>
            <div className="col-span-3">
              <Switch
                id="is_active"
                name="is_active"
                checked={menuForm.is_active}
                onCheckedChange={(checked) => {
                  const event = {
                    target: {
                      name: 'is_active',
                      type: 'checkbox',
                      checked
                    }
                  };
                  onInputChange(event);
                }}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={onSubmit}>
            {currentMenuItem ? '수정' : '추가'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MenuItemForm;
