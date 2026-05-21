import type { Metadata } from "next";

import { EncryptIkaDesktopProofWorkbench } from "@/components/encrypt-ika-desktop-proof-workbench";
import { OperationStateLegend } from "@/components/operation-state-legend";
import { OperationsShell } from "@/components/operations-shell";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Encrypted Capital Markets Proof",
  description:
    "Reviewer-visible proof route for browser encryption, REFHE receipts, Ika readiness, and Solana pre-alpha approval intent boundaries.",
  path: "/proof/encrypted-capital-markets",
  keywords: ["encrypted capital markets", "encrypt", "ika", "2pc-mpc", "refhe", "confidential payroll"],
});

export default function EncryptedCapitalMarketsProofPage() {
  return (
    <OperationsShell
      eyebrow="Encrypted capital markets proof"
      title="Encrypt / Ika / 2PC-MPC / REFHE proof for confidential organizational finance"
      description="A reviewer-visible verification path that separates live execution, readiness checks, intent receipts, and private settlement lanes with clear proof signals."
      badges={[
        { label: "Encrypted finance", variant: "cyan" },
        { label: "Ika readiness", variant: "violet" },
        { label: "REFHE receipt", variant: "success" },
      ]}
    >
      <OperationStateLegend description="This route is intentionally strict: readiness, intent, receipt, and full settlement are separate states so judges can inspect proof continuity without confusing it with private settlement completion." />
      <EncryptIkaDesktopProofWorkbench />
    </OperationsShell>
  );
}
