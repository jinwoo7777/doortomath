"use client"

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const BlogPagination = ({ 
  currentPage = 1, 
  totalPages = 1, 
  onPageChange = () => {} 
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;

    // 현재 URL 파라미터 유지하면서 페이지만 변경
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.push(newUrl);
    
    // 부모 컴포넌트에 페이지 변경 알림
    onPageChange(page);
  };

  // 페이지 버튼 생성
  const renderPageButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // 끝 페이지 기준으로 시작 페이지 조정
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // 첫 페이지 표시
    if (startPage > 1) {
      buttons.push(
        <li key="first">
          <button
            className="td_page_pagination_item td_center"
            type="button"
            onClick={() => handlePageChange(1)}
          >
            1
          </button>
        </li>
      );
      
      if (startPage > 2) {
        buttons.push(
          <li key="dots1">
            <span className="td_page_pagination_item td_center">...</span>
          </li>
        );
      }
    }

    // 중간 페이지들
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <li key={i}>
          <button
            className={`td_page_pagination_item td_center ${
              i === currentPage ? 'active' : ''
            }`}
            type="button"
            onClick={() => handlePageChange(i)}
          >
            {i}
          </button>
        </li>
      );
    }

    // 마지막 페이지 표시
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <li key="dots2">
            <span className="td_page_pagination_item td_center">...</span>
          </li>
        );
      }
      
      buttons.push(
        <li key="last">
          <button
            className="td_page_pagination_item td_center"
            type="button"
            onClick={() => handlePageChange(totalPages)}
          >
            {totalPages}
          </button>
        </li>
      );
    }

    return buttons;
  };

  // 페이지가 1개 이하면 페이지네이션 숨기기
  if (totalPages <= 1) {
    return null;
  }

  return (
    <ul className="td_page_pagination td_mp_0 td_fs_18 td_semibold">
      {/* 이전 페이지 버튼 */}
      <li>
        <button
          className="td_page_pagination_item td_center"
          type="button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
        >
          <i className="fa-solid fa-angles-left"></i>
        </button>
      </li>

      {/* 페이지 번호 버튼들 */}
      {renderPageButtons()}

      {/* 다음 페이지 버튼 */}
      <li>
        <button
          className="td_page_pagination_item td_center"
          type="button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
        >
          <i className="fa-solid fa-angles-right"></i>
        </button>
      </li>
    </ul>
  );
};
