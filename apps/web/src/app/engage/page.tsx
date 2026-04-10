import type { Metadata } from "next";

import { CustomerConversionSurface } from "@/components/customer-conversion-surface";
import { LeadSupportIntake } from "@/components/lead-support-intake";
import { OperationsShell } from "@/components/operations-shell";
import { PlatformServiceArchitecture } from "@/components/platform-service-architecture";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Engage",
  description:
    "Customer conversion route for pilots, hosted reads, confidential operations, enterprise governance, and explicit mainnet trajectory.",
  path: "/engage",
  keywords: ["engage", "pilot request", "hosted read api", "enterprise governance", "mainnet trajectory"],
});

export default function EngagePage() {
  return (
    <OperationsShell
      eyebrow="Engage"
      title="Turn competition-grade demos into real customer and mainnet motion"
      description="This route connects every strong track corridor to an actual buyer story: what is sellable now on Devnet, what the first paid motion looks like, and how the rollout graduates toward mainnet without overstating readiness."
      badges={[
        { label: "Customer-ready", variant: "success" },
        { label: "Mainnet-aware", variant: "warning" },
        { label: "Track-linked", variant: "cyan" },
      ]}
    >
      <LeadSupportIntake mode="engage" />
      <CustomerConversionSurface />
      <PlatformServiceArchitecture />
    </OperationsShell>
  );
}
