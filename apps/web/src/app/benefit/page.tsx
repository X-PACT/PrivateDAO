import { LegacyRouteRedirect } from "@/components/legacy-route-redirect";

export default function BenefitBridgePage() {
  return (
    <LegacyRouteRedirect
      title="Benefit story moved to the product thesis"
      description="This preserved link now sends reviewers to the concise PrivateDAO story and whiteprint path instead of a separate benefit surface."
      target="/whiteprint"
      label="Open whiteprint"
    />
  );
}
