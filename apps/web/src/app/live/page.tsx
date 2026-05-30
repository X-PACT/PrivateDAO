import { LegacyRouteRedirect } from "@/components/legacy-route-redirect";

export default function LiveBridgePage() {
  return (
    <LegacyRouteRedirect
      title="Live state moved to API status"
      description="Live state is now clearer through API status, readiness, QuickNode stream health, and proof freshness."
      target="/api-status"
      label="Open API status"
    />
  );
}
