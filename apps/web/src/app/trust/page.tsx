import { LegacyRouteRedirect } from "@/components/legacy-route-redirect";

export default function TrustBridgePage() {
  return (
    <LegacyRouteRedirect
      title="Trust moved to Proof"
      description="Trust claims now route through proof packets, runtime evidence, and API-backed verification."
      target="/proof"
      label="Open proof"
    />
  );
}
