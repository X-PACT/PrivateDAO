import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { commercialCompare } from "@/lib/site-data";

export function CommercialCompareSurface() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {commercialCompare.map((offer) => (
        offer.href.startsWith("/") ? (
          <Link key={offer.name} href={offer.href} className="group">
            <Card className="h-full transition hover:border-emerald-300/25 hover:bg-white/[0.035]">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-2xl border border-white/8 bg-black/25 p-3 text-emerald-200">
                    <BriefcaseBusiness className="h-4 w-4" />
                  </div>
                  <ArrowUpRight className="mt-1 h-4 w-4 text-emerald-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <CardTitle className="text-lg">{offer.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-7 text-white/58">{offer.fit}</p>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4 text-sm leading-7 text-white/68">
                  {offer.deliverable}
                </div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-300/75">{offer.cta}</div>
              </CardContent>
            </Card>
          </Link>
        ) : (
          <a
            key={offer.name}
            href={offer.href}
            rel="noreferrer"
            target="_blank"
            className="group"
          >
            <Card className="h-full transition hover:border-emerald-300/25 hover:bg-white/[0.035]">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-2xl border border-white/8 bg-black/25 p-3 text-emerald-200">
                    <BriefcaseBusiness className="h-4 w-4" />
                  </div>
                  <ArrowUpRight className="mt-1 h-4 w-4 text-emerald-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <CardTitle className="text-lg">{offer.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-7 text-white/58">{offer.fit}</p>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4 text-sm leading-7 text-white/68">
                  {offer.deliverable}
                </div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-300/75">{offer.cta}</div>
              </CardContent>
            </Card>
          </a>
        )
      ))}
    </div>
  );
}
