'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  MessageSquare,
  Loader2,
  MessageCircle
} from 'lucide-react';

// 날짜 포맷팅 함수 - 컴포넌트 외부로 이동하여 불필요한 재생성 방지
const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    return '날짜 오류';
  }
};

// 개별 코멘트 컴포넌트 - 메모이제이션 적용
const CommentItem = React.memo(({ comment }) => {
  return (
    <div className="mb-4 last:mb-0">
      {/* 코멘트 메타 정보 */}
      <div className="text-sm text-muted-foreground flex flex-wrap gap-x-1 mb-2">
        <span>{formatDate(comment.created_at)}</span>
        {comment.schedule && (
          <>
            <span>-</span>
            <span className="font-medium">{comment.schedule.subject}</span>
          </>
        )}
        {(comment.instructor?.full_name || comment.teacher?.name || comment.schedule?.teacher_name) && (
          <>
            <span>-</span>
            <span>{comment.instructor?.full_name || comment.teacher?.name || comment.schedule?.teacher_name}</span>
          </>
        )}
      </div>

      {/* 강사 프로필과 말풍선 */}
      <div className="flex items-start">
        {/* 강사 프로필 이미지 및 이름 */}
        <div className="flex flex-col items-center mr-3">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-medium overflow-hidden">
            {(comment.instructor?.avatar_url || comment.teacher?.profile_image_url) ? (
              <img
                src={comment.instructor?.avatar_url || comment.teacher?.profile_image_url}
                alt={comment.instructor?.full_name || comment.teacher?.name || comment.schedule?.teacher_name || '강사'}
                className="w-full h-full object-cover"
                width="40"
                height="40"
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.parentNode.textContent = (comment.instructor?.full_name || comment.teacher?.name || comment.schedule?.teacher_name)?.charAt(0) || '강';
                }}
              />
            ) : (
              (comment.instructor?.full_name || comment.teacher?.name || comment.schedule?.teacher_name)?.charAt(0) || '강'
            )}
          </div>
          <span className="text-xs mt-1 text-gray-500 text-center" style={{ maxWidth: '80px', wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
            {comment.instructor?.full_name || comment.teacher?.name || comment.schedule?.teacher_name
              ? `${(comment.instructor?.full_name || comment.teacher?.name || comment.schedule?.teacher_name).charAt(0)}선생`
              : '강사'}
          </span>
        </div>

        {/* 말풍선 */}
        <div className="chat-bubble relative inline-block max-w-[80%]">
          {/* 말풍선 본체 */}
          <div className="bg-blue-100 rounded-lg px-4 py-3 text-sm relative">
            {/* 말풍선 꼬리 - 삼각형 모양 */}
            <div className="absolute w-3 h-3 bg-blue-100 rotate-45 left-[-6px] top-[14px] z-10"></div>
            <div className="whitespace-pre-wrap">{comment.content}</div>
          </div>
        </div>
      </div>
    </div>
  );
});

CommentItem.displayName = 'CommentItem';

export default function StudentCommentsSection({ supabase, studentId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 메모이제이션을 위한 참조 저장
  const studentIdRef = React.useRef(studentId);
  
  // 데이터 캐싱을 위한 상태 추가
  const [dataCache, setDataCache] = useState({
    lastFetch: null,
    expiryTime: 5 * 60 * 1000, // 5분 캐시
    commentCount: 0, // 코멘트 수 캐싱
    teachers: [], // 강사 정보 캐싱
    courses: [] // 강의 정보 캐싱
  });
  
  // 학생 ID가 변경되면 참조 업데이트
  useEffect(() => {
    if (studentIdRef.current !== studentId) {
      studentIdRef.current = studentId;
      // 학생 ID가 변경되면 캐시 무효화
      setDataCache(prev => ({
        ...prev,
        lastFetch: null
      }));
    }
  }, [studentId]);
  
  // fetchComments 함수를 useCallback으로 메모이제이션
  const fetchComments = useCallback(async () => {
    if (!studentId) return;
    
    try {
      setLoading(true);
      setError('');

      // 캐시 만료 확인
      const now = Date.now();
      const isCacheValid = dataCache.lastFetch && (now - dataCache.lastFetch < dataCache.expiryTime);
      
      // 캐시가 유효하고 코멘트가 있으면 API 호출 건너뛰기
      if (isCacheValid && comments.length > 0) {
        setLoading(false);
        return;
      }

      // Supabase를 사용하여 데이터 가져오기
      const [commentsResult, teachersResult] = await Promise.all([
        // 1. 코멘트 데이터 가져오기
        supabase
          .from('student_comments')
          .select(`
            id,
            content,
            created_at,
            updated_at,
            schedule_id,
            instructor_id,
            instructor:instructor_id(id, full_name, email),
            schedule:schedule_id(id, subject)
          `)
          .eq('student_id', studentId)
          .order('created_at', { ascending: false })
          .limit(20),

        // 2. 강사 정보 가져오기
        supabase
          .from('teachers')
          .select('id, name, profile_image_url')
          .limit(50)
      ]);

      if (commentsResult.error) {
        throw commentsResult.error;
      }

      // 학생 강의 정보 가져오기 - 먼저 student_enrollments 테이블 시도
      let coursesResult = await supabase
        .from('student_enrollments')
        .select(`
          id,
          schedule:schedule_id(
            id,
            subject,
            teacher_name
          )
        `)
        .eq('student_id', studentId)
        .eq('status', 'active');

      // student_enrollments에서 데이터를 찾지 못한 경우 student_schedules 테이블 조회
      let courses = [];
      if (!coursesResult.error && coursesResult.data && coursesResult.data.length > 0) {
        courses = coursesResult.data
          .filter(item => item.schedule)
          .map(item => ({
            id: item.schedule.id,
            title: item.schedule.subject,
            instructor_name: item.schedule.teacher_name || '강사 정보 없음'
          }));
      } else {
        console.log('student_enrollments에서 데이터를 찾지 못했습니다. student_schedules 테이블 조회 시도...');
        
        const schedulesResult = await supabase
          .from('student_schedules')
          .select(`
            id,
            schedule:schedule_id(
              id,
              subject,
              teacher_name
            )
          `)
          .eq('student_id', studentId)
          .eq('status', 'active');
          
        if (!schedulesResult.error && schedulesResult.data && schedulesResult.data.length > 0) {
          courses = schedulesResult.data
            .filter(item => item.schedule)
            .map(item => ({
              id: item.schedule.id,
              title: item.schedule.subject,
              instructor_name: item.schedule.teacher_name || '강사 정보 없음'
            }));
        }
      }

      // 강사 정보 추출
      const teachers = teachersResult.data || [];

      // 데이터 캐시 업데이트
      setDataCache({
        lastFetch: now,
        expiryTime: dataCache.expiryTime,
        commentCount: commentsResult.data?.length || 0,
        teachers,
        courses
      });

      // 코멘트 데이터에 강사 정보 보완
      const enhancedComments = commentsResult.data?.map(comment => {
        // 해당 코멘트의 강의 ID와 일치하는 강의 찾기
        const relatedCourse = courses.find(course =>
          course.id === comment.schedule_id ||
          course.id === comment.course_id
        );

        const enhancedComment = { ...comment };

        // 강사 정보와 강의 정보 업데이트
        if (relatedCourse) {
          // 강사 이름으로 teachers 테이블에서 강사 정보 찾기
          const teacherInfo = teachers.find(teacher =>
            teacher.name === relatedCourse.instructor_name
          );

          // 강사 정보 업데이트
          if (enhancedComment.instructor) {
            enhancedComment.instructor.full_name = relatedCourse.instructor_name;
            if (teacherInfo && teacherInfo.profile_image_url) {
              enhancedComment.instructor.avatar_url = teacherInfo.profile_image_url;
            }
          } else {
            enhancedComment.instructor = {
              full_name: relatedCourse.instructor_name,
              ...(teacherInfo && { avatar_url: teacherInfo.profile_image_url })
            };
          }

          // 강의 정보 업데이트
          if (!enhancedComment.schedule) {
            enhancedComment.schedule = {
              id: relatedCourse.id,
              subject: relatedCourse.title
            };
          }
        }

        // 강사 정보를 teacher 필드에도 복사 (호환성을 위해)
        if (enhancedComment.instructor && !enhancedComment.teacher) {
          enhancedComment.teacher = {
            name: enhancedComment.instructor.full_name,
            profile_image_url: enhancedComment.instructor.avatar_url
          };
        }

        return enhancedComment;
      }) || [];

      setComments(enhancedComments);
    } catch (error) {
      console.error('강사 코멘트 조회 오류:', error);
      setError(`강사 코멘트를 불러올 수 없습니다: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  }, [studentId, dataCache, comments.length, supabase]);
  
  // 코멘트 로딩
  useEffect(() => {
    if (studentId && supabase) {
      fetchComments();
    }
  }, [studentId, supabase, fetchComments]);

  // 렌더링 최적화를 위한 메모이제이션
  const commentsList = useMemo(() => {
    return comments.map(comment => (
      <CommentItem key={comment.id} comment={comment} />
    ));
  }, [comments]);

  // 로딩 상태 UI
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            <span>강사 코멘트</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // 에러 상태 UI
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            <span>강사 코멘트</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // 코멘트 없음 상태 UI
  if (comments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            <span>강사 코멘트</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">아직 등록된 강사 코멘트가 없습니다.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 코멘트 목록 UI
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-blue-500" />
          <span>강사 코멘트</span>
          <Badge variant="secondary" className="ml-2">
            {comments.length}개
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
          {commentsList}
        </div>
      </CardContent>
    </Card>
  );
}