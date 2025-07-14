import { CoursesAllContainer } from "@/components/courses/CoursesAllContainer";
import { CoursesAllList } from "@/components/courses/CoursesAllList";
import { Layout } from "@/layouts/Layout";

export default function CoursesListView() {
  return (
    <Layout
      breadcrumbTitle={"Courses List View"}
      breadcrumbSubtitle={"Courses List View"}
    >
      <CoursesAllContainer>
        <CoursesAllList />
      </CoursesAllContainer>
    </Layout>
  );
}
