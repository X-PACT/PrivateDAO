import { LegacyRouteRedirect } from "@/components/legacy-route-redirect";

export default function ComplianceBridgePage() {
  return (
    <LegacyRouteRedirect
      title="Compliance moved to Security"
      description="Compliance belongs with security, custody boundaries, and proof-backed release gates."
      target="/security"
      label="Open security"
    />
  );
}
