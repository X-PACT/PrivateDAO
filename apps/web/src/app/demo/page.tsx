import { LegacyRouteRedirect } from "@/components/legacy-route-redirect";

export default function DemoBridgePage() {
  return (
    <LegacyRouteRedirect
      title="Demo moved to the live governance workbench"
      description="The strongest demo is now the wallet-first governance path: create, vote, finalize, execute, and verify from the current Testnet surface."
      target="/govern"
      label="Open govern"
    />
  );
}
