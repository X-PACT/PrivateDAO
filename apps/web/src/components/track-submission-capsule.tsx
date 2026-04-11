"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight, Gauge, KeyRound, ShieldCheck, TimerReset, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { buildCustodyNarrative, custodyEvidenceUpdatedEvent, emptyCustodyEvidence, getCustodyEvidenceCompletion, readCustodyEvidence, type CustodyEvidence } from "@/lib/custody-evidence";
import type { CompetitionTrackWorkspace } from "@/lib/site-data";
import { getSubmissionCoachPlan } from "@/lib/submission-coach";
import { cn } from "@/lib/utils";

type TrackSubmissionCapsuleProps = {
  workspace: CompetitionTrackWorkspace;
  commercialProfile?: string;
};

function getMainnetDistance(completed: number, total: number) {
  if (completed === 0) return "Still clearly bounded by explicit custody and external validation gates.";
  if (completed < total) return "Shorter than before, but still blocked by missing signatures or post-transfer readouts.";
  return "Operationally shorter, with final external validation still preserved as a separate step.";
}

function getCommercialCapsuleContext(workspace: CompetitionTrackWorkspace, commercialProfile?: string) {
  if (commercialProfile === "pilot-funding") {
    return {
      bestDemoRoute: workspace.liveRoute,
      trustLabel: "Pilot trust",
      trustSummary:
        "Trust framing stays buyer-oriented: show the live product first, then proof, then launch discipline. This keeps the pilot motion tied to a real operating route instead of a generic funding request.",
      commercialPath: {
        label: "Open pilot path",
        href: "/engage?profile=pilot-funding",
      },
      commercialSummary:
        "Commercial path: qualify the buyer, run the live demo, then keep trust and proof attached to the same track route.",
    };
  }

  if (commercialProfile === "treasury-top-up") {
    return {
      bestDemoRoute: "/services",
      trustLabel: "Treasury trust",
      trustSummary:
        "Trust framing stays capital-aware: this should read as governed runway for services and operations, with custody and trust surfaces proving that capital is not being absorbed into an opaque admin path.",
      commercialPath: {
        label: "Open treasury path",
        href: "/engage?profile=treasury-top-up",
      },
      commercialSummary:
        "Commercial path: move from capitalization into services, trust, and operating readiness so treasury capital is tied to visible product reliability.",
    };
  }

  if (commercialProfile === "vendor-payout") {
    return {
      bestDemoRoute: "/command-center",
      trustLabel: "Vendor execution trust",
      trustSummary:
        "Trust framing stays operational: show governed payout execution, diagnostics, and reviewable treasury motion together so vendor disbursement reads as controlled product behavior.",
      commercialPath: {
        label: "Open vendor path",
        href: "/engage?profile=vendor-payout",
      },
      commercialSummary:
        "Commercial path: start from command execution, keep diagnostics visible, and anchor the payout story to governed operations rather than ad-hoc transfers.",
    };
  }

  if (commercialProfile === "contributor-payout") {
    return {
      bestDemoRoute: "/command-center",
      trustLabel: "Contributor trust",
      trustSummary:
        "Trust framing stays contributor-aware: the product should demonstrate retained contributor payouts as governed treasury actions with visible policy and execution review.",
      commercialPath: {
        label: "Open contributor path",
        href: "/engage?profile=contributor-payout",
      },
      commercialSummary:
        "Commercial path: tie contributor payouts to governed execution, security review, and repeatable treasury policy rather than one-off transfers.",
    };
  }

  return {
    bestDemoRoute: getSubmissionCoachPlan(workspace).finalDemoOrder[0] ?? workspace.liveRoute,
    trustLabel: "Trust",
    trustSummary:
      "Trust framing stays evidence-aware: the live product, proof surfaces, and custody boundary should read as one coherent operating story.",
    commercialPath: {
      label: "Open buyer path",
      href: "/engage",
    },
    commercialSummary:
      "Commercial path: keep the live route, trust, and proof attached so product, buyer, and reviewer all see one coherent operating story.",
  };
}

export function TrackSubmissionCapsule({ workspace, commercialProfile }: TrackSubmissionCapsuleProps) {
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
  const coach = useMemo(() => getSubmissionCoachPlan(workspace), [workspace]);
  const resolvedProfile = commercialProfile ?? searchParams.get("profile") ?? undefined;
  const commercialContext = useMemo(() => getCommercialCapsuleContext(workspace, resolvedProfile), [resolvedProfile, workspace]);
  const bestDemoRoute = commercialContext.bestDemoRoute ?? coach.finalDemoOrder[0] ?? workspace.liveRoute;
  const displayedTrustSummary = resolvedProfile ? commercialContext.trustSummary : narrative.summary;
  const whatWorksNow = workspace.deliverables.slice(0, 3);
  const mainnetDistance = getMainnetDistance(completion.completed, completion.total);

  return (
    <Card className="border-cyan-300/18 bg-[linear-gradient(135deg,rgba(8,15,30,0.96),rgba(7,10,22,0.99))]">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/76">Submission capsule</div>
            <CardTitle className="mt-2">What works, why trust is justified, and what still separates Devnet from mainnet</CardTitle>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="cyan">{workspace.sponsor}</Badge>
            <Badge variant={completion.completed === 0 ? "warning" : completion.completed < completion.total ? "cyan" : "success"}>
              {narrative.badge}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-3 md:hidden">
          <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-cyan-200/76">
              <Gauge className="h-3.5 w-3.5" />
              Best demo route
            </div>
            <Link href={bestDemoRoute} className={cn(buttonVariants({ size: "sm" }), "mt-3 w-full justify-between")}>
              Open {bestDemoRoute}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-cyan-200/76">
                <ShieldCheck className="h-3.5 w-3.5" />
                Proof
              </div>
              <Link href={workspace.proofRoute} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "mt-3 w-full justify-between")}>
                Open proof
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-emerald-300/76">
                <ShieldCheck className="h-3.5 w-3.5" />
                {commercialContext.trustLabel}
              </div>
              <div className="mt-3 text-sm leading-7 text-white/66">{displayedTrustSummary}</div>
              <Link href="/documents/launch-trust-packet" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "mt-3 w-full justify-between")}>
                Open trust packet
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-amber-200/76">
                <KeyRound className="h-3.5 w-3.5" />
                Custody state
              </div>
              <div className="mt-3 text-sm leading-7 text-white/66">
                {narrative.badge} · {completion.completed}/{completion.total}
              </div>
            </div>
            <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-fuchsia-200/76">
                <TimerReset className="h-3.5 w-3.5" />
                Mainnet distance
              </div>
              <div className="mt-3 text-sm leading-7 text-white/66">{mainnetDistance}</div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-white/70">
              <ArrowUpRight className="h-3.5 w-3.5" />
              Commercial path
            </div>
            <div className="mt-3 text-sm leading-7 text-white/66">{commercialContext.commercialSummary}</div>
            <Link href={commercialContext.commercialPath.href} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "mt-3 w-full justify-between")}>
              {commercialContext.commercialPath.label}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="hidden gap-4 md:grid xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-emerald-300/76">
              <Zap className="h-3.5 w-3.5" />
              What works now
            </div>
            <div className="mt-4 grid gap-3">
              {whatWorksNow.map((item) => (
                <div key={item} className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm leading-7 text-white/68">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-cyan-200/76">
                <Gauge className="h-3.5 w-3.5" />
                Best demo route
              </div>
              <div className="mt-3 text-sm leading-7 text-white/66">
                Lead with the live route that best preserves product coherence for this track.
              </div>
              <Link href={bestDemoRoute} className={cn(buttonVariants({ size: "sm" }), "mt-4 w-full justify-between")}>
                Open {bestDemoRoute}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-fuchsia-200/76">
                <TimerReset className="h-3.5 w-3.5" />
                Mainnet distance
              </div>
              <div className="mt-3 text-sm leading-7 text-white/66">{mainnetDistance}</div>
            </div>
          </div>
        </div>

        <div className="hidden gap-4 md:grid md:grid-cols-3">
          <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-cyan-200/76">
              <ShieldCheck className="h-3.5 w-3.5" />
              Proof
            </div>
            <div className="mt-3 text-sm leading-7 text-white/66">
              Route reviewers directly into the strongest evidence surface for this track.
            </div>
            <Link href={workspace.proofRoute} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "mt-4 w-full justify-between")}>
              Open proof
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-emerald-300/76">
              <ShieldCheck className="h-3.5 w-3.5" />
              {commercialContext.trustLabel}
            </div>
            <div className="mt-3 text-sm leading-7 text-white/66">
              {displayedTrustSummary}
            </div>
            <Link href="/documents/launch-trust-packet" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "mt-4 w-full justify-between")}>
              Open trust packet
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-amber-200/76">
              <KeyRound className="h-3.5 w-3.5" />
              Custody state
            </div>
            <div className="mt-3 text-sm leading-7 text-white/66">
              Evidence completion {completion.completed}/{completion.total}. Judges can see this improve in real time as custody evidence is recorded.
            </div>
            <Link href="/custody" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "mt-4 w-full justify-between")}>
              Open custody workspace
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="hidden md:grid">
          <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-white/70">
              <ArrowUpRight className="h-3.5 w-3.5" />
              Commercial path
            </div>
            <div className="mt-3 text-sm leading-7 text-white/66">{commercialContext.commercialSummary}</div>
            <Link href={commercialContext.commercialPath.href} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "mt-4 w-full justify-between md:max-w-xs")}>
              {commercialContext.commercialPath.label}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
