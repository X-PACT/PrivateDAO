import { LegacyRouteRedirect } from "@/components/legacy-route-redirect";

export default function CommandCenterBridgePage() {
  return (
    <LegacyRouteRedirect
      title="Command center moved to the judge hub"
      description="Operational command surfaces are preserved, but final review should start from the judge hub and proof path."
      target="/judge"
      label="Open judge hub"
    />
  );
}
