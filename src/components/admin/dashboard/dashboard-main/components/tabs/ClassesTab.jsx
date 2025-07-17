"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ClassesTab = ({ topClasses, navigateToPage }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">인기 수업 TOP 5</h3>
        <Button variant="outline" size="sm" onClick={() => navigateToPage('/dashboard2/admin?path=/dashboard2/admin/schedule-management')}>
          전체 보기 <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>순위</TableHead>
            <TableHead>수업명</TableHead>
            <TableHead>담당 강사</TableHead>
            <TableHead>수강생 수</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topClasses.map((classItem, index) => (
            <TableRow key={index}>
              <TableCell>
                <Badge variant={index < 3 ? "default" : "outline"}>
                  #{index + 1}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">
                {classItem.grade} {classItem.subject}
              </TableCell>
              <TableCell>{classItem.teacher}</TableCell>
              <TableCell>{classItem.enrollmentCount}명</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClassesTab;