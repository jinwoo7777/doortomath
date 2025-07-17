"use client"

import React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  Gauge,
  NotebookPen,
  CalendarClock,
  UsersRound,
  UserRoundPen,
  BookOpenCheck,
  SquareTerminal,
  ChartColumnBig,
  MailQuestionMark,
  Star,
  Users,
  DraftingCompass,
} from "lucide-react"

import { NavHome } from "@/components/admin/shadcn-dashborard/nav-home"
import { NavMain } from "@/components/admin/shadcn-dashborard/nav-main"
import { NavUser } from "@/components/admin/shadcn-dashborard/nav-user"
import { TeamSwitcher } from "@/components/admin/shadcn-dashborard/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// 샘플 데이터
const data = {
  user: {
    name: "관리자",
    email: "m@example.com",
    avatar: "/others/706813.png",
  },
  teams: [
    {
      name: "수학의 문",
      logo: DraftingCompass,
      plan: "관리시스템",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navHome: [
    {
      title: "대시보드",
      url: "/dashboard2/admin?path=/dashboard2/admin/dashboard-main",
      icon: Gauge,
    },
  ],
  navMain: [
    {
      title: "메인페이지 편집",
      url: "#",
      icon: SquareTerminal,
      items: [
        { title: "히어로섹션", url: "/dashboard2/admin?path=/dashboard2/admin/herosection" },
        { title: "SKY입학현황", url: "/dashboard2/admin?path=/dashboard2/admin/admission-status" },
        { title: "학원소개", url: "/dashboard2/admin?path=/dashboard2/admin/main-about" },
        { title: "수학의문 미리보기", url: "/dashboard2/admin?path=/dashboard2/admin/academy-preview" },
        { title: "레벨진단", url: "/dashboard2/admin?path=/dashboard2/admin/level-test" },
        { title: "생생후기", url: "/dashboard2/admin?path=/dashboard2/admin/reviews" },
        { title: "학원학습환경", url: "/dashboard2/admin?path=/dashboard2/admin/facilities" },
        { title: "강사진설명", url: "/dashboard2/admin?path=/dashboard2/admin/team-description" },
      ],
    },
    {
      title: "수업설명 관리",
      url: "/dashboard2/admin?path=/dashboard2/admin/class-description",
      icon: NotebookPen,
      items: [
        { title: "수업 목록", url: "/dashboard2/admin?path=/dashboard2/admin/class-description&tab=list" },
        { title: "수업 에디터", url: "/dashboard2/admin?path=/dashboard2/admin/class-description&tab=create" },
        { title: "메뉴 관리", url: "/dashboard2/admin?path=/dashboard2/admin/class-description&tab=menu" },
        { title: "섹션 표시 설정", url: "/dashboard2/admin?path=/dashboard2/admin/class-description&tab=settings" },
      ],
    },
    {
      title: "블로그 관리",
      url: "/dashboard2/admin?path=/dashboard2/admin/blog-editor",
      icon: NotebookPen,
      items: [
        { title: "포스트 목록", url: "/dashboard2/admin?path=/dashboard2/admin/blog-editor&tab=list" },
        { title: "새 포스트 작성", url: "/dashboard2/admin?path=/dashboard2/admin/blog-editor&tab=create" },
        { title: "카테고리 관리", url: "/dashboard2/admin?path=/dashboard2/admin/blog-editor&tab=categories" },
        { title: "메인페이지 설정", url: "/dashboard2/admin?path=/dashboard2/admin/blog-editor&tab=featured" },
      ],
    },
    {
      title: "대치 수업시간표 관리",
      url: "/dashboard2/admin/schedule-management",
      icon: CalendarClock,
      items: [
        { title: "전체 시간표", url: "/dashboard2/admin/schedule-management" },
        { title: "초등부", url: "/dashboard2/admin/schedule-management?grade=초등부" },
        { title: "중등부", url: "/dashboard2/admin/schedule-management?grade=중등부" },
        { title: "고등부", url: "/dashboard2/admin/schedule-management?grade=고등부" },
      ]
    },
    {
      title: "북위례 수업시간표 관리",
      url: "/dashboard2/admin/schedule-management-bukwirye",
      icon: CalendarClock,
      items: [
        { title: "전체 시간표", url: "/dashboard2/admin/schedule-management-bukwirye" },
        { title: "초등부", url: "/dashboard2/admin/schedule-management-bukwirye?grade=초등부" },
        { title: "중등부", url: "/dashboard2/admin/schedule-management-bukwirye?grade=중등부" },
        { title: "고등부", url: "/dashboard2/admin/schedule-management-bukwirye?grade=고등부" },
      ],
    },
    {
      title: "남위례 수업시간표 관리",
      url: "/dashboard2/admin/schedule-management-namwirye",
      icon: CalendarClock,
      items: [
        { title: "전체 시간표", url: "/dashboard2/admin/schedule-management-namwirye" },
        { title: "초등부", url: "/dashboard2/admin/schedule-management-namwirye?grade=초등부" },
        { title: "중등부", url: "/dashboard2/admin/schedule-management-namwirye?grade=중등부" },
        { title: "고등부", url: "/dashboard2/admin/schedule-management-namwirye?grade=고등부" },
      ],
    },
    {
      title: "강사 관리",
      url: "/dashboard2/admin/instructor-management",
      icon: Users,
      items: [
        { title: "강사 목록", url: "/dashboard2/admin/instructor-management?tab=list" },
        { title: "수업 배정", url: "/dashboard2/admin/instructor-management?tab=schedules" },
      ],
    },
    {
      title: "학원생 관리",
      url: "/dashboard2/admin/student-management",
      icon: UsersRound,
      items: [
        { title: "전체학원생 리스트", url: "/dashboard2/admin/student-management?tab=all" },
        { title: "강사별 학원생 리스트", url: "/dashboard2/admin/student-management?tab=by-teacher" },
        { title: "학년별 학원생 리스트", url: "/dashboard2/admin/student-management?tab=by-grade" },
        { title: "성적별 학원생 리스트", url: "/dashboard2/admin/student-management?tab=by-score" },
        { title: "관심관리 학원생 리스트", url: "/dashboard2/admin/student-management?tab=priority" },
      ],
    },
    {
      title: "자동 채점 관리",
      url: "/dashboard2/admin/grading-management",
      icon: BookOpenCheck,
      items: [
        { title: "답안 키 목록", url: "/dashboard2/admin/grading-management?tab=list" },
        { title: "답안 키 생성", url: "/dashboard2/admin/grading-management?tab=create" },
        { title: "엑셀 업로드", url: "/dashboard2/admin/grading-management?tab=excel" },
      ],
    },
    {
      title: "매출 관리",
      url: "/dashboard2/admin?path=/dashboard2/admin/sales-management",
      icon: ChartColumnBig,
      items: [
        { title: "매출 현황", url: "/dashboard2/admin?path=/dashboard2/admin/sales-management&tab=overview" },
        { title: "연체 관리", url: "/dashboard2/admin?path=/dashboard2/admin/sales-management&tab=overdue" },
        { title: "입금자 목록", url: "/dashboard2/admin?path=/dashboard2/admin/sales-management&tab=paid" },
        { title: "수업별 매출", url: "/dashboard2/admin?path=/dashboard2/admin/sales-management&tab=by-class" },
        { title: "강사별 매출", url: "/dashboard2/admin?path=/dashboard2/admin/sales-management&tab=by-instructor" },
      ],
    },
    {
      title: "문의 관리",
      url: "/dashboard2/admin?path=/dashboard2/admin/inquiry-management",
      icon: MailQuestionMark,
    },
  ],
}

export function AppSidebar(props) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavHome items={data.navHome} />
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
