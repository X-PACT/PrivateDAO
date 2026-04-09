import type { Metadata } from "next";

import { CommercialCompareSurface } from "@/components/commercial-compare-surface";
import { MetricsStrip } from "@/components/metrics-strip";
import { SectionHeader } from "@/components/section-header";
import { ServicesSurface } from "@/components/services-surface";
import { Badge } from "@/components/ui/badge";
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
    <main className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex flex-wrap gap-3">
        <Badge variant="warning">Services</Badge>
        <Badge variant="cyan">Hosted Read API + Ops</Badge>
        <Badge variant="success">Pilot-ready</Badge>
      </div>
      <div className="mt-6">
        <SectionHeader
          eyebrow="Commercial"
          title="Service and pilot surfaces presented like a product, not buried in docs"
          description="PrivateDAO also needs to sell what it can do: API rails, operator support, pilot onboarding, trust packaging, and pricing language that is still technically honest."
        />
      </div>
      <div className="mt-10">
        <MetricsStrip />
      </div>
      <div className="mt-10">
        <CommercialCompareSurface />
      </div>
      <div className="mt-10">
        <ServicesSurface />
      </div>
    </main>
  );
}
