// src/components/admin/dashboard/instructor-management/components/TeachersList.jsx
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit2, 
  X, 
  Eye, 
  EyeOff, 
  GraduationCap,
  Phone,
  Calendar,
  BookOpen
} from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getBranchName } from '../utils/formatUtils';

const TeachersList = ({ 
  teachers, 
  loading, 
  filteredTeachers,
  getTeacherSchedules,
  onAddClick, 
  onEditClick, 
  onToggleActive, 
  onDeleteClick,
  onViewSchedules
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>강사 목록</CardTitle>
            <p className="text-sm text-muted-foreground">등록된 강사들을 관리하고 수업을 배정할 수 있습니다.</p>
          </div>
          <Button onClick={onAddClick} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            새 강사 추가
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingSpinner text="강사 목록을 불러오는 중..." />
        ) : teachers.length === 0 ? (
          <div className="text-center py-8">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">등록된 강사가 없습니다</p>
            <p className="text-muted-foreground mb-4">첫 번째 강사를 추가해보세요.</p>
            <Button onClick={onAddClick}>
              <Plus className="h-4 w-4 mr-2" />
              강사 추가
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>강사명</TableHead>
                  <TableHead>지점</TableHead>
                  <TableHead>전문분야</TableHead>
                  <TableHead>연락처</TableHead>
                  <TableHead>경력</TableHead>
                  <TableHead>담당수업</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.map((teacher) => {
                  const teacherSchedules = getTeacherSchedules(teacher.name, teacher.branch);
                  return (
                    <TableRow 
                      key={teacher.id}
                      className={!teacher.is_active ? 'opacity-60' : ''}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {teacher.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{teacher.name}</p>
                            {teacher.email && (
                              <p className="text-xs text-muted-foreground">{teacher.email}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getBranchName(teacher.branch)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {teacher.specialization?.slice(0, 2).map((spec, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                          {teacher.specialization?.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{teacher.specialization.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {teacher.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{teacher.phone}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{teacher.experience_years}년</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{teacherSchedules.length}개</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={teacher.is_active ? "default" : "secondary"}>
                          {teacher.is_active ? "활성" : "비활성"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewSchedules(teacher)}
                            title="담당 수업 보기"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditClick(teacher)}
                            title="편집"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onToggleActive(teacher)}
                            title={teacher.is_active ? "비활성화" : "활성화"}
                          >
                            {teacher.is_active ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <button
                            type="button"
                            className="ml-1 p-0 bg-transparent border-none cursor-pointer hover:text-red-500 transition-colors"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onDeleteClick(teacher);
                            }}
                            aria-label="강사 삭제"
                            title="삭제"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
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

export default TeachersList;
