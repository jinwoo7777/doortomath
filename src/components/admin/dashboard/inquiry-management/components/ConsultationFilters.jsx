import React from 'react';
import { SearchInput } from "@/components/ui/search-input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ConsultationFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter,
  totalCount 
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
      <div className="flex items-center gap-2">
        문의 목록 ({totalCount}건)
      </div>
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <div className="w-full sm:w-64">
          <SearchInput
            placeholder="이름, 전화번호, 이메일 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="상태 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="pending">대기중</SelectItem>
            <SelectItem value="contacted">연락완료</SelectItem>
            <SelectItem value="completed">완료</SelectItem>
            <SelectItem value="cancelled">취소</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ConsultationFilters;