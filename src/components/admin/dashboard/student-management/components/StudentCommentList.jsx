"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquarePlus } from 'lucide-react';
import { toast } from 'sonner';
import { fetchStudentCommentData } from '@/lib/api/students';

/**
 * Component to display a list of student comments
 * @param {Object} props - Component props
 * @param {string} props.studentId - ID of the student
 * @param {Function} props.onEdit - Function to call when edit button is clicked
 * @param {boolean} props.showEditButton - Whether to show the edit button (default: true)
 */
const StudentCommentList = ({ studentId, onEdit, showEditButton = true }) => {
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);

  // Load comments when component mounts or studentId changes
  useEffect(() => {
    if (studentId) {
      loadComments();
    }
  }, [studentId]);

  // 데이터 캐싱을 위한 상태 추가
  const [dataCache, setDataCache] = useState({
    teachers: [],
    courses: [],
    lastFetch: null
  });
  
  // Function to load comments with performance optimizations
  const loadComments = async () => {
    try {
      setLoading(true);
      
      // 캐시 만료 시간 (5분)
      const CACHE_EXPIRY = 5 * 60 * 1000;
      const now = Date.now();
      const isCacheValid = dataCache.lastFetch && (now - dataCache.lastFetch < CACHE_EXPIRY);
      
      // 단일 API 호출로 모든 데이터 가져오기
      const data = await fetchStudentCommentData(studentId);
      
      // 데이터 추출
      const commentsData = data.comments || [];
      
      // 강의 및 강사 데이터 캐싱
      const coursesData = isCacheValid && dataCache.courses.length > 0 
        ? dataCache.courses 
        : data.courses || [];
        
      const teachersData = isCacheValid && dataCache.teachers.length > 0
        ? dataCache.teachers
        : data.teachers || [];
      
      // 캐시가 만료되었거나 비어있으면 캐시 업데이트
      if (!isCacheValid || dataCache.courses.length === 0 || dataCache.teachers.length === 0) {
        setDataCache({
          teachers: teachersData,
          courses: coursesData,
          lastFetch: now
        });
      }
      
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
        // 이미 서버에서 데이터가 보강되었다면 추가 처리 불필요
        if (comment.instructor?.full_name && comment.schedule?.subject) {
          return comment;
        }
        
        // 룩업 테이블을 사용하여 O(1) 시간 복잡도로 검색
        const relatedCourse = courseMap.get(comment.schedule_id) || courseMap.get(comment.course_id);
        const enhancedComment = { ...comment };
        
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
            ...(enhancedComment.schedule || {}),
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
      setComments([]);
    } finally {
      setLoading(false);
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

  // If loading, show loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // If no comments, show message
  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <p className="text-muted-foreground mb-2">코멘트가 없습니다.</p>
        {showEditButton && onEdit && (
          <Button variant="outline" size="sm" onClick={onEdit}>
            <MessageSquarePlus className="h-4 w-4 mr-2" />
            코멘트 추가
          </Button>
        )}
      </div>
    );
  }

  // Render comments
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-muted-foreground">
          총 {comments.length}개의 코멘트
        </h4>
        {showEditButton && onEdit && (
          <Button variant="outline" size="sm" onClick={onEdit}>
            <MessageSquarePlus className="h-4 w-4 mr-2" />
            코멘트 관리
          </Button>
        )}
      </div>
      
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
        {comments.map((comment) => (
          <div key={comment.id} className="mb-4 last:mb-0">
            <div className="ml-12 text-sm text-muted-foreground flex flex-wrap gap-x-1 mb-1">
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
              <div className="ml-2 chat-bubble relative flex-1">
                {/* 말풍선 본체 */}
                <div className="bg-blue-100 rounded-lg px-4 py-3 text-sm relative">
                  {/* 말풍선 꼬리 - 삼각형 모양 */}
                  <div className="absolute w-3 h-3 bg-blue-100 rotate-45 left-[-6px] top-[14px] z-10"></div>
                  <div className="whitespace-pre-wrap">{comment.content}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentCommentList;