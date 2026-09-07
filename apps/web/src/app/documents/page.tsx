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
  "agentic-treasury-micropayment-rail",
  "canonical-custody-proof",
  "custody-proof-reviewer-packet",
  "treasury-reviewer-packet",
  "launch-trust-packet",
];

export const metadata: Metadata = buildRouteMetadata({
  title: "Curated Documents",
  description:
    "Curated trust, verification, and launch documents available inside the product documentation surface for fast verification and deeper technical review.",
  path: "/documents",
  keywords: ["documents", "trust package", "verification packet", "audit packet"],
});

export default function DocumentsPage() {
  const documents = getIndexableCuratedDocuments();
  const priorityTruthSurfaces = getCuratedDocumentsBySlugs(PRIORITY_TRUTH_SURFACE_SLUGS);
  const prioritySlugs = new Set(priorityTruthSurfaces.map((document) => document.slug));
  const remainingDocuments = documents.filter((document) => !prioritySlugs.has(document.slug));

  return (
    <OperationsShell
      eyebrow="Document library"
      title="Trust, verification, and launch documents inside the product documentation surface"
      description="This is the curated document layer for the highest-value trust and verification surfaces. It behaves like a real product documentation center while keeping source files one click away."
      badges={[
        { label: "Documents", variant: "cyan" },
        { label: "Curated in-app library", variant: "violet" },
        { label: "Source file included", variant: "success" },
      ]}
    >
      <div>
        <ReviewerTelemetryTruthStrip
          title="Telemetry fast path"
          description="Surface freshness, indexed proposal scale, finalized governance and confidential counts, and the direct telemetry packet route before the rest of the document center."
        />
      </div>
      <div>
        <CustodyTruthQuickActions
          title="Custody truth quick actions"
          description="Operator fast path into the custody truth surfaces: custody packet, canonical proof, intake shape, and the product application route."
        />
      </div>
      <div>
        <TreasuryReviewerGradeStrip
          context="documents"
          description="Open the treasury story as one operator-grade packet from the document center: sender checklist, linked rails, truth surfaces, payments fit, and release-readiness visibility."
        />
      </div>
      <div>
        <PdaoTokenStrategyStrip context="documents" />
      </div>
      <div>
        <DataCorridorQuickLinks
          title="Telemetry fast path"
          description="Open the telemetry packet, diagnostics, analytics, and hosted-read proof directly from the document center when you are validating runtime, RPC, or data-side readiness."
        />
      </div>
      <div>
        <ReadNodeHostReadinessStrip context="documents" />
      </div>
      <div>
        <EcosystemFocusAlignmentStrip
          title="Ecosystem focus alignment for grants and partners"
          description="Use this packet layer when a partner wants to see how PrivateDAO maps to decentralisation, censorship resistance, DAO tooling, education, developer tooling, payments, and selective cause-driven use cases."
        />
      </div>
      <div className="rounded-3xl border border-cyan-300/16 bg-cyan-300/[0.05] p-5">
        <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/78">Fast path strip</div>
        <div className="mt-3 max-w-3xl text-sm leading-7 text-white/60">
          Start from `/documents` and reach operating truth, treasury rails, the right packet, and the strongest product route in two clicks instead of scanning the full library.
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Link href="/documents/agentic-treasury-micropayment-rail" className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}>
            Open micropayment rail
          </Link>
          <Link href="/documents/payments-reviewer-fast-path" className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}>
            Open payments fast path
          </Link>
          <Link href="/documents/privacy-and-encryption-proof-guide" className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}>
            Open privacy proof guide
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
          The fast path here now includes a payments verification lane explicitly: treasury packet, canonical custody proof, services payments rail, and command-center payout path stay one layer away instead of being reconstructed from separate results.
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
            Open these documents first if you entered from `/documents`. They establish the operating truth first: the new agentic micropayment rail, canonical custody proof, the custody packet, the treasury packet, and the launch trust packet.
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
