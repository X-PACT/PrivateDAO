import Link from "next/link";
import { ArrowUpRight, CircleAlert, CircleCheckBig, Coins, LineChart, ShieldCheck, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { strategicOpportunities } from "@/lib/strategic-opportunities";

const iconMap = {
  "startup-capital-corridor": Coins,
  "regional-grant-corridor": Sparkles,
  "data-and-telemetry-corridor": LineChart,
  "confidential-payout-corridor": ShieldCheck,
  "audit-and-hardening-corridor": CircleAlert,
} as const;

function fitTone(fit: string) {
  if (fit === "Strong") return "border-emerald-300/20 bg-emerald-300/10 text-emerald-100";
  if (fit === "Moderate") return "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";
  return "border-amber-300/20 bg-amber-300/10 text-amber-100";
}

export function StrategicOpportunitySurface() {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {strategicOpportunities.map((opportunity) => {
        const Icon = iconMap[opportunity.slug as keyof typeof iconMap] ?? Sparkles;

        return (
          <Card
            key={opportunity.slug}
            className="h-full border-white/10 bg-[linear-gradient(180deg,rgba(12,16,30,0.92),rgba(8,10,22,0.98))]"
          >
            <CardHeader className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.24em] ${fitTone(opportunity.fit)}`}
                >
                  <CircleCheckBig className="h-3.5 w-3.5" />
                  {opportunity.fit} fit
                </div>
                <a
                  href={opportunity.sourceUrls[0]}
                  rel="noreferrer"
                  target="_blank"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/8 bg-white/[0.04] text-white/60 transition hover:border-white/14 hover:bg-white/[0.08] hover:text-white"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
              <div className="space-y-2">
                <div className="text-[11px] uppercase tracking-[0.32em] text-emerald-300/72">{opportunity.sponsor}</div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-cyan-100">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-2xl">{opportunity.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
                <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-100/76">Why this corridor matters now</div>
                <p className="mt-3 text-sm leading-7 text-white/62">{opportunity.summary}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-4">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-emerald-300/76">Already shipped</div>
                  <div className="mt-2 text-sm leading-7 text-white/68">{opportunity.shippedNow}</div>
                </div>
                <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-4">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-amber-200/76">Highest-value gap</div>
                  <div className="mt-2 text-sm leading-7 text-white/68">{opportunity.missingFeature}</div>
                </div>
              </div>

              <div className="rounded-3xl border border-cyan-300/16 bg-cyan-300/[0.08] p-4">
                <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-100/76">Best next move</div>
                <div className="mt-2 text-sm leading-7 text-white/72">{opportunity.action}</div>
              </div>

              <div className="flex flex-wrap gap-2">
                {opportunity.skillsNeeded.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/64"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {opportunity.liveRoutes.map((route) => (
                  <Link
                    key={`${opportunity.slug}-${route}`}
                    href={route}
                    className="inline-flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-white/72 transition hover:border-white/14 hover:bg-white/[0.08]"
                  >
                    {route}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                ))}
              </div>

              <div className="grid gap-3">
                {opportunity.sourceUrls.map((sourceUrl, index) => (
                  <a
                    key={`${opportunity.slug}-${sourceUrl}`}
                    href={sourceUrl}
                    rel="noreferrer"
                    target="_blank"
                    className="inline-flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-white/58 transition hover:border-white/14 hover:bg-white/[0.06] hover:text-white/76"
                  >
                    Source reference {index + 1}
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
