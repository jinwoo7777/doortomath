"use client"

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

export function CategoryManager({ categories, onCategoryUpdate }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#3b82f6',
    icon: '',
    sort_order: 0,
    is_active: true
  });

  const supabase = createClientComponentClient();
  const { session } = useAuth();

  // 폼 데이터 초기화
  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      color: '#3b82f6',
      icon: '',
      sort_order: categories.length,
      is_active: true
    });
    setEditingCategory(null);
  };

  // 새 카테고리 추가 대화상자 열기
  const handleAddCategory = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // 카테고리 편집 대화상자 열기
  const handleEditCategory = (category) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      color: category.color || '#3b82f6',
      icon: category.icon || '',
      sort_order: category.sort_order || 0,
      is_active: category.is_active
    });
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  // 이름에서 슬러그 자동 생성
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9ㄱ-ㅎㅏ-ㅣ가-힣\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // 폼 데이터 변경 핸들러
  const handleChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // 이름이 변경되면 슬러그 자동 생성 (편집 중이 아닌 경우에만)
      if (field === 'name' && !editingCategory) {
        newData.slug = generateSlug(value);
      }
      
      return newData;
    });
  };

  // 인증된 Supabase 클라이언트 설정
  const getAuthenticatedSupabase = async () => {
    if (!session?.access_token) {
      throw new Error('인증되지 않은 사용자입니다. 다시 로그인해주세요.');
    }

    console.log('🔐 세션 토큰으로 인증 시도');
    
    // 명시적 세션 설정
    await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token
    });

    return supabase;
  };

  // 카테고리 저장
  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('카테고리 이름을 입력해주세요.');
      return;
    }

    if (!formData.slug.trim()) {
      toast.error('슬러그를 입력해주세요.');
      return;
    }

    setSaving(true);
    
    try {
      console.log('🔄 [카테고리 저장] 시작:', editingCategory ? '수정' : '추가');
      
      const authenticatedSupabase = await getAuthenticatedSupabase();

      if (editingCategory) {
        // 카테고리 수정
        console.log('📝 카테고리 수정 시도:', editingCategory.id);
        
        const { error } = await authenticatedSupabase
          .from('blog_categories')
          .update({
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            color: formData.color,
            icon: formData.icon,
            sort_order: formData.sort_order,
            is_active: formData.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCategory.id);

        if (error) throw error;
        
        console.log('✅ 카테고리 수정 성공');
        toast.success('카테고리가 수정되었습니다.');
      } else {
        // 슬러그 중복 확인
        console.log('🔍 슬러그 중복 확인:', formData.slug);
        
        const { data: existingCategory, error: slugError } = await authenticatedSupabase
          .from('blog_categories')
          .select('id')
          .eq('slug', formData.slug)
          .maybeSingle(); // single() 대신 maybeSingle() 사용

        if (slugError) {
          console.error('❌ 슬러그 중복 확인 오류:', slugError);
          throw new Error('슬러그 중복 확인 중 오류가 발생했습니다.');
        }

        if (existingCategory) {
          toast.error('이미 사용 중인 슬러그입니다.');
          setSaving(false);
          return;
        }

        // 새 카테고리 추가
        console.log('➕ 새 카테고리 추가 시도:', formData.name);
        
        const { error } = await authenticatedSupabase
          .from('blog_categories')
          .insert([formData]);

        if (error) throw error;
        
        console.log('✅ 카테고리 추가 성공');
        toast.success('카테고리가 추가되었습니다.');
      }

      setIsDialogOpen(false);
      resetForm();
      onCategoryUpdate();
      
    } catch (err) {
      console.error('❌ 카테고리 저장 오류:', err);
      
      // RLS 관련 오류 구분
      if (err.message?.includes('RLS') || err.message?.includes('policy') || err.code === '42501') {
        toast.error('권한이 없습니다. 관리자로 로그인했는지 확인해주세요.');
      } else if (err.code === 'PGRST116') {
        toast.error('데이터를 찾을 수 없습니다.');
      } else if (err.message?.includes('인증되지 않은')) {
        toast.error(err.message);
      } else {
        toast.error(`카테고리 저장 중 오류가 발생했습니다: ${err.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  // 카테고리 삭제
  const handleDelete = async (categoryId, categoryName) => {
    if (!confirm(`"${categoryName}" 카테고리를 정말로 삭제하시겠습니까?\n\n이 카테고리를 사용하는 블로그 포스트들은 '일반' 카테고리로 변경됩니다.`)) {
      return;
    }

    try {
      console.log('🗑️ [카테고리 삭제] 시작:', categoryName);
      
      const authenticatedSupabase = await getAuthenticatedSupabase();

      // 해당 카테고리를 사용하는 포스트들을 'general' 카테고리로 변경
      const categorySlug = categories.find(cat => cat.id === categoryId)?.slug;
      
      if (categorySlug) {
        console.log('📝 포스트 카테고리 변경:', categorySlug, '→ general');
        
        const { error: updateError } = await authenticatedSupabase
          .from('blog_posts')
          .update({ category: 'general' })
          .eq('category', categorySlug);

        if (updateError) throw updateError;
      }

      // 카테고리 삭제
      console.log('🗑️ 카테고리 삭제 시도:', categoryId);
      
      const { error: deleteError } = await authenticatedSupabase
        .from('blog_categories')
        .delete()
        .eq('id', categoryId);

      if (deleteError) throw deleteError;

      console.log('✅ 카테고리 삭제 성공');
      toast.success('카테고리가 삭제되었습니다.');
      onCategoryUpdate();
      
    } catch (err) {
      console.error('❌ 카테고리 삭제 오류:', err);
      
      // RLS 관련 오류 구분
      if (err.message?.includes('RLS') || err.message?.includes('policy') || err.code === '42501') {
        toast.error('권한이 없습니다. 관리자로 로그인했는지 확인해주세요.');
      } else if (err.message?.includes('인증되지 않은')) {
        toast.error(err.message);
      } else {
        toast.error(`카테고리 삭제 중 오류가 발생했습니다: ${err.message}`);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* 카테고리 목록 */}
      {categories.map((category) => (
        <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <div>
              <p className="font-medium">{category.name}</p>
              <p className="text-sm text-muted-foreground">{category.slug}</p>
              {category.description && (
                <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={category.is_active ? 'default' : 'secondary'}>
              {category.is_active ? '활성' : '비활성'}
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleEditCategory(category)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            {category.slug !== 'general' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDelete(category.id, category.name)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}

      {/* 새 카테고리 추가 버튼 */}
      <div className="pt-4 border-t">
        <Button onClick={handleAddCategory}>
          <Plus className="h-4 w-4 mr-2" />
          새 카테고리 추가
        </Button>
      </div>

      {/* 카테고리 추가/편집 대화상자 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? '카테고리 편집' : '새 카테고리 추가'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">카테고리 이름 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="교육, 수학, 입시 등"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">슬러그 *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleChange('slug', e.target.value)}
                  placeholder="education, math, exam"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="카테고리에 대한 간단한 설명"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">색상</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => handleChange('color', e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => handleChange('color', e.target.value)}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sort_order">정렬 순서</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => handleChange('sort_order', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleChange('is_active', checked)}
              />
              <Label htmlFor="is_active">활성 상태</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={saving}
              >
                <X className="h-4 w-4 mr-2" />
                취소
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? '저장 중...' : '저장'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 