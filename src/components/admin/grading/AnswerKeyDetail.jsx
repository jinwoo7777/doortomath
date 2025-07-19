'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, BookOpen, User, FileText, ArrowLeft, Edit, Trash2, ExternalLink, Copy, Check, Share2 } from 'lucide-react';

export default function AnswerKeyDetail({ answerKey, onBack, onEdit, onDelete }) {
  const [copied, setCopied] = useState(false);
  
  if (!answerKey) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getExamTypeBadge = (type) => {
    const types = {
      regular: { label: '정기시험', color: 'bg-blue-500' },
      midterm: { label: '중간고사', color: 'bg-green-500' },
      final: { label: '기말고사', color: 'bg-red-500' },
      quiz: { label: '퀴즈', color: 'bg-yellow-500' }
    };
    
    const typeInfo = types[type] || { label: type, color: 'bg-gray-500' };
    return (
      <Badge className={`text-white ${typeInfo.color}`}>
        {typeInfo.label}
      </Badge>
    );
  };

  const getStudentExamUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/student-exam/${answerKey.id}`;
    }
    return '';
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getStudentExamUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
    }
  };

  const openStudentExam = () => {
    window.open(getStudentExamUrl(), '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{answerKey.exam_title}</h2>
          <p className="text-gray-600">답안 키 상세 정보</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => onEdit?.(answerKey)}
            className="flex items-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            편집
          </Button>
          <Button
            variant="outline"
            onClick={() => onDelete?.(answerKey.id)}
            className="flex items-center text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            삭제
          </Button>
        </div>
      </div>

      {/* 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>시험 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-3 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">시험 날짜</p>
                  <p className="font-medium">{formatDate(answerKey.exam_date)}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <BookOpen className="w-5 h-5 mr-3 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">과목</p>
                  <p className="font-medium">{answerKey.subject}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <User className="w-5 h-5 mr-3 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">담당 강사</p>
                  <p className="font-medium">{answerKey.teachers?.name || '알 수 없음'}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">시험 유형</p>
                <div className="mt-1">
                  {getExamTypeBadge(answerKey.exam_type)}
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">총 점수</p>
                <p className="font-medium text-2xl">{answerKey.total_score}점</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">문제 수</p>
                <p className="font-medium text-2xl">{answerKey.answers?.length || 0}문제</p>
              </div>
            </div>
          </div>
          
          {answerKey.exam_description && (
            <>
              <Separator className="my-4" />
              <div>
                <p className="text-sm text-gray-500 mb-2">시험 설명</p>
                <p className="text-gray-700 leading-relaxed">{answerKey.exam_description}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 학생용 시험 링크 */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center text-green-800">
            <Share2 className="w-5 h-5 mr-2" />
            학생용 시험 링크
          </CardTitle>
          <CardDescription className="text-green-700">
            이 링크를 학생들에게 공유하여 시험에 참여할 수 있도록 하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="exam-url" className="text-sm font-medium text-green-800">
                시험 참여 URL
              </Label>
              <div className="flex space-x-2 mt-1">
                <Input
                  id="exam-url"
                  type="text"
                  value={getStudentExamUrl()}
                  readOnly
                  className="flex-1 bg-white"
                />
                <Button
                  variant="outline"
                  onClick={copyToClipboard}
                  className="flex items-center"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      복사됨
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      복사
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={openStudentExam}
                  className="flex items-center"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  미리보기
                </Button>
              </div>
            </div>
            
            <Alert className="border-green-200 bg-green-100">
              <AlertDescription className="text-green-800">
                <strong>📋 시험 진행 방법:</strong>
                <ol className="mt-2 space-y-1 text-sm list-decimal list-inside">
                  <li>위 링크를 학생들에게 공유합니다</li>
                  <li>학생들이 링크에 접속하여 이름과 전화번호를 입력합니다</li>
                  <li>등록된 학원생 정보와 일치하면 시험에 참여할 수 있습니다</li>
                  <li>시험 시작부터 제출까지의 시간이 자동으로 측정됩니다</li>
                  <li>제출된 답안은 관리자 페이지에서 확인 및 채점할 수 있습니다</li>
                </ol>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* 답안 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>답안 목록</CardTitle>
          <CardDescription>
            총 {answerKey.answers?.length || 0}개의 문제와 답안
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!answerKey.answers || answerKey.answers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p>등록된 답안이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {answerKey.answers.map((answer, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <Badge variant="outline" className="text-sm">
                            문제 {answer.question || index + 1}
                          </Badge>
                          <Badge variant="secondary" className="text-sm">
                            {answer.score}점
                          </Badge>
                          <Badge 
                            variant={answer.question_type === 'multiple_choice' ? 'default' : 'destructive'} 
                            className="text-sm"
                          >
                            {answer.question_type === 'multiple_choice' ? '객관식 (자동 채점)' : '주관식 (수동 채점)'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-gray-500">정답</p>
                            <p className="font-medium text-lg text-green-600">
                              {answer.answer}
                            </p>
                          </div>
                          
                          {answer.description && (
                            <div>
                              <p className="text-sm text-gray-500">설명</p>
                              <p className="text-gray-700">{answer.description}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 시스템 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>시스템 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">생성일</p>
              <p>{formatDate(answerKey.created_at)}</p>
            </div>
            <div>
              <p className="text-gray-500">최종 수정일</p>
              <p>{formatDate(answerKey.updated_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}