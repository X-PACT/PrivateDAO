import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Swords, Target } from "lucide-react";

import type { CompetitionTrackWorkspace } from "@/lib/site-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CompetitionWorkspaceProps = {
  workspace: CompetitionTrackWorkspace;
};

export function CompetitionWorkspace({ workspace }: CompetitionWorkspaceProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Submission objective</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-white/60">
            <div className="rounded-3xl border border-white/8 bg-white/4 p-4">{workspace.objective}</div>
            <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
              <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-300/76">Why us</div>
              <div className="mt-2">{workspace.whyUs}</div>
            </div>
            <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
              <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/76">Primary corridor</div>
              <div className="mt-2 text-white/84">{workspace.primaryCorridor}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Winning moves</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {workspace.winningMoves.map((move) => (
              <div key={move} className="flex gap-3 rounded-3xl border border-white/8 bg-white/4 p-4 text-sm leading-7 text-white/60">
                <Swords className="mt-1 h-4 w-4 shrink-0 text-fuchsia-200" />
                <div>{move}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Track requirements in product terms</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {workspace.requirements.map((requirement) => (
              <div key={requirement} className="flex gap-3 rounded-3xl border border-white/8 bg-white/4 p-4 text-sm leading-7 text-white/60">
                <Target className="mt-1 h-4 w-4 shrink-0 text-cyan-200" />
                <div>{requirement}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submission path</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Link className={cn(buttonVariants({ size: "sm" }))} href={workspace.liveRoute}>
                Live route
              </Link>
              <Link className={cn(buttonVariants({ size: "sm", variant: "secondary" }))} href={workspace.judgeRoute}>
                Judge route
              </Link>
              <Link className={cn(buttonVariants({ size: "sm", variant: "outline" }))} href={workspace.proofRoute}>
                Proof route
              </Link>
              <Link className={cn(buttonVariants({ size: "sm", variant: "outline" }))} href={workspace.deckRoute}>
                Deck route
              </Link>
            </div>
            <a
              className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "w-full")}
              href={workspace.readmeHref}
              rel="noreferrer"
              target="_blank"
            >
              README
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <a
              className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full")}
              href={workspace.sourceUrl}
              rel="noreferrer"
              target="_blank"
            >
              Official track source
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current deliverables</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {workspace.deliverables.map((deliverable) => (
              <div key={deliverable} className="flex gap-3 rounded-3xl border border-white/8 bg-white/4 p-4 text-sm leading-7 text-white/60">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-200" />
                <div>{deliverable}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
