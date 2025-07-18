"use client";

import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useBranch } from '../context/BranchContext';
import { Building2 } from 'lucide-react';

/**
 * 지점 선택 컴포넌트
 * 매출 관리 페이지에서 지점을 선택할 수 있는 드롭다운을 제공합니다.
 */
const BranchSelector = () => {
  const { selectedBranch, setSelectedBranch, branches } = useBranch();

  return (
    <div className="flex items-center gap-2 shrink-0">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <Select value={selectedBranch} onValueChange={setSelectedBranch}>
        <SelectTrigger className="w-[180px] shrink-0">
          <SelectValue placeholder="지점 선택" />
        </SelectTrigger>
        <SelectContent position="popper" sideOffset={4} className="z-[100]">
          {branches.map(branch => (
            <SelectItem key={branch.id} value={branch.id}>
              {branch.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default BranchSelector;