import { LegacyRouteRedirect } from "@/components/legacy-route-redirect";

export default function DaoUiTemplateBridgePage() {
  return (
    <LegacyRouteRedirect
      title="DAO template moved to Govern"
      description="The old DAO template route now forwards to the current wallet-first governance surface and proof-backed lifecycle."
      target="/govern"
      label="Open govern"
    />
  );
}
