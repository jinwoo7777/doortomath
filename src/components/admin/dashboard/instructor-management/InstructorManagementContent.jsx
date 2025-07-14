"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit2, 
  X, 
  Eye, 
  EyeOff, 
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  User,
  Building,
  Clock
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const InstructorManagementContent = () => {
  const { session, userRole } = useAuth();
  const searchParams = useSearchParams();
  const [teachers, setTeachers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'list');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: [],
    bio: '',
    education: '',
    experience_years: 0,
    profile_image_url: '',
    is_active: true,
    hire_date: ''
  });

  const [specializationInput, setSpecializationInput] = useState('');

  const supabase = createClientComponentClient();

  useEffect(() => {
    if (session?.user?.id && userRole === 'admin') {
      fetchTeachers();
      fetchSchedules();
    }
  }, [session?.user?.id, userRole]);

  // URL 파라미터 변경 시 activeTab 업데이트
  useEffect(() => {
    const tab = searchParams.get('tab');
    console.log('🔍 URL 파라미터 확인:', { tab, currentActiveTab: activeTab });
    if (tab && (tab === 'list' || tab === 'schedules')) {
      setActiveTab(tab);
      console.log('✅ activeTab 업데이트:', tab);
    }
  }, [searchParams]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      console.log('🔄 강사 목록 로드 시작');

      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('✅ 강사 목록 로드 성공:', data?.length || 0);
      setTeachers(data || []);
    } catch (error) {
      console.error('❌ 강사 목록 불러오기 오류:', error);
      
      if (error.message?.includes('RLS') || error.message?.includes('policy') || error.code === '42501') {
        toast.error('권한이 없습니다. 관리자로 로그인했는지 확인해주세요.');
      } else {
        toast.error('강사 목록을 불러오는 데 실패했습니다.');
      }
    }
    setLoading(false);
  };

  const fetchSchedules = async () => {
    try {
      console.log('🔄 시간표 데이터 로드 시작');

      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('day_of_week', { ascending: true });

      if (error) throw error;
      
      console.log('✅ 시간표 데이터 로드 성공:', data?.length || 0);
      setSchedules(data || []);
    } catch (error) {
      console.error('❌ 시간표 데이터 불러오기 오류:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTeacherForm({
      ...teacherForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const addSpecialization = () => {
    if (specializationInput.trim() && !teacherForm.specialization.includes(specializationInput.trim())) {
      setTeacherForm({
        ...teacherForm,
        specialization: [...teacherForm.specialization, specializationInput.trim()]
      });
      setSpecializationInput('');
    }
  };

  const removeSpecialization = (spec) => {
    setTeacherForm({
      ...teacherForm,
      specialization: teacherForm.specialization.filter(s => s !== spec)
    });
  };

  const handleSpecializationKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSpecialization();
    }
  };

  const handleSaveTeacher = async () => {
    if (!teacherForm.name.trim()) {
      toast.error('강사 이름을 입력해주세요.');
      return;
    }

    try {
      const teacherData = {
        name: teacherForm.name.trim(),
        email: teacherForm.email.trim() || null,
        phone: teacherForm.phone.trim() || null,
        specialization: teacherForm.specialization,
        bio: teacherForm.bio.trim() || null,
        education: teacherForm.education.trim() || null,
        experience_years: parseInt(teacherForm.experience_years) || 0,
        profile_image_url: teacherForm.profile_image_url.trim() || null,
        is_active: teacherForm.is_active,
        hire_date: teacherForm.hire_date || null
      };

      console.log('🔄 강사 데이터 저장 시작:', currentTeacher ? '수정' : '추가');

      if (currentTeacher) {
        // 수정
        const { data, error } = await supabase
          .from('teachers')
          .update(teacherData)
          .eq('id', currentTeacher.id)
          .select()
          .single();

        if (error) throw error;

        setTeachers(prev => prev.map(teacher => 
          teacher.id === currentTeacher.id ? data : teacher
        ));

        console.log('✅ 강사 정보 수정 성공:', data);
        toast.success('강사 정보가 업데이트되었습니다.');
      } else {
        // 추가
        const { data, error } = await supabase
          .from('teachers')
          .insert([teacherData])
          .select()
          .single();

        if (error) throw error;

        setTeachers(prev => [data, ...prev]);
        console.log('✅ 새 강사 추가 성공:', data);
        toast.success('새 강사가 추가되었습니다.');
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('❌ 강사 저장 오류:', error);
      
      if (error.code === '23505') {
        toast.error('이미 등록된 이메일입니다.');
      } else if (error.message?.includes('RLS') || error.message?.includes('policy') || error.code === '42501') {
        toast.error('권한이 없습니다. 관리자로 로그인했는지 확인해주세요.');
      } else {
        toast.error(`강사 저장에 실패했습니다: ${error.message}`);
      }
    }
  };

  const handleDeleteTeacher = async (teacher) => {
    // 담당 수업이 있는지 확인
    const teacherSchedules = schedules.filter(s => s.teacher_name === teacher.name);
    
    if (teacherSchedules.length > 0) {
      const confirmMessage = `${teacher.name} 강사는 현재 ${teacherSchedules.length}개의 수업을 담당하고 있습니다.\n정말로 삭제하시겠습니까?`;
      if (!confirm(confirmMessage)) return;
    } else {
      if (!confirm(`${teacher.name} 강사를 정말 삭제하시겠습니까?`)) return;
    }

    try {
      console.log('🔄 강사 삭제 시작:', teacher.name);

      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', teacher.id);

      if (error) throw error;

      setTeachers(prev => prev.filter(t => t.id !== teacher.id));
      console.log('✅ 강사 삭제 성공:', teacher.name);
      toast.success('강사가 삭제되었습니다.');
    } catch (error) {
      console.error('❌ 강사 삭제 오류:', error);
      
      if (error.message?.includes('RLS') || error.message?.includes('policy') || error.code === '42501') {
        toast.error('권한이 없습니다. 관리자로 로그인했는지 확인해주세요.');
      } else {
        toast.error('강사 삭제에 실패했습니다.');
      }
    }
  };

  const handleToggleActive = async (teacher) => {
    try {
      const newStatus = !teacher.is_active;
      console.log('🔄 강사 상태 변경 시작:', teacher.name, newStatus ? '활성화' : '비활성화');

      const { data, error } = await supabase
        .from('teachers')
        .update({ 
          is_active: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', teacher.id)
        .select()
        .single();

      if (error) throw error;

      setTeachers(prev => prev.map(t => t.id === teacher.id ? data : t));
      console.log('✅ 강사 상태 변경 성공:', teacher.name, newStatus ? '활성화' : '비활성화');
      toast.success(`강사가 ${newStatus ? '활성화' : '비활성화'}되었습니다.`);
    } catch (error) {
      console.error('❌ 강사 상태 변경 오류:', error);
      
      if (error.message?.includes('RLS') || error.message?.includes('policy') || error.code === '42501') {
        toast.error('권한이 없습니다. 관리자로 로그인했는지 확인해주세요.');
      } else {
        toast.error('상태 변경에 실패했습니다.');
      }
    }
  };

  const handleUnassignSchedule = async (schedule) => {
    if (!confirm(`"${schedule.subject} (${getDayName(schedule.day_of_week)} ${schedule.time_slot})" 수업에서 강사 배정을 취소하시겠습니까?`)) {
      return;
    }

    try {
      console.log('🔄 수업 강사 배정 취소 시작:', schedule.subject);

      const { data, error } = await supabase
        .from('schedules')
        .update({ 
          teacher_name: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', schedule.id)
        .select()
        .single();

      if (error) throw error;

      // 로컬 상태 업데이트
      setSchedules(prev => prev.map(s => s.id === schedule.id ? data : s));
      
      console.log('✅ 수업 강사 배정 취소 성공:', schedule.subject);
      toast.success('수업 강사 배정이 취소되었습니다.');
      
      // schedules 데이터 새로고침
      fetchSchedules();
    } catch (error) {
      console.error('❌ 수업 강사 배정 취소 오류:', error);
      
      if (error.message?.includes('RLS') || error.message?.includes('policy') || error.code === '42501') {
        toast.error('권한이 없습니다. 관리자로 로그인했는지 확인해주세요.');
      } else {
        toast.error('수업 강사 배정 취소에 실패했습니다.');
      }
    }
  };

  const handleAssignSchedule = async (schedule, teacher) => {
    if (!confirm(`"${schedule.subject} (${getDayName(schedule.day_of_week)} ${schedule.time_slot})" 수업을 ${teacher.name} 강사에게 배정하시겠습니까?`)) {
      return;
    }

    try {
      console.log('🔄 수업 강사 배정 시작:', schedule.subject, '→', teacher.name);

      const { data, error } = await supabase
        .from('schedules')
        .update({ 
          teacher_name: teacher.name,
          updated_at: new Date().toISOString()
        })
        .eq('id', schedule.id)
        .select()
        .single();

      if (error) throw error;

      // 로컬 상태 업데이트
      setSchedules(prev => prev.map(s => s.id === schedule.id ? data : s));
      
      console.log('✅ 수업 강사 배정 성공:', schedule.subject, '→', teacher.name);
      toast.success(`${teacher.name} 강사에게 수업이 배정되었습니다.`);
      
      // schedules 데이터 새로고침
      fetchSchedules();
    } catch (error) {
      console.error('❌ 수업 강사 배정 오류:', error);
      
      if (error.message?.includes('RLS') || error.message?.includes('policy') || error.code === '42501') {
        toast.error('권한이 없습니다. 관리자로 로그인했는지 확인해주세요.');
      } else {
        toast.error('수업 강사 배정에 실패했습니다.');
      }
    }
  };

  const resetForm = () => {
    setTeacherForm({
      name: '',
      email: '',
      phone: '',
      specialization: [],
      bio: '',
      education: '',
      experience_years: 0,
      profile_image_url: '',
      is_active: true,
      hire_date: ''
    });
    setSpecializationInput('');
    setCurrentTeacher(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (teacher) => {
    setCurrentTeacher(teacher);
    setTeacherForm({
      name: teacher.name || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      specialization: teacher.specialization || [],
      bio: teacher.bio || '',
      education: teacher.education || '',
      experience_years: teacher.experience_years || 0,
      profile_image_url: teacher.profile_image_url || '',
      is_active: teacher.is_active !== false,
      hire_date: teacher.hire_date || ''
    });
    setIsDialogOpen(true);
  };

  const getTeacherSchedules = (teacherName) => {
    return schedules.filter(schedule => 
      schedule.teacher_name === teacherName && schedule.is_active
    );
  };

  const getDayName = (dayOfWeek) => {
    const days = ['', '월', '화', '수', '목', '금', '토', '일'];
    return days[dayOfWeek] || '';
  };

  const getStats = () => {
    const activeTeachers = teachers.filter(t => t.is_active).length;
    const totalSchedules = schedules.filter(s => s.is_active).length;
    const assignedSchedules = schedules.filter(s => s.is_active && s.teacher_name).length;
    
    return {
      total: teachers.length,
      active: activeTeachers,
      totalSchedules,
      assignedSchedules,
      unassignedSchedules: totalSchedules - assignedSchedules
    };
  };

  const stats = getStats();

  const renderTeachersList = () => (
    <div className="space-y-4">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 강사</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">등록된 모든 강사</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 강사</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">현재 활동 중</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">배정된 수업</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assignedSchedules}</div>
            <p className="text-xs text-muted-foreground">총 {stats.totalSchedules}개 중</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">미배정 수업</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.unassignedSchedules}</div>
            <p className="text-xs text-muted-foreground">강사 배정 필요</p>
          </CardContent>
        </Card>
      </div>

      {/* 강사 목록 테이블 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>강사 목록</CardTitle>
              <p className="text-sm text-muted-foreground">등록된 강사들을 관리하고 수업을 배정할 수 있습니다.</p>
            </div>
            <Button onClick={openAddDialog} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              새 강사 추가
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="mt-2 text-sm text-muted-foreground">강사 목록을 불러오는 중...</p>
              </div>
            </div>
          ) : teachers.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">등록된 강사가 없습니다</p>
              <p className="text-muted-foreground mb-4">첫 번째 강사를 추가해보세요.</p>
              <Button onClick={openAddDialog}>
                <Plus className="h-4 w-4 mr-2" />
                강사 추가
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>강사명</TableHead>
                    <TableHead>전문분야</TableHead>
                    <TableHead>연락처</TableHead>
                    <TableHead>경력</TableHead>
                    <TableHead>담당수업</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher) => {
                    const teacherSchedules = getTeacherSchedules(teacher.name);
                    return (
                      <TableRow 
                        key={teacher.id}
                        className={!teacher.is_active ? 'opacity-60' : ''}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">
                                {teacher.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{teacher.name}</p>
                              {teacher.email && (
                                <p className="text-xs text-muted-foreground">{teacher.email}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {teacher.specialization?.slice(0, 2).map((spec, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                            {teacher.specialization?.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{teacher.specialization.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {teacher.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{teacher.phone}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{teacher.experience_years}년</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{teacherSchedules.length}개</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={teacher.is_active ? "default" : "secondary"}>
                            {teacher.is_active ? "활성" : "비활성"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedTeacher(teacher);
                                setActiveTab('schedules');
                              }}
                              title="담당 수업 보기"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(teacher)}
                              title="편집"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleActive(teacher)}
                              title={teacher.is_active ? "비활성화" : "활성화"}
                            >
                              {teacher.is_active ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTeacher(teacher)}
                              className="text-destructive hover:text-destructive"
                              title="삭제"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderSchedulesView = () => {
    const teacher = selectedTeacher;
    const unassignedSchedules = schedules.filter(s => 
      s.is_active && (!s.teacher_name || s.teacher_name.trim() === '')
    );

    if (!teacher) {
      // 강사가 선택되지 않았을 때: 전체 배정 현황과 강사 선택 뷰
      return (
        <div className="space-y-6">
          {/* 전체 배정 현황 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">전체 수업</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{schedules.filter(s => s.is_active).length}</div>
                <p className="text-xs text-muted-foreground">활성 수업</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">배정된 수업</CardTitle>
                <User className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {schedules.filter(s => s.is_active && s.teacher_name).length}
                </div>
                <p className="text-xs text-muted-foreground">강사 배정 완료</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">미배정 수업</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{unassignedSchedules.length}</div>
                <p className="text-xs text-muted-foreground">배정 필요</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 강사 선택 카드 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  강사 선택
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  강사를 선택하여 담당 수업과 배정 가능한 수업을 확인하세요.
                </p>
              </CardHeader>
              <CardContent>
                {teachers.filter(t => t.is_active).length === 0 ? (
                  <div className="text-center py-8">
                    <GraduationCap className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">활성 강사가 없습니다.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {teachers.filter(t => t.is_active).map((teacher) => {
                      const teacherSchedules = getTeacherSchedules(teacher.name);
                      return (
                        <div 
                          key={teacher.id}
                          className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => setSelectedTeacher(teacher)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-sm">
                                  {teacher.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{teacher.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  경력 {teacher.experience_years}년
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{teacherSchedules.length}개</p>
                              <p className="text-xs text-muted-foreground">담당 수업</p>
                            </div>
                          </div>
                          {teacher.specialization && teacher.specialization.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {teacher.specialization.slice(0, 3).map((spec, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {spec}
                                </Badge>
                              ))}
                              {teacher.specialization.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{teacher.specialization.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 미배정 수업 목록 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  미배정 수업 ({unassignedSchedules.length}개)
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  강사 배정이 필요한 수업들입니다.
                </p>
              </CardHeader>
              <CardContent>
                {unassignedSchedules.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">모든 수업이 배정되었습니다!</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {unassignedSchedules.map((schedule) => (
                      <div key={schedule.id} className="p-3 border rounded-lg bg-orange-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{schedule.subject}</p>
                            <p className="text-sm text-muted-foreground">
                              {getDayName(schedule.day_of_week)}요일 {schedule.time_slot}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {schedule.grade} | {schedule.classroom}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-orange-700 border-orange-200">
                            미배정
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    // 강사가 선택되었을 때: 기존 로직 유지
    const teacherSchedules = getTeacherSchedules(teacher.name);

    return (
      <div className="space-y-6">
        {/* 선택된 강사 정보 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-lg">
                    {teacher.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <CardTitle>{teacher.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    경력 {teacher.experience_years}년 | 담당 수업 {teacherSchedules.length}개
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedTeacher(null);
                  setActiveTab('schedules');
                }}
              >
                전체 현황 보기
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 담당 수업 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                담당 수업 ({teacherSchedules.length}개)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teacherSchedules.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">담당 중인 수업이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {teacherSchedules.map((schedule) => (
                    <div key={schedule.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{schedule.subject}</p>
                          <p className="text-sm text-muted-foreground">
                            {getDayName(schedule.day_of_week)}요일 {schedule.time_slot}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {schedule.grade} | {schedule.classroom}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {schedule.current_students || 0}/{schedule.max_students || 30}명
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleUnassignSchedule(schedule)}
                            title="강사 배정 취소"
                          >
                            <X className="h-3 w-3 mr-1" />
                            수업취소
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 미배정 수업 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                미배정 수업 ({unassignedSchedules.length}개)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {unassignedSchedules.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">모든 수업이 배정되었습니다.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {unassignedSchedules.slice(0, 10).map((schedule) => (
                    <div key={schedule.id} className="p-3 border rounded-lg bg-orange-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{schedule.subject}</p>
                          <p className="text-sm text-muted-foreground">
                            {getDayName(schedule.day_of_week)}요일 {schedule.time_slot}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {schedule.grade} | {schedule.classroom}
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAssignSchedule(schedule, teacher)}
                          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          배정하기
                        </Button>
                      </div>
                    </div>
                  ))}
                  {unassignedSchedules.length > 10 && (
                    <p className="text-sm text-muted-foreground text-center">
                      외 {unassignedSchedules.length - 10}개 더...
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // 권한 확인
  if (!session || userRole !== 'admin') {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <p className="text-muted-foreground">관리자 권한이 필요합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold">강사 관리</h1>
        <p className="text-muted-foreground">강사 정보를 관리하고 수업을 배정합니다.</p>
      </div>

      {/* 탭 메뉴 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            강사 목록
          </TabsTrigger>
          <TabsTrigger value="schedules" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            수업 배정
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4 mt-6">
          {renderTeachersList()}
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4 mt-6">
          {renderSchedulesView()}
        </TabsContent>
      </Tabs>

      {/* 강사 추가/편집 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentTeacher ? '강사 정보 수정' : '새 강사 추가'}
            </DialogTitle>
            <DialogDescription>
              강사의 기본 정보와 전문 분야를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* 기본 정보 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                이름 *
              </Label>
              <Input
                id="name"
                name="name"
                value={teacherForm.name}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="강사 이름"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                이메일
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={teacherForm.email}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="example@email.com"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                연락처
              </Label>
              <Input
                id="phone"
                name="phone"
                value={teacherForm.phone}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="010-1234-5678"
              />
            </div>

            {/* 전문 분야 */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">전문 분야</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={specializationInput}
                    onChange={(e) => setSpecializationInput(e.target.value)}
                    onKeyPress={handleSpecializationKeyPress}
                    placeholder="예: 수학, 물리"
                    className="flex-1"
                  />
                  <Button type="button" onClick={addSpecialization} variant="outline">
                    추가
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {teacherForm.specialization.map((spec, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {spec}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeSpecialization(spec)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* 경력 및 기타 정보 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="experience_years" className="text-right">
                경력 (년)
              </Label>
              <Input
                id="experience_years"
                name="experience_years"
                type="number"
                value={teacherForm.experience_years}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="0"
                min="0"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hire_date" className="text-right">
                입사일
              </Label>
              <Input
                id="hire_date"
                name="hire_date"
                type="date"
                value={teacherForm.hire_date}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="education" className="text-right pt-2">
                학력
              </Label>
              <Textarea
                id="education"
                name="education"
                value={teacherForm.education}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="예: OO대학교 수학과 졸업"
                rows="2"
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="bio" className="text-right pt-2">
                소개
              </Label>
              <Textarea
                id="bio"
                name="bio"
                value={teacherForm.bio}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="강사 소개"
                rows="3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="profile_image_url" className="text-right">
                프로필 이미지
              </Label>
              <Input
                id="profile_image_url"
                name="profile_image_url"
                value={teacherForm.profile_image_url}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="이미지 URL"
              />
            </div>

            {/* 활성 상태 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_active" className="text-right">
                활성 상태
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={teacherForm.is_active}
                  onCheckedChange={(checked) => 
                    setTeacherForm({ ...teacherForm, is_active: checked })
                  }
                />
                <Label htmlFor="is_active" className="text-sm">
                  {teacherForm.is_active ? '활성' : '비활성'}
                </Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSaveTeacher}>
              {currentTeacher ? '수정' : '추가'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstructorManagementContent; 