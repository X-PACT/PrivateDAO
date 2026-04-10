import type { Metadata } from "next";

import { DiagnosticsCenter } from "@/components/diagnostics-center";
import { DevnetServiceMetricsPanel } from "@/components/devnet-service-metrics-panel";
import { IncidentReadinessPanel } from "@/components/incident-readiness-panel";
import { LaunchBlockersPanel } from "@/components/launch-blockers-panel";
import { MetricsStrip } from "@/components/metrics-strip";
import { OperationsShell } from "@/components/operations-shell";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Diagnostics",
  description:
    "Generated artifacts, runtime checks, reviewer bundle health, and launch blockers presented as a product-facing diagnostics surface.",
  path: "/diagnostics",
  keywords: ["diagnostics", "reviewer bundle", "artifact freshness", "runtime checks"],
});

export default function DiagnosticsPage() {
  return (
    <OperationsShell
      eyebrow="Diagnostics"
      title="Generated artifacts, runtime checks, and reviewer bundle health in one place"
      description="This page keeps the operator story productized: what is packaged, what is proven, what is still pending-external, and how the verification chain stays coherent inside a professional operations shell."
      badges={[
        { label: "Diagnostics", variant: "warning" },
        { label: "Runtime surfaces", variant: "cyan" },
        { label: "Reviewer bundle aware", variant: "success" },
      ]}
    >
      <div>
        <MetricsStrip />
      </div>
      <div>
        <DiagnosticsCenter />
      </div>
      <div>
        <IncidentReadinessPanel />
      </div>
      <div>
        <DevnetServiceMetricsPanel scope="diagnostics" />
      </div>
      <div>
        <LaunchBlockersPanel />
      </div>
    </OperationsShell>
  );
}
