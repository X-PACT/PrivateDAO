import { LegacyRouteRedirect } from "@/components/legacy-route-redirect";

export default function GovernanceTemplateBridgePage() {
  return (
    <LegacyRouteRedirect
      title="Governance template moved to Govern"
      description="The template page is preserved as a bridge, while the active reviewer path is the live governance workbench."
      target="/govern"
      label="Open govern"
    />
  );
}
