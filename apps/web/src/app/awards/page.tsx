import { LegacyRouteRedirect } from "@/components/legacy-route-redirect";

export default function AwardsBridgePage() {
  return (
    <LegacyRouteRedirect
      title="Recognition moved to the judge hub"
      description="Awards and ecosystem signals now support the final Colosseum judge route instead of competing with the live product flow."
      target="/judge"
      label="Open judge hub"
    />
  );
}
