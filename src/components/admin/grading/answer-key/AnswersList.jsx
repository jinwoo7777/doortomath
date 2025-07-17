'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus } from 'lucide-react';

/**
 * 답안 목록 관리 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {Array} props.answers - 답안 목록
 * @param {Object} props.errors - 유효성 검사 오류
 * @param {Function} props.handleAnswerChange - 답안 변경 핸들러
 * @param {Function} props.addAnswer - 답안 추가 핸들러
 * @param {Function} props.removeAnswer - 답안 제거 핸들러
 * @returns {JSX.Element} 답안 목록 관리 컴포넌트
 */
const AnswersList = ({ answers, errors, handleAnswerChange, addAnswer, removeAnswer }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>답안 목록</CardTitle>
        <Button variant="outline" onClick={addAnswer}>
          <Plus className="mr-2 h-4 w-4" />
          문제 추가
        </Button>
      </CardHeader>
      <CardContent>
        {errors.answers && (
          <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded">
            <p className="text-red-500 text-sm">{errors.answers}</p>
          </div>
        )}

        {answers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>등록된 문제가 없습니다. 문제를 추가해주세요.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {answers.map((answer, index) => (
              <div key={index} className="border p-4 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">문제 {index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAnswer(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`question-${index}`}>문제 번호</Label>
                    <Input
                      id={`question-${index}`}
                      type="number"
                      value={answer.question}
                      onChange={(e) => handleAnswerChange(index, 'question', parseInt(e.target.value) || 1)}
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`score-${index}`}>배점</Label>
                    <Input
                      id={`score-${index}`}
                      type="number"
                      value={answer.score}
                      onChange={(e) => handleAnswerChange(index, 'score', parseInt(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`answer-${index}`}>정답</Label>
                    <Input
                      id={`answer-${index}`}
                      type="text"
                      value={answer.answer}
                      onChange={(e) => handleAnswerChange(index, 'answer', e.target.value)}
                      placeholder="정답을 입력하세요"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`description-${index}`}>설명</Label>
                    <Textarea
                      id={`description-${index}`}
                      value={answer.description}
                      onChange={(e) => handleAnswerChange(index, 'description', e.target.value)}
                      placeholder="문제 설명이나 해설을 입력하세요"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnswersList;
