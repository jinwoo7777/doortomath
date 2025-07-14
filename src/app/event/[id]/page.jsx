import { EventDetailsContent } from "@/components/events/EventDetailsContent";
import { Layout } from "@/layouts/Layout";

export default function EventDetails() {
  return (
    <Layout
      breadcrumbTitle={"Event Details"}
      breadcrumbSubtitle={"Event Details"}
    >
      <EventDetailsContent />
    </Layout>
  );
}
