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
import { TelemetryModeHandoffStrip } from "@/components/telemetry-mode-handoff-strip";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Analytics",
  description:
    "Responsive analytics for votes, proposals, treasury actions, readiness summaries, and launch blockers across the PrivateDAO product surface.",
  path: "/analytics",
  keywords: ["analytics", "recharts", "launch blockers", "treasury actions"],
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
        <DataCorridorQuickLinks />
      </div>
      <div>
        <AnalystGradeDataCorridor />
      </div>
      <div>
        <AnalyticsSummary />
      </div>
      <div>
        <HostedReadProofStrip />
      </div>
      <div>
        <AnalyticsCharts />
      </div>
      <div>
        <LaunchBlockersPanel />
      </div>
    </OperationsShell>
  );
}
