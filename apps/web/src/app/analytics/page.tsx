import type { Metadata } from "next";

import { AnalyticsCharts } from "@/components/analytics-charts";
import { AnalyticsSummary } from "@/components/analytics-summary";
import { LaunchBlockersPanel } from "@/components/launch-blockers-panel";
import { SectionHeader } from "@/components/section-header";
import { Badge } from "@/components/ui/badge";
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
    <main className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex flex-wrap gap-3">
        <Badge variant="cyan">Responsive analytics</Badge>
        <Badge variant="violet">Recharts</Badge>
        <Badge variant="success">Votes · proposals · treasury actions</Badge>
      </div>
      <div className="mt-6">
        <SectionHeader
          eyebrow="Analytics"
          title="Operational metrics for votes, proposals, and treasury activity"
          description="Recharts-backed analytics make the dashboard feel like a product surface, while still reflecting the same governance, security, and treasury realities already present in the repo."
        />
      </div>
      <div className="mt-10">
        <AnalyticsSummary />
      </div>
      <div className="mt-10">
        <AnalyticsCharts />
      </div>
      <div className="mt-10">
        <LaunchBlockersPanel />
      </div>
    </main>
  );
}
