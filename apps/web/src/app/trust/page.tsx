import { LegacyRouteRedirect } from "@/components/legacy-route-redirect";

export default function TrustBridgePage() {
  return (
    <LegacyRouteRedirect
      title="Trust and Security moved to Proof"
      description="Trust and Security claims now route through proof packets, runtime evidence, and API-backed verification."
      target="/proof"
      label="Open proof"
    />
  );
}
