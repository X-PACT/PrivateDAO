import Link from "next/link";
import { ArrowUpRight, FileCheck2, LockKeyhole, ReceiptText, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const receiptRows = [
  {
    title: "Governed payout lane",
    detail: "Treasury motion, payout selection, and commercial service routes are presented as governed execution, not ad-hoc transfers.",
    icon: LockKeyhole,
  },
  {
    title: "Proof-linked payout evidence",
    detail: "Confidential payout evidence, launch trust, and custody proof stay near the route so reviewers can inspect one corridor instead of three disconnected pages.",
    icon: ShieldCheck,
  },
  {
    title: "Receipt publication gap is explicit",
    detail: "The product now shows where settlement evidence exists and where source-verifiable receipt closure still remains before honest mainnet claims.",
    icon: ReceiptText,
  },
  {
    title: "Fundable next step",
    detail: "This is exactly the sort of corridor that grants can accelerate: better receipts, better runtime coverage, and tighter treasury proof publication.",
    icon: FileCheck2,
  },
] as const;

export function SettlementReceiptSurface() {
  return (
    <Card className="border-fuchsia-300/16 bg-[linear-gradient(180deg,rgba(18,12,26,0.96),rgba(10,10,18,0.99))]">
      <CardHeader className="space-y-3">
        <div className="text-[11px] uppercase tracking-[0.3em] text-fuchsia-200/78">Settlement receipt surface</div>
        <CardTitle className="text-2xl">How payout proof, receipts, and blockers connect in one route</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm leading-7 text-white/66">
          Privacy and payout reviewers should not have to guess where settlement confidence comes from. This surface connects the governed payout lane to evidence, trust, and the exact remaining receipt gap.
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {receiptRows.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-fuchsia-100">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-lg font-medium text-white">{item.title}</div>
                <div className="mt-3 text-sm leading-7 text-white/60">{item.detail}</div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <Link href="/documents/confidential-payout-evidence-packet" className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}>
            Payout evidence
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/custody" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Custody proof
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/documents/launch-trust-packet" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Launch trust
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/documents/mainnet-blockers" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Mainnet blockers
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
