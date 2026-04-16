import type { Metadata } from "next";

import { OperationsShell } from "@/components/operations-shell";
import { SiteSearchPanel } from "@/components/site-search-panel";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Search",
  description: "Search the live PrivateDAO surface without browsing the whole application manually.",
  path: "/search",
  keywords: ["site search", "navigation"],
  index: false,
});

export default function SearchPage() {
  return (
    <OperationsShell
      eyebrow="Search"
      title="Find the right product route, proof packet, or document fast"
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
