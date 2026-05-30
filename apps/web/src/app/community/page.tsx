import { LegacyRouteRedirect } from "@/components/legacy-route-redirect";

export default function CommunityBridgePage() {
  return (
    <LegacyRouteRedirect
      title="Community moved to the judge hub"
      description="Community links now support the final verification path rather than standing as a separate product route."
      target="/judge"
      label="Open judge hub"
    />
  );
}
