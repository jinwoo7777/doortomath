'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageSquare, 
  User, 
  Calendar, 
  BookOpen, 
  Loader2,
  MessageCircle,
  Clock
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

      // 먼저 기본 코멘트 데이터만 조회해보기
      const { data: commentsData, error: commentsError } = await supabase
        .from('student_comments')
        .select(`
          id,
          content,
          created_at,
          updated_at,
          course_id,
          instructor_id
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      console.log('기본 코멘트 조회 결과:', { commentsData, commentsError });

      if (commentsError) {
        console.error('Supabase 오류 상세:', commentsError);
        throw commentsError;
      }

      // 기본 코멘트 데이터가 있으면 관련 정보들을 추가로 조회
      let enrichedComments = commentsData || [];
      
      if (commentsData && commentsData.length > 0) {
        // 각 코멘트에 대해 강사 정보와 코스 정보를 별도로 조회
        for (let comment of enrichedComments) {
          // 강사 정보 조회
          if (comment.instructor_id) {
            try {
              const { data: teacherData } = await supabase
                .from('teachers')
                .select('id, name')
                .eq('id', comment.instructor_id)
                .single();
              
              comment.teacher = teacherData;
            } catch (teacherError) {
              console.log('강사 정보 조회 실패:', teacherError);
            }
          }

          // 코스 정보 조회
          if (comment.course_id) {
            try {
              const { data: courseData } = await supabase
                .from('courses')
                .select('id, title, subject')
                .eq('id', comment.course_id)
                .single();
              
              comment.course = courseData;
            } catch (courseError) {
              console.log('코스 정보 조회 실패:', courseError);
            }
          }
        }
      }

      console.log('최종 코멘트 데이터:', enrichedComments);
      setComments(enrichedComments);
    } catch (error) {
      console.error('강사 코멘트 조회 오류:', error);
      console.error('오류 상세 정보:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      setError(`강사 코멘트를 불러올 수 없습니다: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSubjectBadgeColor = (subject) => {
    const colors = {
      '수학': 'bg-blue-100 text-blue-800',
      '영어': 'bg-green-100 text-green-800',
      '국어': 'bg-purple-100 text-purple-800',
      '과학': 'bg-orange-100 text-orange-800',
      '물리': 'bg-red-100 text-red-800',
      '화학': 'bg-yellow-100 text-yellow-800',
      '생물': 'bg-emerald-100 text-emerald-800'
    };
    return colors[subject] || 'bg-gray-100 text-gray-800';
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
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">코멘트를 불러오는 중...</span>
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
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id} className="border border-gray-200">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {/* 코멘트 헤더 */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-800">
                        {comment.teacher?.name || '강사'}
                      </span>
                      {comment.course?.subject && (
                        <Badge 
                          variant="outline" 
                          className={getSubjectBadgeColor(comment.course.subject)}
                        >
                          {comment.course.subject}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(comment.created_at)}
                    </div>
                  </div>

                  {/* 과목/강의 정보 */}
                  {comment.course?.title && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <BookOpen className="h-4 w-4" />
                      <span>{comment.course.title}</span>
                    </div>
                  )}

                  {/* 코멘트 내용 */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>

                  {/* 수정 시간 표시 (생성시간과 다른 경우) */}
                  {comment.updated_at !== comment.created_at && (
                    <div className="text-xs text-gray-400 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      수정됨: {formatDate(comment.updated_at)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}