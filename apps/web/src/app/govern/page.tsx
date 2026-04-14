import type { Metadata } from "next";

import { GovernWorkbenchClient } from "@/components/govern/govern-workbench-client";
import { OperationsShell } from "@/components/operations-shell";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Govern",
  description:
    "Simple wallet-first governance flow for creating a DAO, creating proposals, voting, and executing on Devnet.",
  path: "/govern",
  keywords: ["govern", "create dao", "create proposal", "vote", "execute", "devnet governance"],
});

export default function GovernPage() {
  return (
    <OperationsShell
      eyebrow="Govern"
      title="Create a DAO, submit a proposal, vote, and execute from one simple flow"
      description="This route is the user-first governance path. It leads with the next action only, while logs, proof, and diagnostics stay available when you need them."
      badges={[
        { label: "Wallet-first", variant: "cyan" },
        { label: "Devnet", variant: "success" },
        { label: "User-first flow", variant: "violet" },
      ]}
    >
      <GovernWorkbenchClient />
    </OperationsShell>
  );
}
