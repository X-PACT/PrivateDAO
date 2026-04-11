"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight, Gauge, KeyRound, ShieldCheck, TimerReset } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildCustodyNarrative, custodyEvidenceUpdatedEvent, emptyCustodyEvidence, getCustodyEvidenceCompletion, readCustodyEvidence, type CustodyEvidence } from "@/lib/custody-evidence";
import type { CompetitionTrackWorkspace } from "@/lib/site-data";
import { getTrackJudgeFirstCopy } from "@/lib/track-judge-first-copy";
import { cn } from "@/lib/utils";

type TrackJudgeFirstTopStripProps = {
  workspace: CompetitionTrackWorkspace;
};

function getMainnetDistance(completed: number, total: number) {
  if (completed === 0) return "Still clearly bounded by explicit custody and external validation gates.";
  if (completed < total) return "Shorter than before, but still blocked by missing signatures or post-transfer readouts.";
  return "Operationally shorter, with final external validation still preserved as a separate step.";
}

export function TrackJudgeFirstTopStrip({ workspace }: TrackJudgeFirstTopStripProps) {
  const searchParams = useSearchParams();
  const [evidence, setEvidence] = useState<CustodyEvidence>(emptyCustodyEvidence);

  useEffect(() => {
    const syncEvidence = () => setEvidence(readCustodyEvidence());

    syncEvidence();
    window.addEventListener(custodyEvidenceUpdatedEvent, syncEvidence);
    window.addEventListener("storage", syncEvidence);
    window.addEventListener("focus", syncEvidence);
    window.addEventListener("pageshow", syncEvidence);

    return () => {
      window.removeEventListener(custodyEvidenceUpdatedEvent, syncEvidence);
      window.removeEventListener("storage", syncEvidence);
      window.removeEventListener("focus", syncEvidence);
      window.removeEventListener("pageshow", syncEvidence);
    };
  }, []);

  const completion = useMemo(() => getCustodyEvidenceCompletion(evidence), [evidence]);
  const narrative = useMemo(() => buildCustodyNarrative(evidence), [evidence]);
  const commercialProfile = searchParams.get("profile") ?? undefined;
  const judgeFirstCopy = useMemo(() => getTrackJudgeFirstCopy(workspace, commercialProfile), [commercialProfile, workspace]);
  const mainnetDistance = getMainnetDistance(completion.completed, completion.total);

  return (
    <Card className="border-cyan-300/18 bg-[linear-gradient(135deg,rgba(8,15,30,0.96),rgba(7,10,22,0.99))]">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/76">Judge-first top strip</div>
            <CardTitle className="mt-2">Track, proof closure, custody truth, and the fastest valid demo path</CardTitle>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="cyan">{workspace.sponsor}</Badge>
            <Badge variant={completion.completed === 0 ? "warning" : completion.completed < completion.total ? "cyan" : "success"}>
              {narrative.badge}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
              <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-300/78">What works now</div>
                <div className="mt-4 grid gap-2 text-sm leading-7 text-white/64">
                {judgeFirstCopy.whatWorksNow.map((item) => (
                  <div key={item}>{item}</div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-cyan-200/78">
                <ShieldCheck className="h-3.5 w-3.5" />
                What is externally proven
              </div>
              <div className="mt-4 grid gap-3">
                {judgeFirstCopy.externallyProven.map((item) => (
                  <div key={item.href} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                    <div className="text-sm font-medium text-white">{item.label}</div>
                    <div className="mt-2 text-sm leading-7 text-white/58">{item.summary}</div>
                    <Link href={item.href} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "mt-3 w-full justify-between")}>
                      Open
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-fuchsia-300/14 bg-fuchsia-300/[0.06] p-5">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-fuchsia-200/78">
                <TimerReset className="h-3.5 w-3.5" />
                Exact blocker
              </div>
              <div className="mt-3 text-lg font-medium text-white">{judgeFirstCopy.exactBlocker}</div>
              <div className="mt-2 text-sm leading-7 text-white/62">{judgeFirstCopy.exactBlockerSummary}</div>
            </div>

            <div className="rounded-3xl border border-amber-300/14 bg-amber-300/[0.06] p-5">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-amber-200/78">
                <KeyRound className="h-3.5 w-3.5" />
                Custody truth
              </div>
              <div className="mt-3 text-sm leading-7 text-white/62">
                {narrative.badge} · completion {completion.completed}/{completion.total}
              </div>
              <div className="mt-2 text-sm leading-7 text-white/58">{judgeFirstCopy.pendingSummary}</div>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-cyan-200/78">
              <Gauge className="h-3.5 w-3.5" />
              Best demo route
            </div>
            <div className="mt-3 text-sm leading-7 text-white/62">
              {judgeFirstCopy.bestDemoSummary}
            </div>
            <Link href={judgeFirstCopy.bestDemoRoute} className={cn(buttonVariants({ size: "sm" }), "mt-4 w-full justify-between")}>
              Open {judgeFirstCopy.bestDemoRoute}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-white/72">
              <ShieldCheck className="h-3.5 w-3.5" />
              Reviewer packet
            </div>
            <div className="mt-3 text-sm leading-7 text-white/62">
              Jump directly into the shortest reviewer-facing custody truth packet without leaving the top layer.
            </div>
            <div className="mt-4 grid gap-3">
              <Link href="/documents/custody-proof-reviewer-packet" className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "w-full justify-between")}>
                Open reviewer packet
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/documents/canonical-custody-proof" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full justify-between")}>
                Open canonical proof
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/documents/multisig-setup-intake" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full justify-between")}>
                Open strict intake shape
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/custody#strict-intake-packet" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full justify-between")}>
                Open apply route
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-fuchsia-200/78">
              <TimerReset className="h-3.5 w-3.5" />
              Mainnet distance
            </div>
            <div className="mt-3 text-sm leading-7 text-white/62">{mainnetDistance}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
