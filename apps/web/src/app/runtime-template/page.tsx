import { LegacyRouteRedirect } from "@/components/legacy-route-redirect";

export default function RuntimeTemplateBridgePage() {
  return (
    <LegacyRouteRedirect
      title="Runtime template moved to Proof"
      description="Runtime evidence is now consolidated under proof and API status so judges see current verification instead of templates."
      target="/proof"
      label="Open proof"
    />
  );
}
