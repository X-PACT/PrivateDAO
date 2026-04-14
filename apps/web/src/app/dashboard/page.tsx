import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Radar, ShieldCheck, WalletCards } from "lucide-react";

import { ExecutionSurfaceInline } from "@/components/execution-surface-inline";
import { CustodyReadinessStrip } from "@/components/custody-readiness-strip";
import { CustodyTruthQuickActions } from "@/components/custody-truth-quick-actions";
import { GovernanceDashboard } from "@/components/governance-dashboard";
import { OnchainParityPanel } from "@/components/onchain-parity-panel";
import { GovernanceSessionPanel } from "@/components/governance-session-panel";
import { OperationalValidationPanels } from "@/components/operational-validation-panels";
import { PaymentsTruthStrip } from "@/components/payments-truth-strip";
import { PdaoTokenStrategyStrip } from "@/components/pdao-token-strategy-strip";
import { ProductActionMap } from "@/components/product-action-map";
import { TreasuryProfileQuickActions } from "@/components/treasury-profile-quick-actions";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getExecutionSurfaceSnapshot } from "@/lib/devnet-service-metrics";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Track Activity",
  description:
    "Track proposals, treasury movement, vote timelines, and execution evidence after any wallet action in PrivateDAO.",
  path: "/dashboard",
  keywords: ["track activity", "proposal state", "treasury activity", "execution evidence"],
});

const dashboardHighlights = [
  {
    title: "Wallet-first actions",
    description: "Proposal actions stay close to the signer flow instead of hiding behind docs or settings pages.",
    icon: WalletCards,
  },
  {
    title: "Proof-aware execution",
    description: "Execution posture and readiness stay visible beside governance state, not on a disconnected route.",
    icon: ShieldCheck,
  },
  {
    title: "Runtime visibility",
    description: "Diagnostics, evidence, and operational signals remain one click away from the governance board.",
    icon: Radar,
  },
];

export default function DashboardPage() {
  const executionSnapshot = getExecutionSurfaceSnapshot();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="space-y-8">
        <div className="flex flex-wrap gap-3">
          <Badge variant="cyan">Track Activity</Badge>
          <Badge variant="violet">Treasury + proposals</Badge>
          <Badge variant="success">Live Devnet state</Badge>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <div className="text-[11px] uppercase tracking-[0.34em] text-emerald-300/80">Activity view</div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.045em] text-white sm:text-5xl lg:text-[4rem]">
              Track proposals, treasury state, and execution results without leaving the product.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-white/60 sm:text-lg">
              This route is for checking what happened after a wallet action. Open it when you want to confirm a proposal, inspect treasury posture, or follow execution and logs in one readable place.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link className={buttonVariants({ size: "lg" })} href="/govern">
                Open govern flow
              </Link>
              <Link className={buttonVariants({ size: "lg", variant: "secondary" })} href="/proof/?judge=1">
                Open proof
              </Link>
              <Link className={buttonVariants({ size: "lg", variant: "outline" })} href="/diagnostics">
                Open health
              </Link>
            </div>
          </div>

          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,15,30,0.94),rgba(6,9,20,0.98))]">
            <CardHeader>
              <CardTitle>What this view is for</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {dashboardHighlights.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[18px] border border-white/10 bg-black/20 text-cyan-200">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-base font-medium text-white">{item.title}</div>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-white/58">{item.description}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-10">
        <PaymentsTruthStrip context="dashboard" />
      </section>

      <section className="mt-10">
        <PdaoTokenStrategyStrip context="dashboard" />
      </section>

      <section className="mt-10">
        <CustodyTruthQuickActions
          title="Custody truth quick actions"
          description="Open the exact custody truth surfaces directly from the dashboard: reviewer packet, canonical proof, strict intake shape, and the apply route."
        />
      </section>

      <section className="mt-10">
        <CustodyReadinessStrip context="dashboard" />
      </section>

      <section className="mt-12">
        <OperationalValidationPanels title="Dashboard operating health" />
      </section>

      <section className="mt-12">
        <ExecutionSurfaceInline mode="proposal" snapshot={executionSnapshot} />
      </section>

      <section className="mt-12">
        <OnchainParityPanel
          action="execute_proposal"
          title="Execution parity"
          compact
        />
      </section>

      <section className="mt-12">
        <GovernanceSessionPanel title="Live session carried from start and govern" />
      </section>

      <section className="mt-12">
        <Suspense fallback={<div className="rounded-3xl border border-white/8 bg-white/4 p-6 text-sm text-white/60">Loading treasury routes…</div>}>
          <TreasuryProfileQuickActions title="Commercial actions from the dashboard" />
        </Suspense>
      </section>

      <section className="mt-12">
        <ProductActionMap
          title="What the UI owns"
          description="Dashboard is part of the public product surface. It is responsible for execution visibility, logs, and diagnostics, while repo-only tools remain outside the buyer-facing runtime."
        />
      </section>

      <section className="mt-12">
        <GovernanceDashboard />
      </section>

      <section className="mt-8 flex flex-wrap justify-end gap-3">
        <Link className={cn(buttonVariants({ size: "sm", variant: "secondary" }))} href="/services">
          Open services
        </Link>
        <Link className={cn(buttonVariants({ size: "sm", variant: "outline" }))} href="/tracks">
          Open competition center
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </main>
  );
}
