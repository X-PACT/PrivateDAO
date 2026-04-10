import type { Metadata } from "next";

import { AnalyticsCharts } from "@/components/analytics-charts";
import { AnalyticsSummary } from "@/components/analytics-summary";
import { LaunchBlockersPanel } from "@/components/launch-blockers-panel";
import { OperationsShell } from "@/components/operations-shell";
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
        <AnalyticsSummary />
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
