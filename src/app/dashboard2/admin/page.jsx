"use client"

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ROLES } from '@/lib/auth/constants';

import { AppSidebar } from "@/components/admin/shadcn-dashborard/app-sidebar"

// 서브 페이지 컴포넌트 임포트
import HerosectionPage from './main-designedit/herosection/page';
import AdmissionStatusPage from './main-designedit/admission-status/page';
import MainAboutPage from './main-designedit/main-about/page';
import AcademyPreviewPage from './main-designedit/academy-preview/page';
import LevelTestPage from './main-designedit/level-test/page';
import ReviewsPage from './main-designedit/reviews/page';
import FacilitiesPage from './main-designedit/facilities/page';
import TeamDescriptionPage from './main-designedit/team-description/page';
import ClassDescriptionPage from './class-description/page';
import BlogEditorPage from './blog-editor/page';
import ScheduleManagementContent from '@/components/admin/dashboard/schedule-management/ScheduleManagementContent';
import InquiryManagementContent from '@/components/admin/dashboard/inquiry-management/InquiryManagementContent';
import SalesManagementContent from '@/components/admin/dashboard/sales-management/SalesManagementContent';
import SalesByClassContent from '@/components/admin/dashboard/sales-management/SalesByClassContent';
import SalesByInstructorContent from '@/components/admin/dashboard/sales-management/SalesByInstructorContent';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import { Separator } from "@/components/ui/separator"

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, loading, hasRole, roleLoaded } = useAuth();

  const [currentPage, setCurrentPage] = useState('');

  useEffect(() => {
    if (!loading && roleLoaded) {
      if (!isAuthenticated) {
        router.push('/signin');
      } else if (!hasRole(ROLES.ADMIN)) {
        router.push('/dashboard2/student');
      }
    }
  }, [isAuthenticated, loading, hasRole, roleLoaded, router]);

  useEffect(() => {
    const path = searchParams.get('path');
    if (path) {
      setCurrentPage(path);
    } else {
      setCurrentPage('/dashboard2/admin'); // 기본 페이지를 대시보드로 변경
    }
  }, [searchParams]);

  if (loading || !roleLoaded || !isAuthenticated) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div 
            className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" 
            role="status" 
            aria-busy="true"
          >
            <span className="sr-only">로딩 중...</span>
          </div>
          <p className="mt-4 text-muted-foreground">사용자 정보 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard2/admin">
                    관리자 대시보드
                  </BreadcrumbLink>
                </BreadcrumbItem>
                
                {(() => {
                  const tab = searchParams.get('tab');
                  
                  // 대시보드 메인 페이지
                  if (currentPage === '/dashboard2/admin' || !currentPage) {
                    return null;
                  }
                  
                  // 메인페이지 편집 섹션
                  if (currentPage.includes('/dashboard2/admin/herosection') || 
                      currentPage.includes('/dashboard2/admin/admission-status') ||
                      currentPage.includes('/dashboard2/admin/main-about') ||
                      currentPage.includes('/dashboard2/admin/academy-preview') ||
                      currentPage.includes('/dashboard2/admin/level-test') ||
                      currentPage.includes('/dashboard2/admin/reviews') ||
                      currentPage.includes('/dashboard2/admin/facilities') ||
                      currentPage.includes('/dashboard2/admin/team-description')) {
                    return (
                      <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbLink href="#" onClick={(e) => e.preventDefault()}>
                            메인페이지 편집
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbPage>
                            {currentPage.includes('herosection') ? '히어로섹션' :
                             currentPage.includes('admission-status') ? 'SKY입학현황' :
                             currentPage.includes('main-about') ? '학원소개' :
                             currentPage.includes('academy-preview') ? '수학의문 미리보기' :
                             currentPage.includes('level-test') ? '레벨진단' :
                             currentPage.includes('reviews') ? '생생후기' :
                             currentPage.includes('facilities') ? '학원학습환경' :
                             currentPage.includes('team-description') ? '강사진설명' : ''}
                          </BreadcrumbPage>
                        </BreadcrumbItem>
                      </>
                    );
                  }
                  
                  // 수업설명 관리 섹션
                  if (currentPage === '/dashboard2/admin/class-description') {
                    return (
                      <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbLink href="/dashboard2/admin?path=/dashboard2/admin/class-description">
                            수업설명 관리
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        {tab && (
                          <>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                              <BreadcrumbPage>
                                {tab === 'list' ? '수업 목록' :
                                 tab === 'create' ? '수업 에디터' :
                                 tab === 'menu' ? '메뉴 관리' :
                                 tab === 'settings' ? '섹션 표시 설정' : '수업 목록'}
                              </BreadcrumbPage>
                            </BreadcrumbItem>
                          </>
                        )}
                      </>
                    );
                  }
                  
                  // 블로그 관리 섹션
                  if (currentPage === '/dashboard2/admin/blog-editor') {
                    return (
                      <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbLink href="/dashboard2/admin?path=/dashboard2/admin/blog-editor">
                            블로그 관리
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        {tab && (
                          <>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                              <BreadcrumbPage>
                                {tab === 'list' ? '포스트 목록' :
                                 tab === 'create' ? '새 포스트 작성' :
                                 tab === 'categories' ? '카테고리 관리' :
                                 tab === 'featured' ? '메인페이지 설정' : '포스트 목록'}
                              </BreadcrumbPage>
                            </BreadcrumbItem>
                          </>
                        )}
                      </>
                    );
                  }
                  
                  // 수업시간표 관리
                  if (currentPage.includes('/dashboard2/admin/schedule-management')) {
                    const grade = searchParams.get('grade');
                    return (
                      <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbLink href="/dashboard2/admin?path=/dashboard2/admin/schedule-management">
                            수업시간표 관리
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbPage>
                            {grade || '전체 시간표'}
                          </BreadcrumbPage>
                        </BreadcrumbItem>
                      </>
                    );
                  }
                  
                  // 강사 관리
                  if (currentPage.includes('/dashboard2/admin/teacher')) {
                    return (
                      <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbLink href="#" onClick={(e) => e.preventDefault()}>
                            강사 관리
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbPage>
                            {currentPage.includes('register') ? '강사 등록' :
                             currentPage.includes('list') ? '강사 리스트' :
                             currentPage.includes('class-management') ? '강사 수업관리' : '강사 관리'}
                          </BreadcrumbPage>
                        </BreadcrumbItem>
                      </>
                    );
                  }
                  
                  // 학원생 관리
                  if (currentPage.includes('/dashboard2/admin/student')) {
                    return (
                      <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbLink href="#" onClick={(e) => e.preventDefault()}>
                            학원생 관리
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbPage>
                            {currentPage.includes('all') ? '전체학원생 리스트' :
                             currentPage.includes('by-teacher') ? '강사별 학원생 리스트' :
                             currentPage.includes('by-grade') ? '학년별 학원생 리스트' :
                             currentPage.includes('by-score') ? '성적별 학원생 리스트' :
                             currentPage.includes('attention') ? '관심관리 학원생 리스트' : '학원생 관리'}
                          </BreadcrumbPage>
                        </BreadcrumbItem>
                      </>
                    );
                  }
                  
                  // 프로젝트 섹션 (시험문제, 채점, 매출, 문의 관리)
                  if (currentPage.includes('/dashboard2/admin/exam-management')) {
                    return (
                      <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbPage>시험문제 관리</BreadcrumbPage>
                        </BreadcrumbItem>
                      </>
                    );
                  }
                  
                  if (currentPage.includes('/dashboard2/admin/grading-management')) {
                    return (
                      <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbPage>채점 관리</BreadcrumbPage>
                        </BreadcrumbItem>
                      </>
                    );
                  }
                  
                  if (currentPage.includes('/dashboard2/admin/sales-management')) {
                    return (
                      <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbPage>매출 관리</BreadcrumbPage>
                        </BreadcrumbItem>
                      </>
                    );
                  }
                  
                  if (currentPage.includes('/dashboard2/admin/inquiry-management')) {
                    return (
                      <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbPage>문의 관리</BreadcrumbPage>
                        </BreadcrumbItem>
                      </>
                    );
                  }
                  
                  if (currentPage.includes('/dashboard2/admin/sales-management')) {
                    return (
                      <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbPage>매출 관리</BreadcrumbPage>
                        </BreadcrumbItem>
                      </>
                    );
                  }
                  
                  if (currentPage.includes('/dashboard2/admin/sales-by-class')) {
                    return (
                      <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbLink href="/dashboard2/admin?path=/dashboard2/admin/sales-management">
                            매출 관리
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbPage>수업별 매출</BreadcrumbPage>
                        </BreadcrumbItem>
                      </>
                    );
                  }
                  
                  if (currentPage.includes('/dashboard2/admin/sales-by-instructor')) {
                    return (
                      <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbLink href="/dashboard2/admin?path=/dashboard2/admin/sales-management">
                            매출 관리
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbPage>강사별 매출</BreadcrumbPage>
                        </BreadcrumbItem>
                      </>
                    );
                  }
                  
                  return null;
                })()}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* 여기에 동적으로 로드될 페이지 컨텐츠가 들어갑니다 */}
          
          {/* 대시보드 메인 페이지 */}
          {(currentPage === '/dashboard2/admin' || !currentPage) && (
            <div className="flex flex-1 flex-col gap-6">
              <div className="border-b pb-4">
                <h1 className="text-3xl font-bold">관리자 대시보드</h1>
                <p className="text-muted-foreground">수학의문 학원 관리 시스템에 오신 것을 환영합니다.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">메인페이지 관리</h2>
                  <div className="space-y-2">
                    <a href="/dashboard2/admin?path=/dashboard2/admin/herosection" 
                       className="block p-3 border rounded hover:bg-gray-50 transition-colors">
                      히어로섹션
                    </a>
                    <a href="/dashboard2/admin?path=/dashboard2/admin/admission-status" 
                       className="block p-3 border rounded hover:bg-gray-50 transition-colors">
                      SKY입학현황
                    </a>
                    <a href="/dashboard2/admin?path=/dashboard2/admin/main-about" 
                       className="block p-3 border rounded hover:bg-gray-50 transition-colors">
                      학원소개
                    </a>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">콘텐츠 관리</h2>
                  <div className="space-y-2">
                    <a href="/dashboard2/admin?path=/dashboard2/admin/blog-editor&tab=list" 
                       className="block p-3 border rounded hover:bg-gray-50 transition-colors">
                      블로그 포스트 목록
                    </a>
                    <a href="/dashboard2/admin?path=/dashboard2/admin/blog-editor&tab=featured" 
                       className="block p-3 border rounded hover:bg-gray-50 transition-colors">
                      메인페이지 설정
                    </a>
                    <a href="/dashboard2/admin?path=/dashboard2/admin/class-description&tab=list" 
                       className="block p-3 border rounded hover:bg-gray-50 transition-colors">
                      수업설명 관리
                    </a>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">시스템 관리</h2>
                  <div className="space-y-2">
                    <a href="/dashboard2/admin?path=/dashboard2/admin/schedule-management" 
                       className="block p-3 border rounded hover:bg-gray-50 transition-colors">
                      수업시간표 관리
                    </a>
                    <a href="#" 
                       className="block p-3 border rounded hover:bg-gray-50 transition-colors opacity-50 cursor-not-allowed">
                      강사 관리 (준비중)
                    </a>
                    <a href="#" 
                       className="block p-3 border rounded hover:bg-gray-50 transition-colors opacity-50 cursor-not-allowed">
                      학원생 관리 (준비중)
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {currentPage === '/dashboard2/admin/herosection' && <HerosectionPage />}
          {currentPage === '/dashboard2/admin/admission-status' && <AdmissionStatusPage />}
          {currentPage === '/dashboard2/admin/main-about' && <MainAboutPage />}
          {currentPage === '/dashboard2/admin/academy-preview' && <AcademyPreviewPage />}
          {currentPage === '/dashboard2/admin/level-test' && <LevelTestPage />}
          {currentPage === '/dashboard2/admin/reviews' && <ReviewsPage />}
          {currentPage === '/dashboard2/admin/facilities' && <FacilitiesPage />}
          {currentPage === '/dashboard2/admin/team-description' && <TeamDescriptionPage />}
          {currentPage === '/dashboard2/admin/class-description' && (
            <ClassDescriptionPage initialTab={searchParams.get('tab')} />
          )}
          {currentPage === '/dashboard2/admin/blog-editor' && (
            <BlogEditorPage initialTab={searchParams.get('tab')} />
          )}
          {currentPage === '/dashboard2/admin/schedule-management' && (
            <ScheduleManagementContent />
          )}
          {currentPage === '/dashboard2/admin/inquiry-management' && (
            <InquiryManagementContent />
          )}
          {currentPage === '/dashboard2/admin/sales-management' && (
            <SalesManagementContent />
          )}
          {currentPage === '/dashboard2/admin/sales-by-class' && (
            <SalesByClassContent />
          )}
          {currentPage === '/dashboard2/admin/sales-by-instructor' && (
            <SalesByInstructorContent />
          )}

          {/* 다른 페이지들도 여기에 추가 */}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
