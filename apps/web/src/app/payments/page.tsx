import { LegacyRouteRedirect } from "@/components/legacy-route-redirect";

export default function PaymentsLegacyPage() {
  return <LegacyRouteRedirect title="Payments route consolidated" description="Private payments now route through MagicBlock, Umbra, Cloak, and confidential payment service lanes." target="/services/confidential-payments" />;
}
