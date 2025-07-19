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
      
      console.log('코멘트 조회 시작 - studentId:', studentId);

      // 테이블 존재 여부 먼저 확인
      console.log('테이블 존재 확인 시작...');
      
      // 1. 먼저 students 테이블이 접근 가능한지 확인
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, full_name')
        .limit(1);
      
      console.log('students 테이블 접근 테스트:', { studentsData, studentsError });

      // 2. student_comments 테이블 스키마 확인
      try {
        const { data: schemaData, error: schemaError } = await supabase
          .from('student_comments')
          .select('*')
          .limit(0);
        
        console.log('student_comments 스키마 확인:', { schemaData, schemaError });
      } catch (schemaErr) {
        console.error('스키마 확인 중 오류:', schemaErr);
      }

      // 3. RLS 정책 무시하고 직접 쿼리 시도
      console.log('RLS 우회 테스트 - Supabase 클라이언트 설정:', {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'exists' : 'missing'
      });

      // 4. 전체 코멘트를 조회해보기 (필터 없이)
      const { data: allComments, error: allError } = await supabase
        .from('student_comments')
        .select('*');

      console.log('전체 코멘트 조회:', { allComments, allError });

      // 특정 학생의 코멘트 조회
      const { data: commentsData, error: commentsError } = await supabase
        .from('student_comments')
        .select('*')
        .eq('student_id', studentId);

      console.log('학생별 코멘트 조회 결과:', { 
        studentId, 
        commentsData, 
        commentsError,
        commentCount: commentsData?.length || 0
      });

      if (commentsError) {
        console.error('Supabase 오류:', commentsError);
        throw new Error(`데이터베이스 오류: ${commentsError.message}`);
      }

      setComments(commentsData || []);
    } catch (error) {
      console.error('강사 코멘트 조회 오류:', error);
      setError(`오류: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
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
                        {comment.teacher?.name || comment.schedule?.teacher_name || '강사'}
                      </span>
                      {comment.schedule?.subject && (
                        <Badge 
                          variant="outline" 
                          className="bg-blue-100 text-blue-800"
                        >
                          {comment.schedule.subject}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(comment.created_at)}
                    </div>
                  </div>

                  {/* 코멘트 내용 */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>

                  {/* 과목/수업 정보 */}
                  {comment.schedule && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <BookOpen className="h-4 w-4" />
                      <span>{comment.schedule.grade} • {comment.schedule.time_slot}</span>
                    </div>
                  )}

                  {/* 메타 정보 */}
                  <div className="text-xs text-gray-400 space-y-1">
                    {comment.updated_at !== comment.created_at && (
                      <div>수정됨: {formatDate(comment.updated_at)}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}