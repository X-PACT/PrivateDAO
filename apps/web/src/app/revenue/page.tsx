import { LegacyRouteRedirect } from "@/components/legacy-route-redirect";

export default function RevenueBridgePage() {
  return (
    <LegacyRouteRedirect
      title="Revenue moved to the business model"
      description="The revenue narrative is preserved through the business model and service catalog instead of a standalone judging route."
      target="/business-model"
      label="Open business model"
    />
  );
}
