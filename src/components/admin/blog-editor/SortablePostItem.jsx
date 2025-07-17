"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, GripVertical } from 'lucide-react';

/**
 * 드래그 가능한 포스트 아이템 컴포넌트
 * 메인페이지 표시 포스트 목록에서 사용됨
 */
export default function SortablePostItem({ post, index, onMoveUp, onMoveDown, onRemove, isFirst, isLast, isUpdating }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: post.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-4 border rounded-lg bg-yellow-50 border-yellow-200 ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div 
          className="flex items-center gap-1 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            {index + 1}
          </Badge>
        </div>
        <div>
          <h4 className="font-medium">{post.title}</h4>
          <p className="text-sm text-muted-foreground">
            {post.profiles?.full_name || '관리자'} • {new Date(post.published_at).toLocaleDateString('ko-KR')}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            console.log('🔼 위로 이동 버튼 클릭:', post.id, post.title);
            onMoveUp(post.id);
          }}
          disabled={isFirst || isUpdating}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            console.log('🔽 아래로 이동 버튼 클릭:', post.id, post.title);
            onMoveDown(post.id);
          }}
          disabled={isLast || isUpdating}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onRemove(post.id)}
          disabled={isUpdating}
        >
          제거
        </Button>
      </div>
    </div>
  );
}