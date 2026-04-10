import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, Cpu, ShieldCheck, Target } from "lucide-react";

import type { CompetitionTrackWorkspace } from "@/lib/site-data";
import { getSubmissionCoachPlan } from "@/lib/submission-coach";
import { getTrackCommercializationPlan } from "@/lib/track-commercialization";
import { getTrackMainnetGatePlan } from "@/lib/track-mainnet-gates";
import { getTrackTechnicalFit } from "@/lib/technical-eligibility";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TrackAlignmentPanelProps = {
  workspace: CompetitionTrackWorkspace;
};

export function TrackAlignmentPanel({ workspace }: TrackAlignmentPanelProps) {
  const coach = getSubmissionCoachPlan(workspace);
  const technical = getTrackTechnicalFit(workspace.slug);
  const commercial = getTrackCommercializationPlan(workspace);
  const mainnet = getTrackMainnetGatePlan(workspace);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Track alignment at a glance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-cyan-300/16 bg-cyan-300/[0.08] p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-cyan-100/76">
              <Target className="h-3.5 w-3.5" />
              Sponsor evidence
            </div>
            <div className="mt-3 text-sm font-medium text-white">
              {technical.sponsorEvidence[0]?.sponsor ?? workspace.sponsor}
            </div>
            <div className="mt-2 text-sm leading-7 text-white/72">
              {technical.sponsorEvidence[0]?.detail ?? technical.sponsorUsage[0]}
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-emerald-300/76">
              <Cpu className="h-3.5 w-3.5" />
              Strongest technical proof
            </div>
            <div className="mt-3 text-sm leading-7 text-white/72">
              {technical.sponsorUsage[0]}
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-emerald-300/76">
              <BriefcaseBusiness className="h-3.5 w-3.5" />
              Fastest paid motion
            </div>
            <div className="mt-3 text-sm leading-7 text-white/72">
              {commercial.firstPaidMotion}
            </div>
          </div>

          <div className="rounded-3xl border border-amber-300/16 bg-amber-300/8 p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-amber-100/76">
              <ShieldCheck className="h-3.5 w-3.5" />
              Top mainnet gate
            </div>
            <div className="mt-3 text-sm leading-7 text-white/74">
              {mainnet.beforeMainnet[0]}
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Link className={cn(buttonVariants({ size: "sm" }))} href={workspace.proofRoute}>
            Proof
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <Link className={cn(buttonVariants({ size: "sm", variant: "secondary" }))} href={workspace.judgeRoute}>
            Review
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <Link className={cn(buttonVariants({ size: "sm", variant: "outline" }))} href="/documents/trust-package">
            Trust
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <Link className={cn(buttonVariants({ size: "sm", variant: "outline" }))} href="/engage">
            Engage
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="rounded-3xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/66">
          Readiness {coach.readinessScore} ({coach.readinessBand}). Next fastest improvement: {coach.nextFastestImprovement}
        </div>
      </CardContent>
    </Card>
  );
}
