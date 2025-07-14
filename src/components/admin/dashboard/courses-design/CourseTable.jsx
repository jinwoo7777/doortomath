'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { toast } from 'sonner';

// 기본 이미지 URL - public 폴더 기준 경로
const defaultThumbnail = '/home_3/post_1.jpg';

export default function CourseTable({ courses, handleDelete, handleEdit, deletingId }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-20">썸네일</TableHead>
          <TableHead>강의명</TableHead>
          <TableHead>카테고리</TableHead>
          <TableHead>좌석</TableHead>
          <TableHead>기간(주)</TableHead>
          <TableHead>학기</TableHead>
          <TableHead>가격</TableHead>
          <TableHead>상태</TableHead>
          <TableHead>작성일</TableHead>
          <TableHead className="text-right">액션</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {courses.length === 0 ? (
          <TableRow>
            <TableCell colSpan={10} className="text-center py-10">
              <div className="flex flex-col items-center justify-center space-y-4">
                <p className="text-lg text-gray-500">아직 생성된 강의가 없습니다.</p>
                <p className="text-md text-gray-600">새로운 강의를 추가하여 관리해보세요!</p>
                <div className="flex gap-2">
                  <Button size="lg" className="mt-4" onClick={() => window.location.href = '/dashboard2/admin/class-description?tab=form'}>
                    <FaPlus className="mr-2" /> 새 강의 생성 (통합)
                  </Button>
                  <Button size="lg" variant="outline" className="mt-4" onClick={() => window.location.href = '/dashboard2/admin/class-description/create'}>
                    <FaPlus className="mr-2" /> 새 강의 생성 (개별)
                  </Button>
                </div>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          courses.map((course) => (
            <TableRow key={course.id} className="hover:bg-gray-50 cursor-pointer">
              <TableCell>
                <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                  {course.thumbnail_url ? (
                    <Image
                      src={course.thumbnail_url}
                      alt={course.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <Image
                        src={defaultThumbnail}
                        alt="기본 이미지"
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="font-medium">{course.title}</TableCell>
              <TableCell>{course.category}</TableCell>
              <TableCell>{course.seats}</TableCell>
              <TableCell>{course.weeks}</TableCell>
              <TableCell>{course.semesters}</TableCell>
              <TableCell>{course.price}</TableCell>
              <TableCell>
                <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                  {course.status === 'published' ? '게시됨' : '초안'}
                </Badge>
              </TableCell>
              <TableCell>{course.created_at}</TableCell>
              <TableCell className="text-right">
                <div className="flex gap-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit && handleEdit(course)}
                    title="통합 페이지에서 편집"
                  >
                    <FaEdit />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.location.href = `/dashboard2/admin/class-description/edit/${course.id}`}
                    title="개별 페이지에서 편집"
                  >
                    <FaEdit className="opacity-60" />
                  </Button>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="ml-2"
                      disabled={deletingId === course.id}
                      aria-label="강의 삭제"
                    >
                      {deletingId === course.id ? '삭제 중...' : <FaTrash />}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>강의 삭제 확인</AlertDialogTitle>
                      <AlertDialogDescription>
                        정말로 이 강의를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(course.id)}>
                        삭제
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
