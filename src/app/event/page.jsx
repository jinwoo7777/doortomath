import { EventAll } from "@/components/events/EventAll";
import { Layout } from "@/layouts/Layout";

export default function Event() {
  return (
    <Layout breadcrumbTitle={"Event"} breadcrumbSubtitle={"Event"}>
      <EventAll />
    </Layout>
  );
}
