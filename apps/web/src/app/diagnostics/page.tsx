import { DiagnosticsCenter } from "@/components/diagnostics-center";
import { LaunchBlockersPanel } from "@/components/launch-blockers-panel";
import { MetricsStrip } from "@/components/metrics-strip";
import { SectionHeader } from "@/components/section-header";
import { Badge } from "@/components/ui/badge";

export default function DiagnosticsPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex flex-wrap gap-3">
        <Badge variant="warning">Diagnostics</Badge>
        <Badge variant="cyan">Runtime surfaces</Badge>
        <Badge variant="success">Reviewer bundle aware</Badge>
      </div>
      <div className="mt-6">
        <SectionHeader
          eyebrow="Diagnostics"
          title="Generated artifacts, runtime checks, and reviewer bundle health in one place"
          description="This page keeps the operator story productized: what is packaged, what is proven, what is still pending-external, and how the verification chain stays coherent."
        />
      </div>
      <div className="mt-10">
        <MetricsStrip />
      </div>
      <div className="mt-10">
        <DiagnosticsCenter />
      </div>
      <div className="mt-10">
        <LaunchBlockersPanel />
      </div>
    </main>
  );
}
