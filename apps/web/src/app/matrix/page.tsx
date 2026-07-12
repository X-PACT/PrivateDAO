import type { Metadata } from "next";
import Link from "next/link";

import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { getCuratedDocumentsBySlugs } from "@/lib/curated-documents";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Capability Matrix",
  description:
    "PrivateDAO capability matrix for proof workflows, private governance, treasury coordination, cryptography boundaries, privacy execution, and verification evidence.",
  path: "/matrix",
  keywords: ["PrivateDAO matrix", "capability matrix", "privacy execution matrix", "cryptographic matrix", "ZK matrix"],
});

const matrixDocs = getCuratedDocumentsBySlugs([
  "privacy-execution-matrix-2026-05-26",
  "cryptographic-onchain-matrix-2026-05-25",
  "mainnet-acceptance-matrix",
  "zk-capability-matrix",
  "frontier-track-closure-matrix-2026-05-25",
  "excellence-closure-matrix-2026-05-06",
]);

const productRows = [
  ["Proof Workflows", "Credit, underwriting, compliance, grant review, vendor approval, and audit workflows.", "/proof-workflows"],
  ["Private Governance", "Private rooms, votes, committees, DAO decisions, and verifiable outcomes.", "/govern"],
  ["Treasury Coordination", "Treasury requests, approval trails, token context, and audit-ready decision records.", "/treasury"],
] as const;

export default function MatrixPage() {
  return (
    <OperationsShell
      eyebrow="Capability Matrix"
      title="One map for what PrivateDAO sells, proves, and protects."
      description="The matrix route preserves the historical matrix surface while aligning it with the current commercial product: Proof Workflows, Private Governance, and Treasury Coordination."
      navigationMode="guided"
      badges={[]}
    >
      <section className="grid gap-4 lg:grid-cols-3">
        {productRows.map(([title, body, href]) => (
          <Link key={title} href={href} className="rounded-[24px] border border-cyan-300/16 bg-cyan-300/[0.055] p-5 transition hover:border-cyan-200/35">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-white/64">{body}</p>
          </Link>
        ))}
      </section>

      <section className="rounded-[28px] border border-emerald-300/16 bg-emerald-300/[0.06] p-5 sm:p-6">
        <div className="text-[11px] uppercase tracking-[0.25em] text-emerald-100/76">Core matrices</div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {matrixDocs.map((doc) => (
            <article key={doc.slug} className="rounded-2xl border border-white/10 bg-black/22 p-4">
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/36">{doc.category}</div>
              <h2 className="mt-2 text-base font-semibold text-white">{doc.title}</h2>
              <p className="mt-2 text-sm leading-6 text-white/62">{doc.summary}</p>
              <p className="mt-3 text-xs leading-5 text-white/42">{doc.boundary}</p>
              <Link href={`/documents/${doc.slug}`} className="mt-4 inline-flex text-sm font-semibold text-emerald-100 hover:text-white">
                Open matrix
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
        <h2 className="text-2xl font-semibold text-white">Buyer summary</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/64">
          The matrix is not the product. It is the trust layer behind the product. Buyers should start with a workflow,
          room, or treasury path, then use the matrix to inspect privacy boundaries, proof routes, and verification scope.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/pilots" className={cn(buttonVariants({ size: "sm" }))}>Request Pilot</Link>
          <Link href="/security" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>Security</Link>
          <Link href="/trust" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>Trust</Link>
        </div>
      </section>
    </OperationsShell>
  );
}
