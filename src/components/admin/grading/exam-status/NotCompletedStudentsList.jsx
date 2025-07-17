'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

/**
 * 시험 미완료 학생 목록 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {Array} props.notCompletedStudents - 시험 미완료 학생 목록
 * @returns {JSX.Element} 시험 미완료 학생 목록 컴포넌트
 */
const NotCompletedStudentsList = ({ notCompletedStudents }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>미응시 학생 ({notCompletedStudents.length}명)</CardTitle>
      </CardHeader>
      <CardContent>
        {notCompletedStudents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>모든 학생이 시험을 완료했습니다.</p>
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
                  <TableHead>최근 로그인</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notCompletedStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.student_id}</TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.grade}</TableCell>
                    <TableCell>{student.class_name}</TableCell>
                    <TableCell>
                      {student.last_login 
                        ? new Date(student.last_login).toLocaleString('ko-KR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : '로그인 기록 없음'}
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

export default NotCompletedStudentsList;
