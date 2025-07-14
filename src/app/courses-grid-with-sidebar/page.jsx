import { CoursesAllContainerSidebar } from "@/components/courses/CoursesAllContainerSidebar";
import { CoursesAllGridSidebar } from "@/components/courses/CoursesAllGridSidebar";
import { Layout } from "@/layouts/Layout";

export default function CoursesGridSidebar() {
  return (
    <Layout
      breadcrumbTitle={"Courses Grid With Sidebar"}
      breadcrumbSubtitle={"Courses Grid With Sidebar"}
    >
      <CoursesAllContainerSidebar isGrid>
        <CoursesAllGridSidebar />
      </CoursesAllContainerSidebar>
    </Layout>
  );
}
