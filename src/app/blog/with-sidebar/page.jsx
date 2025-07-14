import { BlogAllSidebar } from "@/components/blogs/BlogAllSidebar";
import { BlogContainer } from "@/components/blogs/BlogContainer";
import { Layout } from "@/layouts/Layout";

export default function BlogWithSidebar() {
  return (
    <Layout
      breadcrumbTitle={"Blog With Sidebar"}
      breadcrumbSubtitle={"Blog With Sidebar"}
    >
      <BlogContainer>
        <BlogAllSidebar />
      </BlogContainer>
    </Layout>
  );
}
