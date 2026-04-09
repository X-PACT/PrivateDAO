import { AnalyticsCharts } from "@/components/analytics-charts";
import { SectionHeader } from "@/components/section-header";
import { Badge } from "@/components/ui/badge";

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
        <AnalyticsCharts />
      </div>
    </main>
  );
}
