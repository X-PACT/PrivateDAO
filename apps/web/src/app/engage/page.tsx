import { LegacyRouteRedirect } from "@/components/legacy-route-redirect";

export default function EngageBridgePage() {
  return (
    <LegacyRouteRedirect
      title="Engage moved to Services"
      description="Pilot, buyer, and contact motion now starts from the services route so visitors first see the live product rails and proof boundaries."
      target="/services"
      label="Open services"
    />
  );
}
