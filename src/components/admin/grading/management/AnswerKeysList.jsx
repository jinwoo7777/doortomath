'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Users } from 'lucide-react';
import { formatDate } from '../utils/formatters';
import { getExamTypeBadge } from '../utils/badges';

/**
 * 답안 키 목록 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {Array} props.answerKeys - 답안 키 목록
 * @param {Function} props.onDelete - 삭제 핸들러
 * @returns {JSX.Element} 답안 키 목록 컴포넌트
 */
const AnswerKeysList = ({ answerKeys, onDelete }) => {
  const router = useRouter();

  // 상세 보기 페이지로 이동
  const handleViewDetail = (id) => {
    router.push(`/admin/grading/detail/${id}`);
  };

  // 수정 페이지로 이동
  const handleEdit = (id) => {
    router.push(`/admin/grading/edit/${id}`);
  };

  // 학생 응시 현황 페이지로 이동
  const handleViewStatus = (id) => {
    router.push(`/admin/grading/status/${id}`);
  };

  // 삭제 확인
  const handleDelete = (id, title) => {
    if (confirm(`"${title}" 답안 키를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      onDelete(id);
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        {answerKeys.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>등록된 답안 키가 없습니다.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>시험 날짜</TableHead>
                  <TableHead>시험 제목</TableHead>
                  <TableHead>과목</TableHead>
                  <TableHead>강사</TableHead>
                  <TableHead>유형</TableHead>
                  <TableHead>총점</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {answerKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell>{formatDate(key.exam_date)}</TableCell>
                    <TableCell className="font-medium">{key.exam_title}</TableCell>
                    <TableCell>{key.subject}</TableCell>
                    <TableCell>{key.teachers?.name || '-'}</TableCell>
                    <TableCell>{getExamTypeBadge(key.exam_type)}</TableCell>
                    <TableCell>{key.total_score}점</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetail(key.id)}
                          title="상세 보기"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(key.id)}
                          title="수정"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewStatus(key.id)}
                          title="학생 응시 현황"
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(key.id, key.exam_title)}
                          className="text-red-500 hover:text-red-700"
                          title="삭제"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnswerKeysList;
