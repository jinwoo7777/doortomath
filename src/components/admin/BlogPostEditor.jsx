"use client"

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/supabaseClientBrowser';
import { toast } from 'sonner';
import { MinimalTiptapEditor } from '@/components/ui/minimal-tiptap';
import '@/styles/tiptap.css';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Save, Eye, Upload, X } from 'lucide-react';

export function BlogPostEditor({ onSaveSuccess, editingPost = null }) {
  const { session, userRole } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    image_url: '',
    category: 'general',
    tags: [],
    status: 'draft',
    featured: false,
    meta_title: '',
    meta_description: '',
    slug: ''
  });

  // 편집 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (editingPost) {
      let tags = [];
      if (editingPost.tags) {
        try {
          tags = typeof editingPost.tags === 'string' ? JSON.parse(editingPost.tags) : editingPost.tags;
        } catch (e) {
          console.error('태그 파싱 오류:', e);
          tags = [];
        }
      }

      setFormData({
        title: editingPost.title || '',
        content: editingPost.content || '',
        excerpt: editingPost.excerpt || '',
        image_url: editingPost.image_url || '',
        category: editingPost.category || 'general',
        tags: Array.isArray(tags) ? tags : [],
        status: editingPost.status || 'draft',
        featured: editingPost.featured || false,
        meta_title: editingPost.meta_title || '',
        meta_description: editingPost.meta_description || '',
        slug: editingPost.slug || ''
      });
    } else {
      // 새 포스트 생성 시 초기화
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        image_url: '',
        category: 'general',
        tags: [],
        status: 'draft',
        featured: false,
        meta_title: '',
        meta_description: '',
        slug: ''
      });
    }
  }, [editingPost]);

  // 카테고리 목록 불러오기
  useEffect(() => {
    const fetchCategories = async () => {
      if (!session || userRole !== 'admin') return;
      
      try {
        const { data, error } = await supabase
          .from('blog_categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });
        
        if (error) throw error;
        setCategories(data || []);
      } catch (err) {
        console.error('카테고리 목록 불러오기 오류:', err);
        toast.error('카테고리 목록을 불러오는 중 오류가 발생했습니다.');
      }
    };

    fetchCategories();
  }, [session, supabase, userRole]);

  // 제목에서 슬러그 자동 생성 (새 포스트일 때만)
  useEffect(() => {
    if (formData.title && !formData.slug && !editingPost) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9ㄱ-ㅎㅏ-ㅣ가-힣\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, editingPost]);

  // 메타 제목 자동 생성 (새 포스트일 때만)
  useEffect(() => {
    if (formData.title && !formData.meta_title && !editingPost) {
      setFormData(prev => ({ ...prev, meta_title: formData.title }));
    }
  }, [formData.title, editingPost]);

  // 폼 데이터 변경 핸들러
  const handleChange = (field, value) => {
    if (field === 'status') {
      console.log('📝 폼 상태 변경:', {
        이전상태: formData.status,
        새상태: value,
        필드: field,
        시간: new Date().toISOString()
      });
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 태그 추가
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  // 태그 제거
  const handleRemoveTag = (tagToRemove) => {
    console.log('태그 삭제 시도:', tagToRemove);
    console.log('현재 태그 목록:', formData.tags);
    
    if (!tagToRemove || !formData.tags.includes(tagToRemove)) {
      console.warn('삭제할 태그가 존재하지 않습니다:', tagToRemove);
      return;
    }
    
    setFormData(prev => {
      const newTags = prev.tags.filter(tag => tag !== tagToRemove);
      console.log('삭제 후 태그 목록:', newTags);
      return {
        ...prev,
        tags: newTags
      };
    });
    
    // 사용자에게 피드백 제공
    toast.success(`"${tagToRemove}" 태그가 삭제되었습니다.`);
  };

  // 태그 입력 키 핸들러
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // 블로그 포스트 저장
  const handleSave = async (status = formData.status) => {
    // 중복 클릭 방지
    if (isSaving) {
      console.log('⚠️ 중복 클릭 방지: 이미 저장 중');
      toast.error('이미 저장 중입니다. 잠시 기다려주세요.');
      return;
    }

    console.log('=== 블로그 포스트 저장 시작 ===');
    console.log('저장 모드:', editingPost ? '편집' : '새 포스트');
    console.log('💾 저장될 상태:', status);
    console.log('📋 현재 폼 상태:', formData.status);
    console.log('📝 폼 데이터:', formData);

    // 상태 값 검증
    if (!['draft', 'published', 'archived'].includes(status)) {
      console.error('❌ 잘못된 상태 값:', status);
      toast.error('잘못된 상태 값입니다. 다시 시도해주세요.');
      return;
    }
    
    // 사용자에게 저장될 상태 안내
    const statusMessages = {
      'draft': '초안으로 저장',
      'published': '발행',
      'archived': '보관'
    };
    
    console.log(`🎯 ${statusMessages[status]} 시작...`);
    
    if (!formData.title.trim()) {
      console.log('❌ 제목이 비어있음');
      toast.error('제목을 입력해주세요.');
      return;
    }

    if (!formData.content.trim()) {
      console.log('❌ 내용이 비어있음');
      toast.error('내용을 입력해주세요.');
      return;
    }

    // 세션 확인
    if (!session || !session.user) {
      console.log('❌ 세션이 없음:', session);
      toast.error('로그인이 필요합니다. 다시 로그인해주세요.');
      return;
    }

    console.log('✅ 유효성 검사 통과');
    console.log('현재 세션:', session.user);

    setIsSaving(true);

    // 타임아웃 설정 (30초)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('저장 요청이 30초를 초과했습니다.')), 30000);
    });

    try {
      const savePromise = async () => {
        // 슬러그 중복 확인 (편집 모드가 아니거나 슬러그가 변경된 경우)
        if (formData.slug && (!editingPost || formData.slug !== editingPost.slug)) {
          console.log('슬러그 중복 확인 중:', formData.slug);
          
          let slugQuery = supabase
            .from('blog_posts')
            .select('id')
            .eq('slug', formData.slug);

          // 편집 모드일 때만 현재 포스트 ID 제외
          if (editingPost && editingPost.id) {
            slugQuery = slugQuery.neq('id', editingPost.id);
          }

          const { data: existingPost, error: slugError } = await slugQuery.maybeSingle();

          if (slugError) {
            console.error('❌ 슬러그 중복 확인 오류:', slugError);
            throw new Error(`슬러그 중복 확인 중 오류: ${slugError.message}`);
          }

          if (existingPost) {
            console.log('❌ 슬러그 중복됨:', existingPost);
            throw new Error('이미 사용 중인 슬러그입니다. 다른 슬러그를 사용해주세요.');
          }
          
          console.log('✅ 슬러그 중복 확인 통과');
        }

        const postData = {
          ...formData,
          status, // 명시적으로 전달받은 status 사용
          tags: JSON.stringify(formData.tags),
          updated_at: new Date().toISOString()
        };

        console.log('📦 준비된 포스트 데이터:', postData);
        console.log('🎯 최종 저장 상태:', postData.status);

        if (editingPost) {
          console.log('📝 기존 포스트 수정 중...');
          console.log('편집할 포스트 ID:', editingPost.id);
          
          // 기존 포스트 수정
          if (status === 'published' && editingPost.status !== 'published') {
            postData.published_at = new Date().toISOString();
            console.log('발행 시간 설정:', postData.published_at);
          }

          console.log('Supabase 업데이트 쿼리 실행 중...');
          
          // 더 강화된 쿼리 - select를 제거하고 단순화
          const { error } = await supabase
            .from('blog_posts')
            .update(postData)
            .eq('id', editingPost.id);

          console.log('Supabase 업데이트 쿼리 완료');

          if (error) {
            console.error('❌ 블로그 포스트 수정 오류:', error);
            console.error('오류 코드:', error.code);
            console.error('오류 메시지:', error.message);
            console.error('오류 세부사항:', error.details);
            throw error;
          }

          // 업데이트 성공 후 데이터 다시 조회
          const { data: updatedData, error: fetchError } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('id', editingPost.id)
            .single();

          if (fetchError) {
            console.warn('업데이트된 데이터 조회 실패:', fetchError);
          } else {
            console.log('✅ 업데이트된 데이터:', updatedData);
            console.log('✅ 최종 저장된 상태:', updatedData.status);
          }

          console.log('✅ 블로그 포스트 수정 성공');
          toast.success(`블로그 포스트가 ${statusMessages[status]}되었습니다.`);
        } else {
          console.log('➕ 새 포스트 생성 중...');
          
          // 새 포스트 생성
          postData.author_id = session.user.id;
          if (status === 'published') {
            postData.published_at = new Date().toISOString();
            console.log('발행 시간 설정:', postData.published_at);
          }

          console.log('새 포스트 생성 데이터:', postData);
          console.log('현재 세션 사용자:', session.user.id);

          console.log('Supabase 삽입 쿼리 실행 중...');
          
          const { data, error } = await supabase
            .from('blog_posts')
            .insert([postData])
            .select()
            .single();

          console.log('Supabase 삽입 쿼리 완료');

          if (error) {
            console.error('❌ 블로그 포스트 생성 오류:', error);
            console.error('오류 코드:', error.code);
            console.error('오류 메시지:', error.message);
            console.error('오류 세부사항:', error.details);
            console.error('세션 정보:', session);
            throw error;
          }

          console.log('✅ 블로그 포스트 생성 성공:', data);
          console.log('✅ 최종 저장된 상태:', data.status);
          toast.success(`블로그 포스트가 ${statusMessages[status]}되었습니다.`);
        }
      };

      // 타임아웃과 실제 저장 작업을 경쟁시킴
      await Promise.race([savePromise(), timeoutPromise]);

      console.log('✅ 저장 완료 - 성공 콜백 호출');
      
      // 성공 콜백 호출 - 강화된 처리
      try {
        if (onSaveSuccess && typeof onSaveSuccess === 'function') {
          console.log('성공 콜백 실행 중...');
          await onSaveSuccess();
          console.log('성공 콜백 완료');
        } else {
          console.log('성공 콜백이 없거나 함수가 아님:', typeof onSaveSuccess);
        }
      } catch (callbackError) {
        console.error('성공 콜백 실행 중 오류:', callbackError);
        // 콜백 오류는 저장 성공에 영향을 주지 않도록 함
      }

      // 강제로 UI 상태 업데이트
      setTimeout(() => {
        setIsSaving(false);
        console.log('UI 상태 강제 업데이트 완료');
      }, 100);

    } catch (err) {
      console.error('❌ 블로그 포스트 저장 치명적 오류:', err);
      console.error('오류 타입:', typeof err);
      console.error('오류 스택:', err.stack);
      
      if (err.message.includes('30초를 초과')) {
        toast.error('저장 요청이 시간 초과되었습니다. 네트워크 연결을 확인하고 다시 시도해주세요.');
      } else if (err.code === '42501') {
        toast.error('저장 권한이 없습니다. 관리자 권한이 있는지 확인해주세요.');
      } else if (err.code === '23505') {
        toast.error('중복된 데이터가 있습니다. 슬러그를 다시 확인해주세요.');
      } else if (err.code === 'PGRST116') {
        toast.error('데이터베이스 연결 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else if (err.message.includes('슬러그')) {
        toast.error(err.message);
      } else {
        toast.error(`블로그 포스트 저장 중 오류가 발생했습니다: ${err.message}`);
      }
    } finally {
      console.log('=== 저장 프로세스 종료 ===');
      // finally에서 확실히 상태 해제
      setIsSaving(false);
    }
  };

  // 미리보기 (포스트 상태에 따라 적절한 페이지로)
  const handlePreview = () => {
    if (!editingPost?.id) {
      toast.info('포스트를 먼저 저장한 후 미리보기가 가능합니다.');
      return;
    }

    // 발행된 포스트는 실제 블로그 페이지로, 나머지는 관리자 미리보기로
    if (formData.status === 'published' && editingPost.slug) {
      window.open(`/blog/${editingPost.slug}`, '_blank');
    } else {
      window.open(`/dashboard2/admin/blog-editor/preview/${editingPost.id}`, '_blank');
    }
  };

  // 현재 선택된 상태에 따른 액션 결정
  const getPrimaryAction = () => {
    switch (formData.status) {
      case 'draft':
        return {
          label: '초안으로 저장',
          status: 'draft',
          className: 'bg-gray-600 hover:bg-gray-700 text-white',
          icon: '💾'
        };
      case 'published':
        return {
          label: '발행하기',
          status: 'published',
          className: 'bg-green-600 hover:bg-green-700 text-white',
          icon: '🚀'
        };
      case 'archived':
        return {
          label: '보관하기',
          status: 'archived',
          className: 'bg-orange-600 hover:bg-orange-700 text-white',
          icon: '📦'
        };
      default:
        return {
          label: '초안으로 저장',
          status: 'draft',
          className: 'bg-gray-600 hover:bg-gray-700 text-white',
          icon: '💾'
        };
    }
  };

  const primaryAction = getPrimaryAction();

  return (
    <div className="space-y-6">
      {/* 액션 버튼 */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handlePreview} disabled={!editingPost}>
          <Eye className="h-4 w-4 mr-2" />
          {formData.status === 'published' ? '실제 페이지 보기' : '관리자 미리보기'}
        </Button>
        
        {/* 주요 액션 버튼 */}
        <Button 
          onClick={() => {
            console.log(`🖱️ ${primaryAction.label} 버튼 클릭됨`);
            handleSave(primaryAction.status);
          }} 
          disabled={isSaving}
          className={primaryAction.className}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? '저장 중...' : primaryAction.label}
        </Button>
      </div>

      {/* 현재 상태 및 다음 액션 안내 */}
      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-4">
          <div className="text-sm text-blue-700">
            <strong>현재 상태:</strong>
            <span className="ml-2 px-3 py-1 rounded-full text-xs font-medium">
              {formData.status === 'draft' && (
                <span className="bg-gray-200 text-gray-800">📝 초안</span>
              )}
              {formData.status === 'published' && (
                <span className="bg-green-200 text-green-800">✅ 발행됨</span>
              )}
              {formData.status === 'archived' && (
                <span className="bg-orange-200 text-orange-800">📦 보관됨</span>
              )}
            </span>
          </div>
          
          <div className="text-sm text-blue-600">
            <strong>선택된 액션:</strong>
            <span className="ml-2 px-2 py-1 bg-blue-100 rounded text-blue-800 font-medium">
              {primaryAction.icon} {primaryAction.label}
            </span>
          </div>
        </div>
        
        <div className="text-xs text-blue-500">
          💡 우측 상단의 <strong>{primaryAction.label}</strong> 버튼을 클릭하거나 아래 상태를 변경한 후 저장하세요.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 메인 콘텐츠 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">제목 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="블로그 포스트 제목을 입력하세요"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">요약</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => handleChange('excerpt', e.target.value)}
                  placeholder="블로그 포스트의 간단한 요약을 입력하세요"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">내용 *</Label>
                <MinimalTiptapEditor
                  id="content"
                  value={formData.content}
                  onChange={(value) => handleChange('content', value)}
                  placeholder="블로그 포스트 내용을 입력하세요"
                  className="w-full"
                  editorClassName="min-h-[400px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="slug">URL 슬러그</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleChange('slug', e.target.value)}
                  placeholder="url-slug-example"
                />
                <p className="text-sm text-muted-foreground">
                  URL: /blog/{formData.slug || 'your-slug'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta_title">메타 제목</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) => handleChange('meta_title', e.target.value)}
                  placeholder="검색 엔진에 표시될 제목"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta_description">메타 설명</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => handleChange('meta_description', e.target.value)}
                  placeholder="검색 엔진에 표시될 설명"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>발행 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">게시 상태</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => {
                    console.log('📋 상태 변경:', formData.status, '→', value);
                    handleChange('status', value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">
                      <div className="flex flex-col">
                        <span className="font-medium">초안</span>
                        <span className="text-xs text-muted-foreground">작성 중인 포스트 (공개되지 않음)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="published">
                      <div className="flex flex-col">
                        <span className="font-medium">발행됨</span>
                        <span className="text-xs text-muted-foreground">공개된 포스트 (모든 사용자가 볼 수 있음)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="archived">
                      <div className="flex flex-col">
                        <span className="font-medium">보관됨</span>
                        <span className="text-xs text-muted-foreground">보관된 포스트 (공개되지 않음)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  💡 팁: 상태를 선택하면 상단의 버튼이 <strong>{primaryAction.label}</strong>로 바뀝니다. 버튼을 클릭해서 저장하세요.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleChange('featured', checked)}
                />
                <Label htmlFor="featured">추천 포스트</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>카테고리 및 태그</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">카테고리</Label>
                <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>태그</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                    placeholder="태그 입력 후 Enter"
                  />
                  <Button type="button" onClick={handleAddTag} variant="outline">
                    추가
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1 group">
                        <span className="flex-1">{tag}</span>
                        <button
                          type="button"
                          className="ml-1 p-0 bg-transparent border-none cursor-pointer hover:text-red-500 transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('X 버튼 클릭됨, 태그:', tag);
                            handleRemoveTag(tag);
                          }}
                          aria-label={`${tag} 태그 삭제`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                {formData.tags.length === 0 && (
                  <p className="text-sm text-muted-foreground">태그를 추가하면 여기에 표시됩니다. X 버튼을 클릭하여 삭제할 수 있습니다.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>대표 이미지</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image_url">이미지 URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => handleChange('image_url', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              {formData.image_url && (
                <div className="mt-2">
                  <img 
                    src={formData.image_url} 
                    alt="대표 이미지 미리보기" 
                    className="w-full h-32 object-cover rounded-md border"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <Button variant="outline" className="w-full" disabled>
                <Upload className="h-4 w-4 mr-2" />
                이미지 업로드 (준비 중)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 