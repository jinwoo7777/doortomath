import { TeamAll } from "@/components/teams/TeamAll";
import { Layout } from "@/layouts/Layout";

export default function TeamMembers() {
  return (
    <Layout
      breadcrumbTitle={"Team Members"}
      breadcrumbSubtitle={"Team Members"}
    >
      <TeamAll />
    </Layout>
  );
}
