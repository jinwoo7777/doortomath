"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  fetchAllSchedulesForAdmin,
  addSchedule,
  updateSchedule,
  deleteSchedule,
  toggleScheduleActive,
  getDayName,
  getDayNumber
} from '@/lib/supabase/fetchSchedules';

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
  Clock, 
  Users, 
  GraduationCap,
  BookOpen,
  MapPin
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from 'sonner';

const ScheduleManagementContent = () => {
  const [schedules, setSchedules] = useState({
    초등부: [],
    중등부: [],
    고등부: []
  });
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [activeTab, setActiveTab] = useState('초등부');
  
  const [scheduleForm, setScheduleForm] = useState({
    grade: '초등부',
    day_of_week: 1,
    time_slot: '',
    subject: '',
    teacher_name: '',
    classroom: '',
    description: '',
    max_students: 30,
    current_students: 0,
    is_active: true
  });

  const supabase = createClientComponentClient();
  const searchParams = useSearchParams();
  const selectedGrade = searchParams.get('grade');

  // 디버깅을 위한 useEffect 추가
  useEffect(() => {
    console.log('🔍 [ScheduleManagementContent] URL 파라미터 변경 감지:');
    console.log('  - searchParams:', Array.from(searchParams.entries()));
    console.log('  - selectedGrade:', selectedGrade);
    console.log('  - 전체 시간표 모드:', !selectedGrade);
  }, [searchParams, selectedGrade]);

  useEffect(() => {
    const initialGrade = searchParams.get('grade');
    if (initialGrade && ['초등부', '중등부', '고등부'].includes(initialGrade)) {
      setActiveTab(initialGrade);
    }
    fetchSchedules();
    fetchTeachers();
  }, [searchParams]);

  const fetchTeachers = async () => {
    try {
      console.log('🔄 강사 목록 로드 시작');

      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      
      console.log('✅ 강사 목록 로드 성공:', data?.length || 0);
      setTeachers(data || []);
    } catch (error) {
      console.error('❌ 강사 목록 불러오기 오류:', error);
    }
  };

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const [elementary, middle, high] = await Promise.all([
        fetchAllSchedulesForAdmin('초등부'),
        fetchAllSchedulesForAdmin('중등부'),
        fetchAllSchedulesForAdmin('고등부')
      ]);

      setSchedules({
        초등부: elementary,
        중등부: middle,
        고등부: high
      });
      
      console.log('✅ 시간표 로드 성공:', {
        초등부: elementary.length,
        중등부: middle.length,
        고등부: high.length
      });
    } catch (error) {
      console.error('❌ 시간표 불러오기 오류:', error);
      toast.error('시간표를 불러오는 데 실패했습니다.');
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setScheduleForm({
      ...scheduleForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSelectChange = (name, value) => {
    setScheduleForm({
      ...scheduleForm,
      [name]: value
    });
  };

  const handleAddEditSchedule = async () => {
    if (!scheduleForm.subject.trim() || !scheduleForm.time_slot.trim()) {
      toast.error('과목명과 시간을 입력해주세요.');
      return;
    }

    try {
      const teacherName = scheduleForm.teacher_name === 'unassigned' ? null : scheduleForm.teacher_name.trim();

      if (currentSchedule) {
        // 수정
        const updated = await updateSchedule(currentSchedule.id, {
          grade: scheduleForm.grade,
          day_of_week: scheduleForm.day_of_week,
          time_slot: scheduleForm.time_slot.trim(),
          subject: scheduleForm.subject.trim(),
          teacher_name: teacherName,
          classroom: scheduleForm.classroom.trim() || null,
          description: scheduleForm.description.trim() || null,
          max_students: parseInt(scheduleForm.max_students) || 30,
          current_students: parseInt(scheduleForm.current_students) || 0,
          is_active: scheduleForm.is_active
        });

        setSchedules(prev => ({
          ...prev,
          [scheduleForm.grade]: prev[scheduleForm.grade].map(item => 
            item.id === currentSchedule.id ? updated : item
          )
        }));

        toast.success('시간표가 업데이트되었습니다.');
      } else {
        // 추가
        const newSchedule = await addSchedule({
          grade: scheduleForm.grade,
          day_of_week: scheduleForm.day_of_week,
          time_slot: scheduleForm.time_slot.trim(),
          subject: scheduleForm.subject.trim(),
          teacher_name: teacherName,
          classroom: scheduleForm.classroom.trim() || null,
          description: scheduleForm.description.trim() || null,
          max_students: parseInt(scheduleForm.max_students) || 30,
          current_students: parseInt(scheduleForm.current_students) || 0,
          is_active: scheduleForm.is_active
        });

        setSchedules(prev => ({
          ...prev,
          [scheduleForm.grade]: [...prev[scheduleForm.grade], newSchedule]
            .sort((a, b) => {
              if (a.day_of_week !== b.day_of_week) {
                return a.day_of_week - b.day_of_week;
              }
              return a.time_slot.localeCompare(b.time_slot);
            })
        }));

        toast.success('새 시간표가 추가되었습니다.');
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('❌ 시간표 저장 오류:', error);
      toast.error(`시간표 저장에 실패했습니다: ${error.message}`);
    }
  };

  const resetForm = () => {
    setScheduleForm({
      grade: activeTab,
      day_of_week: 1,
      time_slot: '',
      subject: '',
      teacher_name: 'unassigned',
      classroom: '',
      description: '',
      max_students: 30,
      current_students: 0,
      is_active: true
    });
    setCurrentSchedule(null);
  };

  const handleDeleteSchedule = async (schedule) => {
    if (!confirm(`"${schedule.subject} (${getDayName(schedule.day_of_week)} ${schedule.time_slot})" 시간표를 정말 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteSchedule(schedule.id);
      
      setSchedules(prev => ({
        ...prev,
        [schedule.grade]: prev[schedule.grade].filter(item => item.id !== schedule.id)
      }));

      toast.success('시간표가 삭제되었습니다.');
    } catch (error) {
      console.error('❌ 시간표 삭제 오류:', error);
      toast.error('시간표 삭제에 실패했습니다.');
    }
  };

  const handleToggleActive = async (schedule) => {
    try {
      const updated = await toggleScheduleActive(schedule.id, !schedule.is_active);
      
      setSchedules(prev => ({
        ...prev,
        [schedule.grade]: prev[schedule.grade].map(item => 
          item.id === schedule.id ? updated : item
        )
      }));

      toast.success(`시간표가 ${!schedule.is_active ? '활성화' : '비활성화'}되었습니다.`);
    } catch (error) {
      console.error('❌ 시간표 활성화 토글 오류:', error);
      toast.error('상태 변경에 실패했습니다.');
    }
  };

  const openAddDialog = (grade = activeTab) => {
    resetForm();
    setScheduleForm(prev => ({ ...prev, grade }));
    setIsDialogOpen(true);
  };

  const openEditDialog = (schedule) => {
    setCurrentSchedule(schedule);
    setScheduleForm({
      grade: schedule.grade,
      day_of_week: schedule.day_of_week,
      time_slot: schedule.time_slot || '',
      subject: schedule.subject || '',
      teacher_name: schedule.teacher_name || 'unassigned',
      classroom: schedule.classroom || '',
      description: schedule.description || '',
      max_students: schedule.max_students || 30,
      current_students: schedule.current_students || 0,
      is_active: schedule.is_active !== false
    });
    setIsDialogOpen(true);
  };

  const getStats = (grade) => {
    const gradeSchedules = schedules[grade];
    return {
      total: gradeSchedules.length,
      active: gradeSchedules.filter(s => s.is_active).length,
      totalStudents: gradeSchedules.reduce((sum, s) => sum + (s.current_students || 0), 0),
      maxCapacity: gradeSchedules.reduce((sum, s) => sum + (s.max_students || 0), 0)
    };
  };

  const renderScheduleTable = (grade) => {
    const gradeSchedules = schedules[grade];
    
    if (gradeSchedules.length === 0) {
      return (
        <div className="text-center py-8">
          <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">등록된 시간표가 없습니다</p>
          <p className="text-muted-foreground mb-4">{grade} 시간표를 추가해보세요.</p>
          <Button onClick={() => openAddDialog(grade)}>
            <Plus className="h-4 w-4 mr-2" />
            시간표 추가
          </Button>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>요일</TableHead>
            <TableHead>시간</TableHead>
            <TableHead>과목</TableHead>
            <TableHead>강사</TableHead>
            <TableHead>강의실</TableHead>
            <TableHead>수강인원</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {gradeSchedules.map((schedule) => (
            <TableRow 
              key={schedule.id}
              className={!schedule.is_active ? 'opacity-60' : ''}
            >
              <TableCell className="font-medium">
                {getDayName(schedule.day_of_week)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  {schedule.time_slot}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{schedule.subject}</p>
                  {schedule.description && (
                    <p className="text-xs text-muted-foreground">{schedule.description}</p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {schedule.teacher_name && (
                  <div className="flex items-center gap-1">
                    <GraduationCap className="h-3 w-3 text-muted-foreground" />
                    {schedule.teacher_name}
                  </div>
                )}
              </TableCell>
              <TableCell>
                {schedule.classroom && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    {schedule.classroom}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className={
                    (schedule.current_students || 0) >= (schedule.max_students || 30) 
                      ? 'text-red-600 font-medium' : ''
                  }>
                    {schedule.current_students || 0}/{schedule.max_students || 30}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={schedule.is_active ? "default" : "secondary"}>
                  {schedule.is_active ? "활성" : "비활성"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleToggleActive(schedule)}
                    title={schedule.is_active ? "비활성화" : "활성화"}
                  >
                    {schedule.is_active ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEditDialog(schedule)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteSchedule(schedule)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const renderAllGradesView = () => {
    return (
      <div className="space-y-8">
        {['초등부', '중등부', '고등부'].map((grade) => {
          const gradeSchedules = schedules[grade];
          const stats = getStats(grade);
          
          return (
            <div key={grade} className="space-y-4">
              {/* 학년별 헤더 */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{grade} 시간표</h3>
                  <p className="text-sm text-muted-foreground">
                    총 {stats.total}개 수업 | 활성 {stats.active}개 | 수강생 {stats.totalStudents}명
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => openAddDialog(grade)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {grade} 시간표 추가
                </Button>
              </div>

              {/* 시간표 테이블 */}
              <Card>
                <CardContent className="pt-6">
                  {renderScheduleTable(grade)}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {selectedGrade ? `${selectedGrade} 시간표 관리` : '수업시간표 관리'}
          </h2>
          <p className="text-muted-foreground">
            {selectedGrade 
              ? `${selectedGrade} 수업시간표를 생성, 편집, 관리합니다.`
              : '학년별 수업시간표를 생성, 편집, 관리합니다.'
            }
          </p>
        </div>
        <Button onClick={() => openAddDialog()} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          새 시간표 추가
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-2 text-sm text-muted-foreground">시간표를 불러오는 중...</p>
          </div>
        </div>
      ) : selectedGrade ? (
        // 특정 학년 선택된 경우 - 기존 탭 형태
        (() => {
          console.log('📝 [ScheduleManagementContent] 탭 모드로 렌더링:', selectedGrade);
          return (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="초등부">초등부</TabsTrigger>
                <TabsTrigger value="중등부">중등부</TabsTrigger>
                <TabsTrigger value="고등부">고등부</TabsTrigger>
              </TabsList>

              {['초등부', '중등부', '고등부'].map((grade) => {
                const stats = getStats(grade);
                
                return (
                  <TabsContent key={grade} value={grade} className="space-y-4">
                    {/* 통계 카드 */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">총 시간표</CardTitle>
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{stats.total}</div>
                          <p className="text-xs text-muted-foreground">등록된 수업</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">활성 수업</CardTitle>
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{stats.active}</div>
                          <p className="text-xs text-muted-foreground">현재 진행 중</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">수강생</CardTitle>
                          <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{stats.totalStudents}</div>
                          <p className="text-xs text-muted-foreground">현재 수강 중</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">수용 인원</CardTitle>
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{stats.maxCapacity}</div>
                          <p className="text-xs text-muted-foreground">최대 수용 가능</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* 시간표 테이블 */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>{grade} 시간표</CardTitle>
                          <Button 
                            variant="outline" 
                            onClick={() => openAddDialog(grade)}
                            className="flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            시간표 추가
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {renderScheduleTable(grade)}
                      </CardContent>
                    </Card>
                  </TabsContent>
                );
              })}
            </Tabs>
          );
        })()
      ) : (
        // 전체 시간표 보기 - 모든 학년을 세로로 나열
        (() => {
          console.log('📝 [ScheduleManagementContent] 전체 시간표 모드로 렌더링');
          return renderAllGradesView();
        })()
      )}

      {/* 추가/편집 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentSchedule ? '시간표 수정' : '새 시간표 추가'}
            </DialogTitle>
            <DialogDescription>
              수업시간표 정보를 입력하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="grade" className="text-right">
                학년 *
              </Label>
              <Select 
                value={scheduleForm.grade} 
                onValueChange={(value) => handleSelectChange('grade', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="초등부">초등부</SelectItem>
                  <SelectItem value="중등부">중등부</SelectItem>
                  <SelectItem value="고등부">고등부</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="day_of_week" className="text-right">
                요일 *
              </Label>
              <Select 
                value={scheduleForm.day_of_week.toString()} 
                onValueChange={(value) => handleSelectChange('day_of_week', parseInt(value))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">월요일</SelectItem>
                  <SelectItem value="2">화요일</SelectItem>
                  <SelectItem value="3">수요일</SelectItem>
                  <SelectItem value="4">목요일</SelectItem>
                  <SelectItem value="5">금요일</SelectItem>
                  <SelectItem value="6">토요일</SelectItem>
                  <SelectItem value="7">일요일</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time_slot" className="text-right">
                시간 *
              </Label>
              <Input
                id="time_slot"
                name="time_slot"
                value={scheduleForm.time_slot}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="예: 09:00-10:00"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject" className="text-right">
                과목 *
              </Label>
              <Input
                id="subject"
                name="subject"
                value={scheduleForm.subject}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="예: 중1수학"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="teacher_name" className="text-right">
                강사
              </Label>
              <Select 
                value={scheduleForm.teacher_name} 
                onValueChange={(value) => handleSelectChange('teacher_name', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="강사를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">미배정</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.name}>
                      <div className="flex items-center gap-2">
                        <span>{teacher.name}</span>
                        {teacher.specialization && teacher.specialization.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            ({teacher.specialization.slice(0, 2).join(', ')})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="classroom" className="text-right">
                강의실
              </Label>
              <Input
                id="classroom"
                name="classroom"
                value={scheduleForm.classroom}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="예: A101"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="max_students" className="text-right">
                최대 인원
              </Label>
              <Input
                id="max_students"
                name="max_students"
                type="number"
                value={scheduleForm.max_students}
                onChange={handleInputChange}
                className="col-span-1"
                min="1"
              />
              <Label htmlFor="current_students" className="text-right">
                현재 인원
              </Label>
              <Input
                id="current_students"
                name="current_students"
                type="number"
                value={scheduleForm.current_students}
                onChange={handleInputChange}
                className="col-span-1"
                min="0"
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                설명
              </Label>
              <Textarea
                id="description"
                name="description"
                value={scheduleForm.description}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="수업에 대한 추가 설명"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_active" className="text-right">
                활성화
              </Label>
              <div className="col-span-3">
                <Switch
                  id="is_active"
                  name="is_active"
                  checked={scheduleForm.is_active}
                  onCheckedChange={(checked) => 
                    setScheduleForm(prev => ({ ...prev, is_active: checked }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleAddEditSchedule}>
              {currentSchedule ? '수정' : '추가'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduleManagementContent; 