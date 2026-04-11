import Link from "next/link";
import { ArrowUpRight, ShieldCheck, TimerReset, WalletCards } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getCanonicalCustodyProofSnapshot } from "@/lib/canonical-custody-proof";
import type { CompetitionTrackWorkspace } from "@/lib/site-data";
import { cn } from "@/lib/utils";

type TrackProofClosurePanelProps = {
  workspace: CompetitionTrackWorkspace;
};

const supportedTracks = new Set([
  "colosseum-frontier",
  "privacy-track",
  "rpc-infrastructure",
]);

function getTrackSpecificProofContext(workspace: CompetitionTrackWorkspace) {
  if (workspace.slug === "privacy-track") {
    return {
      externallyProven: [
        {
          label: "Live Proof V3",
          href: "/documents/live-proof-v3",
          summary: "Devnet proposal lifecycle, V3 hardening, and explorer-verifiable proof anchors are already documented.",
        },
        {
          label: "ZK capability matrix",
          href: "/documents/zk-capability-matrix",
          summary: "The repo already states what the privacy layer proves today and what remains outside the claim boundary.",
        },
      ],
      exactBlocker: "magicblock-refhe-source-receipts",
      exactBlockerSummary:
        "Privacy launch remains blocked until settlement receipts or verifier-grade source proof replace the current integration boundary.",
      pendingSummary:
        "Custody evidence is still required, and the signer or transfer packet can now be ingested through /custody in a strict repo-safe shape. The exact privacy-side blocker still remains the source-verifiable receipt path, not generic wording.",
    };
  }

  if (workspace.slug === "rpc-infrastructure") {
    return {
      externallyProven: [
        {
          label: "Diagnostics",
          href: "/diagnostics",
          summary: "Latency, success rate, wallet coverage, proof completion, and incident-facing diagnostics are already surfaced live.",
        },
        {
          label: "Frontier integrations",
          href: "/documents/frontier-integrations",
          summary: "Hosted-read and runtime evidence already prove the infrastructure story on Devnet with reviewer-facing artifacts.",
        },
      ],
      exactBlocker: "production-monitoring-alerts",
      exactBlockerSummary:
        "RPC and hosted-read mainnet claims remain blocked until live monitoring, alert delivery, and tested operator ownership are recorded.",
      pendingSummary:
        "Custody still matters for buyer trust, and the new /custody ingestion flow reduces operator drift when the real signer and transfer data arrives. The exact infrastructure blocker remains monitored operations, not generic product maturity.",
    };
  }

  return {
    externallyProven: [
      {
        label: "Proof center",
        href: "/proof",
        summary: "The full governance lifecycle, proof packets, and reviewer path are already visible inside the live product.",
      },
      {
        label: "Launch trust packet",
        href: "/documents/launch-trust-packet",
        summary: "The repo already binds launch truth, blockers, and buyer-safe trust wording into one explicit packet.",
      },
    ],
    exactBlocker: "upgrade-authority-multisig",
    exactBlockerSummary:
      "The startup-quality path remains blocked until production multisig, authority transfer signatures, and post-transfer readouts are recorded.",
    pendingSummary:
      "For the main submission, custody is not a side detail. It is the exact trust gate that separates a strong Devnet product from a real-funds launch claim, and the strict ingestion route now makes that ceremony packet reproducible instead of manual.",
  };
}

export function TrackProofClosurePanel({
  workspace,
}: TrackProofClosurePanelProps) {
  if (!supportedTracks.has(workspace.slug)) {
    return null;
  }

  const custody = getCanonicalCustodyProofSnapshot();
  const proofContext = getTrackSpecificProofContext(workspace);
  const topDeliverables = workspace.deliverables.slice(0, 3);
  const pendingItems = custody.pendingItems.slice(0, 4);

  return (
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.94),rgba(7,11,23,0.98))]">
      <CardHeader>
        <CardTitle>Track proof closure</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-2">
        <div className="grid gap-4">
          <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
            <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-300/78">
              What works now
            </div>
            <div className="mt-4 grid gap-2 text-sm leading-7 text-white/62">
              {topDeliverables.map((item) => (
                <div key={item}>{item}</div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-cyan-200/78">
              <ShieldCheck className="h-3.5 w-3.5" />
              What is externally proven
            </div>
            <div className="mt-4 grid gap-3">
              {proofContext.externallyProven.map((item) => (
                <div key={item.href} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-white">{item.label}</div>
                    <Link href={item.href} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                      Open
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <div className="mt-2 text-sm leading-7 text-white/58">{item.summary}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-3xl border border-amber-300/14 bg-amber-300/[0.06] p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-amber-200/78">
              <WalletCards className="h-3.5 w-3.5" />
              What is still pending
            </div>
            <div className="mt-3 text-sm leading-7 text-white/62">{proofContext.pendingSummary}</div>
            <div className="mt-4 grid gap-2 text-sm leading-7 text-white/58">
              {pendingItems.map((item) => (
                <div key={item}>{item}</div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-fuchsia-300/14 bg-fuchsia-300/[0.06] p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-fuchsia-200/78">
              <TimerReset className="h-3.5 w-3.5" />
              Exact mainnet blocker
            </div>
            <div className="mt-3 text-lg font-medium text-white">{proofContext.exactBlocker}</div>
            <div className="mt-2 text-sm leading-7 text-white/62">{proofContext.exactBlockerSummary}</div>
            <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/58">
              Canonical custody status: {custody.status}. Completion: {custody.completedItems}/{custody.totalItems}. Real-funds mainnet claim allowed: {custody.productionMainnetClaimAllowed ? "yes" : "no"}.
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/custody" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
                Open custody proof
              </Link>
              <Link href="/documents/multisig-setup-intake" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                Open intake shape
              </Link>
              <Link href="/documents/mainnet-blockers" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                Open blockers
              </Link>
              <Link href="/documents/launch-trust-packet" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                Open trust packet
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
