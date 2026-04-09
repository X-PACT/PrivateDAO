import { GovernanceDashboard } from "@/components/governance-dashboard";
import { SectionHeader } from "@/components/section-header";

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
