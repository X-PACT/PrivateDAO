import type { Metadata } from "next";

import { CanonicalCustodyProofSurface } from "@/components/canonical-custody-proof-surface";
import { CustodyTruthQuickActions } from "@/components/custody-truth-quick-actions";
import { DocumentLibrary } from "@/components/document-library";
import { CustodyTrustContinuity } from "@/components/custody-trust-continuity";
import { OperationsShell } from "@/components/operations-shell";
import { getCuratedDocuments, getCuratedDocumentsBySlugs } from "@/lib/curated-documents";
import { buildRouteMetadata } from "@/lib/route-metadata";

const PRIORITY_TRUTH_SURFACE_SLUGS = [
  "canonical-custody-proof",
  "custody-proof-reviewer-packet",
  "launch-trust-packet",
];

const TRACK_REVIEWER_PACKET_SLUGS = [
  "track-reviewer-packet-colosseum-frontier",
  "track-reviewer-packet-privacy-track",
  "track-reviewer-packet-rpc-infrastructure",
];

export const metadata: Metadata = buildRouteMetadata({
  title: "Curated Documents",
  description:
    "Curated reviewer, trust, and launch documents available inside the Next.js surface without claiming full docs-viewer parity yet.",
  path: "/documents",
  keywords: ["documents", "reviewer docs", "trust package", "audit packet"],
});

export default function DocumentsPage() {
  const documents = getCuratedDocuments();
  const priorityTruthSurfaces = getCuratedDocumentsBySlugs(PRIORITY_TRUTH_SURFACE_SLUGS);
  const trackReviewerPackets = getCuratedDocumentsBySlugs(TRACK_REVIEWER_PACKET_SLUGS);
  const prioritySlugs = new Set(
    [...priorityTruthSurfaces, ...trackReviewerPackets].map((document) => document.slug),
  );
  const remainingDocuments = documents.filter((document) => !prioritySlugs.has(document.slug));

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
        <div className="mb-5">
          <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/76">Priority truth surfaces</div>
          <div className="mt-3 max-w-3xl text-sm leading-7 text-white/60">
            Open these three documents first if the reviewer entered from `/documents`. They establish the operating truth first: canonical custody proof, the reviewer-safe custody packet, and the launch trust packet.
          </div>
        </div>
        <DocumentLibrary documents={priorityTruthSurfaces} />
      </div>
      <div>
        <div className="mb-5">
          <div className="text-[11px] uppercase tracking-[0.3em] text-violet-200/76">Track reviewer packets</div>
          <div className="mt-3 max-w-3xl text-sm leading-7 text-white/60">
            After the truth surfaces, open the three priority track packets for the judge-first summary of Frontier, Privacy, and RPC Infrastructure.
          </div>
        </div>
        <DocumentLibrary documents={trackReviewerPackets} />
      </div>
      <div>
        <div className="mb-5">
          <div className="text-[11px] uppercase tracking-[0.3em] text-white/46">All curated documents</div>
          <div className="mt-3 max-w-3xl text-sm leading-7 text-white/56">
            The rest of the document center stays below as the broader proof, trust, launch, strategy, and reviewer library.
          </div>
        </div>
        <DocumentLibrary documents={remainingDocuments} />
      </div>
    </OperationsShell>
  );
}
