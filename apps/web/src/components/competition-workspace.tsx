import { Fragment, Suspense, type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, ShieldCheck, Sparkles, Swords, Target, TimerReset, Wallet } from "lucide-react";

import type { CompetitionTrackWorkspace } from "@/lib/site-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { SubmissionCoachPanel } from "@/components/submission-coach-panel";
import { DevnetServiceMetricsPanel } from "@/components/devnet-service-metrics-panel";
import { TrackAlignmentPanel } from "@/components/track-alignment-panel";
import { TrackCommercializationPanel } from "@/components/track-commercialization-panel";
import { TrackInvestmentCasePanel } from "@/components/track-investment-case-panel";
import { TrackMainnetGatesPanel } from "@/components/track-mainnet-gates-panel";
import { TrackNarrativePanel } from "@/components/track-narrative-panel";
import { TrackTechnicalFitPanel } from "@/components/track-technical-fit-panel";
import { TrackCustodyImpactPanel } from "@/components/track-custody-impact-panel";
import { AuthorityHardeningPanel } from "@/components/authority-hardening-panel";
import { IncidentReadinessPanel } from "@/components/incident-readiness-panel";
import { TrackCommercialContinuityCard } from "@/components/track-commercial-continuity-card";
import { WorkspacePanelOrderController } from "@/components/workspace-panel-order-controller";
import { cn } from "@/lib/utils";
import { getWorkspacePanelOrder, type WorkspacePanelKey } from "@/lib/track-profile-routing";

type CompetitionWorkspaceProps = {
  workspace: CompetitionTrackWorkspace;
};

export function CompetitionWorkspace({ workspace }: CompetitionWorkspaceProps) {
  const orderedPanels = getWorkspacePanelOrder();

  const panelMap: Record<WorkspacePanelKey, ReactNode> = {
    submissionCoach: <SubmissionCoachPanel workspace={workspace} />,
    trackAlignment: <TrackAlignmentPanel workspace={workspace} />,
    trackNarrative: <TrackNarrativePanel workspace={workspace} />,
    trackInvestmentCase: <TrackInvestmentCasePanel workspace={workspace} />,
    devnetServiceMetrics: <DevnetServiceMetricsPanel trackSlug={workspace.slug} />,
    trackTechnicalFit: <TrackTechnicalFitPanel slug={workspace.slug} />,
    trackCommercialization: <TrackCommercializationPanel workspace={workspace} />,
    trackMainnetGates: <TrackMainnetGatesPanel workspace={workspace} />,
    trackCustodyImpact: <TrackCustodyImpactPanel workspace={workspace} />,
    authorityHardening: <AuthorityHardeningPanel />,
    incidentReadiness: <IncidentReadinessPanel />,
    submissionPath: (
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
              Review route
            </Link>
            <Link className={cn(buttonVariants({ size: "sm", variant: "outline" }))} href={workspace.proofRoute}>
              Proof route
            </Link>
            <Link className={cn(buttonVariants({ size: "sm", variant: "outline" }))} href={workspace.deckRoute}>
              Deck route
            </Link>
            <Link className={cn(buttonVariants({ size: "sm", variant: "outline" }))} href={workspace.videoRoute}>
              Story video route
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
          <div className="rounded-3xl border border-white/8 bg-white/4 p-4 text-sm leading-7 text-white/60">
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/46">Skills needed</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {workspace.skillsNeeded.map((skill) => (
                <span key={skill} className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/62">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    ),
  };

  return (
      <div className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
      <div className="grid gap-6">
        <Suspense fallback={null}>
          <TrackCommercialContinuityCard workspace={workspace} />
        </Suspense>

        <Card>
          <CardHeader>
            <CardTitle>Submission bundle snapshot</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
              <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/76">Prize posture</div>
              <div className="mt-2 text-sm leading-7 text-white/68">{workspace.prizeSummary}</div>
            </div>
            <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-amber-200/76">
                <TimerReset className="h-3.5 w-3.5" />
                Announcement timing
              </div>
              <div className="mt-2 text-sm leading-7 text-white/68">{workspace.winnerAnnouncementBy}</div>
            </div>
            <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-emerald-300/76">
                <Wallet className="h-3.5 w-3.5" />
                Recommended wallet
              </div>
              <div className="mt-2 text-sm leading-7 text-white/68">{workspace.recommendedWallet}</div>
            </div>
            <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-fuchsia-200/76">
                <ShieldCheck className="h-3.5 w-3.5" />
                Testnet status
              </div>
              <div className="mt-2 text-sm leading-7 text-white/68">{workspace.devnetStatus}</div>
            </div>
          </CardContent>
        </Card>

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

        <Card>
          <CardHeader>
            <CardTitle>Sponsor fit</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {workspace.sponsorFit.map((item) => (
              <div key={item} className="flex gap-3 rounded-3xl border border-white/8 bg-white/4 p-4 text-sm leading-7 text-white/60">
                <Sparkles className="mt-1 h-4 w-4 shrink-0 text-cyan-200" />
                <div>{item}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6" data-workspace-panel-container={workspace.slug}>
        <Suspense fallback={null}>
          <WorkspacePanelOrderController workspaceSlug={workspace.slug} />
        </Suspense>
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
        {orderedPanels.map((panelKey) => (
          <div
            key={`${workspace.slug}-${panelKey}`}
            data-workspace-panel-key={panelKey}
          >
            <Fragment>{panelMap[panelKey]}</Fragment>
          </div>
        ))}

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

        <Card>
          <CardHeader>
            <CardTitle>Validation before submit</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {workspace.validationSteps.map((step) => (
              <div key={step} className="flex gap-3 rounded-3xl border border-white/8 bg-white/4 p-4 text-sm leading-7 text-white/60">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-200" />
                <div>{step}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
