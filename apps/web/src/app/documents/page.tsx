import type { Metadata } from "next";
import Link from "next/link";

import { CanonicalCustodyProofSurface } from "@/components/canonical-custody-proof-surface";
import { CustodyTruthQuickActions } from "@/components/custody-truth-quick-actions";
import { DataCorridorQuickLinks } from "@/components/data-corridor-quick-links";
import { DocumentLibrary } from "@/components/document-library";
import { CustodyTrustContinuity } from "@/components/custody-trust-continuity";
import { EcosystemFocusAlignmentStrip } from "@/components/ecosystem-focus-alignment-strip";
import { OperationsShell } from "@/components/operations-shell";
import { PdaoTokenStrategyStrip } from "@/components/pdao-token-strategy-strip";
import { ReadNodeHostReadinessStrip } from "@/components/read-node-host-readiness-strip";
import { ReviewerTelemetryTruthStrip } from "@/components/reviewer-telemetry-truth-strip";
import { TreasuryReviewerGradeStrip } from "@/components/treasury-reviewer-grade-strip";
import { getCuratedDocumentsBySlugs, getIndexableCuratedDocuments } from "@/lib/curated-documents";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PRIORITY_TRUTH_SURFACE_SLUGS = [
  "canonical-custody-proof",
  "custody-proof-reviewer-packet",
  "treasury-reviewer-packet",
  "launch-trust-packet",
];

export const metadata: Metadata = buildRouteMetadata({
  title: "Curated Documents",
  description:
    "Curated reviewer, trust, and launch documents available inside the Next.js surface without claiming full docs-viewer parity yet.",
  path: "/documents",
  keywords: ["documents", "reviewer docs", "trust package", "audit packet"],
});

export default function DocumentsPage() {
  const documents = getIndexableCuratedDocuments();
  const priorityTruthSurfaces = getCuratedDocumentsBySlugs(PRIORITY_TRUTH_SURFACE_SLUGS);
  const prioritySlugs = new Set(priorityTruthSurfaces.map((document) => document.slug));
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
        <ReviewerTelemetryTruthStrip
          title="Reviewer telemetry fast path"
          description="Surface freshness, indexed proposal scale, finalized governance and confidential counts, and the direct telemetry packet route before the rest of the document center."
        />
      </div>
      <div>
        <CustodyTruthQuickActions
          title="Custody truth quick actions"
          description="Reviewer and operator fast path into the custody truth surfaces: reviewer packet, canonical proof, intake shape, and the strict apply route."
        />
      </div>
      <div>
        <TreasuryReviewerGradeStrip
          context="documents"
          description="Open the treasury story as one reviewer-grade packet from the document center: strict sender checklist, linked rails, truth surfaces, payments fit, and exact blocker visibility."
        />
      </div>
      <div>
        <PdaoTokenStrategyStrip context="documents" />
      </div>
      <div>
        <DataCorridorQuickLinks
          title="Telemetry reviewer fast path"
          description="Open the telemetry packet, diagnostics, analytics, and hosted-read proof directly from the document center when the reviewer is validating runtime, RPC, or data-side readiness."
        />
      </div>
      <div>
        <ReadNodeHostReadinessStrip context="documents" />
      </div>
      <div>
        <EcosystemFocusAlignmentStrip
          title="Ecosystem focus alignment for grant and partner reviewers"
          description="Use this packet layer when the reviewer wants to see how PrivateDAO maps to decentralisation, censorship resistance, DAO tooling, education, developer tooling, payments, and selective cause-driven use cases."
        />
      </div>
      <div className="rounded-3xl border border-cyan-300/16 bg-cyan-300/[0.05] p-5">
        <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/78">Reviewer fast path strip</div>
        <div className="mt-3 max-w-3xl text-sm leading-7 text-white/60">
          Start from `/documents` and reach operating truth, treasury rails, the correct reviewer packet, and the shortest demo route in two clicks instead of scanning the full library.
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Link href="/documents/payments-reviewer-fast-path" className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}>
            Open payments fast path
          </Link>
          <Link href="/documents/canonical-custody-proof" className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}>
            Open truth
          </Link>
          <Link href="/documents/treasury-reviewer-packet" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Open treasury packet
          </Link>
          <Link href="/documents/reviewer-fast-path" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Open fast path
          </Link>
          <Link href="/learn" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Open plain-language guide
          </Link>
        </div>
        <div className="mt-4 text-sm leading-7 text-white/56">
          Reviewer truth here now includes a payments reviewer fast path explicitly: treasury packet, canonical custody proof, services payments rail, and command-center payout path stay one layer away instead of being reconstructed from separate results.
        </div>
      </div>
      <div>
        <CanonicalCustodyProofSurface mode="documents" />
      </div>
      <div>
        <CustodyTrustContinuity mode="documents" />
      </div>
      <div id="priority-truth-surfaces">
        <div className="mb-5">
          <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/76">Priority truth surfaces</div>
          <div className="mt-3 max-w-3xl text-sm leading-7 text-white/60">
            Open these documents first if the reviewer entered from `/documents`. They establish the operating truth first: canonical custody proof, the reviewer-safe custody packet, the treasury reviewer packet, and the launch trust packet.
          </div>
        </div>
        <DocumentLibrary documents={priorityTruthSurfaces} />
      </div>
      <div>
        <div className="mb-5">
          <div className="text-[11px] uppercase tracking-[0.3em] text-white/46">Public document set</div>
          <div className="mt-3 max-w-3xl text-sm leading-7 text-white/56">
            The public document center stays focused on the highest-value trust, proof, runtime, and funding packets so search engines and first-time visitors land on the clearest evidence first.
          </div>
        </div>
        <DocumentLibrary documents={remainingDocuments} />
      </div>
    </OperationsShell>
  );
}
