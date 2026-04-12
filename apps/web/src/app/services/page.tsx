import { Suspense } from "react";
import type { Metadata } from "next";

import { AnalystGradeDataCorridor } from "@/components/analyst-grade-data-corridor";
import { CommercialCompareSurface } from "@/components/commercial-compare-surface";
import { CustodyReadinessStrip } from "@/components/custody-readiness-strip";
import { DataCorridorQuickLinks } from "@/components/data-corridor-quick-links";
import { DevnetServiceMetricsPanel } from "@/components/devnet-service-metrics-panel";
import { EcosystemFocusAlignmentStrip } from "@/components/ecosystem-focus-alignment-strip";
import { HostedReadProofStrip } from "@/components/hosted-read-proof-strip";
import { MetricsStrip } from "@/components/metrics-strip";
import { OperationsShell } from "@/components/operations-shell";
import { PlatformServiceArchitecture } from "@/components/platform-service-architecture";
import { PaymentsTruthStrip } from "@/components/payments-truth-strip";
import { PdaoTokenStrategyStrip } from "@/components/pdao-token-strategy-strip";
import { ReviewerTelemetryTruthStrip } from "@/components/reviewer-telemetry-truth-strip";
import { ReadNodeActivationStrip } from "@/components/read-node-activation-strip";
import { ReadNodeHostReadinessStrip } from "@/components/read-node-host-readiness-strip";
import { SectionHeader } from "@/components/section-header";
import { ServiceOperationalCards } from "@/components/service-operational-cards";
import { ServiceReadinessLadder } from "@/components/service-readiness-ladder";
import { ServiceHandoffStrip } from "@/components/service-handoff-strip";
import { ServicesSurface } from "@/components/services-surface";
import { SolutionCorridors } from "@/components/solution-corridors";
import { TreasuryReceiveSurface } from "@/components/treasury-receive-surface";
import { TreasuryProfileQuickActions } from "@/components/treasury-profile-quick-actions";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { TreasuryReviewerGradeStrip } from "@/components/treasury-reviewer-grade-strip";
import { WalletFirstServiceActionsStrip } from "@/components/wallet-first-service-actions-strip";
import { AuthoritativeExecutionTrail } from "@/components/authoritative-execution-trail";
import { getJudgeRuntimeLogsSnapshot } from "@/lib/judge-runtime-logs";

export const metadata: Metadata = buildRouteMetadata({
  title: "Services",
  description:
    "Commercial comparison, hosted read API, pilot journey, pricing, SLA framing, and trust surfaces for PrivateDAO as a real product.",
  path: "/services",
  keywords: ["services", "pilot package", "pricing model", "hosted read api"],
});

export default function ServicesPage() {
  const runtimeSnapshot = getJudgeRuntimeLogsSnapshot();
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
        <PaymentsTruthStrip context="services" />
      </div>
      <div>
        <Suspense fallback={null}>
          <ServiceHandoffStrip context="services" />
        </Suspense>
      </div>
      <div>
        <Suspense fallback={null}>
          <AuthoritativeExecutionTrail context="services" runtimeSnapshot={runtimeSnapshot} />
        </Suspense>
      </div>
      <div>
        <WalletFirstServiceActionsStrip context="services" />
      </div>
      <div>
        <PdaoTokenStrategyStrip context="services" />
      </div>
      <div>
        <ReviewerTelemetryTruthStrip
          id="telemetry-inspection"
          title="Telemetry truth for infrastructure buyers"
          description="Put freshness, hosted-read scale, finalized proof counts, and the telemetry packet above the commercial infrastructure story."
        />
      </div>
      <div>
        <ReadNodeActivationStrip context="services" />
      </div>
      <div>
        <ReadNodeHostReadinessStrip context="services" />
      </div>
      <div>
        <EcosystemFocusAlignmentStrip
          title="Services also close real ecosystem focus areas"
          description="Make the payments, DAO tooling, developer tooling, and decentralisation fit explicit from the services surface instead of leaving it buried in grant notes."
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
        <Suspense fallback={<div className="rounded-3xl border border-white/8 bg-white/4 p-6 text-sm text-white/60">Loading service metrics…</div>}>
          <DevnetServiceMetricsPanel scope="services" />
        </Suspense>
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
          description="Proposal Review AI, Treasury Review AI, Voting Summary, RPC Analyzer, and Gaming AI strengthen how buyers understand PrivateDAO. They are part of the product story because they improve real decisions."
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
        <Suspense fallback={<div className="rounded-3xl border border-white/8 bg-white/4 p-6 text-sm text-white/60">Loading treasury routes…</div>}>
          <TreasuryProfileQuickActions title="Fast commercial treasury routes" />
        </Suspense>
      </div>
      <div>
        <TreasuryReviewerGradeStrip
          context="services"
          description="Collapse treasury professionalism into one reviewer-grade surface before the receive rails: sender discipline, proof links, rail references, commercial fit, and the exact blocker stay visible together."
        />
      </div>
      <div>
        <Suspense fallback={<div className="rounded-3xl border border-white/8 bg-white/4 p-6 text-sm text-white/60">Loading treasury receive surface…</div>}>
          <TreasuryReceiveSurface />
        </Suspense>
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
