import type { Metadata } from "next";

import { AnalystGradeDataCorridor } from "@/components/analyst-grade-data-corridor";
import { CommercialCompareSurface } from "@/components/commercial-compare-surface";
import { CustodyReadinessStrip } from "@/components/custody-readiness-strip";
import { DataCorridorQuickLinks } from "@/components/data-corridor-quick-links";
import { DevnetServiceMetricsPanel } from "@/components/devnet-service-metrics-panel";
import { HostedReadProofStrip } from "@/components/hosted-read-proof-strip";
import { MetricsStrip } from "@/components/metrics-strip";
import { OperationsShell } from "@/components/operations-shell";
import { PlatformServiceArchitecture } from "@/components/platform-service-architecture";
import { ReviewerTelemetryTruthStrip } from "@/components/reviewer-telemetry-truth-strip";
import { SectionHeader } from "@/components/section-header";
import { ServiceOperationalCards } from "@/components/service-operational-cards";
import { ServiceReadinessLadder } from "@/components/service-readiness-ladder";
import { ServicesSurface } from "@/components/services-surface";
import { SolutionCorridors } from "@/components/solution-corridors";
import { TreasuryReceiveSurface } from "@/components/treasury-receive-surface";
import { TreasuryProfileQuickActions } from "@/components/treasury-profile-quick-actions";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Services",
  description:
    "Commercial comparison, hosted read API, pilot journey, pricing, SLA framing, and trust surfaces for PrivateDAO as a real product.",
  path: "/services",
  keywords: ["services", "pilot package", "pricing model", "hosted read api"],
});

export default function ServicesPage() {
  return (
    <OperationsShell
      eyebrow="Commercial"
      title="Service and pilot surfaces presented like a product, not buried in docs"
      description="PrivateDAO also needs to sell what it can do: API rails, operator support, pilot onboarding, trust packaging, and pricing language that stays technically honest."
      badges={[
        { label: "Services", variant: "warning" },
        { label: "Hosted Read API + Ops", variant: "cyan" },
        { label: "Pilot-ready", variant: "success" },
      ]}
    >
      <div>
        <ReviewerTelemetryTruthStrip
          title="Telemetry truth for infrastructure buyers"
          description="Put freshness, hosted-read scale, finalized proof counts, and the telemetry packet above the commercial infrastructure story."
        />
      </div>
      <div>
        <MetricsStrip />
      </div>
      <div>
        <CustodyReadinessStrip context="services" />
      </div>
      <div>
        <DataCorridorQuickLinks
          title="Data-side quick links"
          description="Buyer-safe path into the telemetry packet, diagnostics, analytics, and hosted-read proof so infrastructure reviewers can inspect the data corridor from the services surface."
        />
      </div>
      <div>
        <SolutionCorridors />
      </div>
      <div>
        <DevnetServiceMetricsPanel scope="services" />
      </div>
      <div>
        <HostedReadProofStrip />
      </div>
      <div>
        <AnalystGradeDataCorridor />
      </div>
      <div>
        <ServiceOperationalCards />
      </div>
      <div>
        <SectionHeader
          eyebrow="AI-powered features"
          title="Operational intelligence is now part of the commercial surface"
          description="Proposal Analyzer, Treasury Risk AI, Voting Summary, RPC Analyzer, and Gaming AI strengthen how buyers understand PrivateDAO. They are part of the product story because they improve real decisions."
        />
      </div>
      <div>
        <ServicesSurface />
      </div>
      <div>
        <CommercialCompareSurface />
      </div>
      <div className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.08] p-6 text-sm leading-7 text-white/66">
        Open <a className="text-cyan-100 underline underline-offset-4" href="/intelligence">/intelligence</a> to try the live Security + Intelligence layer. It is where proposal analysis, treasury warnings, voting compression, RPC interpretation, and gaming-governance assistance become user-visible.
      </div>
      <div>
        <TreasuryProfileQuickActions title="Fast commercial treasury routes" />
      </div>
      <div>
        <TreasuryReceiveSurface />
      </div>
      <div>
        <PlatformServiceArchitecture />
      </div>
      <div>
        <ServiceReadinessLadder />
      </div>
    </OperationsShell>
  );
}
