import { LegacyRouteRedirect } from "@/components/legacy-route-redirect";

export default function OnboardBridgePage() {
  return (
    <LegacyRouteRedirect
      title="Onboarding moved to Start"
      description="The current onboarding path is the quick-start route: fund a Testnet wallet, open Govern, then verify proof."
      target="/start"
      label="Open start"
    />
  );
}
