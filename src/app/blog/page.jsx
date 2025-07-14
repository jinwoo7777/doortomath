import { BlogAll } from "@/components/blogs/BlogAll";
import { Layout } from "@/layouts/Layout";

export default function Blog() {
  return (
    <Layout breadcrumbTitle={"Blog"} breadcrumbSubtitle={"Blog"}>
      <BlogAll />
    </Layout>
  );
}
