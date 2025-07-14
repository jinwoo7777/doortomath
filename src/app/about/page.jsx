import { AboutOne } from "@/components/about/AboutOne";
import { BlogThree } from "@/components/blogs/BlogThree";
import { CampusOne } from "@/components/campus/CampusOne";
import { DepartmentOne } from "@/components/departments/DepartmentOne";
import { VideoOne } from "@/components/videos/VideoOne";
import { Layout } from "@/layouts/Layout";
import { AboutThree } from "@/components/about/AboutThree";

export default function About() {
  return (
    <Layout breadcrumbTitle={"대치 수학의 문"} breadcrumbSubtitle={"학원소개"}>
      {/* about */}
      <AboutOne />

      {/* campus */}
      <CampusOne />

      {/* departments */}
      <DepartmentOne />

      {/* video */}
      <VideoOne />

      {/* blog */}
      <BlogThree />
    </Layout>
  );
}
