import Link from "next/link";
import { ArrowRight, Gauge, LockKeyhole, Radar, ShieldCheck, TimerReset, WalletCards } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getCanonicalCustodyProofSnapshot } from "@/lib/canonical-custody-proof";
import { getExecutionSurfaceSnapshot } from "@/lib/devnet-service-metrics";
import { getReviewerTelemetryTruthSnapshot } from "@/lib/reviewer-telemetry-truth";
import { getCompetitionTrackWorkspace } from "@/lib/site-data";
import { getTrackJudgeFirstCopy } from "@/lib/track-judge-first-copy";
import { cn } from "@/lib/utils";

type InfrastructureStartupProofStripProps = {
  route: "start" | "story";
};

const routeConfig = {
  start: {
    eyebrow: "Infrastructure startup proof",
    title: "The shortest startup-grade truth layer before the user opens anything else",
    description:
      "Lead with the live product, reviewer telemetry, custody truth, the exact next readiness gate, and the best product route in one strip instead of scattering the story across packets and secondary labels.",
    workspaceSlug: "colosseum-frontier",
  },
  story: {
    eyebrow: "Infrastructure startup proof",
    title: "The story route now opens with startup proof, not just a hosted video",
    description:
      "Judges and buyers should see the live narrative boundary immediately: what works now, what is externally proven, what the next readiness gate is, and where the fastest valid demo begins.",
    workspaceSlug: "privacy-track",
  },
} as const;

export function InfrastructureStartupProofStrip({
  route,
}: InfrastructureStartupProofStripProps) {
  const config = routeConfig[route];
  const workspace = getCompetitionTrackWorkspace(config.workspaceSlug);

  if (!workspace) {
    return null;
  }

  const executionSnapshot = getExecutionSurfaceSnapshot();
  const telemetrySnapshot = getReviewerTelemetryTruthSnapshot();
  const custodySnapshot = getCanonicalCustodyProofSnapshot();
  const judgeFirstCopy = getTrackJudgeFirstCopy(workspace);

  const liveProductValue =
    executionSnapshot.proposalFlow.value === executionSnapshot.walletReadiness.value
      ? executionSnapshot.proposalFlow.value
      : `${executionSnapshot.proposalFlow.value} · ${executionSnapshot.walletReadiness.value}`;
  const custodyValue = `${custodySnapshot.status} · ${custodySnapshot.completedItems}/${custodySnapshot.totalItems}`;
  const externallyProvenValue = judgeFirstCopy.externallyProven
    .map((item) => item.label)
    .join(" + ");

  return (
    <Card className="border-cyan-300/16 bg-[linear-gradient(180deg,rgba(9,16,31,0.96),rgba(6,11,21,0.99))]">
      <CardHeader className="gap-3">
        <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/80">
          {config.eyebrow}
        </div>
        <CardTitle>{config.title}</CardTitle>
        <div className="max-w-4xl text-sm leading-7 text-white/58">{config.description}</div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/42">
              <Gauge className="h-3.5 w-3.5 text-cyan-200/78" />
              Live product
            </div>
            <div className="mt-3 text-lg font-semibold tracking-tight text-white">
              {liveProductValue}
            </div>
            <div className="mt-2 text-sm leading-7 text-white/56">
              {executionSnapshot.proposalFlow.detail}
            </div>
          </div>

          <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/42">
              <Radar className="h-3.5 w-3.5 text-cyan-200/78" />
              Reviewer telemetry
            </div>
            <div className="mt-3 text-lg font-semibold tracking-tight text-white">
              {telemetrySnapshot.freshnessLabel}
            </div>
            <div className="mt-2 text-sm leading-7 text-white/56">
              {telemetrySnapshot.indexedProposalCount} indexed · {telemetrySnapshot.governanceFinalized} governance · {telemetrySnapshot.confidentialFinalized} confidential
            </div>
          </div>

          <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/42">
              <LockKeyhole className="h-3.5 w-3.5 text-cyan-200/78" />
              Custody truth
            </div>
            <div className="mt-3 text-lg font-semibold tracking-tight text-white">
              {custodyValue}
            </div>
            <div className="mt-2 text-sm leading-7 text-white/56">
              {custodySnapshot.blocker.nextAction}
            </div>
          </div>

          <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/42">
              <TimerReset className="h-3.5 w-3.5 text-cyan-200/78" />
              Next readiness gate
            </div>
            <div className="mt-3 text-lg font-semibold tracking-tight text-white">
              {judgeFirstCopy.exactBlocker}
            </div>
            <div className="mt-2 text-sm leading-7 text-white/56">
              {judgeFirstCopy.exactBlockerSummary}
            </div>
          </div>

          <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/42">
              <WalletCards className="h-3.5 w-3.5 text-cyan-200/78" />
              Payments readiness
            </div>
            <div className="mt-3 text-lg font-semibold tracking-tight text-white">
              Treasury packet live
            </div>
            <div className="mt-2 text-sm leading-7 text-white/56">
              {judgeFirstCopy.paymentsReadiness}
            </div>
          </div>

          <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/42">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-200/78" />
              Best product route
            </div>
            <div className="mt-3 text-lg font-semibold tracking-tight text-white">
              {judgeFirstCopy.bestDemoRoute}
            </div>
            <div className="mt-2 text-sm leading-7 text-white/56">
              {externallyProvenValue}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={judgeFirstCopy.bestDemoRoute}
            className={cn(buttonVariants({ variant: "secondary" }), "justify-between sm:min-w-[220px]")}
          >
            Open best product route
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={telemetrySnapshot.packetHref}
            className={cn(buttonVariants({ variant: "outline" }), "justify-between sm:min-w-[240px]")}
          >
            Open reviewer telemetry
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/documents/treasury-reviewer-packet"
            className={cn(buttonVariants({ variant: "outline" }), "justify-between sm:min-w-[230px]")}
          >
            Open treasury packet
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/documents/canonical-custody-proof"
            className={cn(buttonVariants({ variant: "outline" }), "justify-between sm:min-w-[230px]")}
          >
            Open custody truth
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
