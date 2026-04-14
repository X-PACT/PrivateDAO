import type { Metadata } from "next";
import { Suspense } from "react";

import { GettingStartedWorkspace } from "@/components/getting-started-workspace";
import { GovernanceSessionPanel } from "@/components/governance-session-panel";
import { InfrastructureStartupProofStrip } from "@/components/infrastructure-startup-proof-strip";
import { OperatingBoundaryPanel } from "@/components/operating-boundary-panel";
import { OperationsShell } from "@/components/operations-shell";
import { ProductActionMap } from "@/components/product-action-map";
import { ProductServiceMap } from "@/components/product-service-map";
import { SponsorSignalBar } from "@/components/sponsor-signal-bar";
import { TreasuryProfileQuickActions } from "@/components/treasury-profile-quick-actions";
import { WalletFirstServiceActionsStrip } from "@/components/wallet-first-service-actions-strip";
import { getExecutionSurfaceSnapshot } from "@/lib/devnet-service-metrics";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Get Started",
  description:
    "The easiest first-run path into PrivateDAO: connect a wallet, create a DAO, submit a proposal, and move through the live Devnet flow.",
  path: "/start",
  keywords: ["getting started", "wallet onboarding", "consumer path", "service corridor"],
});

export default function StartPage() {
  const executionSnapshot = getExecutionSurfaceSnapshot();

  return (
    <OperationsShell
      eyebrow="Quick start"
      title="Connect a wallet and start the full Devnet flow without learning the product architecture first"
      description="This page is the easy on-ramp. It explains what PrivateDAO lets you do, points to the exact first action, and keeps deeper proof and trust surfaces one layer away."
      navigationMode="guided"
      badges={[
        { label: "Consumer-first shell", variant: "success" },
        { label: "Wallet-ready", variant: "cyan" },
        { label: "Proof still connected", variant: "violet" },
      ]}
    >
      <GettingStartedWorkspace executionSnapshot={executionSnapshot} />
      <ProductActionMap
        title="Use the app in this order"
        description="This map keeps the first run simple: start, govern, track the result, then inspect trust or API only when you need more depth."
      />
      <GovernanceSessionPanel title="Current session in the app" />
      <WalletFirstServiceActionsStrip context="start" />
      <InfrastructureStartupProofStrip route="start" />
      <SponsorSignalBar />
      <OperatingBoundaryPanel
        title="What stays inside the product"
        summary="The public UI is for wallet connection, DAO creation, proposal flow, voting, execution, logs, and diagnostics. Debugging, migrations, batch operations, and recovery stay in the engineering layer."
      />
      <ProductServiceMap
        compact
        title="PrivateDAO service map"
        description="Use this map if you are deciding where to go next: start the live flow, track the result, or inspect API and trust without learning internal route names."
      />
      <Suspense fallback={<div className="rounded-3xl border border-white/8 bg-white/4 p-6 text-sm text-white/60">Loading treasury routes…</div>}>
        <TreasuryProfileQuickActions title="Commercial treasury actions" />
      </Suspense>
    </OperationsShell>
  );
}
