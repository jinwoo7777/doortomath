import { CoursesAllContainer } from "@/components/courses/CoursesAllContainer";
import { CoursesAllGrid } from "@/components/courses/CoursesAllGrid";
import { Layout } from "@/layouts/Layout";

export default function CoursesGridView() {
  return (
    <Layout
      breadcrumbTitle={"Courses Grid View"}
      breadcrumbSubtitle={"Courses Grid View"}
    >
      <CoursesAllContainer isGrid>
        <CoursesAllGrid />
      </CoursesAllContainer>
    </Layout>
  );
}
