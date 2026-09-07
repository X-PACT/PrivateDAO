import Link from "next/link";
import { ArrowUpRight, Gauge, ListOrdered, TriangleAlert, WandSparkles } from "lucide-react";

import type { CompetitionTrackWorkspace } from "@/lib/site-data";
import { getSubmissionCoachPlan } from "@/lib/submission-coach";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SubmissionCoachPanelProps = {
  workspace: CompetitionTrackWorkspace;
};

function bandTone(band: "High" | "Strong" | "Medium") {
  if (band === "High") return "border-emerald-300/20 bg-emerald-300/10 text-emerald-100";
  if (band === "Strong") return "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";
  return "border-amber-300/20 bg-amber-300/10 text-amber-100";
}

export function SubmissionCoachPanel({ workspace }: SubmissionCoachPanelProps) {
  const plan = getSubmissionCoachPlan(workspace);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submission coach</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-cyan-200/76">
              <Gauge className="h-3.5 w-3.5" />
              Readiness score
            </div>
            <div className="mt-3 flex items-end gap-3">
              <div className="text-4xl font-semibold text-white">{plan.readinessScore}</div>
              <div className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.22em] ${bandTone(plan.readinessBand)}`}>
                {plan.readinessBand}
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-fuchsia-200/76">
              <WandSparkles className="h-3.5 w-3.5" />
              Next fastest improvement
            </div>
            <div className="mt-3 text-sm leading-7 text-white/68">{plan.nextFastestImprovement}</div>
          </div>
        </div>

        <div className="rounded-3xl border border-amber-300/16 bg-amber-300/8 p-4">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-amber-100/76">
            <TriangleAlert className="h-3.5 w-3.5" />
            Weakest gap
          </div>
          <div className="mt-3 text-sm leading-7 text-white/72">{plan.weakestGap}</div>
        </div>

        <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-white/46">
            <ListOrdered className="h-3.5 w-3.5" />
            Final product route order
          </div>
          <div className="mt-4 grid gap-3">
            {plan.finalDemoOrder.map((route, index) => (
              <div key={`${workspace.slug}-${route}-${index}`} className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-xs font-medium text-cyan-100">
                    {index + 1}
                  </div>
                  <div className="font-mono text-xs text-white/76">{route}</div>
                </div>
                <Link href={route} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                  Open
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
