import { LegacyRouteRedirect } from "@/components/legacy-route-redirect";

export default function WalletTemplateBridgePage() {
  return (
    <LegacyRouteRedirect
      title="Wallet template moved to Govern"
      description="Wallet connection is now part of the live Review, Sign, Verify governance flow rather than a separate template page."
      target="/govern"
      label="Open govern"
    />
  );
}
