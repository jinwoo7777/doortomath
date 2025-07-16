"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import * as XLSX from 'xlsx';
import { getDayName } from '@/lib/supabase/fetchSchedules';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Edit2, 
  X, 
  Eye, 
  Users, 
  GraduationCap,
  BookOpen,
  Star,
  BarChart3,
  UserCheck,
  UserX,
  Phone,
  Mail,
  School,
  Calendar,
  MapPin,
  AlertCircle,
  Upload,
  FileSpreadsheet,
  Download,
  Check,
  AlertTriangle,
  Search
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
import StudentExamScoresModal from './StudentExamScoresModal';
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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import StudentCoursesModal from './StudentCoursesModal';

const StudentManagementContent = () => {
  const { session, userRole } = useAuth();
  const searchParams = useSearchParams();
  const [students, setStudents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [studentSchedules, setStudentSchedules] = useState([]);
  const [studentGrades, setStudentGrades] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all');
  
  // 엑셀 업로드 관련 state
  const [isExcelDialogOpen, setIsExcelDialogOpen] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [excelData, setExcelData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState(null);
  
  // 수강 강의 모달 관련 state
  const [isCoursesModalOpen, setIsCoursesModalOpen] = useState(false);
  const [selectedStudentForCourses, setSelectedStudentForCourses] = useState(null);
  const [selectedStudentForScores, setSelectedStudentForScores] = useState(null);
  const [isExamScoresModalOpen, setIsExamScoresModalOpen] = useState(false);
  
  // 수업 등록 모달 관련 state
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [selectedStudentForEnrollment, setSelectedStudentForEnrollment] = useState(null);
  const [enrollmentForm, setEnrollmentForm] = useState({
    schedule_id: '',
    start_date: '',
    monthly_fee: '',
    notes: ''
  });
  
  const [studentForm, setStudentForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    parent_name: '',
    parent_phone: '',
    birth_date: '',
    school: '',
    grade: '',
    school_grade: '', // 구체적인 학년 추가
    address: '',
    notes: '',
    is_priority: false,
    status: 'active'
  });

  const supabase = createClientComponentClient();

  useEffect(() => {
    if (session?.user?.id && userRole === 'admin') {
      fetchData();
    }
  }, [session?.user?.id, userRole]);

  // URL 파라미터 변경 시 activeTab 업데이트
  useEffect(() => {
    const tab = searchParams.get('tab');
    console.log('🔍 URL 파라미터 확인:', { tab, currentActiveTab: activeTab });
    if (tab && ['all', 'by-teacher', 'by-grade', 'by-score', 'priority'].includes(tab)) {
      setActiveTab(tab);
      console.log('✅ activeTab 업데이트:', tab);
    }
  }, [searchParams]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStudents(),
        fetchSchedules(),
        fetchTeachers(),
        fetchStudentSchedules(),
        fetchStudentGrades()
      ]);
    } catch (error) {
      console.error('❌ 데이터 로드 오류:', error);
      toast.error('데이터를 불러오는 데 실패했습니다.');
    }
    setLoading(false);
  };

  const fetchStudents = async () => {
    try {
      console.log('🔄 학원생 목록 로드 시작');
      console.log('🔐 세션 인증 확인:', { 
        hasSession: !!session, 
        userId: session?.user?.id,
        userRole 
      });

      // 세션이 없으면 에러
      if (!session?.access_token) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      }

      // 현재 Supabase 세션 상태 확인
      const { data: currentSession } = await supabase.auth.getSession();
      console.log('🔍 현재 Supabase 세션:', { 
        hasCurrentSession: !!currentSession?.session,
        userId: currentSession?.session?.user?.id,
        accessToken: currentSession?.session?.access_token ? '존재함' : '없음'
      });

      // 세션이 없으면 명시적으로 설정
      if (!currentSession?.session && session?.access_token && session?.refresh_token) {
        console.log('🔧 세션 설정 시도 중...');
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        });
        
        if (sessionError) {
          console.error('❌ 세션 설정 실패:', sessionError);
        } else {
          console.log('✅ 세션 설정 성공');
        }
      }

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('✅ 학원생 목록 로드 성공:', data?.length || 0);
      setStudents(data || []);
    } catch (error) {
      console.error('❌ 학원생 목록 불러오기 오류:', error);
      
      if (error.message?.includes('RLS') || error.message?.includes('policy') || error.code === '42501') {
        toast.error('권한이 없습니다. 관리자로 로그인했는지 확인해주세요.');
      } else if (error.code === 'PGRST116') {
        toast.error('데이터를 찾을 수 없습니다.');
      } else {
        toast.error(`학원생 목록을 불러오는 데 실패했습니다: ${error.message}`);
      }
    }
  };

  const fetchSchedules = async () => {
    try {
      console.log('🔄 시간표 데이터 로드 시작');
      console.log('🔐 세션 인증 확인:', { 
        hasSession: !!session, 
        userId: session?.user?.id 
      });

      // 세션이 없으면 에러
      if (!session?.access_token) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      }

      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('is_active', true)
        .order('grade', { ascending: true });

      if (error) throw error;
      
      console.log('✅ 시간표 데이터 로드 성공:', data?.length || 0);
      setSchedules(data || []);
    } catch (error) {
      console.error('❌ 시간표 데이터 불러오기 오류:', error);
      
      if (error.message?.includes('RLS') || error.message?.includes('policy') || error.code === '42501') {
        toast.error('권한이 없습니다. 관리자로 로그인했는지 확인해주세요.');
      } else {
        toast.error(`시간표 데이터를 불러오는 데 실패했습니다: ${error.message}`);
      }
    }
  };

  const fetchTeachers = async () => {
    try {
      console.log('🔄 강사 목록 로드 시작');
      console.log('🔐 세션 인증 확인:', { 
        hasSession: !!session, 
        userId: session?.user?.id 
      });

      // 세션이 없으면 에러
      if (!session?.access_token) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      }

      // 현재 Supabase 세션 상태 확인
      const { data: currentSession } = await supabase.auth.getSession();
      console.log('🔍 현재 Supabase 세션 (강사):', { 
        hasCurrentSession: !!currentSession?.session,
        userId: currentSession?.session?.user?.id
      });

      // 세션이 없으면 명시적으로 설정
      if (!currentSession?.session && session?.access_token && session?.refresh_token) {
        console.log('🔧 세션 설정 시도 중 (강사)...');
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        });
      }

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
      
      if (error.message?.includes('RLS') || error.message?.includes('policy') || error.code === '42501') {
        toast.error('권한이 없습니다. 관리자로 로그인했는지 확인해주세요.');
      } else {
        toast.error(`강사 목록을 불러오는 데 실패했습니다: ${error.message}`);
      }
    }
  };

  const fetchStudentSchedules = async () => {
    try {
      console.log('🔄 학원생 수업 연결 데이터 로드 시작');
      console.log('🔐 세션 인증 확인:', { 
        hasSession: !!session, 
        userId: session?.user?.id 
      });

      // 세션이 없으면 에러
      if (!session?.access_token) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      }

      // 현재 Supabase 세션 상태 확인
      const { data: currentSession } = await supabase.auth.getSession();
      console.log('🔍 현재 Supabase 세션 (학원생 수업):', { 
        hasCurrentSession: !!currentSession?.session,
        userId: currentSession?.session?.user?.id
      });

      // 세션이 없으면 명시적으로 설정
      if (!currentSession?.session && session?.access_token && session?.refresh_token) {
        console.log('🔧 세션 설정 시도 중 (학원생 수업)...');
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        });
      }

      const { data, error } = await supabase
        .from('student_schedules')
        .select(`
          *,
          students:student_id(id, full_name, grade),
          schedules:schedule_id(id, subject, teacher_name, grade, day_of_week, time_slot)
        `)
        .eq('status', 'active');

      if (error) throw error;
      
      console.log('✅ 학원생 수업 연결 데이터 로드 성공:', data?.length || 0);
      setStudentSchedules(data || []);
    } catch (error) {
      console.error('❌ 학원생 수업 연결 데이터 불러오기 오류:', error);
      
      if (error.message?.includes('RLS') || error.message?.includes('policy') || error.code === '42501') {
        toast.error('권한이 없습니다. 관리자로 로그인했는지 확인해주세요.');
      } else {
        toast.error(`학원생 수업 연결 데이터를 불러오는 데 실패했습니다: ${error.message}`);
      }
    }
  };

  const fetchStudentGrades = async () => {
    try {
      console.log('🔄 학원생 성적 데이터 로드 시작');
      console.log('🔐 세션 인증 확인:', { 
        hasSession: !!session, 
        userId: session?.user?.id 
      });

      // 세션이 없으면 에러
      if (!session?.access_token) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      }

      // 현재 Supabase 세션 상태 확인
      const { data: currentSession } = await supabase.auth.getSession();
      console.log('🔍 현재 Supabase 세션 (성적):', { 
        hasCurrentSession: !!currentSession?.session,
        userId: currentSession?.session?.user?.id
      });

      // 세션이 없으면 명시적으로 설정
      if (!currentSession?.session && session?.access_token && session?.refresh_token) {
        console.log('🔧 세션 설정 시도 중 (성적)...');
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        });
      }

      const { data, error } = await supabase
        .from('student_grades')
        .select(`
          *,
          students:student_id(id, full_name, grade),
          schedules:schedule_id(id, subject, teacher_name, grade)
        `)
        .order('exam_date', { ascending: false });

      if (error) throw error;
      
      console.log('✅ 학원생 성적 데이터 로드 성공:', data?.length || 0);
      setStudentGrades(data || []);
    } catch (error) {
      console.error('❌ 학원생 성적 데이터 불러오기 오류:', error);
      
      if (error.message?.includes('RLS') || error.message?.includes('policy') || error.code === '42501') {
        toast.error('권한이 없습니다. 관리자로 로그인했는지 확인해주세요.');
      } else {
        toast.error(`학원생 성적 데이터를 불러오는 데 실패했습니다: ${error.message}`);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStudentForm({
      ...studentForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSelectChange = (name, value) => {
    setStudentForm({
      ...studentForm,
      [name]: value
    });
  };

  const handleSaveStudent = async () => {
    if (!studentForm.full_name.trim() || !studentForm.email.trim()) {
      toast.error('이름과 이메일을 입력해주세요.');
      return;
    }

    try {
      console.log('🔄 학원생 데이터 저장 시작:', currentStudent ? '수정' : '추가');
      console.log('🔐 세션 인증 확인:', { 
        hasSession: !!session, 
        userId: session?.user?.id,
        userRole 
      });

      // 세션이 없으면 에러
      if (!session?.access_token) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      }

      const studentData = {
        full_name: studentForm.full_name.trim(),
        email: studentForm.email.trim(),
        phone: studentForm.phone.trim() || null,
        parent_name: studentForm.parent_name.trim() || null,
        parent_phone: studentForm.parent_phone.trim() || null,
        birth_date: studentForm.birth_date || null,
        school: studentForm.school.trim() || null,
        grade: studentForm.grade || null,
        school_grade: studentForm.school_grade || null, // 구체적인 학년 추가
        address: studentForm.address.trim() || null,
        notes: studentForm.notes.trim() || null,
        is_priority: studentForm.is_priority,
        status: studentForm.status
      };

      if (currentStudent) {
        // 수정
        const { data, error } = await supabase
          .from('students')
          .update(studentData)
          .eq('id', currentStudent.id)
          .select()
          .single();

        if (error) throw error;

        setStudents(prev => prev.map(student => 
          student.id === currentStudent.id ? data : student
        ));

        console.log('✅ 학원생 정보 수정 성공:', data);
        toast.success('학원생 정보가 업데이트되었습니다.');
      } else {
        // 추가
        const { data, error } = await supabase
          .from('students')
          .insert([studentData])
          .select()
          .single();

        if (error) throw error;

        setStudents(prev => [data, ...prev]);
        console.log('✅ 새 학원생 추가 성공:', data);
        toast.success('새 학원생이 추가되었습니다.');
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('❌ 학원생 저장 오류:', error);
      
      if (error.code === '23505') {
        toast.error('이미 등록된 이메일입니다.');
      } else if (error.message?.includes('RLS') || error.message?.includes('policy') || error.code === '42501') {
        toast.error('권한이 없습니다. 관리자로 로그인했는지 확인해주세요.');
      } else {
        toast.error(`학원생 저장에 실패했습니다: ${error.message}`);
      }
    }
  };

  // 수업 등록 관련 함수들
  const openEnrollmentModal = (student) => {
    setSelectedStudentForEnrollment(student);
    setEnrollmentForm({
      schedule_id: '',
      start_date: new Date().toISOString().split('T')[0],
      monthly_fee: '',
      notes: ''
    });
    setIsEnrollmentModalOpen(true);
  };

  const handleEnrollmentFormChange = (e) => {
    const { name, value } = e.target;
    setEnrollmentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleScheduleSelect = (scheduleId) => {
    const selectedSchedule = schedules.find(s => s.id === scheduleId);
    setEnrollmentForm(prev => ({
      ...prev,
      schedule_id: scheduleId,
      monthly_fee: selectedSchedule?.price || ''
    }));
  };

  const handleEnrollStudent = async () => {
    if (!enrollmentForm.schedule_id || !enrollmentForm.start_date) {
      toast.error('수업과 시작일을 선택해주세요.');
      return;
    }

    try {
      // 이미 등록된 수업인지 확인
      const { data: existingEnrollment } = await supabase
        .from('student_enrollments')
        .select('*')
        .eq('student_id', selectedStudentForEnrollment.id)
        .eq('schedule_id', enrollmentForm.schedule_id)
        .eq('status', 'active')
        .single();

      if (existingEnrollment) {
        toast.error('이미 해당 수업에 등록된 학생입니다.');
        return;
      }

      // 수강생 등록
      const { error } = await supabase
        .from('student_enrollments')
        .insert([{
          student_id: selectedStudentForEnrollment.id,
          schedule_id: enrollmentForm.schedule_id,
          start_date: enrollmentForm.start_date,
          monthly_fee: parseFloat(enrollmentForm.monthly_fee) || 0,
          notes: enrollmentForm.notes,
          status: 'active',
          payment_status: 'pending'
        }]);

      if (error) throw error;

      // 해당 수업의 current_students 증가
      const selectedSchedule = schedules.find(s => s.id === enrollmentForm.schedule_id);
      await supabase
        .from('schedules')
        .update({ 
          current_students: (selectedSchedule.current_students || 0) + 1 
        })
        .eq('id', enrollmentForm.schedule_id);

      toast.success('수업 등록이 완료되었습니다.');
      setIsEnrollmentModalOpen(false);
      fetchStudentSchedules(); // 수강 정보 새로고침
      fetchSchedules(); // 스케줄 정보 새로고침
    } catch (error) {
      console.error('Error enrolling student:', error);
      toast.error('수업 등록 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteStudent = async (student) => {
    // 수강 중인 수업이 있는지 확인
    const enrolledSchedules = studentSchedules.filter(ss => ss.student_id === student.id);
    
    if (enrolledSchedules.length > 0) {
      const confirmMessage = `${student.full_name} 학원생은 현재 ${enrolledSchedules.length}개의 수업을 수강하고 있습니다.\n정말로 삭제하시겠습니까?`;
      if (!confirm(confirmMessage)) return;
    } else {
      if (!confirm(`${student.full_name} 학원생을 정말 삭제하시겠습니까?`)) return;
    }

    try {
      console.log('🔄 학원생 삭제 시작:', student.full_name);
      console.log('🔐 세션 인증 확인:', { 
        hasSession: !!session, 
        userId: session?.user?.id,
        userRole 
      });

      // 세션이 없으면 에러
      if (!session?.access_token) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      }

      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', student.id);

      if (error) throw error;

      setStudents(prev => prev.filter(s => s.id !== student.id));
      console.log('✅ 학원생 삭제 성공:', student.full_name);
      toast.success('학원생이 삭제되었습니다.');
    } catch (error) {
      console.error('❌ 학원생 삭제 오류:', error);
      
      if (error.message?.includes('RLS') || error.message?.includes('policy') || error.code === '42501') {
        toast.error('권한이 없습니다. 관리자로 로그인했는지 확인해주세요.');
      } else {
        toast.error(`학원생 삭제에 실패했습니다: ${error.message}`);
      }
    }
  };

  const handleTogglePriority = async (student) => {
    try {
      const newStatus = !student.is_priority;
      console.log('🔄 학원생 관심관리 상태 변경 시작:', student.full_name, newStatus ? '추가' : '제거');
      console.log('🔐 세션 인증 확인:', { 
        hasSession: !!session, 
        userId: session?.user?.id,
        userRole 
      });

      // 세션이 없으면 에러
      if (!session?.access_token) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      }

      const { data, error } = await supabase
        .from('students')
        .update({ 
          is_priority: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', student.id)
        .select()
        .single();

      if (error) throw error;

      setStudents(prev => prev.map(s => s.id === student.id ? data : s));
      console.log('✅ 학원생 관심관리 상태 변경 성공:', student.full_name, newStatus ? '추가' : '제거');
      toast.success(`${student.full_name} 학원생이 관심관리 대상에서 ${newStatus ? '추가' : '제거'}되었습니다.`);
    } catch (error) {
      console.error('❌ 학원생 관심관리 상태 변경 오류:', error);
      
      if (error.message?.includes('RLS') || error.message?.includes('policy') || error.code === '42501') {
        toast.error('권한이 없습니다. 관리자로 로그인했는지 확인해주세요.');
      } else {
        toast.error(`상태 변경에 실패했습니다: ${error.message}`);
      }
    }
  };

  const resetForm = () => {
    setStudentForm({
      full_name: '',
      email: '',
      phone: '',
      parent_name: '',
      parent_phone: '',
      birth_date: '',
      school: '',
      grade: '',
      school_grade: '', // 구체적인 학년
      address: '',
      notes: '',
      is_priority: false,
      status: 'active'
    });
    setCurrentStudent(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (student) => {
    setCurrentStudent(student);
    setStudentForm({
      full_name: student.full_name || '',
      email: student.email || '',
      phone: student.phone || '',
      parent_name: student.parent_name || '',
      parent_phone: student.parent_phone || '',
      birth_date: student.birth_date || '',
      school: student.school || '',
      grade: student.grade || '',
      school_grade: student.school_grade || '', // 구체적인 학년 추가
      address: student.address || '',
      notes: student.notes || '',
      is_priority: student.is_priority || false,
      status: student.status || 'active'
    });
    setIsDialogOpen(true);
  };

  const getStudentSchedules = (studentId) => {
    return studentSchedules.filter(ss => ss.student_id === studentId);
  };

  const openCoursesModal = (student) => {
    setSelectedStudentForCourses(student);
    setIsCoursesModalOpen(true);
  };

  const closeCoursesModal = () => {
    setIsCoursesModalOpen(false);
    setSelectedStudentForCourses(null);
  };

  const handleViewExamScores = (student) => {
    setSelectedStudentForScores(student);
    setIsExamScoresModalOpen(true);
  };

  const closeExamScoresModal = () => {
    setIsExamScoresModalOpen(false);
    setSelectedStudentForScores(null);
  };

  const handleCoursesUpdate = () => {
    // 학생 수강 정보가 변경되었을 때 데이터 새로고침
    fetchStudentSchedules();
    fetchStudents();
  };

  const getDayName = (dayOfWeek) => {
    const days = ['', '월', '화', '수', '목', '금', '토', '일'];
    return days[dayOfWeek] || '';
  };

  const getStats = () => {
    const currentYear = new Date().getFullYear();
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === 'active').length;
    const priorityStudents = students.filter(s => s.is_priority).length;
    
    const gradeStats = {
      초등부: students.filter(s => s.grade === '초등부').length,
      중등부: students.filter(s => s.grade === '중등부').length,
      고등부: students.filter(s => s.grade === '고등부').length
    };
    
    return {
      totalStudents,
      activeStudents,
      priorityStudents,
      gradeStats
    };
  };

  const stats = getStats();

  const getAvailableSchoolGrades = (grade) => {
    if (!grade) return [];
    
    switch (grade) {
      case '초등부':
        return ['1학년', '2학년', '3학년', '4학년', '5학년', '6학년'];
      case '중등부':
        return ['1학년', '2학년', '3학년'];
      case '고등부':
        return ['1학년', '2학년', '3학년'];
      default:
        return [];
    }
  };

  const getStudentsByTeacher = (teacherName) => {
    if (!teacherName || teacherName === 'all') return [];
    
    const teacherSchedules = studentSchedules.filter(ss => 
      ss.schedules?.teacher_name === teacherName && ss.status === 'active'
    );
    
    const studentIds = [...new Set(teacherSchedules.map(ss => ss.student_id))];
    return students.filter(student => studentIds.includes(student.id));
  };

  const getStudentsByGrade = (grade) => {
    return students.filter(student => student.grade === grade);
  };

  const getStudentGradeAverage = (studentId) => {
    const studentGradeRecords = studentGrades.filter(sg => sg.student_id === studentId);
    if (studentGradeRecords.length === 0) return null;
    
    const totalScore = studentGradeRecords.reduce((sum, record) => sum + parseFloat(record.score), 0);
    return Math.round(totalScore / studentGradeRecords.length);
  };

  const getGradeCategory = (average) => {
    if (average === null) return { category: '미측정', color: 'gray' };
    if (average >= 90) return { category: '상위권', color: 'green' };
    if (average >= 70) return { category: '중위권', color: 'blue' };
    return { category: '하위권', color: 'red' };
  };

  // 엑셀 업로드 관련 함수들
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('📄 파일 업로드 시작:', file.name);
    setExcelFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        console.log('📊 엑셀 데이터 파싱 완료:', jsonData.length, '행');
        setExcelData(jsonData);
      } catch (error) {
        console.error('❌ 엑셀 파일 파싱 오류:', error);
        toast.error('엑셀 파일을 읽는 데 실패했습니다.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const validateExcelData = (data) => {
    const requiredFields = ['이름', '이메일'];
    const errors = [];
    const validData = [];
    const currentYear = new Date().getFullYear();

    data.forEach((row, index) => {
      const rowNumber = index + 2; // 엑셀에서 헤더가 1행이므로
      const rowErrors = [];

      // 필수 필드 검증
      requiredFields.forEach(field => {
        if (!row[field] || row[field].toString().trim() === '') {
          rowErrors.push(`${field} 필드가 비어있습니다`);
        }
      });

      // 이메일 형식 검증
      if (row['이메일']) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row['이메일'])) {
          rowErrors.push('이메일 형식이 올바르지 않습니다');
        }
      }

      // 학교급 검증
      if (row['학교급'] && !['초등부', '중등부', '고등부'].includes(row['학교급'])) {
        rowErrors.push('학교급은 초등부, 중등부, 고등부 중 하나여야 합니다');
      }

      // 학년 검증
      if (row['학년']) {
        const validGrades = ['1학년', '2학년', '3학년', '4학년', '5학년', '6학년'];
        if (!validGrades.includes(row['학년'])) {
          rowErrors.push('학년은 1학년~6학년 중 하나여야 합니다');
        }
      }

      if (rowErrors.length > 0) {
        errors.push({ row: rowNumber, errors: rowErrors, data: row });
      } else {
        validData.push({
          full_name: row['이름']?.toString().trim(),
          email: row['이메일']?.toString().trim(),
          phone: row['연락처']?.toString().trim() || null,
          parent_name: row['학부모명']?.toString().trim() || null,
          parent_phone: row['학부모연락처']?.toString().trim() || null,
          birth_date: row['생년월일'] ? formatDate(row['생년월일']) : null,
          school: row['학교']?.toString().trim() || null,
          grade: row['학교급']?.toString().trim() || null,
          school_grade: row['학년']?.toString().trim() || null, // 구체적인 학년
          address: row['주소']?.toString().trim() || null,
          notes: row['특이사항']?.toString().trim() || null,
          is_priority: row['관심관리'] === '예' || row['관심관리'] === 'Y' || row['관심관리'] === true,
          status: 'active'
        });
      }
    });

    return { validData, errors };
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return null;
    
    try {
      // 엑셀에서 날짜가 숫자로 올 수 있음
      if (typeof dateValue === 'number') {
        const date = XLSX.SSF.parse_date_code(dateValue);
        return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
      }
      
      // 문자열 형태의 날짜
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return null;
      
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('날짜 변환 오류:', error);
      return null;
    }
  };

  const handleBulkUpload = async () => {
    if (!excelData.length) {
      toast.error('업로드할 데이터가 없습니다.');
      return;
    }

    console.log('🔄 일괄 등록 시작:', excelData.length, '건');
    setIsProcessing(true);
    setUploadProgress(0);

    try {
      // 세션 확인
      if (!session?.access_token) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      }

      // 현재 Supabase 세션 상태 확인
      const { data: currentSession } = await supabase.auth.getSession();
      if (!currentSession?.session && session?.access_token && session?.refresh_token) {
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        });
      }

      // 데이터 검증
      const { validData, errors } = validateExcelData(excelData);
      
      if (errors.length > 0) {
        console.warn('⚠️ 데이터 검증 오류:', errors.length, '건');
        setUploadResults({ 
          success: false, 
          validCount: validData.length,
          errorCount: errors.length,
          errors: errors.slice(0, 10) // 최대 10개 오류만 표시
        });
        setIsProcessing(false);
        return;
      }

      const totalRecords = validData.length;
      const batchSize = 10; // 한 번에 처리할 레코드 수
      let successCount = 0;
      let failedRecords = [];

      // 배치 단위로 처리
      for (let i = 0; i < validData.length; i += batchSize) {
        const batch = validData.slice(i, i + batchSize);
        
        try {
          const { data, error } = await supabase
            .from('students')
            .insert(batch)
            .select();

          if (error) {
            console.error('❌ 배치 등록 오류:', error);
            batch.forEach(record => {
              failedRecords.push({ 
                data: record, 
                error: error.message 
              });
            });
          } else {
            successCount += data.length;
            console.log(`✅ 배치 ${Math.floor(i/batchSize) + 1} 등록 성공:`, data.length, '건');
          }
        } catch (batchError) {
          console.error('❌ 배치 처리 오류:', batchError);
          batch.forEach(record => {
            failedRecords.push({ 
              data: record, 
              error: batchError.message 
            });
          });
        }

        // 진행률 업데이트
        const progress = Math.min(((i + batchSize) / totalRecords) * 100, 100);
        setUploadProgress(progress);
        
        // UI 업데이트를 위한 짧은 지연
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setUploadResults({
        success: failedRecords.length === 0,
        totalCount: totalRecords,
        successCount,
        failedCount: failedRecords.length,
        failedRecords: failedRecords.slice(0, 10) // 최대 10개 실패 기록만 표시
      });

      if (successCount > 0) {
        console.log('✅ 일괄 등록 완료:', successCount, '건 성공');
        toast.success(`${successCount}명의 학원생이 등록되었습니다.`);
        
        // 학원생 목록 새로고침
        await fetchStudents();
      }

      if (failedRecords.length > 0) {
        console.warn('⚠️ 일부 등록 실패:', failedRecords.length, '건');
        toast.warning(`${failedRecords.length}건의 등록에 실패했습니다.`);
      }

    } catch (error) {
      console.error('❌ 일괄 등록 오류:', error);
      toast.error(`일괄 등록에 실패했습니다: ${error.message}`);
      setUploadResults({
        success: false,
        error: error.message
      });
    }

    setIsProcessing(false);
  };

  const downloadTemplate = () => {
    const currentYear = new Date().getFullYear();
    const templateData = [
      {
        '이름': '홍길동',
        '이메일': 'hong@example.com',
        '연락처': '010-1234-5678',
        '학부모명': '홍아버지',
        '학부모연락처': '010-9876-5432',
        '생년월일': '2010-01-01',
        '학교': '서울초등학교',
        '학교급': '초등부',
        '학년': '3학년',
        '주소': '서울시 강남구',
        '특이사항': '수학에 관심이 많음',
        '관심관리': '아니오'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '학원생목록');
    XLSX.writeFile(wb, '학원생_등록_템플릿.xlsx');
    
    toast.success('템플릿이 다운로드되었습니다.');
  };

  const resetExcelUpload = () => {
    setExcelFile(null);
    setExcelData([]);
    setUploadProgress(0);
    setUploadResults(null);
  };

  const renderAllStudentsList = () => (
    <div className="space-y-4">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 학원생</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">등록된 모든 학원생</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">재학생</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeStudents}</div>
            <p className="text-xs text-muted-foreground">현재 재학 중</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">관심관리</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.priorityStudents}</div>
            <p className="text-xs text-muted-foreground">특별 관리 대상</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">학년별</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <div>초등부: {stats.gradeStats.초등부}명</div>
              <div>중등부: {stats.gradeStats.중등부}명</div>
              <div>고등부: {stats.gradeStats.고등부}명</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 옵션 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">필터 옵션</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Label htmlFor="search-input" className="min-w-fit">검색:</Label>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="search-input"
                  placeholder="이름, 이메일, 연락처로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="grade-filter" className="min-w-fit">학교급:</Label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="초등부">초등부</SelectItem>
                  <SelectItem value="중등부">중등부</SelectItem>
                  <SelectItem value="고등부">고등부</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(selectedGrade !== 'all' || searchQuery) && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setSelectedGrade('all');
                  setSearchQuery('');
                }}
              >
                필터 초기화
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 액션 버튼들 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            전체 학원생 목록
            {selectedGrade !== 'all' && ` (${selectedGrade})`}
            {searchQuery && ` - "${searchQuery}" 검색`}
          </h2>
          <p className="text-sm text-muted-foreground">
            {(() => {
              let filteredStudents = students;
              if (selectedGrade !== 'all') {
                filteredStudents = filteredStudents.filter(s => s.grade === selectedGrade);
              }
              if (searchQuery) {
                filteredStudents = filteredStudents.filter(s => 
                  s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  s.phone?.includes(searchQuery) ||
                  s.parent_phone?.includes(searchQuery)
                );
              }
              return `${filteredStudents.length}명의 학원생이 조회되었습니다.`;
            })()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsExcelDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            엑셀 일괄등록
          </Button>
          <Button onClick={openAddDialog} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            새 학원생 추가
          </Button>
        </div>
      </div>

      {/* 학원생 목록 테이블 */}
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="mt-2 text-sm text-muted-foreground">학원생 목록을 불러오는 중...</p>
              </div>
            </div>
          ) : (() => {
            // 필터링된 학원생 목록
            let filteredStudents = students;
            if (selectedGrade !== 'all') {
              filteredStudents = filteredStudents.filter(s => s.grade === selectedGrade);
            }
            if (searchQuery) {
              filteredStudents = filteredStudents.filter(s => 
                s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.phone?.includes(searchQuery) ||
                s.parent_phone?.includes(searchQuery)
              );
            }
            
            return filteredStudents.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">
                  {selectedGrade !== 'all' || searchQuery ? '조건에 맞는 학원생이 없습니다' : '등록된 학원생이 없습니다'}
                </p>
                <p className="text-muted-foreground mb-4">
                  {selectedGrade !== 'all' || searchQuery ? '필터 조건을 변경해보세요.' : '첫 번째 학원생을 추가해보세요.'}
                </p>
                <div className="flex justify-center gap-2">
                  {selectedGrade !== 'all' || searchQuery ? (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSelectedGrade('all');
                        setSearchQuery('');
                      }}
                    >
                      필터 초기화
                    </Button>
                  ) : (
                    <>
                      <Button onClick={openAddDialog}>
                        <Plus className="h-4 w-4 mr-2" />
                        학원생 추가
                      </Button>
                      <Button variant="outline" onClick={() => setIsExcelDialogOpen(true)}>
                        <Upload className="h-4 w-4 mr-2" />
                        엑셀로 일괄등록
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>학원생명</TableHead>
                      <TableHead>학교급</TableHead>
                      <TableHead>학년</TableHead>
                      <TableHead>학교</TableHead>
                      <TableHead>연락처</TableHead>
                      <TableHead>수강과목</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => {
                      const enrolledSchedules = getStudentSchedules(student.id);
                      return (
                        <TableRow 
                          key={student.id}
                          className={student.status !== 'active' ? 'opacity-60' : ''}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 font-semibold text-sm">
                                  {student.full_name?.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">
                                  {student.full_name}
                                  {student.is_priority && (
                                    <Star className="h-3 w-3 text-orange-500 inline ml-1" />
                                  )}
                                </p>
                                {student.email && (
                                  <p className="text-xs text-muted-foreground">{student.email}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {student.grade && (
                              <Badge variant="outline">
                                {student.grade}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {student.school_grade && (
                              <Badge variant="outline" className="text-purple-600 border-purple-300">
                                {student.school_grade}
                              </Badge>
                            )}
                          </TableCell>
                             <TableCell>
                            {student.school && (
                              <div className="flex items-center gap-1">
                                <School className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">{student.school}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {student.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs">{student.phone}</span>
                                </div>
                              )}
                              {student.parent_phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-gray-500">부모: {student.parent_phone}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openCoursesModal(student)}
                              className="flex items-center gap-1 h-auto p-1"
                            >
                              <BookOpen className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{enrolledSchedules.length}개</span>
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant={student.status === 'active' ? "default" : "secondary"}>
                                {student.status === 'active' ? '재학' : 
                                 student.status === 'inactive' ? '휴학' : '퇴학'}
                              </Badge>
                              {student.is_priority && (
                                <Badge variant="outline" className="text-orange-600 border-orange-300">
                                  관심관리
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(student)}
                                title="편집"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewExamScores(student)}
                                title="성적 확인"
                              >
                                <BarChart3 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleTogglePriority(student)}
                                title={student.is_priority ? "관심관리 제거" : "관심관리 추가"}
                              >
                                <Star className={`h-4 w-4 ${student.is_priority ? 'text-orange-500 fill-orange-500' : 'text-gray-400'}`} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteStudent(student)}
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
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );

  const renderTeacherTab = () => (
    <div className="space-y-4">
      {/* 강사 선택 */}
      <Card>
        <CardHeader>
          <CardTitle>강사별 학원생 관리</CardTitle>
          <p className="text-sm text-muted-foreground">강사를 선택하여 담당 학원생들을 확인할 수 있습니다.</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Label htmlFor="teacher-select" className="min-w-fit">담당 강사:</Label>
            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="강사를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 강사</SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.name}>
                    {teacher.name} ({teacher.specialization?.join(', ')})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTeacher && selectedTeacher !== 'all' ? (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">{selectedTeacher} 강사 담당 학원생</h3>
                <p className="text-sm text-muted-foreground">
                  총 {getStudentsByTeacher(selectedTeacher).length}명의 학원생
                </p>
              </div>
              
              {getStudentsByTeacher(selectedTeacher).length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">담당 학원생이 없습니다</p>
                  <p className="text-muted-foreground">해당 강사에게 배정된 학원생이 없습니다.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>학원생명</TableHead>
                        <TableHead>학교급</TableHead>
                        <TableHead>수강과목</TableHead>
                        <TableHead>수업시간</TableHead>
                        <TableHead>연락처</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>관리</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getStudentsByTeacher(selectedTeacher).map((student) => {
                        const studentScheduleData = studentSchedules.filter(ss => 
                          ss.student_id === student.id && ss.schedules?.teacher_name === selectedTeacher
                        );
                        
                        return (
                          <TableRow key={student.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 font-semibold text-sm">
                                    {student.full_name?.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {student.full_name}
                                    {student.is_priority && (
                                      <Star className="h-3 w-3 text-orange-500 inline ml-1" />
                                    )}
                                  </p>
                                  {student.school && (
                                    <p className="text-xs text-muted-foreground">{student.school}</p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {student.grade && (
                                <Badge variant="outline">{student.grade}</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openCoursesModal(student)}
                                className="flex items-center gap-1 h-auto p-1"
                              >
                                <BookOpen className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">{getStudentSchedules(student.id).length}개</span>
                              </Button>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {studentScheduleData.map((ss, index) => (
                                  <div key={index} className="text-sm">
                                    {getDayName(ss.schedules?.day_of_week)} {ss.schedules?.time_slot}
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {student.phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs">{student.phone}</span>
                                  </div>
                                )}
                                {student.parent_phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs text-gray-500">부모: {student.parent_phone}</span>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={student.status === 'active' ? "default" : "secondary"}>
                                {student.status === 'active' ? '재학' : 
                                 student.status === 'inactive' ? '휴학' : '퇴학'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(student)}
                                  title="편집"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewExamScores(student)}
                                  title="성적 확인"
                                >
                                  <BarChart3 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEnrollmentModal(student)}
                                  title="수업 등록"
                                >
                                  <Plus className="h-4 w-4" />
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
            </div>
          ) : (
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">강사를 선택해주세요</p>
              <p className="text-muted-foreground">강사를 선택하면 담당 학원생 목록을 확인할 수 있습니다.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderGradeTab = () => {
    const gradeGroups = [
      { grade: '초등부', students: getStudentsByGrade('초등부'), color: 'green' },
      { grade: '중등부', students: getStudentsByGrade('중등부'), color: 'blue' },
      { grade: '고등부', students: getStudentsByGrade('고등부'), color: 'purple' }
    ];

    return (
      <div className="space-y-4">
        {/* 학년별 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {gradeGroups.map(({ grade, students, color }) => (
            <Card key={grade}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{grade}</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{students.length}명</div>
                <p className="text-xs text-muted-foreground">
                  재학생: {students.filter(s => s.status === 'active').length}명
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 학년별 상세 목록 */}
        {gradeGroups.map(({ grade, students, color }) => (
          <Card key={grade}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full bg-${color}-500`}></div>
                {grade} 학원생 목록 ({students.length}명)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">{grade} 학원생이 없습니다</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>학원생명</TableHead>
                        <TableHead>학교급</TableHead>
                        <TableHead>학년</TableHead>
                        <TableHead>학교</TableHead>
                        <TableHead>수강과목</TableHead>
                        <TableHead>연락처</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>관리</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => {
                        const enrolledSchedules = getStudentSchedules(student.id);
                        return (
                          <TableRow key={student.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 bg-${color}-100 rounded-full flex items-center justify-center`}>
                                  <span className={`text-${color}-600 font-semibold text-sm`}>
                                    {student.full_name?.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {student.full_name}
                                    {student.is_priority && (
                                      <Star className="h-3 w-3 text-orange-500 inline ml-1" />
                                    )}
                                  </p>
                                  {student.email && (
                                    <p className="text-xs text-muted-foreground">{student.email}</p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {student.grade && (
                                <Badge variant="outline">{student.grade}</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {student.school_grade && (
                                <Badge variant="outline" className="text-purple-600 border-purple-300">
                                  {student.school_grade}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {student.school && (
                                <div className="flex items-center gap-1">
                                  <School className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm">{student.school}</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openCoursesModal(student)}
                                className="flex items-center gap-1 h-auto p-1"
                              >
                                <BookOpen className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">{enrolledSchedules.length}개</span>
                              </Button>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {student.phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs">{student.phone}</span>
                                  </div>
                                )}
                                {student.parent_phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs text-gray-500">부모: {student.parent_phone}</span>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={student.status === 'active' ? "default" : "secondary"}>
                                {student.status === 'active' ? '재학' : 
                                 student.status === 'inactive' ? '휴학' : '퇴학'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(student)}
                                  title="편집"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewExamScores(student)}
                                  title="성적 확인"
                                >
                                  <BarChart3 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleTogglePriority(student)}
                                  title={student.is_priority ? "관심관리 제거" : "관심관리 추가"}
                                >
                                  <Star className={`h-4 w-4 ${student.is_priority ? 'text-orange-500 fill-orange-500' : 'text-gray-400'}`} />
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
        ))}
      </div>
    );
  };

  const renderScoreTab = () => {
    const studentsWithScores = students.map(student => {
      const average = getStudentGradeAverage(student.id);
      const gradeInfo = getGradeCategory(average);
      return { ...student, average, gradeInfo };
    }).sort((a, b) => (b.average || 0) - (a.average || 0));

    const scoreGroups = [
      { 
        category: '상위권', 
        students: studentsWithScores.filter(s => s.gradeInfo.category === '상위권'),
        color: 'green',
        description: '평균 90점 이상'
      },
      { 
        category: '중위권', 
        students: studentsWithScores.filter(s => s.gradeInfo.category === '중위권'),
        color: 'blue',
        description: '평균 70-89점'
      },
      { 
        category: '하위권', 
        students: studentsWithScores.filter(s => s.gradeInfo.category === '하위권'),
        color: 'red',
        description: '평균 70점 미만'
      },
      { 
        category: '미측정', 
        students: studentsWithScores.filter(s => s.gradeInfo.category === '미측정'),
        color: 'gray',
        description: '성적 기록 없음'
      }
    ];

    return (
      <div className="space-y-4">
        {/* 성적별 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {scoreGroups.map(({ category, students, color, description }) => (
            <Card key={category}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{category}</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{students.length}명</div>
                <p className="text-xs text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 성적별 상세 목록 */}
        {scoreGroups.map(({ category, students, color, description }) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full bg-${color}-500`}></div>
                {category} 학원생 ({students.length}명)
                <span className="text-sm font-normal text-muted-foreground">- {description}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">{category} 학원생이 없습니다</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>학원생명</TableHead>
                        <TableHead>학교급</TableHead>
                        <TableHead>평균점수</TableHead>
                        <TableHead>최근성적</TableHead>
                        <TableHead>수강과목</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>관리</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.filter(s => s.gradeInfo.category === category).map((student) => {
                        const recentGrades = studentGrades
                          .filter(sg => sg.student_id === student.id)
                          .sort((a, b) => new Date(b.exam_date) - new Date(a.exam_date))
                          .slice(0, 3);
                        const enrolledSchedules = getStudentSchedules(student.id);

                        return (
                          <TableRow key={student.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 bg-${color}-100 rounded-full flex items-center justify-center`}>
                                  <span className={`text-${color}-600 font-semibold text-sm`}>
                                    {student.full_name?.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {student.full_name}
                                    {student.is_priority && (
                                      <Star className="h-3 w-3 text-orange-500 inline ml-1" />
                                    )}
                                  </p>
                                  {student.school && (
                                    <p className="text-xs text-muted-foreground">{student.school}</p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {student.grade && (
                                <Badge variant="outline">{student.grade}</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {student.average !== null ? (
                                <div className="flex items-center gap-2">
                                  <span className={`font-semibold text-${color}-600`}>
                                    {student.average}점
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {recentGrades.slice(0, 2).map((grade, index) => (
                                  <div key={index} className="text-xs">
                                    {grade.schedules?.subject}: {grade.score}점
                                  </div>
                                ))}
                                {recentGrades.length === 0 && (
                                  <span className="text-gray-400 text-xs">기록 없음</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openCoursesModal(student)}
                                className="flex items-center gap-1 h-auto p-1"
                              >
                                <BookOpen className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">{enrolledSchedules.length}개</span>
                              </Button>
                            </TableCell>
                            <TableCell>
                              <Badge variant={student.status === 'active' ? "default" : "secondary"}>
                                {student.status === 'active' ? '재학' : 
                                 student.status === 'inactive' ? '휴학' : '퇴학'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(student)}
                                  title="편집"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewExamScores(student)}
                                  title="성적 확인"
                                >
                                  <BarChart3 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleTogglePriority(student)}
                                  title={student.is_priority ? "관심관리 제거" : "관심관리 추가"}
                                >
                                  <Star className={`h-4 w-4 ${student.is_priority ? 'text-orange-500 fill-orange-500' : 'text-gray-400'}`} />
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
        ))}
      </div>
    );
  };

  const renderPriorityTab = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>관심관리 학원생 목록</CardTitle>
          <p className="text-sm text-muted-foreground">특별히 관리가 필요한 학원생들을 확인할 수 있습니다.</p>
        </CardHeader>
        <CardContent>
          {students.filter(s => s.is_priority).length === 0 ? (
            <div className="text-center py-8">
              <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">관심관리 대상이 없습니다</p>
              <p className="text-muted-foreground">특별 관리가 필요한 학원생을 지정해주세요.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>학원생명</TableHead>
                    <TableHead>학교급</TableHead>
                    <TableHead>학년</TableHead>
                    <TableHead>학교</TableHead>
                    <TableHead>연락처</TableHead>
                    <TableHead>수강과목</TableHead>
                    <TableHead>특이사항</TableHead>
                    <TableHead>관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.filter(s => s.is_priority).map((student) => {
                    const enrolledSchedules = getStudentSchedules(student.id);
                    return (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <span className="text-orange-600 font-semibold text-sm">
                                {student.full_name?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium flex items-center gap-1">
                                {student.full_name}
                                <Star className="h-3 w-3 text-orange-500 fill-orange-500" />
                              </p>
                              {student.email && (
                                <p className="text-xs text-muted-foreground">{student.email}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {student.grade && (
                            <Badge variant="outline">
                              {student.grade}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {student.school_grade && (
                            <Badge variant="outline" className="text-purple-600 border-purple-300">
                              {student.school_grade}
                            </Badge>
                          )}
                        </TableCell>
                         <TableCell>
                          <div className="space-y-1">
                            {student.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs">{student.phone}</span>
                              </div>
                            )}
                            {student.parent_phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-gray-500">부모: {student.parent_phone}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openCoursesModal(student)}
                            className="flex items-center gap-1 h-auto p-1"
                          >
                            <BookOpen className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{enrolledSchedules.length}개</span>
                          </Button>
                        </TableCell>
                        <TableCell>
                          {student.notes && (
                            <div className="flex items-start gap-1">
                              <AlertCircle className="h-3 w-3 text-orange-500 mt-0.5" />
                              <span className="text-xs text-gray-600">{student.notes}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(student)}
                              title="편집"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTogglePriority(student)}
                              title="관심관리 제거"
                            >
                              <Star className="h-4 w-4 text-orange-500 fill-orange-500" />
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
        <h1 className="text-3xl font-bold">학원생 관리</h1>
        <p className="text-muted-foreground">학원생 정보를 관리하고 수업 배정을 확인합니다.</p>
      </div>

      {/* 탭 메뉴 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            전체학원생
          </TabsTrigger>
          <TabsTrigger value="by-teacher" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            강사별
          </TabsTrigger>
          <TabsTrigger value="by-grade" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            학년별
          </TabsTrigger>
          <TabsTrigger value="by-score" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            성적별
          </TabsTrigger>
          <TabsTrigger value="priority" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            관심관리
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {renderAllStudentsList()}
        </TabsContent>

        <TabsContent value="by-teacher" className="space-y-4 mt-6">
          {renderTeacherTab()}
        </TabsContent>

        <TabsContent value="by-grade" className="space-y-4 mt-6">
          {renderGradeTab()}
        </TabsContent>

        <TabsContent value="by-score" className="space-y-4 mt-6">
          {renderScoreTab()}
        </TabsContent>

        <TabsContent value="priority" className="space-y-4 mt-6">
          {renderPriorityTab()}
        </TabsContent>
      </Tabs>

      {/* 학원생 추가/편집 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentStudent ? '학원생 정보 수정' : '새 학원생 추가'}
            </DialogTitle>
            <DialogDescription>
              학원생의 기본 정보를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* 기본 정보 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="full_name" className="text-right">
                이름 *
              </Label>
              <Input
                id="full_name"
                name="full_name"
                value={studentForm.full_name}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="학원생 이름"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                이메일 *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={studentForm.email}
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
                value={studentForm.phone}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="010-1234-5678"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="grade" className="text-right">
                학교급
              </Label>
              <Select 
                value={studentForm.grade} 
                onValueChange={(value) => {
                  handleSelectChange('grade', value);
                  // 학교급 변경시 학년 초기화
                  setStudentForm(prev => ({ ...prev, school_grade: '' }));
                }}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="학교급 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="초등부">초등부</SelectItem>
                  <SelectItem value="중등부">중등부</SelectItem>
                  <SelectItem value="고등부">고등부</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="school_grade" className="text-right">
                학년
              </Label>
              <Select 
                value={studentForm.school_grade} 
                onValueChange={(value) => handleSelectChange('school_grade', value)}
                disabled={!studentForm.grade}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={studentForm.grade ? "학년 선택" : "먼저 학교급을 선택하세요"} />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableSchoolGrades(studentForm.grade).map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="school" className="text-right">
                학교
              </Label>
              <Input
                id="school"
                name="school"
                value={studentForm.school}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="재학 중인 학교"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="birth_date" className="text-right">
                생년월일
              </Label>
              <Input
                id="birth_date"
                name="birth_date"
                type="date"
                value={studentForm.birth_date}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>

            {/* 학부모 정보 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="parent_name" className="text-right">
                학부모명
              </Label>
              <Input
                id="parent_name"
                name="parent_name"
                value={studentForm.parent_name}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="학부모 이름"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="parent_phone" className="text-right">
                학부모 연락처
              </Label>
              <Input
                id="parent_phone"
                name="parent_phone"
                value={studentForm.parent_phone}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="010-1234-5678"
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="address" className="text-right pt-2">
                주소
              </Label>
              <Textarea
                id="address"
                name="address"
                value={studentForm.address}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="거주지 주소"
                rows="2"
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notes" className="text-right pt-2">
                특이사항
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={studentForm.notes}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="특별히 관리가 필요한 사항"
                rows="3"
              />
            </div>

            {/* 상태 설정 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                재학 상태
              </Label>
              <Select 
                value={studentForm.status} 
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">재학</SelectItem>
                  <SelectItem value="inactive">휴학</SelectItem>
                  <SelectItem value="suspended">퇴학</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_priority" className="text-right">
                관심관리
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="is_priority"
                  checked={studentForm.is_priority}
                  onCheckedChange={(checked) => 
                    setStudentForm({ ...studentForm, is_priority: checked })
                  }
                />
                <Label htmlFor="is_priority" className="text-sm">
                  {studentForm.is_priority ? '관심관리 대상' : '일반 학원생'}
                </Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSaveStudent}>
              {currentStudent ? '수정' : '추가'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 엑셀 일괄 등록 다이얼로그 */}
      <Dialog open={isExcelDialogOpen} onOpenChange={setIsExcelDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              엑셀 일괄 등록
            </DialogTitle>
            <DialogDescription>
              엑셀 파일을 업로드하여 학원생 목록을 일괄 등록할 수 있습니다. 먼저 템플릿을 다운로드해서 형식을 확인해주세요.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* 템플릿 다운로드 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  1단계: 템플릿 다운로드
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  먼저 엑셀 템플릿을 다운로드하여 올바른 형식을 확인하세요.
                </p>
                <Button 
                  onClick={downloadTemplate} 
                  variant="outline" 
                  className="w-full"
                  disabled={isProcessing}
                >
                  <Download className="h-4 w-4 mr-2" />
                  템플릿 다운로드 (.xlsx)
                </Button>
              </CardContent>
            </Card>

            {/* 파일 업로드 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  2단계: 엑셀 파일 업로드
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="excel-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">클릭하여 파일 선택</span> 또는 드래그 앤 드롭
                        </p>
                        <p className="text-xs text-gray-500">Excel 파일만 지원 (.xlsx, .xls)</p>
                      </div>
                      <Input
                        id="excel-file"
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  {excelFile && (
                    <Alert>
                      <FileSpreadsheet className="h-4 w-4" />
                      <AlertTitle>업로드된 파일</AlertTitle>
                      <AlertDescription className="flex items-center justify-between">
                        <span>{excelFile.name}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={resetExcelUpload}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 데이터 미리보기 */}
            {excelData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    3단계: 데이터 미리보기
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    총 {excelData.length}개의 레코드가 발견되었습니다.
                  </p>
                  <div className="max-h-60 overflow-auto border rounded">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>이름</TableHead>
                          <TableHead>이메일</TableHead>
                          <TableHead>연락처</TableHead>
                          <TableHead>학교급</TableHead>
                          <TableHead>학년</TableHead>
                          <TableHead>학교</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {excelData.slice(0, 5).map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{row['이름'] || '-'}</TableCell>
                            <TableCell>{row['이메일'] || '-'}</TableCell>
                            <TableCell>{row['연락처'] || '-'}</TableCell>
                            <TableCell>{row['학교급'] || '-'}</TableCell>
                            <TableCell>{row['학년'] || '-'}</TableCell>
                            <TableCell>{row['학교'] || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {excelData.length > 5 && (
                      <p className="text-xs text-muted-foreground text-center p-2">
                        ... 외 {excelData.length - 5}개 더
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 진행률 */}
            {isProcessing && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    처리 중...
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    {uploadProgress.toFixed(1)}% 완료
                  </p>
                </CardContent>
              </Card>
            )}

            {/* 결과 표시 */}
            {uploadResults && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    {uploadResults.success ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                    등록 결과
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-lg font-semibold">{uploadResults.totalCount || 0}</div>
                      <div className="text-xs text-muted-foreground">총 레코드</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-lg font-semibold text-green-600">{uploadResults.successCount || 0}</div>
                      <div className="text-xs text-muted-foreground">성공</div>
                    </div>
                  </div>

                  {uploadResults.failedCount > 0 && (
                    <div className="text-center p-3 bg-red-50 rounded mb-4">
                      <div className="text-lg font-semibold text-red-600">{uploadResults.failedCount}</div>
                      <div className="text-xs text-muted-foreground">실패</div>
                    </div>
                  )}

                  {uploadResults.errors && uploadResults.errors.length > 0 && (
                    <Alert className="border-red-200">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>데이터 검증 오류</AlertTitle>
                      <AlertDescription>
                        <div className="mt-2 max-h-32 overflow-y-auto">
                          {uploadResults.errors.slice(0, 5).map((error, index) => (
                            <div key={index} className="text-xs">
                              <strong>행 {error.row}:</strong> {error.errors.join(', ')}
                            </div>
                          ))}
                          {uploadResults.errors.length > 5 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              ... 외 {uploadResults.errors.length - 5}개 오류 더
                            </div>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {uploadResults.failedRecords && uploadResults.failedRecords.length > 0 && (
                    <Alert className="border-red-200 mt-3">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>등록 실패 레코드</AlertTitle>
                      <AlertDescription>
                        <div className="mt-2 max-h-32 overflow-y-auto">
                          {uploadResults.failedRecords.slice(0, 5).map((record, index) => (
                            <div key={index} className="text-xs">
                              <strong>{record.data.full_name}:</strong> {record.error}
                            </div>
                          ))}
                          {uploadResults.failedRecords.length > 5 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              ... 외 {uploadResults.failedRecords.length - 5}개 실패 더
                            </div>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {uploadResults.success && (
                    <Alert className="border-green-200">
                      <Check className="h-4 w-4" />
                      <AlertTitle>등록 완료</AlertTitle>
                      <AlertDescription>
                        모든 학원생 데이터가 성공적으로 등록되었습니다.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsExcelDialogOpen(false);
                resetExcelUpload();
              }}
            >
              닫기
            </Button>
            {excelData.length > 0 && !isProcessing && !uploadResults && (
              <Button 
                onClick={handleBulkUpload}
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {excelData.length}건 일괄 등록
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 수강 강의 관리 모달 */}
      <StudentCoursesModal
        isOpen={isCoursesModalOpen}
        onClose={closeCoursesModal}
        student={selectedStudentForCourses}
        onUpdate={handleCoursesUpdate}
      />

      {/* 시험 성적 관리 모달 */}
      <StudentExamScoresModal
        isOpen={isExamScoresModalOpen}
        onClose={closeExamScoresModal}
        student={selectedStudentForScores}
      />

      {/* 수업 등록 모달 */}
      <Dialog open={isEnrollmentModalOpen} onOpenChange={setIsEnrollmentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>수업 등록</DialogTitle>
            <DialogDescription>
              {selectedStudentForEnrollment?.full_name} 학생을 수업에 등록합니다.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="schedule_select">수업 선택 *</Label>
              <Select 
                value={enrollmentForm.schedule_id} 
                onValueChange={handleScheduleSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="수업을 선택해주세요" />
                </SelectTrigger>
                <SelectContent>
                  {schedules
                    .filter(schedule => schedule.is_active && 
                      (schedule.current_students || 0) < (schedule.max_students || 30))
                    .map((schedule) => (
                    <SelectItem key={schedule.id} value={schedule.id}>
                      {schedule.grade} - {schedule.subject} 
                      ({getDayName(schedule.day_of_week)} {schedule.time_slot})
                      {schedule.teacher_name && ` - ${schedule.teacher_name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">수업 시작일 *</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                value={enrollmentForm.start_date}
                onChange={handleEnrollmentFormChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly_fee">월 수업료 (원)</Label>
              <Input
                id="monthly_fee"
                name="monthly_fee"
                type="number"
                value={enrollmentForm.monthly_fee}
                onChange={handleEnrollmentFormChange}
                placeholder="월 수업료를 입력해주세요"
                min="0"
                step="1000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">비고</Label>
              <Textarea
                id="notes"
                name="notes"
                value={enrollmentForm.notes}
                onChange={handleEnrollmentFormChange}
                placeholder="특이사항이나 메모를 입력해주세요"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEnrollmentModalOpen(false)}>
              취소
            </Button>
            <Button 
              onClick={handleEnrollStudent}
              disabled={!enrollmentForm.schedule_id || !enrollmentForm.start_date}
            >
              등록
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentManagementContent; 