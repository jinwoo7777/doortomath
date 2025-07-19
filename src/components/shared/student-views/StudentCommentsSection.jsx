'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  MessageSquare,
  Loader2,
  MessageCircle
} from 'lucide-react';

export default function StudentCommentsSection({ supabase, studentId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (studentId) {
      fetchComments();
    }
  }, [studentId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('학생 코멘트 조회 시작:', studentId);

      // 1. 학생이 수강 중인 과목 정보 조회
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('student_enrollments')
        .select(`
          id,
          schedule_id,
          schedule:schedule_id (
            id,
            subject,
            teacher_name,
            grade,
            time_slot
          )
        `)
        .eq('student_id', studentId);

      if (enrollmentsError) {
        console.error('학생 수강 정보 조회 오류:', enrollmentsError);
      } else {
        console.log('학생 수강 정보:', enrollmentsData?.length || 0, '개 과목');
      }

      // 수강 중인 과목의 강사 이름 수집
      const teacherNames = new Set();
      enrollmentsData?.forEach(enrollment => {
        if (enrollment.schedule?.teacher_name) {
          teacherNames.add(enrollment.schedule.teacher_name);
        }
      });

      console.log('수강 중인 과목 강사 이름:', Array.from(teacherNames));

      // 2. 강사 정보 조회
      let teachersData = [];

      // 모든 강사 정보 조회
      const { data: teachers, error: teachersError } = await supabase
        .from('teachers')
        .select('id, name, profile_image_url');

      if (teachersError) {
        console.error('강사 정보 조회 오류:', teachersError);
      } else {
        teachersData = teachers || [];
        console.log('조회된 강사 정보:', teachersData.length, '명');

        // 첫 번째 강사 정보 출력
        if (teachersData.length > 0) {
          console.log('첫 번째 강사 정보:', teachersData[0]);
        }
      }

      // 강사 이름으로 룩업 맵 생성
      const teacherMap = new Map();
      teachersData.forEach(teacher => {
        teacherMap.set(teacher.name, teacher);
        console.log(`강사 정보 맵에 추가: ${teacher.name}, 이미지 URL: ${teacher.profile_image_url}`);
      });

      // 3. 학생 코멘트 조회
      const { data: commentsData, error: commentsError } = await supabase
        .from('student_comments')
        .select(`
          id,
          content,
          created_at,
          updated_at,
          schedule_id,
          instructor_id,
          schedule:schedule_id(id, subject, teacher_name, grade, time_slot)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (commentsError) {
        console.error('코멘트 조회 오류:', commentsError);
        throw commentsError;
      }

      console.log('조회된 코멘트 수:', commentsData?.length || 0);

      // 4. 코멘트에 강사 정보 추가
      const enhancedComments = commentsData?.map(comment => {
        // 강사 정보 찾기
        let teacherInfo = null;

        // 1) 코멘트에 연결된 스케줄의 강사 이름으로 찾기
        if (comment.schedule?.teacher_name) {
          teacherInfo = teacherMap.get(comment.schedule.teacher_name);
          if (teacherInfo) {
            console.log(`스케줄의 강사 이름으로 찾음: ${comment.schedule.teacher_name}`);
          }
        }

        // 2) 수강 중인 과목 중에서 일치하는 스케줄 ID로 찾기
        if (!teacherInfo && comment.schedule_id) {
          const matchingEnrollment = enrollmentsData?.find(e => e.schedule_id === comment.schedule_id);
          if (matchingEnrollment?.schedule?.teacher_name) {
            teacherInfo = teacherMap.get(matchingEnrollment.schedule.teacher_name);
            if (teacherInfo) {
              console.log(`수강 중인 과목에서 찾음: ${matchingEnrollment.schedule.teacher_name}`);
            }
          }
        }

        // 3) 강사 ID로 직접 찾기
        if (!teacherInfo && comment.instructor_id) {
          teacherInfo = teachersData.find(t => t.id === comment.instructor_id);
          if (teacherInfo) {
            console.log(`강사 ID로 찾음: ${comment.instructor_id}`);
          }
        }

        // 4) 김민수 강사 정보 직접 찾기
        if (!teacherInfo) {
          teacherInfo = teachersData.find(t => t.name === '김민수');
          if (teacherInfo) {
            console.log('김민수 강사 정보 직접 찾음');
          }
        }

        // 강사 정보 추가
        if (teacherInfo) {
          comment.teacher = teacherInfo;
          console.log(`강사 정보 추가: ${teacherInfo.name}, 이미지 URL: ${teacherInfo.profile_image_url || '없음'}`);
        } else {
          // 기본 강사 정보 설정
          comment.teacher = {
            name: comment.schedule?.teacher_name || '강사',
            profile_image_url: '/avatar_1.png' // 기본 이미지 경로
          };
          console.log('강사 정보를 찾지 못해 기본 정보 사용');
        }

        return comment;
      });

      setComments(enhancedComments || []);
    } catch (error) {
      console.error('강사 코멘트 조회 오류:', error);
      setError(`강사 코멘트를 불러올 수 없습니다: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

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
          {comments.map((comment) => (
            <div key={comment.id} className="mb-4 last:mb-0">
              {/* 코멘트 메타 정보 */}
              <div className="text-sm text-muted-foreground flex flex-wrap gap-x-1 mb-2">
                <span>{formatDate(comment.created_at)}</span>
                {comment.schedule && (
                  <>
                    <span>-</span>
                    <span className="font-medium">{comment.schedule.subject}</span>
                  </>
                )}
                {(comment.teacher?.name || comment.schedule?.teacher_name) && (
                  <>
                    <span>-</span>
                    <span>{comment.teacher?.name || comment.schedule?.teacher_name}</span>
                  </>
                )}
              </div>

              {/* 강사 프로필과 말풍선 */}
              <div className="flex items-start">
                {/* 강사 프로필 이미지 및 이름 */}
                <div className="flex flex-col items-center mr-3">
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-medium overflow-hidden">
                    {comment.teacher?.profile_image_url ? (
                      <img
                        src={comment.teacher.profile_image_url}
                        alt={comment.teacher?.name || comment.schedule?.teacher_name || '강사'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          console.log('이미지 로드 실패, 기본 이미지로 대체');
                          e.target.onerror = null;
                          e.target.src = '/avatar_1.png';
                          e.target.style.display = 'none';
                          e.target.parentNode.textContent = (comment.teacher?.name || comment.schedule?.teacher_name)?.charAt(0) || '강';
                        }}
                      />
                    ) : (
                      (comment.teacher?.name || comment.schedule?.teacher_name)?.charAt(0) || '강'
                    )}
                  </div>
                  <span className="text-xs mt-1 text-gray-500 text-center" style={{ maxWidth: '80px', wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
                    {comment.teacher?.name || comment.schedule?.teacher_name
                      ? `${(comment.teacher?.name || comment.schedule?.teacher_name).charAt(0)}선생`
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
}