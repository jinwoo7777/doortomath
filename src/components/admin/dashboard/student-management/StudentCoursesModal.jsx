"use client";

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  X, 
  Clock, 
  User, 
  MapPin,
  BookOpen,
  Calendar,
  Trash2,
  Edit2
} from 'lucide-react';

const StudentCoursesModal = ({ 
  isOpen, 
  onClose, 
  student, 
  onUpdate 
}) => {
  const [studentCourses, setStudentCourses] = useState([]);
  const [availableSchedules, setAvailableSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [enrollmentNotes, setEnrollmentNotes] = useState('');
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (isOpen && student) {
      fetchStudentCourses();
      fetchAvailableSchedules();
    }
  }, [isOpen, student]);

  const fetchStudentCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('student_schedules')
        .select(`
          *,
          schedules (
            id,
            grade,
            day_of_week,
            time_slot,
            subject,
            teacher_name,
            classroom,
            description,
            max_students,
            current_students
          )
        `)
        .eq('student_id', student.id);

      if (error) throw error;
      setStudentCourses(data || []);
    } catch (error) {
      console.error('Error fetching student courses:', error);
      toast.error('수강 중인 강의 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('is_active', true)
        .order('grade', { ascending: true })
        .order('day_of_week', { ascending: true })
        .order('time_slot', { ascending: true });

      if (error) throw error;
      setAvailableSchedules(data || []);
    } catch (error) {
      console.error('Error fetching available schedules:', error);
      toast.error('이용 가능한 강의 정보를 불러오는데 실패했습니다.');
    }
  };

  const getDayName = (dayOfWeek) => {
    const days = ['', '월', '화', '수', '목', '금', '토', '일'];
    return days[dayOfWeek] || '';
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return '수강중';
      case 'inactive': return '휴강';
      default: return status;
    }
  };

  const handleAddCourse = async () => {
    if (!selectedSchedule) {
      toast.error('강의를 선택해주세요.');
      return;
    }

    try {
      setLoading(true);
      
      // 이미 수강 중인 강의인지 확인
      const existingCourse = studentCourses.find(
        course => course.schedule_id === selectedSchedule
      );
      
      if (existingCourse) {
        toast.error('이미 수강 중인 강의입니다.');
        return;
      }

      const { error } = await supabase
        .from('student_schedules')
        .insert({
          student_id: student.id,
          schedule_id: selectedSchedule,
          enrollment_date: new Date().toISOString(),
          status: 'active',
          notes: enrollmentNotes || null
        });

      if (error) throw error;

      // 스케줄의 현재 학생 수 증가
      const schedule = availableSchedules.find(s => s.id === selectedSchedule);
      if (schedule) {
        await supabase
          .from('schedules')
          .update({ current_students: schedule.current_students + 1 })
          .eq('id', selectedSchedule);
      }

      toast.success('강의가 성공적으로 추가되었습니다.');
      setIsAddingCourse(false);
      setSelectedSchedule('');
      setEnrollmentNotes('');
      fetchStudentCourses();
      onUpdate && onUpdate();
    } catch (error) {
      console.error('Error adding course:', error);
      toast.error('강의 추가에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCourse = async (courseId, scheduleId) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('student_schedules')
        .delete()
        .eq('id', courseId);

      if (error) throw error;

      // 스케줄의 현재 학생 수 감소
      const schedule = availableSchedules.find(s => s.id === scheduleId);
      if (schedule && schedule.current_students > 0) {
        await supabase
          .from('schedules')
          .update({ current_students: schedule.current_students - 1 })
          .eq('id', scheduleId);
      }

      toast.success('강의가 성공적으로 제거되었습니다.');
      fetchStudentCourses();
      onUpdate && onUpdate();
    } catch (error) {
      console.error('Error removing course:', error);
      toast.error('강의 제거에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourseStatus = async (courseId, newStatus) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('student_schedules')
        .update({ status: newStatus })
        .eq('id', courseId);

      if (error) throw error;

      toast.success('강의 상태가 성공적으로 업데이트되었습니다.');
      fetchStudentCourses();
      onUpdate && onUpdate();
    } catch (error) {
      console.error('Error updating course status:', error);
      toast.error('강의 상태 업데이트에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourseNotes = async (courseId, notes) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('student_schedules')
        .update({ notes: notes })
        .eq('id', courseId);

      if (error) throw error;

      toast.success('수강 메모가 성공적으로 업데이트되었습니다.');
      fetchStudentCourses();
      setEditingCourse(null);
    } catch (error) {
      console.error('Error updating course notes:', error);
      toast.error('수강 메모 업데이트에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filteredAvailableSchedules = availableSchedules.filter(schedule => {
    // 이미 수강 중인 강의는 제외
    return !studentCourses.some(course => course.schedule_id === schedule.id);
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {student?.full_name}님의 수강 중인 강의
          </DialogTitle>
          <DialogDescription>
            학생의 수강 중인 강의 목록을 관리하고 새로운 강의를 추가할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 수강 중인 강의 목록 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">수강 중인 강의</h3>
              <Button
                onClick={() => setIsAddingCourse(true)}
                disabled={loading}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                강의 추가
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">로딩 중...</div>
              </div>
            ) : studentCourses.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>과목</TableHead>
                      <TableHead>요일/시간</TableHead>
                      <TableHead>강사</TableHead>
                      <TableHead>교실</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>수강 메모</TableHead>
                      <TableHead>관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentCourses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{course.schedules.subject}</div>
                            <div className="text-sm text-muted-foreground">
                              {course.schedules.grade}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {getDayName(course.schedules.day_of_week)} {course.schedules.time_slot}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{course.schedules.teacher_name || '미정'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{course.schedules.classroom || '미정'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={course.status}
                            onValueChange={(value) => handleUpdateCourseStatus(course.id, value)}
                            disabled={loading}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">수강중</SelectItem>
                              <SelectItem value="inactive">휴강</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {editingCourse === course.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={course.notes || ''}
                                onChange={(e) => {
                                  const updatedCourses = studentCourses.map(c =>
                                    c.id === course.id ? { ...c, notes: e.target.value } : c
                                  );
                                  setStudentCourses(updatedCourses);
                                }}
                                placeholder="수강 메모"
                                className="text-sm"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateCourseNotes(course.id, course.notes)}
                              >
                                저장
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingCourse(null)}
                              >
                                취소
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{course.notes || '메모 없음'}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingCourse(course.id)}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveCourse(course.id, course.schedule_id)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                수강 중인 강의가 없습니다.
              </div>
            )}
          </div>

          {/* 강의 추가 폼 */}
          {isAddingCourse && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">새 강의 추가</h4>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsAddingCourse(false);
                    setSelectedSchedule('');
                    setEnrollmentNotes('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="schedule">강의 선택</Label>
                  <Select value={selectedSchedule} onValueChange={setSelectedSchedule}>
                    <SelectTrigger>
                      <SelectValue placeholder="강의를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredAvailableSchedules.map((schedule) => (
                        <SelectItem key={schedule.id} value={schedule.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>
                              {schedule.subject} ({schedule.grade}) - {getDayName(schedule.day_of_week)} {schedule.time_slot}
                            </span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {schedule.teacher_name || '미정'}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">수강 메모</Label>
                  <Input
                    id="notes"
                    value={enrollmentNotes}
                    onChange={(e) => setEnrollmentNotes(e.target.value)}
                    placeholder="수강 관련 메모 (선택사항)"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingCourse(false);
                    setSelectedSchedule('');
                    setEnrollmentNotes('');
                  }}
                >
                  취소
                </Button>
                <Button
                  onClick={handleAddCourse}
                  disabled={!selectedSchedule || loading}
                >
                  추가
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StudentCoursesModal;