"use client";

import React, { useState, useEffect } from 'react';
import { 
  fetchAllCourseMenu, 
  addCourseMenu, 
  updateCourseMenuItem, 
  deleteCourseMenuItem, 
  updateCourseMenu,
  toggleCourseMenuActive 
} from '@/lib/supabase/fetchCourseMenu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, X, Plus, GripVertical, Eye, EyeOff } from 'lucide-react';
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from 'sonner';

const MenuManagementContent = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentMenuItem, setCurrentMenuItem] = useState(null); // For editing
  const [menuForm, setMenuForm] = useState({ 
    name: '', 
    slug: '', 
    description: '', 
    icon: '📚', 
    color: '#6B7280',
    is_active: true 
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const data = await fetchAllCourseMenu();
      console.log('✅ 메뉴 항목 로드 성공:', data?.length || 0, '개');
      // 순서대로 정렬 (활성/비활성 모두 포함)
      setMenuItems((data ?? []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    } catch (error) {
      console.error('❌ 메뉴 항목 불러오기 오류:', error);
      toast.error('메뉴 항목을 불러오는 데 실패했습니다.');
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMenuForm({ 
      ...menuForm, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleAddEditMenuItem = async () => {
    if (!menuForm.name.trim()) {
      toast.error('메뉴 이름을 입력해주세요.');
      return;
    }

    try {
      if (currentMenuItem) {
        // 수정
        const updated = await updateCourseMenuItem(currentMenuItem.id, {
          name: menuForm.name.trim(),
          slug: menuForm.slug.trim() || menuForm.name.toLowerCase().replace(/\s+/g, '-'),
          description: menuForm.description.trim() || null,
          icon: menuForm.icon.trim() || '📚',
          color: menuForm.color || '#6B7280',
          is_active: menuForm.is_active
        });
        
        setMenuItems(prev => prev.map(item => 
          item.id === currentMenuItem.id ? updated : item
        ));
        
        toast.success('메뉴 항목이 업데이트되었습니다.');
      } else {
        // 추가
        const maxOrder = Math.max(...menuItems.map(item => item.order || 0), 0);
        const newItem = await addCourseMenu({
          name: menuForm.name.trim(),
          slug: menuForm.slug.trim() || menuForm.name.toLowerCase().replace(/\s+/g, '-'),
          description: menuForm.description.trim() || null,
          icon: menuForm.icon.trim() || '📚',
          color: menuForm.color || '#6B7280',
          order: maxOrder + 1,
          is_active: menuForm.is_active
        });
        
        setMenuItems(prev => [...prev, newItem].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
        toast.success('메뉴 항목이 추가되었습니다.');
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('❌ 메뉴 저장 오류:', error);
      toast.error('메뉴 저장에 실패했습니다.');
    }
  };

  const resetForm = () => {
    setMenuForm({ 
      name: '', 
      slug: '', 
      description: '', 
      icon: '📚', 
      color: '#6B7280',
      is_active: true 
    });
    setCurrentMenuItem(null);
  };

  // Drag & Drop Handlers
  const handleDragStart = (idx, e) => {
    // 버튼(아이콘) 클릭 시 드래그 무시
    if (e?.target?.closest('button')) return;
    setDraggingIndex(idx);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (idx) => {
    if (draggingIndex === null || draggingIndex === idx) return;
    
    const reordered = [...menuItems];
    const [moved] = reordered.splice(draggingIndex, 1);
    reordered.splice(idx, 0, moved);
    
    // 재정렬 후 order 재계산
    const updated = reordered.map((item, i) => ({ ...item, order: i + 1 }));
    setMenuItems(updated);
    
    try {
      await updateCourseMenu(updated);
      toast.success('메뉴 순서가 업데이트되었습니다.');
    } catch (error) {
      console.error('❌ 순서 업데이트 오류:', error);
      toast.error('순서 업데이트 실패');
      // 에러 시 원래 상태로 복원
      setMenuItems(menuItems);
    }
    setDraggingIndex(null);
  };

  const handleDeleteMenuItem = async (menuItem) => {
    if (!confirm(`"${menuItem.name}" 메뉴를 정말 삭제하시겠습니까?`)) {
      return;
    }

    const originalItems = [...menuItems];
    // 낙관적 업데이트
    const filteredItems = menuItems.filter(item => item.id !== menuItem.id);
    setMenuItems(filteredItems);

    try {
      await deleteCourseMenuItem(menuItem.id);
      toast.success('메뉴 항목이 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('❌ 메뉴 삭제 오류:', error);
      toast.error('메뉴 항목 삭제에 실패했습니다.');
      // 에러 시 원래 상태로 복원
      setMenuItems(originalItems);
    }
  };

  const handleToggleActive = async (menuItem) => {
    const originalItems = [...menuItems];
    // 낙관적 업데이트
    setMenuItems(prev => prev.map(item => 
      item.id === menuItem.id ? { ...item, is_active: !item.is_active } : item
    ));

    try {
      await toggleCourseMenuActive(menuItem.id, !menuItem.is_active);
      toast.success(`메뉴가 ${!menuItem.is_active ? '활성화' : '비활성화'}되었습니다.`);
    } catch (error) {
      console.error('❌ 메뉴 활성화 토글 오류:', error);
      toast.error('상태 변경에 실패했습니다.');
      // 에러 시 원래 상태로 복원
      setMenuItems(originalItems);
    }
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (item) => {
    setCurrentMenuItem(item);
    setMenuForm({ 
      name: item.name || '',
      slug: item.slug || '',
      description: item.description || '',
      icon: item.icon || '📚',
      color: item.color || '#6B7280',
      is_active: item.is_active !== false
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">수업 카테고리 관리</h2>
          <p className="text-muted-foreground">수업 카테고리를 추가, 편집, 삭제하고 순서를 변경할 수 있습니다.</p>
        </div>
        <Button onClick={openAddDialog} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          새 카테고리 추가
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-2 text-sm text-muted-foreground">메뉴를 불러오는 중...</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {menuItems.map((item, idx) => (
            <Card
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(idx, e)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(idx)}
              className={`p-4 transition-all duration-200 cursor-move hover:shadow-md ${
                draggingIndex === idx ? 'opacity-50 scale-95' : ''
              } ${
                !item.is_active ? 'opacity-60 bg-muted/30' : 'bg-background'
              }`}
            >
              <div className="space-y-3">
                {/* 헤더 */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <Badge 
                      variant="secondary" 
                      className="text-xs"
                      style={{ backgroundColor: `${item.color}20`, color: item.color }}
                    >
                      #{item.order}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6" 
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleToggleActive(item); 
                      }}
                      title={item.is_active ? "비활성화" : "활성화"}
                    >
                      {item.is_active ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <EyeOff className="h-3 w-3" />
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6" 
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        openEditDialog(item); 
                      }}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-destructive hover:text-destructive" 
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleDeleteMenuItem(item); 
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* 콘텐츠 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.icon}</span>
                    <h3 className="font-semibold text-sm leading-tight">{item.name}</h3>
                  </div>
                  
                  {item.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>슬러그:</span>
                    <code className="bg-muted px-1 rounded text-xs">{item.slug}</code>
                  </div>
                </div>

                {/* 상태 */}
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={item.is_active ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {item.is_active ? "활성" : "비활성"}
                  </Badge>
                  <div 
                    className="w-3 h-3 rounded-full border"
                    style={{ backgroundColor: item.color }}
                    title={`색상: ${item.color}`}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 추가/편집 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
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
                  onChange={handleInputChange}
                  className="w-12 h-8 p-0 border rounded"
                />
                <Input
                  name="color"
                  value={menuForm.color}
                  onChange={handleInputChange}
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
                  onCheckedChange={(checked) => 
                    setMenuForm(prev => ({ ...prev, is_active: checked }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleAddEditMenuItem}>
              {currentMenuItem ? '수정' : '추가'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuManagementContent;
