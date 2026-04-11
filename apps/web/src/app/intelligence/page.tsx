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
});

export default function IntelligencePage() {
  return (
    <OperationsShell
      eyebrow="Intelligence"
      title="Operational intelligence that helps users take safer governance actions"
      description="PrivateDAO uses intelligence where it actually matters: proposal review, treasury execution review, voting compression, RPC health interpretation, and gaming-governance decision support."
      badges={[
        { label: "Security + Intelligence", variant: "cyan" },
        { label: "Decision support", variant: "success" },
        { label: "Hugging Face free-ready", variant: "warning" },
      ]}
    >
      <div>
        <MetricsStrip />
      </div>
      <div>
        <SectionHeader
          eyebrow="Not a chatbot"
          title="AI in PrivateDAO should improve decisions, not just add another chat window"
          description="This route is intentionally operational. It helps users understand proposal risk, treasury risk, voting posture, RPC quality, and gaming-governance implications before they sign or execute anything."
        />
      </div>
      <div>
        <IntelligenceLayerSurface />
      </div>
    </OperationsShell>
  );
}
