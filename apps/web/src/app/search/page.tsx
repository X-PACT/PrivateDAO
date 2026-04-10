import { OperationsShell } from "@/components/operations-shell";
import { SiteSearchPanel } from "@/components/site-search-panel";

export default function SearchPage() {
  return (
    <OperationsShell
      eyebrow="Search"
      title="Find the right route, proof packet, document, or competition workspace fast"
      description="Search the live PrivateDAO surface without browsing the whole application manually."
      badges={[
        { label: "Fast product search", variant: "cyan" },
        { label: "Judge and user friendly", variant: "success" },
      ]}
    >
      <SiteSearchPanel />
    </OperationsShell>
  );
}
