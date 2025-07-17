// src/components/admin/dashboard/menu-management/MenuManagementContent.jsx
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { useMenuManagement } from './hooks/useMenuManagement';
import MenuItemList from './components/MenuItemList';
import MenuItemForm from './components/MenuItemForm';

const MenuManagementContent = () => {
  const {
    menuItems,
    draggingIndex,
    loading,
    isDialogOpen,
    currentMenuItem,
    menuForm,
    setIsDialogOpen,
    handleInputChange,
    handleAddEditMenuItem,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDeleteMenuItem,
    handleToggleActive,
    openAddDialog,
    openEditDialog
  } = useMenuManagement();

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

      <MenuItemList
        menuItems={menuItems}
        loading={loading}
        draggingIndex={draggingIndex}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onEdit={openEditDialog}
        onDelete={handleDeleteMenuItem}
        onToggleActive={handleToggleActive}
      />

      <MenuItemForm
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        currentMenuItem={currentMenuItem}
        menuForm={menuForm}
        onInputChange={handleInputChange}
        onSubmit={handleAddEditMenuItem}
      />
    </div>
  );
};

export default MenuManagementContent;
