// src/components/admin/dashboard/instructor-management/components/BranchFilter.jsx
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BranchFilter = ({ selectedBranch, setSelectedBranch }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">지점별 필터</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="branch-filter">지점 선택</Label>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger>
                <SelectValue placeholder="지점을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="daechi">대치</SelectItem>
                <SelectItem value="bukwirye">북위례</SelectItem>
                <SelectItem value="namwirye">남위례</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BranchFilter;
