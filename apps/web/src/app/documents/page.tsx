import type { Metadata } from "next";

import { CanonicalCustodyProofSurface } from "@/components/canonical-custody-proof-surface";
import { CustodyTruthQuickActions } from "@/components/custody-truth-quick-actions";
import { DocumentLibrary } from "@/components/document-library";
import { CustodyTrustContinuity } from "@/components/custody-trust-continuity";
import { OperationsShell } from "@/components/operations-shell";
import { getCuratedDocuments } from "@/lib/curated-documents";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Curated Documents",
  description:
    "Curated reviewer, trust, and launch documents available inside the Next.js surface without claiming full docs-viewer parity yet.",
  path: "/documents",
  keywords: ["documents", "reviewer docs", "trust package", "audit packet"],
});

export default function DocumentsPage() {
  const documents = getCuratedDocuments();

  return (
    <OperationsShell
      eyebrow="Document library"
      title="Reviewer, trust, and launch documents inside the Next.js surface"
      description="This is the curated in-app document layer for the highest-value reviewer and trust surfaces. It complements the raw viewer, but already behaves like a proper product documentation center."
      badges={[
        { label: "Documents", variant: "cyan" },
        { label: "Curated in-app library", variant: "violet" },
        { label: "Raw viewer included", variant: "warning" },
      ]}
    >
      <div>
        <CustodyTruthQuickActions
          title="Custody truth quick actions"
          description="Reviewer and operator fast path into the custody truth surfaces: reviewer packet, canonical proof, intake shape, and the strict apply route."
        />
      </div>
      <div>
        <CanonicalCustodyProofSurface mode="documents" />
      </div>
      <div>
        <CustodyTrustContinuity mode="documents" />
      </div>
      <div>
        <DocumentLibrary documents={documents} />
      </div>
    </OperationsShell>
  );
}
