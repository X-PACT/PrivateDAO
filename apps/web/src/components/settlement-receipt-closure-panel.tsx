import Link from "next/link";
import { AlertTriangle, ArrowUpRight, FileCheck2, LockKeyhole, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getSettlementReceiptClosureSnapshot } from "@/lib/operational-closure-corridors";
import { cn } from "@/lib/utils";

export function SettlementReceiptClosurePanel() {
  const snapshot = getSettlementReceiptClosureSnapshot();

  return (
    <Card className="border-fuchsia-300/16 bg-[linear-gradient(180deg,rgba(18,12,26,0.96),rgba(10,10,18,0.99))]">
      <CardHeader className="space-y-3">
        <div className="text-[11px] uppercase tracking-[0.3em] text-fuchsia-200/78">Settlement receipt closure</div>
        <CardTitle className="text-2xl">The exact privacy-settlement blocker that still separates Devnet evidence from believable mainnet payout posture</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-fuchsia-200/78">
              <LockKeyhole className="h-4 w-4" />
              Blocker status
            </div>
            <div className="mt-3 text-lg font-medium text-white">{snapshot.blockerStatus}</div>
            <div className="mt-3 text-sm leading-7 text-white/60">
              Severity: {snapshot.severity}. Owner: {snapshot.blockerOwner}.
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-amber-200/78">
              <AlertTriangle className="h-4 w-4" />
              Exact next action
            </div>
            <div className="mt-3 text-sm leading-7 text-white/68">{snapshot.blockerNextAction}</div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-emerald-200/78">
              <FileCheck2 className="h-4 w-4" />
              Why funders care
            </div>
            <div className="mt-3 text-sm leading-7 text-white/68">
              This is a bounded integration closure that upgrades privacy demos into a reviewer-safe payment corridor with stronger commercial credibility.
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/48">Current truth</div>
            <div className="mt-3 grid gap-2 text-sm leading-7 text-white/62">
              {snapshot.currentTruth.map((item) => (
                <div key={item}>{item}</div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/48">Required closure</div>
            <div className="mt-3 grid gap-2 text-sm leading-7 text-white/62">
              {snapshot.requiredClosure.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                  <div className="text-white/82">{item.label}</div>
                  <div className="text-white/52">{item.status} · {item.evidence}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-cyan-300/14 bg-cyan-300/[0.06] p-5 text-sm leading-7 text-white/64">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-cyan-200/78">
            <ShieldCheck className="h-4 w-4" />
            Evidence path
          </div>
          <div className="mt-3 grid gap-2">
            {snapshot.evidencePaths.map((item) => (
              <div key={item}>{item}</div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <Link href="/documents/settlement-receipt-closure-packet" className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}>
            Receipt closure packet
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/documents/confidential-payout-evidence-packet" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Payout evidence
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/documents/canonical-verifier-boundary-decision" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Verifier boundary
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/documents/mainnet-blockers" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Mainnet blockers
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/security" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Security route
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/services#payout-route-selection" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Payout route
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
