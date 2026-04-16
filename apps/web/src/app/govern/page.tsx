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
  index: false,
});

export default function GovernPage() {
  return (
    <OperationsShell
      eyebrow="Govern"
      title="Create a DAO, submit a proposal, vote, and execute from one simple flow"
      description="This route is the user-first governance path. Connect a Devnet wallet, run the full DAO lifecycle yourself, and use logs, proof, and diagnostics only when you want to inspect how the product keeps privacy, cryptography, and speed visible in practice."
      navigationMode="guided"
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
