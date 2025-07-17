// src/components/admin/dashboard/menu-management/hooks/useMenuManagement.js
import { useState, useEffect } from 'react';
import { 
  fetchAllCourseMenu, 
  addCourseMenu, 
  updateCourseMenuItem, 
  deleteCourseMenuItem, 
  updateCourseMenu,
  toggleCourseMenuActive 
} from '@/lib/supabase/fetchCourseMenu';
import { toast } from 'sonner';

export const useMenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentMenuItem, setCurrentMenuItem] = useState(null);
  const [menuForm, setMenuForm] = useState({ 
    name: '', 
    slug: '', 
    description: '', 
    icon: '📚', 
    color: '#6B7280',
    is_active: true 
  });

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
      return true;
    } catch (error) {
      console.error('❌ 메뉴 저장 오류:', error);
      toast.error('메뉴 저장에 실패했습니다.');
      return false;
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

  useEffect(() => {
    fetchMenuItems();
  }, []);

  return {
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
    openEditDialog,
    resetForm
  };
};
