import type { Metadata } from "next";
import Link from "next/link";

import { DevnetServiceMetricsPanel } from "@/components/devnet-service-metrics-panel";
import { LocalizedRouteBrief } from "@/components/localized-route-brief";
import { LocalizedRouteSummary } from "@/components/localized-route-summary";
import { OperationsShell } from "@/components/operations-shell";
import { ReadNodeActivationStrip } from "@/components/read-node-activation-strip";
import { ReadNodeHostReadinessStrip } from "@/components/read-node-host-readiness-strip";
import { ReviewerTelemetryTruthStrip } from "@/components/reviewer-telemetry-truth-strip";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Runtime Infrastructure",
  description:
    "Infrastructure lane for fast reads, runtime telemetry, diagnostics readiness, and reviewer-grade evidence continuity.",
  path: "/services/runtime-infrastructure",
  keywords: ["runtime infrastructure", "quicknode", "fast rpc", "telemetry", "read node"],
});

export default function RuntimeInfrastructurePage() {
  return (
    <OperationsShell
      eyebrow="Infrastructure"
      title="Run and verify low-latency infrastructure as a product lane, not hidden backend plumbing"
      description="This lane packages RPC and runtime infrastructure into a reviewer-facing route with telemetry, host readiness, and operational evidence continuity."
      badges={[
        { label: "Fast RPC", variant: "warning" },
        { label: "Runtime telemetry", variant: "cyan" },
        { label: "Reviewer-grade", variant: "success" },
      ]}
    >
      <LocalizedRouteSummary routeKey="services" />
      <LocalizedRouteBrief routeKey="servicesCore" />
      <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 text-sm leading-7 text-white/68">
        Runtime infrastructure in PrivateDAO is exposed directly in product flows so operators and judges can inspect freshness,
        failover posture, and telemetry truth before trusting execution claims.
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/analytics" className={cn(buttonVariants({ size: "sm" }))}>
            Open analytics
          </Link>
          <Link href="/diagnostics" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
            Open diagnostics
          </Link>
          <Link href="/proof" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            Open proof
          </Link>
        </div>
      </div>
      <ReadNodeActivationStrip context="services" />
      <ReadNodeHostReadinessStrip context="services" />
      <ReviewerTelemetryTruthStrip
        title="Infrastructure telemetry truth"
        description="Freshness, fallback posture, and proof-linked telemetry shown from the same runtime corridor."
      />
      <DevnetServiceMetricsPanel scope="services" />
    </OperationsShell>
  );
}

