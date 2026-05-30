import { LegacyRouteRedirect } from "@/components/legacy-route-redirect";

export default function ProductsBridgePage() {
  return (
    <LegacyRouteRedirect
      title="Products moved to the service map"
      description="Product packaging now lives under Services, where each lane is tied to proof, APIs, and wallet-first action."
      target="/services"
      label="Open services"
    />
  );
}
