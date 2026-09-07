import { LegacyRouteRedirect } from "@/components/legacy-route-redirect";

export default function VersusBridgePage() {
  return (
    <LegacyRouteRedirect
      title="Comparison moved to the whiteprint"
      description="Comparison framing now belongs inside the edited project thesis instead of a separate route."
      target="/whiteprint"
      label="Open whiteprint"
    />
  );
}
