import type { Metadata } from "next";
import { Trophy, Shield } from "lucide-react";

import { MetricsStrip } from "@/components/metrics-strip";
import { EcosystemFocusAlignmentStrip } from "@/components/ecosystem-focus-alignment-strip";
import { SectionHeader } from "@/components/section-header";
import { TrustSurface } from "@/components/trust-surface";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { awards } from "@/lib/site-data";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Recognition and Trust",
  description:
    "Recognition, trust links, launch trust packet, and credibility surfaces for PrivateDAO in a product-facing Next.js page.",
  path: "/awards",
  keywords: ["recognition", "trust package", "trust links", "product credibility"],
});

export default function AwardsPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex flex-wrap gap-3">
        <Badge variant="warning">Recognition</Badge>
        <Badge variant="success">Product + protocol execution</Badge>
      </div>
      <div className="mt-6">
        <SectionHeader
          eyebrow="Awards"
          title="Recognition and product credibility"
          description="This page carries the recognition story forward into the Next.js surface without losing the product or security context behind it."
        />
      </div>
      <div className="mt-10">
        <MetricsStrip />
      </div>
      <div className="mt-10">
        <EcosystemFocusAlignmentStrip
          title="How the current ecosystem focus areas map to the live product"
          description="Use this layer to show grant partners and ecosystem supporters that PrivateDAO already fits decentralisation, DAO tooling, developer tooling, payments, education, and strong infrastructure work without pretending every corridor is equally mature."
        />
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-4 text-amber-100">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-amber-200/80">Award banner</div>
                <CardTitle className="mt-2">1st Place · Superteam Poland</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-8 text-white/62">
            <p>
              PrivateDAO is being presented as a product that combines private governance, treasury operations, runtime evidence, and commercial packaging. This recognition supports that story, but it is not used to exaggerate live mainnet readiness.
            </p>
            <p>
              The Next.js migration keeps that same discipline: proof clarity, operator clarity, and buyer-facing product language all remain intact.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          {awards.map((item) => (
            <Card key={item.label}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/6 p-3 text-cyan-200">
                    <Shield className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-lg">{item.label}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-white/62">{item.value}</CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div className="mt-10">
        <TrustSurface />
      </div>
    </main>
  );
}
