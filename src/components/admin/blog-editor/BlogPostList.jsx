"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InlineSpinner } from '@/components/ui/spinner';
import { Plus, FileText, Eye, Edit, Trash2, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * 블로그 포스트 목록 컴포넌트
 * 포스트 목록 표시, 검색, 필터링, 작업 기능 제공
 */
export default function BlogPostList({
  filteredPosts,
  loading,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  categories,
  onDeletePost,
  onStatusChange,
  onToggleFeatured,
  onCreateClick,
  updatingPosts,
  getCategoryName
}) {
  const router = useRouter();
  
  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>블로그 포스트 목록</CardTitle>
            <CardDescription>
              작성된 블로그 포스트를 확인하고 관리합니다. 
              <span className="inline-flex items-center ml-2 text-yellow-600">
                <span className="mr-1">★</span>
                메인페이지에 표시할 포스트를 최대 3개까지 선택할 수 있습니다.
              </span>
            </CardDescription>
          </div>
          <Button 
            onClick={onCreateClick}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            새 포스트 작성
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* 필터링 및 검색 */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="제목이나 내용으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="상태 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 상태</SelectItem>
              <SelectItem value="published">발행됨</SelectItem>
              <SelectItem value="draft">초안</SelectItem>
              <SelectItem value="archived">보관됨</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="카테고리 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 카테고리</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.slug}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 포스트 목록 */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-center">
              <InlineSpinner />
              <p className="mt-2 text-sm text-muted-foreground">포스트를 불러오는 중...</p>
            </div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">포스트가 없습니다</p>
            <p className="text-muted-foreground mb-4">첫 번째 블로그 포스트를 작성해보세요.</p>
            <Button onClick={onCreateClick}>
              <Plus className="h-4 w-4 mr-2" />
              포스트 생성
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">제목</th>
                  <th className="text-left p-3 font-medium">상태</th>
                  <th className="text-left p-3 font-medium">카테고리</th>
                  <th className="text-left p-3 font-medium">메인페이지 표시</th>
                  <th className="text-left p-3 font-medium">작성일</th>
                  <th className="text-left p-3 font-medium">작업</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{post.title}</div>
                        {post.excerpt && (
                          <div className="text-sm text-gray-500 mt-1">
                            {post.excerpt.length > 100 
                              ? `${post.excerpt.substring(0, 100)}...` 
                              : post.excerpt
                            }
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge 
                        variant={
                          post.status === 'published' ? 'default' :
                          post.status === 'draft' ? 'secondary' : 'outline'
                        }
                      >
                        {post.status === 'published' ? '발행됨' :
                         post.status === 'draft' ? '초안' : '보관됨'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">
                        {getCategoryName ? getCategoryName(post.category) : post.category}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={post.featured || false}
                          onChange={() => onToggleFeatured(post.id, post.featured)}
                          disabled={updatingPosts.has(post.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                        />
                        {post.featured && (
                          <span className="ml-2 text-xs text-yellow-600">★</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-500">
                      {formatDate(post.created_at)}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        {post.status === 'published' && post.slug && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard2/admin/blog-editor/edit/${post.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeletePost(post.id)}
                          disabled={updatingPosts.has(post.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}