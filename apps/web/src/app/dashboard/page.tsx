import type { Metadata } from "next";

import { GovernanceDashboard } from "@/components/governance-dashboard";
import { SectionHeader } from "@/components/section-header";
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
    <main className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Dashboard"
        title="Governance dashboard"
        description="Proposal cards, treasury actions, vote timing, and execution evidence are presented as reusable React surfaces so the migration can grow without rewriting the protocol story."
      />
      <div className="mt-10">
        <GovernanceDashboard />
      </div>
    </main>
  );
}
