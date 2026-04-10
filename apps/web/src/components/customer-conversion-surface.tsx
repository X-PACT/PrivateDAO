import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, KeyRound, Rocket, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  competitionTrackWorkspaces,
  commercialCompare,
  servicesJourney,
} from "@/lib/site-data";
import { getTrackCommercializationPlan } from "@/lib/track-commercialization";

const offerIcons = [Rocket, KeyRound, ShieldCheck, BriefcaseBusiness];

export function CustomerConversionSurface() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer conversion ladder</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {commercialCompare.map((offer, index) => {
            const Icon = offerIcons[index] ?? BriefcaseBusiness;
            return (
              <Link
                key={offer.name}
                href={offer.href}
                className="group rounded-3xl border border-white/8 bg-white/4 p-5 transition hover:border-emerald-300/25 hover:bg-white/6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-2xl border border-white/8 bg-black/25 p-3 text-emerald-200">
                    <Icon className="h-4 w-4" />
                  </div>
                  <ArrowUpRight className="mt-1 h-4 w-4 text-emerald-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <div className="mt-4 text-lg font-medium text-white">{offer.name}</div>
                <p className="mt-3 text-sm leading-7 text-white/60">{offer.fit}</p>
                <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/68">
                  {offer.deliverable}
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Track to customer path</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-2">
          {competitionTrackWorkspaces.map((workspace) => {
            const plan = getTrackCommercializationPlan(workspace);
            return (
              <div
                key={workspace.slug}
                className="rounded-3xl border border-white/8 bg-white/4 p-5"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-base font-medium text-white">{workspace.title}</div>
                  <div className="rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-cyan-100">
                    {workspace.sponsor}
                  </div>
                </div>
                <div className="mt-4 text-sm leading-7 text-white/60">
                  {plan.commercialNarrative}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/68">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-emerald-300/74">
                      First paid motion
                    </div>
                    <div className="mt-2">{plan.firstPaidMotion}</div>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/68">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-white/46">
                      Customer offer
                    </div>
                    <div className="mt-2">{plan.customerOffer}</div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={`/tracks/${workspace.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/74 transition hover:border-cyan-300/30 hover:text-white"
                  >
                    Open workspace
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                  {plan.routes.slice(0, 2).map((route) => (
                    <Link
                      key={`${workspace.slug}-${route.href}`}
                      href={route.href}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/62 transition hover:border-emerald-300/28 hover:text-white"
                    >
                      {route.label}
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mainnet customer discipline</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {servicesJourney.map((step) => (
            <Link
              key={step.title}
              href={step.href}
              className="group rounded-3xl border border-white/8 bg-white/4 p-5 transition hover:border-emerald-300/25 hover:bg-white/6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="text-base font-medium text-white">{step.title}</div>
                <ArrowUpRight className="mt-1 h-4 w-4 text-emerald-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <div className="mt-3 text-sm leading-7 text-white/58">{step.detail}</div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
