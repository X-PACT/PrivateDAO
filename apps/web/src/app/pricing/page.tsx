import { LegacyRouteRedirect } from "@/components/legacy-route-redirect";

export default function PricingBridgePage() {
  return (
    <LegacyRouteRedirect
      title="Pricing moved to services"
      description="Commercial and API packaging now lives under the service catalog so pricing does not distract from the execution path."
      target="/services"
      label="Open services"
    />
  );
}
