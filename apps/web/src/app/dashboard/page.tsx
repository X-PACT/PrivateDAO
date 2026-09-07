import { LegacyRouteRedirect } from "@/components/legacy-route-redirect";

export default function DashboardBridgePage() {
  return (
    <LegacyRouteRedirect
      title="Dashboard moved to the judge hub"
      description="The judge hub is now the clearest dashboard for live proof, integrations, and Testnet evidence."
      target="/judge"
      label="Open judge hub"
    />
  );
}
