"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Star } from 'lucide-react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortablePostItem from './SortablePostItem';

/**
 * 메인페이지 표시 포스트 관리 컴포넌트
 * 포스트 추가, 제거, 순서 변경 기능 제공
 */
export default function FeaturedPostsManager({
  featuredPosts,
  availablePosts,
  updatingPosts,
  sensors,
  onAddToFeatured,
  onRemoveFromFeatured,
  onMovePost,
  onDragEnd
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 현재 메인페이지에 표시되는 포스트들 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            메인페이지 표시 포스트
          </CardTitle>
          <CardDescription>
            현재 메인페이지에 표시되는 포스트들입니다. 최대 3개까지 선택할 수 있고, 순서를 조정할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {featuredPosts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>메인페이지에 표시할 포스트를 선택해주세요.</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
            >
              <SortableContext
                items={featuredPosts.map(post => post.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {featuredPosts.map((post, index) => (
                    <SortablePostItem
                      key={post.id}
                      post={post}
                      index={index}
                      onMoveUp={(postId) => onMovePost(postId, 'up')}
                      onMoveDown={(postId) => onMovePost(postId, 'down')}
                      onRemove={onRemoveFromFeatured}
                      isFirst={index === 0}
                      isLast={index === featuredPosts.length - 1}
                      isUpdating={updatingPosts.has(post.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* 추가 가능한 포스트들 */}
      <Card>
        <CardHeader>
          <CardTitle>추가 가능한 포스트</CardTitle>
          <CardDescription>
            발행된 포스트 중에서 메인페이지에 추가할 수 있는 포스트들입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availablePosts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>추가 가능한 발행된 포스트가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {availablePosts.map((post) => (
                <div 
                  key={post.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <h4 className="font-medium">{post.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {post.profiles?.full_name || '관리자'} • {new Date(post.published_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAddToFeatured(post.id)}
                    disabled={featuredPosts.length >= 3 || updatingPosts.has(post.id)}
                  >
                    {featuredPosts.length >= 3 ? '최대 3개' : '추가'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 메인페이지 미리보기 안내 */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>메인페이지 미리보기</CardTitle>
          <CardDescription>
            설정한 포스트들이 메인페이지에 어떻게 표시되는지 확인하려면 메인페이지를 방문해보세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <a href="/" target="_blank" rel="noopener noreferrer">
              메인페이지에서 확인하기
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}