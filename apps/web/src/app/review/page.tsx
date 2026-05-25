import { LegacyRouteRedirect } from "@/components/legacy-route-redirect";

export default function ReviewLegacyPage() {
  return <LegacyRouteRedirect title="Review moved to the judge hub" description="The current reviewer path is consolidated into the judge route with demo, tracks, proof, and live API status." target="/judge" />;
}
