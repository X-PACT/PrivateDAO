import type { Metadata } from "next";

import { IntelligenceLayerSurface } from "@/components/intelligence-layer-surface";
import { MetricsStrip } from "@/components/metrics-strip";
import { OperationsShell } from "@/components/operations-shell";
import { SectionHeader } from "@/components/section-header";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Intelligence",
  description:
    "Operational intelligence for proposals, treasury execution, voting, RPC, and gaming. Built for decision support inside PrivateDAO instead of a shallow chatbot.",
  path: "/intelligence",
  keywords: ["ai", "proposal review", "treasury review", "voting summary", "rpc analyzer", "gaming ai"],
  index: false,
});

export default function IntelligencePage() {
  return (
    <OperationsShell
      eyebrow="Intelligence"
      title="Operational intelligence that helps a normal user make safer governance and treasury decisions"
      description="PrivateDAO uses intelligence where it actually matters: proposal review, treasury execution review, voting compression, RPC health interpretation, and gaming-governance decision support tied to real product flows."
      badges={[
        { label: "Security + Intelligence", variant: "cyan" },
        { label: "Decision support", variant: "success" },
        { label: "Hugging Face free-ready", variant: "warning" },
      ]}
    >
      <div className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.08] p-6 text-sm leading-7 text-white/68">
        This route is easiest to understand after <a className="text-cyan-100 underline underline-offset-4" href="/learn">/learn</a> and a real Devnet action from <a className="text-cyan-100 underline underline-offset-4" href="/govern">/govern</a>. The goal is simple: help the signer understand risk, treasury context, RPC quality, and gaming consequences before pressing approve.
      </div>
      <div>
        <MetricsStrip />
      </div>
      <div>
        <SectionHeader
          eyebrow="Not a chatbot"
          title="AI in PrivateDAO exists to explain hard decisions, not to distract from them"
          description="This route is intentionally operational. It helps users understand proposal review context, treasury execution context, voting posture, RPC quality, and gaming-governance implications before they sign or execute anything."
        />
      </div>
      <div>
        <IntelligenceLayerSurface />
      </div>
    </OperationsShell>
  );
}
