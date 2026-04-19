import type { Metadata } from "next";

import { ExecutionSpineSurface } from "@/components/execution-spine-surface";
import { GovernWorkbenchClient } from "@/components/govern/govern-workbench-client";
import { LocalizedGovernIntroSurface } from "@/components/localized-govern-intro-surface";
import { NormalUserOperationPath } from "@/components/normal-user-operation-path";
import { OperationsShell } from "@/components/operations-shell";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Govern",
  description:
    "Simple wallet-first governance flow for creating a DAO, creating proposals, voting, and executing on Testnet.",
  path: "/govern",
  keywords: ["govern", "create dao", "create proposal", "vote", "execute", "testnet governance"],
  index: false,
});

export default function GovernPage() {
  return (
    <OperationsShell
      eyebrow="Govern"
      title="Create a DAO, submit a proposal, vote, and execute from one simple flow"
      description="This route is the user-first governance path. Connect a Testnet wallet, run the full DAO lifecycle yourself, and use logs, proof, and diagnostics when you want to inspect how the product keeps vote privacy, cryptographic boundaries, execution fairness, and RPC speed visible in practice."
      navigationMode="guided"
      badges={[
        { label: "Wallet-first", variant: "cyan" },
        { label: "Testnet", variant: "success" },
        { label: "User-first flow", variant: "violet" },
      ]}
    >
      <LocalizedGovernIntroSurface />
      <NormalUserOperationPath />
      <ExecutionSpineSurface context="govern" compact />
      <GovernWorkbenchClient />
    </OperationsShell>
  );
}
