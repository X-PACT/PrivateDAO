import type { Metadata } from "next";

import { GovernanceDashboard } from "@/components/governance-dashboard";
import { OperationsShell } from "@/components/operations-shell";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Governance Dashboard",
  description:
    "Reusable governance dashboard UI for proposals, treasury actions, vote timelines, and execution evidence inside the PrivateDAO Next.js surface.",
  path: "/dashboard",
  keywords: ["governance dashboard", "proposal cards", "treasury table"],
});

export default function DashboardPage() {
  return (
    <OperationsShell
      eyebrow="Dashboard"
      title="Governance dashboard"
      description="Proposal cards, treasury actions, vote timing, and execution evidence are presented as reusable operational surfaces so the migration grows like a real governance system, not a demo."
      badges={[
        { label: "Governance Dashboard", variant: "cyan" },
        { label: "Treasury + timelines", variant: "violet" },
        { label: "Operational UI", variant: "success" },
      ]}
    >
      <div>
        <GovernanceDashboard />
      </div>
    </OperationsShell>
  );
}
