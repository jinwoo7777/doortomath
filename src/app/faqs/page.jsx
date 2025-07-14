import { BlogNine } from "@/components/blogs/BlogNine";
import { FaqAll } from "@/components/faqs/FaqAll";
import { Layout } from "@/layouts/Layout";

export default function Faq() {
  return (
    <Layout breadcrumbTitle={"Faqs"} breadcrumbSubtitle={"Faqs"}>
      {/* faqs */}
      <FaqAll />

      {/* blogs */}
      <BlogNine />
    </Layout>
  );
}
