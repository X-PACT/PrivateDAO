import { Suspense } from "react";

import { DiagnosticsCenter } from "@/components/diagnostics-center";
import { ExecutionOperationsStrip } from "@/components/execution-operations-strip";
import { FrontierSignalBoard } from "@/components/frontier-signal-board";
import { ProofCenter } from "@/components/proof-center";
import { SecurityCenter } from "@/components/security-center";
import { TelemetryRuntimeFocusStrip } from "@/components/telemetry-runtime-focus-strip";
import { TelemetryModeHandoffStrip } from "@/components/telemetry-mode-handoff-strip";
import { OperationsShell } from "@/components/operations-shell";
import { RuntimeEvidenceContinuityPanel } from "@/components/runtime-evidence-continuity-panel";
import type { Metadata } from "next";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { getExecutionSurfaceSnapshot } from "@/lib/devnet-service-metrics";
import { getJudgeRuntimeLogsSnapshot } from "@/lib/judge-runtime-logs";

export const metadata: Metadata = buildRouteMetadata({
  title: "Network",
  description:
    "Runtime evidence, diagnostics, proof, and network-grade reviewer surfaces for the live PrivateDAO Devnet system.",
  path: "/network",
  keywords: ["network", "runtime evidence", "diagnostics", "proof"],
  index: false,
});

export default function NetworkPage() {
  const executionSnapshot = getExecutionSurfaceSnapshot();
  const runtimeSnapshot = getJudgeRuntimeLogsSnapshot();

  return (
    <OperationsShell
      eyebrow="Network"
      title="Proof, security, diagnostics, and runtime surfaces for the live Devnet system"
      description="This route groups the network-grade layer: proof, security, diagnostics, reviewer paths, and runtime trust surfaces across the PrivateDAO stack."
      badges={[
        { label: "Proof and runtime", variant: "cyan" },
        { label: "ZK + REFHE + MagicBlock + Fast RPC", variant: "violet" },
        { label: "Reviewer-visible", variant: "success" },
      ]}
    >
      <Suspense fallback={null}>
        <TelemetryModeHandoffStrip context="network" />
      </Suspense>
      <Suspense fallback={<div className="rounded-3xl border border-white/8 bg-white/4 p-6 text-sm text-white/60">Loading telemetry runtime focus…</div>}>
        <TelemetryRuntimeFocusStrip context="network" />
      </Suspense>
      <Suspense fallback={null}>
        <RuntimeEvidenceContinuityPanel
          context="network"
          executionSnapshot={executionSnapshot}
          runtimeSnapshot={runtimeSnapshot}
        />
      </Suspense>
      <Suspense fallback={null}>
        <ExecutionOperationsStrip context="network" />
      </Suspense>
      <FrontierSignalBoard />
      <ProofCenter />
      <SecurityCenter />
      <Suspense fallback={<div className="rounded-3xl border border-white/8 bg-white/4 p-6 text-sm text-white/60">Loading network diagnostics…</div>}>
        <DiagnosticsCenter />
      </Suspense>
    </OperationsShell>
  );
}
