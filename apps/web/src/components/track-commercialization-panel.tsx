import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, Rocket, TrendingUp } from "lucide-react";

import type { CompetitionTrackWorkspace } from "@/lib/site-data";
import { getTrackCommercializationPlan } from "@/lib/track-commercialization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TrackCommercializationPanelProps = {
  workspace: CompetitionTrackWorkspace;
};

export function TrackCommercializationPanel({
  workspace,
}: TrackCommercializationPanelProps) {
  const plan = getTrackCommercializationPlan(workspace);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Commercial + mainnet trajectory</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-emerald-300/76">
              <BriefcaseBusiness className="h-3.5 w-3.5" />
              Buyer type
            </div>
            <div className="mt-3 text-sm leading-7 text-white/68">
              {plan.buyerType}
            </div>
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-cyan-200/76">
              <TrendingUp className="h-3.5 w-3.5" />
              Customer offer
            </div>
            <div className="mt-3 text-sm leading-7 text-white/68">
              {plan.customerOffer}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
          <div className="text-[11px] uppercase tracking-[0.28em] text-white/46">
            Commercial narrative
          </div>
          <div className="mt-3 text-sm leading-7 text-white/72">
            {plan.commercialNarrative}
          </div>
        </div>

        <div className="rounded-3xl border border-emerald-300/16 bg-emerald-300/8 p-4">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-emerald-100/76">
            <Rocket className="h-3.5 w-3.5" />
            First paid motion
          </div>
          <div className="mt-3 text-sm leading-7 text-white/74">
            {plan.firstPaidMotion}
          </div>
        </div>

        <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
          <div className="text-[11px] uppercase tracking-[0.28em] text-white/46">
            Mainnet upgrade path
          </div>
          <div className="mt-4 grid gap-3">
            {plan.mainnetUpgradePath.map((step, index) => (
              <div
                key={`${workspace.slug}-mainnet-${index}`}
                className="flex gap-3 rounded-2xl border border-white/8 bg-black/20 px-4 py-3"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-fuchsia-300/20 bg-fuchsia-300/10 text-xs font-medium text-fuchsia-100">
                  {index + 1}
                </div>
                <div className="text-sm leading-7 text-white/68">{step}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {plan.routes.map((route) => (
            <Link
              key={`${workspace.slug}-${route.href}`}
              className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
              href={route.href}
            >
              {route.label}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          ))}
          <Link
            className={cn(buttonVariants({ size: "sm" }), "sm:col-span-3")}
            href="/engage"
          >
            Open customer conversion route
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
