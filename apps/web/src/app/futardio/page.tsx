import { LegacyRouteRedirect } from "@/components/legacy-route-redirect";

export default function FutardioBridgePage() {
  return (
    <LegacyRouteRedirect
      title="Futardio moved to the judge hub"
      description="Futardio launch context is preserved as supporting evidence, while reviewers should enter through the judge hub."
      target="/judge"
      label="Open judge hub"
    />
  );
}
