import { Suspense } from "react";
import type { Metadata } from "next";

import { AnalystGradeDataCorridor } from "@/components/analyst-grade-data-corridor";
import { DataCorridorQuickLinks } from "@/components/data-corridor-quick-links";
import { DiagnosticsCenter } from "@/components/diagnostics-center";
import { DevnetServiceMetricsPanel } from "@/components/devnet-service-metrics-panel";
import { HostedReadProofStrip } from "@/components/hosted-read-proof-strip";
import { IncidentReadinessPanel } from "@/components/incident-readiness-panel";
import { LaunchBlockersPanel } from "@/components/launch-blockers-panel";
import { MetricsStrip } from "@/components/metrics-strip";
import { OperationsShell } from "@/components/operations-shell";
import { ReviewerTelemetryTruthStrip } from "@/components/reviewer-telemetry-truth-strip";
import { TelemetryRuntimeFocusStrip } from "@/components/telemetry-runtime-focus-strip";
import { TelemetryModeHandoffStrip } from "@/components/telemetry-mode-handoff-strip";
import { CustodyWorkspace } from "@/components/custody-workspace";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { RuntimeEvidenceContinuityPanel } from "@/components/runtime-evidence-continuity-panel";
import { getExecutionSurfaceSnapshot } from "@/lib/devnet-service-metrics";
import { getJudgeRuntimeLogsSnapshot } from "@/lib/judge-runtime-logs";

export const metadata: Metadata = buildRouteMetadata({
  title: "Diagnostics",
  description:
    "Generated artifacts, runtime checks, reviewer bundle health, and release-readiness signals presented as a product-facing diagnostics surface.",
  path: "/diagnostics",
  keywords: ["diagnostics", "reviewer bundle", "artifact freshness", "runtime checks"],
  index: false,
});

export default function DiagnosticsPage() {
  const executionSnapshot = getExecutionSurfaceSnapshot();
  const runtimeSnapshot = getJudgeRuntimeLogsSnapshot();

  return (
    <OperationsShell
      eyebrow="Diagnostics"
      title="Generated artifacts, runtime checks, and reviewer bundle health in one place"
      description="This page keeps the operator story productized: what is packaged, what is proven, what is actively being strengthened next, and how the verification chain stays coherent inside a professional operations shell."
      badges={[
        { label: "Diagnostics", variant: "violet" },
        { label: "Runtime surfaces", variant: "cyan" },
        { label: "Reviewer bundle aware", variant: "success" },
      ]}
    >
      <div className="rounded-3xl border border-cyan-300/16 bg-cyan-300/[0.08] p-5 text-sm leading-7 text-white/72">
        Use diagnostics after you connect a Testnet wallet and run the product flow. This is where a visitor, reviewer, or operator can confirm the runtime result, inspect the data corridor, and see that the system is doing real work instead of presenting static claims.
      </div>
      <div>
        <Suspense fallback={null}>
          <TelemetryModeHandoffStrip context="diagnostics" />
        </Suspense>
      </div>
      <div>
        <ReviewerTelemetryTruthStrip
          title="Telemetry truth for diagnostics reviewers"
          description="Show packet freshness, indexed proposal scale, finalized counts, and the direct telemetry packet route before the deeper diagnostics surfaces."
        />
      </div>
      <div>
        <Suspense fallback={<div className="rounded-3xl border border-white/8 bg-white/4 p-6 text-sm text-white/60">Loading telemetry runtime focus…</div>}>
          <TelemetryRuntimeFocusStrip context="diagnostics" />
        </Suspense>
      </div>
      <div>
        <DataCorridorQuickLinks
          title="Reviewer telemetry quick links"
          description="Fast path from diagnostics into the telemetry packet, analytics summaries, and hosted-read proof without forcing the reviewer to infer the data corridor."
        />
      </div>
      <div>
        <HostedReadProofStrip />
      </div>
      <div>
        <MetricsStrip />
      </div>
      <div>
        <Suspense fallback={<div className="rounded-3xl border border-white/8 bg-white/4 p-6 text-sm text-white/60">Loading diagnostics center…</div>}>
          <DiagnosticsCenter />
        </Suspense>
      </div>
      <div>
        <Suspense fallback={null}>
          <RuntimeEvidenceContinuityPanel
            context="diagnostics"
            executionSnapshot={executionSnapshot}
            runtimeSnapshot={runtimeSnapshot}
          />
        </Suspense>
      </div>
      <div>
        <IncidentReadinessPanel />
      </div>
      <div>
        <Suspense fallback={<div className="rounded-3xl border border-white/8 bg-white/4 p-6 text-sm text-white/60">Loading diagnostics metrics…</div>}>
          <DevnetServiceMetricsPanel scope="diagnostics" />
        </Suspense>
      </div>
      <div>
        <AnalystGradeDataCorridor />
      </div>
      <div>
        <LaunchBlockersPanel />
      </div>
      <div>
        <CustodyWorkspace />
      </div>
    </OperationsShell>
  );
}
