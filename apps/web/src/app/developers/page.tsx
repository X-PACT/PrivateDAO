import { OperationsShell } from "@/components/operations-shell";
import { ProofCenter } from "@/components/proof-center";
import { SiteSearchPanel } from "@/components/site-search-panel";
import { TrustSurface } from "@/components/trust-surface";

export default function DevelopersPage() {
  return (
    <OperationsShell
      eyebrow="Developers"
      title="Documentation, proof packets, viewers, and engineering surfaces"
      description="Developer-facing access should start with curated docs and continue into the broader repository viewer and proof surfaces."
      badges={[
        { label: "Docs and viewers", variant: "cyan" },
        { label: "Reviewer-ready", variant: "violet" },
        { label: "Track-aware", variant: "success" },
      ]}
    >
      <SiteSearchPanel />
      <ProofCenter />
      <TrustSurface />
    </OperationsShell>
  );
}
