"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteStudentComment, addStudentComment, fetchStudentCommentData } from '@/lib/api/students';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/**
 * Modal component for managing student comments
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when the modal is closed
 * @param {Object} props.student - Student object with id, full_name, etc.
 * @param {Function} props.onUpdate - Function to call when comments are updated
 */
const StudentCommentModal = ({ isOpen, onClose, student, onUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  
  // New comment form state
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [contentError, setContentError] = useState('');
  
  // Fetch student comments when the modal opens or student changes
  useEffect(() => {
    if (isOpen && student?.id) {
      loadComments();
      loadStudentCourses();
    }
  }, [isOpen, student]);
  
  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedCourse('');
      setCommentContent('');
      setContentError('');
    }
  }, [isOpen]);

  // 데이터 캐싱을 위한 상태 추가
  const [dataCache, setDataCache] = useState({
    teachers: [],
    lastFetch: null
  });
  
  // Function to load comments with performance optimizations
  const loadComments = async () => {
    if (!student?.id) return;
    
    try {
      setLoading(true);
      
      // 단일 API 호출로 모든 데이터 가져오기
      const data = await fetchStudentCommentData(student.id);
      
      // 데이터 추출
      const commentsData = data.comments || [];
      const coursesData = data.courses || [];
      
      // 강사 데이터 캐싱 (5분 캐시)
      const now = Date.now();
      const teachersData = dataCache.teachers.length > 0 && dataCache.lastFetch && (now - dataCache.lastFetch < 5 * 60 * 1000)
        ? dataCache.teachers
        : data.teachers || [];
      
      // 캐시 업데이트
      if (teachersData !== dataCache.teachers) {
        setDataCache({
          teachers: teachersData,
          lastFetch: now
        });
      }
      
      // 강의 정보 설정
      setCourses(coursesData);
      
      // 룩업 테이블 생성 (O(1) 검색 속도)
      const courseMap = new Map();
      coursesData.forEach(course => {
        courseMap.set(course.id, course);
      });
      
      const teacherMap = new Map();
      teachersData.forEach(teacher => {
        teacherMap.set(teacher.name, teacher);
      });
      
      // 최적화된 데이터 매핑
      const enhancedComments = commentsData.map(comment => {
        const enhancedComment = { ...comment };
        
        // 이미 서버에서 데이터가 보강되었다면 추가 처리 불필요
        if (enhancedComment.instructor?.full_name && enhancedComment.schedule?.subject) {
          return enhancedComment;
        }
        
        // 룩업 테이블을 사용하여 O(1) 시간 복잡도로 검색
        const relatedCourse = courseMap.get(comment.schedule_id) || courseMap.get(comment.course_id);
        
        if (relatedCourse) {
          const teacherInfo = teacherMap.get(relatedCourse.instructor_name);
          
          // 강사 정보 업데이트
          enhancedComment.instructor = {
            ...(enhancedComment.instructor || {}),
            id: relatedCourse.instructor_id,
            full_name: relatedCourse.instructor_name,
            // 강사 프로필 이미지 추가 (있는 경우)
            ...(teacherInfo && { avatar_url: teacherInfo.profile_image_url })
          };
          
          // 강의 정보 업데이트
          enhancedComment.schedule = {
            id: relatedCourse.id,
            subject: relatedCourse.title
          };
        }
        
        return enhancedComment;
      });
      
      setComments(enhancedComments);
    } catch (error) {
      toast.error('코멘트를 불러오는 중 오류가 발생했습니다.');
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to load student courses - 최적화된 버전
  const loadStudentCourses = async () => {
    if (!student?.id) return;
    
    try {
      setCoursesLoading(true);
      
      // 이미 코멘트 로딩 과정에서 강의 정보를 가져왔다면 추가 API 호출 방지
      if (courses.length > 0) {
        setCoursesLoading(false);
        return;
      }
      
      // 단일 API 호출로 모든 데이터 가져오기
      const data = await fetchStudentCommentData(student.id);
      
      // 강의 정보 설정
      setCourses(data.courses || []);
    } catch (error) {
      toast.error('학생 강의 정보를 불러오는 중 오류가 발생했습니다.');
      console.error('Error loading student courses:', error);
    } finally {
      setCoursesLoading(false);
    }
  };

  // Function to delete a comment
  const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    
    try {
      setDeleteLoading(true);
      await deleteStudentComment(commentToDelete);
      
      // Remove the deleted comment from the state
      setComments(comments.filter(comment => comment.id !== commentToDelete));
      
      toast.success('코멘트가 삭제되었습니다.');
      
      // Call the onUpdate callback if provided
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      toast.error('코멘트 삭제 중 오류가 발생했습니다.');
      console.error('Error deleting comment:', error);
    } finally {
      setDeleteLoading(false);
      setCommentToDelete(null);
    }
  };
  
  // Validate comment content
  const validateContent = () => {
    if (!commentContent.trim()) {
      setContentError('코멘트 내용을 입력해주세요.');
      return false;
    }
    
    if (commentContent.length > 1000) {
      setContentError('코멘트는 1000자를 초과할 수 없습니다.');
      return false;
    }
    
    setContentError('');
    return true;
  };
  
  // Handle content change
  const handleContentChange = (e) => {
    setCommentContent(e.target.value);
    if (contentError) {
      validateContent();
    }
  };
  
  // Handle save comment
  const [saveLoading, setSaveLoading] = useState(false);
  
  const handleSaveComment = async () => {
    // Validate form
    if (!validateContent()) {
      return;
    }
    
    try {
      setSaveLoading(true);
      
      // Get instructor ID and course info from selected course
      let instructorId = null;
      let selectedCourseObj = null;
      
      if (selectedCourse) {
        selectedCourseObj = courses.find(course => course.id === selectedCourse);
        if (selectedCourseObj) {
          instructorId = selectedCourseObj.instructor_id;
        }
      }
      
      // Add comment
      let newComment = await addStudentComment(
        student.id,
        commentContent,
        selectedCourse || null, // This is scheduleId
        instructorId
      );
      
      // 새 코멘트에 강사 정보 직접 추가
      if (selectedCourseObj) {
        // 강사 프로필 이미지 정보 찾기
        const teacherInfo = dataCache.teachers.find(teacher => 
          teacher.name === selectedCourseObj.instructor_name
        );
        
        // 새 코멘트 객체 생성 (프로필 이미지 포함)
        newComment = {
          ...newComment,
          instructor: {
            id: instructorId,
            full_name: selectedCourseObj.instructor_name,
            // 강사 프로필 이미지 추가 (있는 경우)
            ...(teacherInfo && { avatar_url: teacherInfo.profile_image_url })
          },
          schedule: {
            id: selectedCourse,
            subject: selectedCourseObj.title
          }
        };
        
        // 코멘트 목록에 추가
        setComments([newComment, ...comments]);
        
        // Reset form
        setSelectedCourse('');
        setCommentContent('');
        
        toast.success('코멘트가 저장되었습니다.');
      } else {
        // Reset form
        setSelectedCourse('');
        setCommentContent('');
        
        toast.success('코멘트가 저장되었습니다.');
        
        // 서버에서 데이터 다시 로드
        await loadComments();
      }
      
      // Call the onUpdate callback if provided
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      toast.error('코멘트 저장 중 오류가 발생했습니다.');
      console.error('Error saving comment:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>강사 코멘트 - {student?.full_name}</DialogTitle>
          </DialogHeader>
          
          {/* Student information section */}
          <div className="bg-muted/30 p-4 rounded-md mb-4">
            <h3 className="font-medium mb-2">학생 정보</h3>
            {student && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">이름:</span> {student.full_name}
                </div>
                {student.email && (
                  <div>
                    <span className="text-muted-foreground">이메일:</span> {student.email}
                  </div>
                )}
                {student.phone && (
                  <div>
                    <span className="text-muted-foreground">전화번호:</span> {student.phone}
                  </div>
                )}
                {student.grade && (
                  <div>
                    <span className="text-muted-foreground">학년:</span> {student.grade}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Comments section */}
          <div className="mb-4">
            <h3 className="font-medium mb-2">기존 코멘트</h3>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {comments.map((comment) => (
                  <div key={comment.id} className="mb-4 last:mb-0">
                    <div className="text-sm text-muted-foreground flex flex-wrap gap-x-1 mb-1">
                      <span>{formatDate(comment.created_at)}</span>
                      {comment.schedule && (
                        <>
                          <span>-</span>
                          <span className="font-medium">{comment.schedule.subject}</span>
                        </>
                      )}
                      {comment.instructor && (
                        <>
                          <span>-</span>
                          <span>{comment.instructor.full_name}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-start">
                      {/* 강사 프로필 이미지 및 이름 */}
                      <div className="flex flex-col items-center mr-2">
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-medium overflow-hidden">
                          {comment.instructor ? (
                            comment.instructor.avatar_url ? (
                              <img 
                                src={comment.instructor.avatar_url} 
                                alt={comment.instructor.full_name} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null; 
                                  e.target.style.display = 'none';
                                  e.target.parentNode.textContent = comment.instructor.full_name?.charAt(0) || '강';
                                }}
                              />
                            ) : (
                              comment.instructor.full_name?.charAt(0) || '강'
                            )
                          ) : (
                            '강'
                          )}
                        </div>
                        <span className="text-xs mt-1 text-gray-500 w-full text-center" style={{ maxWidth: '80px', wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
                          {comment.instructor && comment.instructor.full_name 
                            ? `${comment.instructor.full_name.charAt(0)}선생` 
                            : '강사'}
                        </span>
                      </div>
                      
                      {/* 말풍선 */}
                      <div className="chat-bubble relative flex-1">
                        {/* 말풍선 본체 */}
                        <div className="bg-blue-100 rounded-lg px-4 py-3 text-sm relative">
                          {/* 말풍선 꼬리 - 삼각형 모양 */}
                          <div className="absolute w-3 h-3 bg-blue-100 rotate-45 left-[-6px] top-[14px] z-10"></div>
                          <div className="whitespace-pre-wrap">{comment.content}</div>
                        </div>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 ml-2 text-destructive hover:text-destructive hover:bg-destructive/10 self-start"
                        onClick={() => setCommentToDelete(comment.id)}
                        aria-label="코멘트 삭제"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                코멘트가 없습니다.
              </div>
            )}
          </div>
          
          {/* New comment form */}
          <div className="border-t pt-4 mb-4">
            <h3 className="font-medium mb-3">새 코멘트 작성</h3>
            
            <div className="space-y-4">
              {/* Course selection */}
              <div className="space-y-2">
                <Label htmlFor="course">강의 선택</Label>
                <Select
                  value={selectedCourse}
                  onValueChange={setSelectedCourse}
                  disabled={coursesLoading}
                >
                  <SelectTrigger id="course" className="w-full">
                    <SelectValue placeholder="강의를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {coursesLoading ? (
                      <div className="flex items-center justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        로딩 중...
                      </div>
                    ) : courses.length > 0 ? (
                      courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title} ({course.instructor_name})
                        </SelectItem>
                      ))
                    ) : (
                      <div className="text-center py-2 text-muted-foreground">
                        수강 중인 강의가 없습니다
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Comment content */}
              <div className="space-y-2">
                <Label htmlFor="content">코멘트 내용</Label>
                <Textarea
                  id="content"
                  placeholder="학생에 대한 코멘트를 입력하세요"
                  value={commentContent}
                  onChange={handleContentChange}
                  onBlur={validateContent}
                  className={contentError ? "border-destructive" : ""}
                  rows={4}
                />
                {contentError && (
                  <p className="text-sm text-destructive">{contentError}</p>
                )}
                <p className="text-xs text-muted-foreground text-right">
                  {commentContent.length}/1000
                </p>
              </div>
            </div>
          </div>
          
          {/* Footer with action buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={saveLoading}>
              취소
            </Button>
            <Button 
              onClick={handleSaveComment} 
              disabled={saveLoading || !commentContent.trim()}
            >
              {saveLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                '저장'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!commentToDelete} onOpenChange={(open) => !open && setCommentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>코멘트 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 코멘트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading} onClick={() => setCommentToDelete(null)}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteComment}
              disabled={deleteLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  삭제 중...
                </>
              ) : (
                '삭제'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default StudentCommentModal;