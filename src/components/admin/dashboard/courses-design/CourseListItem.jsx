'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { FaEdit, FaTrash } from 'react-icons/fa';

// 기본 이미지 URL - public 폴더 기준 경로
const defaultThumbnail = '/home_3/post_1.jpg';

export default function CourseListItem({ course, handleDelete, deletingId }) {
  return (
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
      <TableCell>{course.price}</TableCell>
      <TableCell>
        <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
          {course.status === 'published' ? '게시됨' : '초안'}
        </Badge>
      </TableCell>
      <TableCell>{course.created_at}</TableCell>
      <TableCell className="text-right">
        <Link href={`/dashboard/admin/courses/edit/${course.id}`} passHref>
          <Button variant="outline" size="sm" className="mr-2">
            <FaEdit />
          </Button>
        </Link>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              size="sm" 
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
  );
}
