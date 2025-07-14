'use client';

import { Suspense } from 'react';
import { BlogAll } from "@/components/blogs/BlogAll";
import { Layout } from "@/layouts/Layout";

export default function Blog() {
  return (
    <Suspense fallback={<div className="py-20 text-center">로딩 중...</div>}>
    <Layout breadcrumbTitle={"Blog"} breadcrumbSubtitle={"Blog"}>
      <BlogAll />
    </Layout>
    </Suspense>
  );
}
