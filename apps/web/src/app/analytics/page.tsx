import { LegacyRouteRedirect } from "@/components/legacy-route-redirect";

export default function AnalyticsBridgePage() {
  return (
    <LegacyRouteRedirect
      title="Analytics moved to API status"
      description="Analytics is preserved through live API status and proof-backed telemetry instead of a separate judging lane."
      target="/api-status"
      label="Open API status"
    />
  );
}
