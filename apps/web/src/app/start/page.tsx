import type { Metadata } from "next";

import { GettingStartedWorkspace } from "@/components/getting-started-workspace";
import { ExecutionSpineSurface } from "@/components/execution-spine-surface";
import { LocalizedStartGuidanceSurface } from "@/components/localized-start-guidance-surface";
import { LocalizedRouteSummary } from "@/components/localized-route-summary";
import { NormalUserOperationPath } from "@/components/normal-user-operation-path";
import { OperationsShell } from "@/components/operations-shell";
import { PrivacyPolicySelector } from "@/components/privacy-policy-selector";
import { getExecutionSurfaceSnapshot } from "@/lib/devnet-service-metrics";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Get Started",
  description:
    "The easiest first-run path into PrivateDAO: connect a wallet, create a DAO, submit a proposal, and move through the live Testnet flow.",
  path: "/start",
  keywords: ["getting started", "wallet onboarding", "consumer path", "service corridor"],
});

export default function StartPage() {
  const executionSnapshot = getExecutionSurfaceSnapshot();

  return (
    <OperationsShell
      eyebrow="Quick start"
      title="Connect a wallet and start the full Testnet flow without learning the product architecture first"
      description="This page is the easy on-ramp. Connect a Testnet wallet, run the real governance flow yourself, and keep proof and trust surfaces one layer away when you want to inspect how the product stays private, fast, and verifiable. The goal is simple: a normal user can complete the flow, then open the blockchain evidence and understand what happened."
      navigationMode="guided"
      badges={[
        { label: "Consumer-first shell", variant: "success" },
        { label: "Wallet-ready", variant: "cyan" },
        { label: "Proof still connected", variant: "violet" },
      ]}
    >
      <LocalizedRouteSummary routeKey="start" />
      <NormalUserOperationPath />
      <ExecutionSpineSurface context="start" />
      <GettingStartedWorkspace executionSnapshot={executionSnapshot} />
      <PrivacyPolicySelector compact />
      <LocalizedStartGuidanceSurface />
    </OperationsShell>
  );
}
