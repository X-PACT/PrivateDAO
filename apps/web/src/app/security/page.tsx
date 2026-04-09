import { MetricsStrip } from "@/components/metrics-strip";
import { SectionHeader } from "@/components/section-header";
import { SecurityCenter } from "@/components/security-center";
import { Badge } from "@/components/ui/badge";

export default function SecurityPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex flex-wrap gap-3">
        <Badge variant="violet">Security</Badge>
        <Badge variant="success">Additive hardening</Badge>
        <Badge variant="cyan">ZK + REFHE + MagicBlock</Badge>
      </div>
      <div className="mt-6">
        <SectionHeader
          eyebrow="Security"
          title="A security surface that keeps hardening, proof, and launch boundaries together"
          description="The Next.js migration should make the security story easier to understand without flattening the truth: additive V3 hardening, integration rails, audit packets, and explicit launch blockers all stay visible."
        />
      </div>
      <div className="mt-10">
        <MetricsStrip />
      </div>
      <div className="mt-10">
        <SecurityCenter />
      </div>
    </main>
  );
}
