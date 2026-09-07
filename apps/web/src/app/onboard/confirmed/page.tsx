import { LegacyRouteRedirect } from "@/components/legacy-route-redirect";

export default function OnboardConfirmedBridgePage() {
  return (
    <LegacyRouteRedirect
      title="Onboarding confirmation moved to Start"
      description="This preserved confirmation link now returns visitors to the current Testnet start path."
      target="/start"
      label="Open start"
    />
  );
}
