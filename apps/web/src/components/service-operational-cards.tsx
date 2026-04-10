import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, Gauge, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getServiceOperationalCards } from "@/lib/service-operational-cards";
import { cn } from "@/lib/utils";

const iconMap = {
  "RPC Infrastructure": Gauge,
  "Gaming DAO": BriefcaseBusiness,
  "Payments DAO": BriefcaseBusiness,
  "Security / Encryption": ShieldCheck,
} as const;

export function ServiceOperationalCards() {
  const cards = getServiceOperationalCards();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Try these services now on Devnet</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-2">
        {cards.map((card) => {
          const Icon = iconMap[card.title as keyof typeof iconMap] ?? BriefcaseBusiness;

          return (
            <div key={card.title} className="rounded-3xl border border-white/8 bg-white/4 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-3 text-cyan-100">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-lg font-medium text-white">{card.title}</div>
                    <div className="mt-1 text-sm leading-7 text-white/58">{card.summary}</div>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-cyan-300/16 bg-cyan-300/[0.08] p-4">
                <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-100/74">Try now on Devnet</div>
                <div className="mt-2 text-sm leading-7 text-white/70">{card.tryNow}</div>
              </div>

              <div className="mt-4 grid gap-3">
                {card.evidence.map((metric) => (
                  <div key={`${card.title}-${metric.label}`} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-white/46">{metric.label}</div>
                      <div className="text-sm font-medium text-white">{metric.value}</div>
                    </div>
                    <div className="mt-2 text-sm leading-7 text-white/60">{metric.detail}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/62">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-emerald-300/76">Buyer motion</div>
                  <div className="mt-2">{card.buyerMotion}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/62">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-amber-300/76">Mainnet gate</div>
                  <div className="mt-2">{card.mainnetGate}</div>
                </div>
              </div>

              <Link className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "mt-5")} href={card.bestRoute.href}>
                {card.bestRoute.label}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
