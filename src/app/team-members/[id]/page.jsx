import { TeamDetails } from "@/components/teams/TeamDetails";
import { Layout } from "@/layouts/Layout";

export default function TeamMemberDetails() {
  return (
    <Layout
      breadcrumbTitle={"Team Member Details"}
      breadcrumbSubtitle={"Team Member Details"}
    >
      <TeamDetails />
    </Layout>
  );
}
