'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDuration } from '../utils/formatters';
import { getScoreBadge } from '../utils/badges';

/**
 * 시험 완료 학생 목록 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {Array} props.completedStudents - 시험 완료 학생 목록
 * @param {number} props.totalScore - 시험 총점
 * @returns {JSX.Element} 시험 완료 학생 목록 컴포넌트
 */
const CompletedStudentsList = ({ completedStudents, totalScore }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>응시 완료 학생 ({completedStudents.length}명)</CardTitle>
      </CardHeader>
      <CardContent>
        {completedStudents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>응시 완료한 학생이 없습니다.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>학번</TableHead>
                  <TableHead>이름</TableHead>
                  <TableHead>학년</TableHead>
                  <TableHead>반</TableHead>
                  <TableHead>점수</TableHead>
                  <TableHead>비율</TableHead>
                  <TableHead>소요시간</TableHead>
                  <TableHead>제출일시</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedStudents.map((student) => {
                  const scorePercentage = totalScore > 0 
                    ? Math.round((student.score / totalScore) * 100) 
                    : 0;
                  
                  return (
                    <TableRow key={student.id}>
                      <TableCell>{student.student_id}</TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.grade}</TableCell>
                      <TableCell>{student.class_name}</TableCell>
                      <TableCell>
                        {student.score} / {totalScore}
                      </TableCell>
                      <TableCell>
                        {getScoreBadge(scorePercentage)}
                        <span className="ml-2">{scorePercentage}%</span>
                      </TableCell>
                      <TableCell>{formatDuration(student.duration_seconds)}</TableCell>
                      <TableCell>
                        {new Date(student.submitted_at).toLocaleString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompletedStudentsList;
