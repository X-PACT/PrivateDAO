import { OperationsShell } from "@/components/operations-shell";
import { SiteSearchPanel } from "@/components/site-search-panel";

export default function DevelopersPage() {
  return (
    <OperationsShell
      eyebrow="Developers"
      title="Documentation, proof packets, viewers, and engineering surfaces"
      description="Developer-facing access should start with curated docs and continue into the broader repository viewer and proof surfaces."
      badges={[
        { label: "Docs and viewers", variant: "cyan" },
        { label: "Reviewer-ready", variant: "violet" },
      ]}
    >
      <SiteSearchPanel />
    </OperationsShell>
  );
}
