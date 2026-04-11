import type { Metadata } from "next";

import { CanonicalCustodyProofSurface } from "@/components/canonical-custody-proof-surface";
import { CustodyWorkspace } from "@/components/custody-workspace";
import { MetricsStrip } from "@/components/metrics-strip";
import { OperationsShell } from "@/components/operations-shell";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Custody Workspace",
  description:
    "Live execution surface for multisig creation, authority transfer, and evidence capture before any mainnet custody claims.",
  path: "/custody",
  keywords: ["custody workspace", "multisig", "authority transfer", "mainnet launch"],
});

export default function CustodyPage() {
  return (
    <OperationsShell
      eyebrow="Custody Workspace"
      title="Multisig and authority transfer are now an explicit launch workflow"
      description="This route turns the custody story into a live operating surface. It keeps the signer split, transfer sequence, and evidence checklist visible without pretending the external ceremony has already happened."
      badges={[
        { label: "Custody", variant: "warning" },
        { label: "Multisig", variant: "cyan" },
        { label: "Authority transfer", variant: "success" },
      ]}
    >
      <div>
        <MetricsStrip />
      </div>
      <div>
        <CanonicalCustodyProofSurface />
      </div>
      <div>
        <CustodyWorkspace />
      </div>
    </OperationsShell>
  );
}
