import { Suspense } from "react";
import type { Metadata } from "next";

import { AnalystGradeDataCorridor } from "@/components/analyst-grade-data-corridor";
import { AnalyticsCharts } from "@/components/analytics-charts";
import { AnalyticsSummary } from "@/components/analytics-summary";
import { DataCorridorQuickLinks } from "@/components/data-corridor-quick-links";
import { HostedReadProofStrip } from "@/components/hosted-read-proof-strip";
import { LaunchBlockersPanel } from "@/components/launch-blockers-panel";
import { OperationsShell } from "@/components/operations-shell";
import { ReviewerTelemetryTruthStrip } from "@/components/reviewer-telemetry-truth-strip";
import { TelemetryExportReadinessPanel } from "@/components/telemetry-export-readiness-panel";
import { TelemetryExportScorecard } from "@/components/telemetry-export-scorecard";
import { TelemetryRuntimeFocusStrip } from "@/components/telemetry-runtime-focus-strip";
import { TelemetryModeHandoffStrip } from "@/components/telemetry-mode-handoff-strip";
import { SectionHeader } from "@/components/section-header";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Analytics",
  description:
    "Responsive analytics for votes, proposals, treasury actions, readiness summaries, and launch blockers across the PrivateDAO product surface.",
  path: "/analytics",
  keywords: ["analytics", "recharts", "launch blockers", "treasury actions"],
  index: false,
});

export default function AnalyticsPage() {
  return (
    <OperationsShell
      eyebrow="Analytics"
      title="Operational metrics for votes, proposals, and treasury activity"
      description="Recharts-backed analytics make the governance system feel operational rather than presentational, while still reflecting the same security, proof, and treasury realities already in the repo."
      badges={[
        { label: "Responsive analytics", variant: "cyan" },
        { label: "Recharts", variant: "violet" },
        { label: "Votes · proposals · treasury actions", variant: "success" },
      ]}
    >
      <div>
        <Suspense fallback={null}>
          <TelemetryModeHandoffStrip context="analytics" />
        </Suspense>
      </div>
      <div>
        <ReviewerTelemetryTruthStrip
          id="telemetry-inspection"
          title="Telemetry truth for analytics reviewers"
          description="Keep freshness, hosted-read scale, finalized governance counts, and the reviewer packet visible above the analytics surface itself."
        />
      </div>
      <div>
        <SectionHeader
          eyebrow="Dune + RPC fit"
          title="This analytics route is now part of the competition submission surface"
          description="Use this corridor when judges need to see exportable telemetry, hosted-read value, runtime proof, and commercial infrastructure logic in one place."
        />
      </div>
      <div>
        <Suspense fallback={<div className="rounded-3xl border border-white/8 bg-white/4 p-6 text-sm text-white/60">Loading telemetry runtime focus…</div>}>
          <TelemetryRuntimeFocusStrip context="analytics" />
        </Suspense>
      </div>
      <div>
        <DataCorridorQuickLinks />
      </div>
      <div>
        <AnalystGradeDataCorridor />
      </div>
      <div>
        <TelemetryExportReadinessPanel />
      </div>
      <div>
        <TelemetryExportScorecard />
      </div>
      <div>
        <Suspense fallback={<div className="rounded-3xl border border-white/8 bg-white/4 p-6 text-sm text-white/60">Loading analytics summary…</div>}>
          <AnalyticsSummary />
        </Suspense>
      </div>
      <div>
        <HostedReadProofStrip />
      </div>
      <div>
        <Suspense fallback={<div className="rounded-3xl border border-white/8 bg-white/4 p-6 text-sm text-white/60">Loading analytics charts…</div>}>
          <AnalyticsCharts />
        </Suspense>
      </div>
      <div>
        <LaunchBlockersPanel />
      </div>
    </OperationsShell>
  );
}
