"use client"

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
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
import { Save, Eye, Upload, X, BookOpen, Users, Clock, Calendar, DollarSign } from 'lucide-react';

export function AdvancedCourseEditor({ onSaveSuccess, editingCourse = null }) {
  const { session, userRole } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const supabase = createClientComponentClient();

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image_url: '',
    video_url: '',
    category: '학습분석',
    tags: [],
    status: 'draft',
    featured: false,
    
    // 수업 관련 필드
    author_name: '',
    author_image_url: '',
    course_label: '',
    price: 0,
    seats: 30,
    weeks: 12,
    semesters: 1,
    
    // 수업 상세 내용
    what_you_will_learn: [],
    requirements: [],
    includes: [],
    curriculum: [],
    reviews: [],
    
    // SEO 관련
    meta_title: '',
    meta_description: '',
    slug: ''
  });

  // 수업 데이터 로드 (편집 모드일 때)
  useEffect(() => {
    if (editingCourse) {
      console.log('📝 편집 모드: 기존 수업 데이터 로드', editingCourse);
      
      // JSON 필드 파싱
      const parseJsonField = (field) => {
        if (!field) return [];
        if (Array.isArray(field)) return field;
        try {
          return JSON.parse(field);
        } catch {
          return [field];
        }
      };

      setFormData({
        title: editingCourse.title || '',
        subtitle: editingCourse.subtitle || '',
        description: editingCourse.description || '',
        image_url: editingCourse.image_url || '',
        video_url: editingCourse.video_url || '',
        category: editingCourse.category || '학습분석',
        tags: editingCourse.tags || [],
        status: editingCourse.status || 'draft',
        featured: editingCourse.featured || false,
        
        author_name: editingCourse.author_name || '',
        author_image_url: editingCourse.author_image_url || '',
        course_label: editingCourse.course_label || '',
        price: editingCourse.price || 0,
        seats: editingCourse.seats || 30,
        weeks: editingCourse.weeks || 12,
        semesters: editingCourse.semesters || 1,
        
        what_you_will_learn: parseJsonField(editingCourse.what_you_will_learn),
        requirements: parseJsonField(editingCourse.requirements),
        includes: parseJsonField(editingCourse.includes),
        curriculum: parseJsonField(editingCourse.curriculum),
        reviews: parseJsonField(editingCourse.reviews),
        
        meta_title: editingCourse.meta_title || '',
        meta_description: editingCourse.meta_description || '',
        slug: editingCourse.slug || ''
      });
    }
  }, [editingCourse]);

  // 카테고리 로드
  useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log('🔄 카테고리 목록 로딩 시작');
        
        const { data, error } = await supabase
          .from('course_menu')
          .select('name')
          .eq('is_active', true)
          .order('order');

        if (error) {
          console.error('💥 카테고리 로딩 오류:', error);
          // 기본 카테고리 사용
          setCategories(['시험대비', '학습분석', '내신,모의 기출분석', '선행수업', '개별오답관리']);
          return;
        }

        const categoryNames = data?.map(item => item.name) || [];
        console.log('✅ 카테고리 로딩 성공:', categoryNames);
        setCategories(categoryNames);
        
      } catch (err) {
        console.error('💥 카테고리 로딩 실패:', err);
        // 기본 카테고리 사용
        setCategories(['시험대비', '학습분석', '내신,모의 기출분석', '선행수업', '개별오답관리']);
      }
    };

    if (session && userRole === 'admin') {
      loadCategories();
    }
  }, [session?.user?.id, userRole]); // session 객체 대신 user.id만 의존

  // 폼 데이터 변경 핸들러
  const handleChange = (field, value) => {
    console.log(`📝 ${field} 변경:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 중첩 필드 변경 핸들러
  const handleNestedChange = (parent, field, value) => {
    console.log(`📝 ${parent}.${field} 변경:`, value);
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  // 태그 추가
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      const newTags = [...formData.tags, tagInput.trim()];
      handleChange('tags', newTags);
      setTagInput('');
      console.log('🏷️ 태그 추가:', tagInput.trim());
    }
  };

  // 태그 제거
  const removeTag = (tagToRemove) => {
    const newTags = formData.tags.filter(tag => tag !== tagToRemove);
    handleChange('tags', newTags);
    console.log('🗑️ 태그 제거:', tagToRemove);
  };

  // 태그 입력 키 처리
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // 배열 항목 추가
  const addListItem = (listType, item) => {
    if (item.trim()) {
      const newList = [...formData[listType], item.trim()];
      handleChange(listType, newList);
      console.log(`➕ ${listType} 항목 추가:`, item.trim());
    }
  };

  // 배열 항목 제거
  const removeListItem = (listType, index) => {
    const newList = formData[listType].filter((_, i) => i !== index);
    handleChange(listType, newList);
    console.log(`➖ ${listType} 항목 제거:`, index);
  };

  // 수업 저장
  const handleSave = async (status = formData.status) => {
    // 중복 클릭 방지
    if (isSaving) {
      console.log('⚠️ 중복 클릭 방지: 이미 저장 중');
      toast.error('이미 저장 중입니다. 잠시 기다려주세요.');
      return;
    }

    console.log('=== 🔄 수업 저장 시작 ===');
    console.log('저장 모드:', editingCourse ? '편집' : '새 수업');
    console.log('💾 저장될 상태:', status);
    console.log('📋 현재 폼 상태:', formData.status);

    // 상태 값 검증
    if (!['draft', 'published'].includes(status)) {
      console.error('❌ 잘못된 상태 값:', status);
      toast.error('잘못된 상태 값입니다. 다시 시도해주세요.');
      return;
    }

    // 유효성 검사
    if (!formData.title.trim()) {
      console.log('❌ 제목이 비어있음');
      toast.error('제목을 입력해주세요.');
      return;
    }

    if (!formData.description.trim()) {
      console.log('❌ 설명이 비어있음');
      toast.error('설명을 입력해주세요.');
      return;
    }

    // 세션 확인
    if (!session || !session.user) {
      console.log('❌ 세션이 없음:', session);
      toast.error('로그인이 필요합니다. 다시 로그인해주세요.');
      return;
    }

    // 권한 확인
    if (userRole !== 'admin') {
      console.log('❌ 권한 부족:', userRole);
      toast.error('관리자 권한이 필요합니다.');
      return;
    }

    console.log('✅ 유효성 검사 통과');
    console.log('현재 세션:', session.user);

    setIsSaving(true);

    try {
      const savePromise = async () => {
        // 인증된 Supabase 클라이언트는 이미 사용 가능
        console.log('🔐 인증된 Supabase 클라이언트 사용');

        const courseData = {
          title: formData.title.trim(),
          subtitle: formData.subtitle?.trim() || null,
          description: formData.description.trim(),
          image_url: formData.image_url?.trim() || null,
          video_url: formData.video_url?.trim() || null,
          category: formData.category,
          author_name: formData.author_name?.trim() || null,
          author_image_url: formData.author_image_url?.trim() || null,
          course_label: formData.course_label?.trim() || null,
          price: Number(formData.price) || 0,
          seats: Number(formData.seats) || 30,
          weeks: Number(formData.weeks) || 12,
          semesters: Number(formData.semesters) || 1,
          status: status,
          featured: formData.featured,
          what_you_will_learn: JSON.stringify(formData.what_you_will_learn),
          requirements: JSON.stringify(formData.requirements),
          includes: JSON.stringify(formData.includes),
          curriculum: JSON.stringify(formData.curriculum),
          reviews: JSON.stringify(formData.reviews),
          updated_at: new Date().toISOString()
        };

        let result;
        if (editingCourse) {
          console.log('📝 기존 수업 업데이트:', editingCourse.id);
          result = await supabase
            .from('courses')
            .update(courseData)
            .eq('id', editingCourse.id)
            .select()
            .maybeSingle(); // single() 대신 maybeSingle() 사용
        } else {
          console.log('🆕 새 수업 생성');
          courseData.created_at = new Date().toISOString();
          result = await supabase
            .from('courses')
            .insert([courseData])
            .select()
            .maybeSingle(); // single() 대신 maybeSingle() 사용
        }

        if (result.error) {
          console.error('💥 Supabase 오류:', result.error);
          throw result.error;
        }

        if (!result.data) {
          console.error('💥 데이터가 반환되지 않음');
          throw new Error('수업 데이터가 반환되지 않았습니다.');
        }

        return result.data;
      };

      const savedCourse = await savePromise();
      
      const statusMessages = {
        'draft': '초안으로 저장',
        'published': '발행'
      };

      toast.success(`✅ 수업이 ${statusMessages[status]}되었습니다.`);
      console.log('✅ 수업 저장 성공:', savedCourse);

      if (onSaveSuccess) {
        await onSaveSuccess(savedCourse);
      }

    } catch (error) {
      console.error('💥 수업 저장 오류:', error);
      
      let errorMessage = '수업 저장 중 오류가 발생했습니다.';
      
      // RLS 관련 오류 구분
      if (error.message?.includes('RLS') || error.message?.includes('policy') || error.code === '42501') {
        errorMessage = '권한이 없습니다. 관리자로 로그인했는지 확인해주세요.';
      } else if (error.code === 'PGRST116') {
        errorMessage = '데이터를 찾을 수 없습니다.';
      } else if (error.code === '23505') {
        errorMessage = '이미 존재하는 수업 제목입니다.';
      } else if (error.code === '23514') {
        errorMessage = '입력한 데이터 형식이 올바르지 않습니다.';
      } else if (error.message) {
        errorMessage = `오류: ${error.message}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
      console.log('🏁 수업 저장 완료');
    }
  };

  // 미리보기 (수업 상태에 따라 적절한 페이지로)
  const handlePreview = () => {
    if (!editingCourse?.id) {
      toast.info('수업을 먼저 저장한 후 미리보기가 가능합니다.');
      return;
    }

    // 발행된 수업은 실제 수업 페이지로, 나머지는 관리자 미리보기로
    if (formData.status === 'published') {
      window.open(`/course-details/${editingCourse.id}`, '_blank');
    } else {
      window.open(`/dashboard2/admin/class-description/preview/${editingCourse.id}`, '_blank');
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

  // 리스트 에디터 컴포넌트
  const ListEditor = ({ title, items, onAdd, onRemove, placeholder }) => {
    const [inputValue, setInputValue] = useState('');

    const handleAdd = () => {
      if (inputValue.trim()) {
        onAdd(inputValue.trim());
        setInputValue('');
      }
    };

    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAdd();
      }
    };

    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium">{title}</Label>
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1"
          />
          <Button type="button" onClick={handleAdd} variant="outline" size="sm">
            추가
          </Button>
        </div>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded">
              <span className="text-sm">{item}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemove(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">{title}을 추가해보세요.</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 액션 버튼 */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handlePreview} disabled={!editingCourse}>
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
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                기본 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">수업 제목 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="예: 수학의 문 - 개별오답관리 수업"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">부제목</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => handleChange('subtitle', e.target.value)}
                  placeholder="수업의 간단한 부제목을 입력하세요"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">수업 설명 *</Label>
                <MinimalTiptapEditor
                  id="description"
                  value={formData.description}
                  onChange={(value) => handleChange('description', value)}
                  placeholder="수업 설명을 자세히 입력하세요..."
                  className="w-full"
                  editorClassName="min-h-[300px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>수업 세부 내용</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ListEditor
                title="수업에서 배울 내용"
                items={formData.what_you_will_learn}
                onAdd={(value) => addListItem('what_you_will_learn', value)}
                onRemove={(index) => removeListItem('what_you_will_learn', index)}
                placeholder="예: 개별 오답 분석 방법"
              />

              <ListEditor
                title="수업 참여 요구사항"
                items={formData.requirements}
                onAdd={(value) => addListItem('requirements', value)}
                onRemove={(index) => removeListItem('requirements', index)}
                placeholder="예: 기본적인 수학 개념 이해"
              />

              <ListEditor
                title="수업에 포함된 내용"
                items={formData.includes}
                onAdd={(value) => addListItem('includes', value)}
                onRemove={(index) => removeListItem('includes', index)}
                placeholder="예: 개별 맞춤 문제집 제공"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>커리큘럼</CardTitle>
              <p className="text-sm text-muted-foreground">주차별 학습 내용을 작성하세요</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <ListEditor
                title="주차별 커리큘럼"
                items={formData.curriculum}
                onAdd={(value) => addListItem('curriculum', value)}
                onRemove={(index) => removeListItem('curriculum', index)}
                placeholder="예: 1주차: 기본 개념 정립 및 기초 문제 풀이"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>수강 후기</CardTitle>
              <p className="text-sm text-muted-foreground">학생들의 수강 후기를 관리하세요</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <ListEditor
                title="수강 후기"
                items={formData.reviews}
                onAdd={(value) => addListItem('reviews', value)}
                onRemove={(index) => removeListItem('reviews', index)}
                placeholder="예: 수학 실력이 크게 향상되었습니다 - 김○○ 학생"
              />
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
                        <span className="text-xs text-muted-foreground">작성 중인 수업 (공개되지 않음)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="published">
                      <div className="flex flex-col">
                        <span className="font-medium">발행됨</span>
                        <span className="text-xs text-muted-foreground">공개된 수업 (모든 사용자가 볼 수 있음)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  💡 팁: 상태를 선택하면 상단의 버튼이 <strong>{primaryAction.label}</strong>로 바뀝니다.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleChange('featured', checked)}
                />
                <Label htmlFor="featured">추천 수업</Label>
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
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="학습분석">학습분석</SelectItem>
                        <SelectItem value="시험대비">시험대비</SelectItem>
                        <SelectItem value="내신,모의 기출분석">내신,모의 기출분석</SelectItem>
                        <SelectItem value="선행수업">선행수업</SelectItem>
                        <SelectItem value="개별오답관리">개별오답관리</SelectItem>
                      </>
                    )}
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
                  <Button type="button" onClick={addTag} variant="outline">
                    추가
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                수업 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seats">정원</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="seats"
                      type="number"
                      value={formData.seats}
                      onChange={(e) => handleChange('seats', parseInt(e.target.value) || 0)}
                      className="pl-10"
                      min="1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weeks">기간(주)</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="weeks"
                      type="number"
                      value={formData.weeks}
                      onChange={(e) => handleChange('weeks', parseInt(e.target.value) || 0)}
                      className="pl-10"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="semesters">학기</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="semesters"
                      type="number"
                      value={formData.semesters}
                      onChange={(e) => handleChange('semesters', parseInt(e.target.value) || 0)}
                      className="pl-10"
                      min="1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">가격(원)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleChange('price', parseInt(e.target.value) || 0)}
                      className="pl-10"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>미디어</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image_url">대표 이미지 URL</Label>
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

              <div className="space-y-2">
                <Label htmlFor="video_url">소개 동영상 URL</Label>
                <Input
                  id="video_url"
                  value={formData.video_url}
                  onChange={(e) => handleChange('video_url', e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              <Button variant="outline" className="w-full" disabled>
                <Upload className="h-4 w-4 mr-2" />
                파일 업로드 (준비 중)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>강사 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="author_name">강사명</Label>
                <Input
                  id="author_name"
                  value={formData.author_name}
                  onChange={(e) => handleChange('author_name', e.target.value)}
                  placeholder="강사 이름"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course_label">수업 라벨</Label>
                <Input
                  id="course_label"
                  value={formData.course_label}
                  onChange={(e) => handleChange('course_label', e.target.value)}
                  placeholder="예: 전문가 과정"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 