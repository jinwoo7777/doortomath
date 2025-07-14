'use client';

import { Suspense } from 'react';

import { BlogAllSidebar } from "@/components/blogs/BlogAllSidebar";
import { BlogContainer } from "@/components/blogs/BlogContainer";
import { Layout } from "@/layouts/Layout";

export default function BlogWithSidebar() {
  return (
    <Suspense fallback={<div className="py-20 text-center">로딩 중...</div>}>
    <Layout
      breadcrumbTitle={"Blog With Sidebar"}
      breadcrumbSubtitle={"Blog With Sidebar"}
    >
      <BlogContainer>
        <BlogAllSidebar />
      </BlogContainer>
    </Layout>
    </Suspense>
  );
}
