// src/components/admin/dashboard/menu-management/components/MenuItemCard.jsx
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, X, GripVertical, Eye, EyeOff } from 'lucide-react';

const MenuItemCard = ({ 
  item, 
  index, 
  draggingIndex,
  onDragStart, 
  onDragOver, 
  onDrop, 
  onEdit, 
  onDelete, 
  onToggleActive 
}) => {
  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(index, e)}
      onDragOver={onDragOver}
      onDrop={() => onDrop(index)}
      className={`p-4 transition-all duration-200 cursor-move hover:shadow-md ${
        draggingIndex === index ? 'opacity-50 scale-95' : ''
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
                onToggleActive(item); 
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
                onEdit(item); 
              }}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <button 
              type="button"
              className="h-6 w-6 p-0 bg-transparent border-none cursor-pointer hover:text-red-500 transition-colors text-destructive flex items-center justify-center" 
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { 
                e.stopPropagation(); 
                onDelete(item); 
              }}
              aria-label={`${item.name} 메뉴 삭제`}
            >
              <X className="h-3 w-3" />
            </button>
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
  );
};

export default MenuItemCard;
