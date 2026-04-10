import type { Metadata } from "next";

import { CommercialCompareSurface } from "@/components/commercial-compare-surface";
import { MetricsStrip } from "@/components/metrics-strip";
import { OperationsShell } from "@/components/operations-shell";
import { ServicesSurface } from "@/components/services-surface";
import { SolutionCorridors } from "@/components/solution-corridors";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Services",
  description:
    "Commercial comparison, hosted read API, pilot journey, pricing, SLA framing, and trust surfaces for PrivateDAO as a real product.",
  path: "/services",
  keywords: ["services", "pilot package", "pricing model", "hosted read api"],
});

export default function ServicesPage() {
  return (
    <OperationsShell
      eyebrow="Commercial"
      title="Service and pilot surfaces presented like a product, not buried in docs"
      description="PrivateDAO also needs to sell what it can do: API rails, operator support, pilot onboarding, trust packaging, and pricing language that stays technically honest."
      badges={[
        { label: "Services", variant: "warning" },
        { label: "Hosted Read API + Ops", variant: "cyan" },
        { label: "Pilot-ready", variant: "success" },
      ]}
    >
      <div>
        <MetricsStrip />
      </div>
      <div>
        <SolutionCorridors />
      </div>
      <div>
        <CommercialCompareSurface />
      </div>
      <div>
        <ServicesSurface />
      </div>
    </OperationsShell>
  );
}
