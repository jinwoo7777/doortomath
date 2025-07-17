"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { ChevronRight } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({ items }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPath = searchParams.get('path');
  const currentTab = searchParams.get('tab');

  const shouldBeOpen = (item) => {
    // 하위 메뉴가 있는 경우, 하위 메뉴 중 하나라도 활성화되어 있으면 열림
    if (item.items && item.items.length > 0) {
      // 현재 URL의 기본 경로 (path 파라미터 제외)
      const currentBasePath = pathname;
      
      return item.items.some(subItem => {
        // 하위 메뉴 항목의 기본 경로 추출
        const subItemUrl = new URL(subItem.url, 'http://localhost');
        const subItemBasePath = subItemUrl.pathname;
        const subItemPath = subItemUrl.searchParams.get('path');
        const subItemTab = subItemUrl.searchParams.get('tab');
        
        // 기본 경로가 일치하는지 먼저 확인
        if (currentBasePath !== subItemBasePath) {
          return false;
        }
        
        // 정확한 경로와 탭 매칭
        if (subItemTab && currentTab) {
          return currentPath === subItemPath && currentTab === subItemTab;
        }
        return currentPath === subItemPath;
      });
    }
    
    return false;
  };

  return (
    <SidebarGroup>
      {/* <SidebarGroupLabel>Platform</SidebarGroupLabel> */}
      <SidebarMenu>
        {items.map((item) => {
          // 하위 메뉴가 있는 경우 - Collapsible 사용
          if (item.items && item.items.length > 0) {
            const shouldOpen = shouldBeOpen(item);
            
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={shouldOpen}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }
          
          // 하위 메뉴가 없는 경우 - 직접 링크
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
