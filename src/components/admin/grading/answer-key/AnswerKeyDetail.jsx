'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clipboard, ClipboardCheck, ExternalLink, ArrowLeft } from 'lucide-react';
import { formatDateTime } from '../utils/formatters';
import { getExamTypeBadge } from '../utils/badges';

/**
 * 답안 키 상세 정보 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {Object} props.answerKey - 답안 키 데이터
 * @param {Function} props.onBack - 뒤로 가기 핸들러
 * @returns {JSX.Element} 답안 키 상세 정보 컴포넌트
 */
const AnswerKeyDetail = ({ answerKey, onBack }) => {
  const [copied, setCopied] = useState(false);
  
  // 학생용 시험 URL 생성
  const studentExamUrl = `${window.location.origin}/exam/${answerKey.id}`;
  
  // 클립보드에 복사
  const copyToClipboard = () => {
    navigator.clipboard.writeText(studentExamUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // 미리보기 열기
  const openPreview = () => {
    window.open(studentExamUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* 기본 정보 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>{answerKey.exam_title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">시험 정보</h3>
              <dl className="mt-2 space-y-1">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium">시험 날짜</dt>
                  <dd className="text-sm">{new Date(answerKey.exam_date).toLocaleDateString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium">강사</dt>
                  <dd className="text-sm">{answerKey.teacher_name || '-'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium">과목</dt>
                  <dd className="text-sm">{answerKey.subject}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium">유형</dt>
                  <dd className="text-sm">{getExamTypeBadge(answerKey.exam_type)}</dd>
                </div>
              </dl>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">시험 구성</h3>
              <dl className="mt-2 space-y-1">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium">총점</dt>
                  <dd className="text-sm">{answerKey.total_score}점</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium">문제 수</dt>
                  <dd className="text-sm">{answerKey.answers?.length || 0}문제</dd>
                </div>
              </dl>
            </div>
          </div>
          
          {/* 시험 설명 */}
          {answerKey.exam_description && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500">시험 설명</h3>
              <p className="mt-1 text-sm whitespace-pre-line">{answerKey.exam_description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 학생용 시험 링크 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>학생용 시험 링크</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
            <span className="text-sm truncate mr-2">{studentExamUrl}</span>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="flex items-center"
              >
                {copied ? (
                  <>
                    <ClipboardCheck className="h-4 w-4 mr-1" />
                    복사됨
                  </>
                ) : (
                  <>
                    <Clipboard className="h-4 w-4 mr-1" />
                    복사
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={openPreview}
                className="flex items-center"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                미리보기
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 답안 목록 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>답안 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {answerKey.answers && answerKey.answers.length > 0 ? (
            <div className="space-y-4">
              {answerKey.answers.map((answer, index) => (
                <div key={index} className="border p-4 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">문제 {answer.question || index + 1}</h4>
                    <Badge variant="outline">{answer.score}점</Badge>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">정답: </span>
                      <span className="text-sm">{answer.answer}</span>
                    </div>
                    {answer.description && (
                      <div>
                        <span className="text-sm font-medium">설명: </span>
                        <span className="text-sm">{answer.description}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">등록된 답안이 없습니다.</p>
          )}
        </CardContent>
      </Card>

      {/* 시스템 정보 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>시스템 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">생성일</span>
              <span className="text-sm">{formatDateTime(answerKey.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">마지막 수정일</span>
              <span className="text-sm">{formatDateTime(answerKey.updated_at)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-start">
          <Button
            variant="outline"
            onClick={onBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            뒤로
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AnswerKeyDetail;
