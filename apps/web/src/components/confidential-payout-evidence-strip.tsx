import Link from "next/link";
import { ArrowUpRight, LockKeyhole, ShieldCheck, WalletCards } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ConfidentialPayoutEvidenceStrip() {
  return (
    <Card className="border-emerald-300/16 bg-[linear-gradient(180deg,rgba(10,22,21,0.94),rgba(8,14,16,0.98))]">
      <CardHeader className="space-y-3">
        <div className="text-[11px] uppercase tracking-[0.3em] text-emerald-200/80">Confidential payout corridor</div>
        <CardTitle className="text-2xl">Private payout is now packaged as a reviewer-safe service lane</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-emerald-100">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <div className="mt-4 text-lg font-medium text-white">What it proves</div>
            <div className="mt-3 text-sm leading-7 text-white/60">
              PrivateDAO can already connect private governance to confidential payout rehearsal, grant releases, and payroll-style treasury motions on Devnet.
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-cyan-100">
              <WalletCards className="h-5 w-5" />
            </div>
            <div className="mt-4 text-lg font-medium text-white">Why judges care</div>
            <div className="mt-3 text-sm leading-7 text-white/60">
              Umbra and Encrypt reviewers need a practical payout workflow, not generic privacy language. This packet ties treasury motions to governance, trust, and payout review.
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-amber-100">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="mt-4 text-lg font-medium text-white">Boundary</div>
            <div className="mt-3 text-sm leading-7 text-white/60">
              This is Devnet and evidence-backed. It is not a real-funds mainnet claim until audit, custody, and settlement-receipt blockers are closed.
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Link href="/documents/confidential-payout-evidence-packet" className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}>
            Open payout packet
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/documents/grant-committee-pack" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Open grant committee pack
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/services" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Open services
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/trust" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Open trust
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
