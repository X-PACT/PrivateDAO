import { MetricsStrip } from "@/components/metrics-strip";
import { ProofFlowRail } from "@/components/proof-flow-rail";
import { ProofCenter } from "@/components/proof-center";
import { SectionHeader } from "@/components/section-header";
import { Badge } from "@/components/ui/badge";

export default function ProofPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex flex-wrap gap-3">
        <Badge variant="cyan">Proof Center</Badge>
        <Badge variant="violet">Reviewer-ready</Badge>
        <Badge variant="success">Baseline + V3</Badge>
      </div>
      <div className="mt-6">
        <SectionHeader
          eyebrow="Proof"
          title="Runtime evidence, reviewer packets, and additive hardening in one surface"
          description="The Next.js app should expose the same proof story as the current site: baseline live proof, dedicated V3 hardening proof, integration packets, and clear launch boundaries."
        />
      </div>
      <div className="mt-10">
        <MetricsStrip />
      </div>
      <div className="mt-10">
        <ProofFlowRail />
      </div>
      <div className="mt-10">
        <ProofCenter />
      </div>
    </main>
  );
}
