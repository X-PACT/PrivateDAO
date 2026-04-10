import type { Metadata } from "next";

import { CustomerConversionSurface } from "@/components/customer-conversion-surface";
import { LeadSupportIntake } from "@/components/lead-support-intake";
import { OperationsShell } from "@/components/operations-shell";
import { PlatformServiceArchitecture } from "@/components/platform-service-architecture";
import { ProductIntakeForms } from "@/components/product-intake-forms";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Engage",
  description:
    "Customer conversion route for pilots, hosted reads, confidential operations, enterprise governance, and explicit mainnet trajectory.",
  path: "/engage",
  keywords: ["engage", "pilot request", "hosted read api", "enterprise governance", "mainnet trajectory"],
});

type EngagePageProps = {
  searchParams?: { intake?: string };
};

function normalizeIntake(value?: string) {
  return value === "pilot" || value === "rpc" || value === "gaming" || value === "payments" || value === "support" ? value : undefined;
}

export default function EngagePage({ searchParams }: EngagePageProps) {
  const initialKind = normalizeIntake(searchParams?.intake);

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
      <ProductIntakeForms mode="engage" initialKind={initialKind} />
      <CustomerConversionSurface />
      <PlatformServiceArchitecture />
    </OperationsShell>
  );
}
