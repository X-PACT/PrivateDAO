import type { Metadata } from "next";
import { Trophy, Shield } from "lucide-react";

import { GuidedOperationRail } from "@/components/guided-operation-rail";
import { MetricsStrip } from "@/components/metrics-strip";
import { EcosystemFocusAlignmentStrip } from "@/components/ecosystem-focus-alignment-strip";
import { OperatingJourneyStrip } from "@/components/operating-journey-strip";
import { OperationsShell } from "@/components/operations-shell";
import { SectionHeader } from "@/components/section-header";
import { TrustSurface } from "@/components/trust-surface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { awards } from "@/lib/site-data";
import { getJudgeRuntimeLogsSnapshot } from "@/lib/judge-runtime-logs";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Recognition and Operating Trust",
  description:
    "Recognition, trust links, launch trust packet, and operating credibility surfaces for PrivateDAO in a product-facing Next.js page.",
  path: "/awards",
  keywords: ["recognition", "trust package", "trust links", "operating credibility"],
});

export default function AwardsPage() {
  const runtimeSnapshot = getJudgeRuntimeLogsSnapshot();

  return (
    <OperationsShell
      eyebrow="Recognition"
      title="Recognition stays attached to product proof, trust, and operating credibility"
      description="This route keeps awards secondary to the real product surface. Recognition matters only when it stays tied to proof, runtime discipline, and the live Testnet operating path."
      navigationMode="guided"
      badges={[
        { label: "Recognition", variant: "warning" },
        { label: "Product + protocol execution", variant: "success" },
      ]}
    >
      <GuidedOperationRail current="verify" reviewHref="/intelligence" verifyHref="/proof" />
      <OperatingJourneyStrip
        snapshot={runtimeSnapshot}
        title="Recognition should send reviewers back to the same proof-bearing operating path"
        description="This page exists to strengthen trust, not distract from the product. The right next move after any recognition claim is still to inspect the wallet-first Testnet journey and proof continuity."
      />
      <div>
        <SectionHeader
          eyebrow="Recognition"
          title="Recognition and operating credibility"
          description="This page keeps recognition secondary to the product itself: a visible execution signal tied to proof, trust, and operating discipline."
        />
      </div>
      <div>
        <MetricsStrip />
      </div>
      <div>
        <EcosystemFocusAlignmentStrip
          title="How ecosystem requirements map into the live platform"
          description="Use this layer to show reviewers, partners, and funders that PrivateDAO turns ecosystem requirements into concrete product lanes across governance, payments, infrastructure, education, and developer tooling."
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-4 text-amber-100">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-amber-200/80">Recognition signal</div>
                <CardTitle className="mt-2">Regional first-place recognition</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-8 text-white/62">
            <p>
              PrivateDAO is presented as a product that combines private governance, treasury operations, runtime evidence, and commercial packaging. This recognition supports that story without replacing the product proof itself.
            </p>
            <p>
              The public surface keeps that same discipline: proof clarity, operator clarity, and buyer-facing product language remain intact.
            </p>
            <p className="text-white/52">
              FastRPC is supporting PrivateDAO throughout the hackathon with RPC infrastructure, and we appreciate that support.
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
      <div>
        <TrustSurface />
      </div>
    </OperationsShell>
  );
}
