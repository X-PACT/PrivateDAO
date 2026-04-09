import { ShieldCheck, Sparkles, WalletCards } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { daoSummary } from "@/lib/site-data";

export function DaoCard() {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-300/80">DAO Card</div>
            <CardTitle className="mt-2">{daoSummary.name}</CardTitle>
            <CardDescription>{daoSummary.network}</CardDescription>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/6 p-3 text-emerald-200">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
          <div className="text-[11px] uppercase tracking-[0.28em] text-white/45">Treasury</div>
          <div className="mt-2 text-2xl font-semibold text-white">{daoSummary.treasuryValue}</div>
          <div className="mt-2 flex items-center gap-2 text-sm text-white/55">
            <WalletCards className="h-4 w-4 text-cyan-300" />
            Timelocked treasury with policy-aware execution rails
          </div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
          <div className="text-[11px] uppercase tracking-[0.28em] text-white/45">Members</div>
          <div className="mt-2 text-2xl font-semibold text-white">{daoSummary.activeMembers}</div>
          <div className="mt-2 flex items-center gap-2 text-sm text-white/55">
            <Sparkles className="h-4 w-4 text-fuchsia-300" />
            {daoSummary.livePolicies}
          </div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/4 p-4 sm:col-span-2">
          <div className="text-[11px] uppercase tracking-[0.28em] text-white/45">Reviewer State</div>
          <div className="mt-2 text-base leading-7 text-white/75">{daoSummary.reviewerState}</div>
        </div>
      </CardContent>
    </Card>
  );
}
