import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, Gem, ShieldCheck, Waypoints } from "lucide-react";

import type { CompetitionTrackWorkspace } from "@/lib/site-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTrackCommercializationPlan } from "@/lib/track-commercialization";
import { getTrackMainnetGatePlan } from "@/lib/track-mainnet-gates";
import { getTrackNarrativePlan } from "@/lib/track-narratives";
import { getTrackTechnicalFit } from "@/lib/technical-eligibility";

type TrackInvestmentCasePanelProps = {
  workspace: CompetitionTrackWorkspace;
};

export function TrackInvestmentCasePanel({ workspace }: TrackInvestmentCasePanelProps) {
  const technical = getTrackTechnicalFit(workspace.slug);
  const commercialization = getTrackCommercializationPlan(workspace);
  const mainnet = getTrackMainnetGatePlan(workspace);
  const narrative = getTrackNarrativePlan(workspace);
  const specialPacketHref =
    workspace.slug === "rpc-infrastructure" || workspace.slug === "dune-analytics"
      ? "/documents/telemetry-export-packet"
    : workspace.slug === "encrypt-ika" || workspace.slug === "umbra-confidential-payout"
        ? "/documents/confidential-payout-evidence-packet"
        : workspace.slug === "poland-grants"
          ? "/documents/poland-foundation-grant-application-packet"
          : workspace.slug === "startup-accelerator"
          ? "/documents/capital-readiness-packet"
          : null;
  const specialPacketLabel =
    workspace.slug === "rpc-infrastructure" || workspace.slug === "dune-analytics"
      ? "Telemetry export packet"
    : workspace.slug === "encrypt-ika" || workspace.slug === "umbra-confidential-payout"
        ? "Confidential payout packet"
        : workspace.slug === "poland-grants"
          ? "Poland grant packet"
          : workspace.slug === "startup-accelerator"
          ? "Capital readiness packet"
          : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evidence-backed investment case</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-cyan-300/16 bg-cyan-300/[0.08] p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-cyan-100/76">
              <Gem className="h-3.5 w-3.5" />
              Why customers can trust this now
            </div>
            <div className="mt-3 text-sm leading-7 text-white/72">
              {narrative.whyUs}
            </div>
            <div className="mt-4 grid gap-2">
              {technical.coreIdentity.slice(0, 3).map((item) => (
                <div
                  key={`${workspace.slug}-${item.label}`}
                  className="rounded-2xl border border-white/8 bg-black/20 px-3 py-2 text-xs text-white/66"
                >
                  <span className="text-white/88">{item.label}:</span> {item.value}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-300/18 bg-emerald-300/8 p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-emerald-100/76">
              <BriefcaseBusiness className="h-3.5 w-3.5" />
              Why this becomes revenue
            </div>
            <div className="mt-3 text-sm leading-7 text-white/72">
              {narrative.futureProblemSolution}
            </div>
            <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-3 text-sm leading-7 text-white/66">
              <span className="text-white/88">Offer:</span> {commercialization.customerOffer}
            </div>
            <div className="mt-2 rounded-2xl border border-white/8 bg-black/20 p-3 text-sm leading-7 text-white/66">
              <span className="text-white/88">Fastest paid motion:</span> {commercialization.firstPaidMotion}
            </div>
          </div>

          <div className="rounded-3xl border border-amber-300/16 bg-amber-300/8 p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-amber-100/76">
              <ShieldCheck className="h-3.5 w-3.5" />
              Why mainnet is believable
            </div>
            <div className="mt-3 text-sm leading-7 text-white/74">
              {mainnet.releaseDiscipline}
            </div>
            <div className="mt-4 grid gap-2">
              {mainnet.beforeMainnet.slice(0, 2).map((item) => (
                <div
                  key={`${workspace.slug}-${item}`}
                  className="rounded-2xl border border-white/8 bg-black/20 px-3 py-2 text-sm leading-7 text-white/66"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-fuchsia-300/16 bg-fuchsia-300/[0.08] p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-fuchsia-100/76">
              <Waypoints className="h-3.5 w-3.5" />
              Why this sponsor should care now
            </div>
            <div className="mt-3 text-sm leading-7 text-white/72">
              {narrative.whySponsorShouldCareNow}
            </div>
            <div className="mt-4 grid gap-2">
              {technical.sponsorEvidence.slice(0, 2).map((item) => (
                <div
                  key={`${workspace.slug}-${item.sponsor}-${item.status}`}
                  className="rounded-2xl border border-white/8 bg-black/20 p-3 text-sm leading-7 text-white/66"
                >
                  <div className="text-[11px] uppercase tracking-[0.24em] text-white/46">
                    {item.sponsor} · {item.status}
                  </div>
                  <div className="mt-2">{item.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {specialPacketHref && specialPacketLabel ? (
            <Link
              href={specialPacketHref}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-cyan-100 transition hover:border-cyan-300/30 hover:text-white"
            >
              {specialPacketLabel}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          ) : null}
          {technical.evidenceRoutes.slice(0, 4).map((route) => (
            <Link
              key={`${workspace.slug}-${route.href}`}
              href={route.href}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/68 transition hover:border-cyan-300/30 hover:text-white"
            >
              {route.label}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          ))}
          <Link
            href="/documents/trust-package"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/68 transition hover:border-cyan-300/30 hover:text-white"
          >
            Trust package
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/documents/launch-trust-packet"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/68 transition hover:border-cyan-300/30 hover:text-white"
          >
            Launch trust packet
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
