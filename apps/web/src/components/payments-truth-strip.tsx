import Link from "next/link";
import {
  ArrowRight,
  BanknoteArrowDown,
  Landmark,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getTreasuryReviewerTruthSnapshot,
  type TreasuryReviewerTruthContext,
} from "@/lib/treasury-reviewer-truth";
import { cn } from "@/lib/utils";

type PaymentsTruthStripProps = {
  context: TreasuryReviewerTruthContext;
};

const statMeta = [
  {
    key: "paymentsReadiness",
    label: "Payments readiness",
    icon: BanknoteArrowDown,
  },
  {
    key: "treasuryNetwork",
    label: "Treasury network",
    icon: Landmark,
  },
  {
    key: "publicRails",
    label: "Public rails",
    icon: WalletCards,
  },
  {
    key: "paymentsFit",
    label: "Payments fit",
    icon: ShieldCheck,
  },
] as const;

export function PaymentsTruthStrip({ context }: PaymentsTruthStripProps) {
  const snapshot = getTreasuryReviewerTruthSnapshot(context);

  return (
    <Card className="border-emerald-300/14 bg-[linear-gradient(180deg,rgba(8,18,25,0.96),rgba(7,12,20,0.98))]">
      <CardHeader className="gap-3">
        <div className="text-[11px] uppercase tracking-[0.3em] text-emerald-200/80">
          Payments truth
        </div>
        <CardTitle>{snapshot.title}</CardTitle>
        <div className="max-w-4xl text-sm leading-7 text-white/58">{snapshot.description}</div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {statMeta.map((item) => {
            const Icon = item.icon;
            const value = snapshot[item.key];

            return (
              <div
                key={item.key}
                className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4"
              >
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/42">
                  <Icon className="h-3.5 w-3.5 text-emerald-200/78" />
                  {item.label}
                </div>
                <div className="mt-3 text-lg font-semibold tracking-tight text-white">
                  {value}
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
          <div className="text-[11px] uppercase tracking-[0.24em] text-white/42">
            Exact blocker
          </div>
          <div className="mt-3 text-base font-semibold tracking-tight text-white">
            {snapshot.exactBlocker}
          </div>
          <div className="mt-2 text-sm leading-7 text-white/56">{snapshot.exactBlockerSummary}</div>
          <div className="mt-2 text-sm leading-7 text-white/42">{snapshot.pendingCount}</div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href={snapshot.reviewerPacketHref}
            className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}
          >
            {snapshot.reviewerPacketLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={snapshot.proofHref}
            className={cn(buttonVariants({ variant: "outline" }), "justify-between")}
          >
            {snapshot.proofLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={snapshot.bestDemoRouteHref}
            className={cn(buttonVariants({ variant: "outline" }), "justify-between")}
          >
            {snapshot.bestDemoRouteLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
