// src/components/admin/dashboard/menu-management/components/MenuItemList.jsx
import React from 'react';
import MenuItemCard from './MenuItemCard';
import { LoadingSpinner } from '@/components/ui/spinner';

const MenuItemList = ({ 
  menuItems, 
  loading, 
  draggingIndex,
  onDragStart,
  onDragOver,
  onDrop,
  onEdit,
  onDelete,
  onToggleActive
}) => {
  if (loading) {
    return (
      <LoadingSpinner text="메뉴를 불러오는 중..." />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {menuItems.map((item, idx) => (
        <MenuItemCard
          key={item.id}
          item={item}
          index={idx}
          draggingIndex={draggingIndex}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
        />
      ))}
    </div>
  );
};

export default MenuItemList;
