import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, Coins, Gauge, RefreshCcw, ShieldCheck, WalletCards } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getServiceOperationalCards } from "@/lib/service-operational-cards";
import { cn } from "@/lib/utils";

const iconMap = {
  "RPC Infrastructure": Gauge,
  "AUDD Stablecoin Treasury": Coins,
  "Treasury Swap / Rebalance": RefreshCcw,
  "Gaming DAO": BriefcaseBusiness,
  "Payments DAO": BriefcaseBusiness,
  "Security / Encryption": ShieldCheck,
  "PUSD Stablecoin Treasury": Coins,
  "Eitherway Wallet-First Live dApp": WalletCards,
  "Consumer Governance UX": WalletCards,
  "SolRouter Encrypted AI": ShieldCheck,
  "Main Frontier Closure": BriefcaseBusiness,
  "Zerion Agent Policy": ShieldCheck,
  "Torque Growth Loop": BriefcaseBusiness,
  "Agentic Treasury Micropayments": ShieldCheck,
} as const;

export function ServiceOperationalCards() {
  const cards = getServiceOperationalCards();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Try these services now on Testnet</CardTitle>
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
                <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-100/74">Try now on Testnet</div>
                <div className="mt-2 text-sm leading-7 text-white/70">{card.tryNow}</div>
              </div>

              <div className="mt-4 rounded-2xl border border-emerald-300/16 bg-emerald-300/[0.08] p-4 text-sm leading-7 text-white/70">
                Start with <span className="text-white">/learn</span> if you are new, then run the service path on Testnet and verify the result through analytics, proof, or trust packets instead of trusting the copy alone.
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.22em] text-white/54">
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">Connect</span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">Review</span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">Sign</span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">Verify</span>
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
                  <div className="text-[11px] uppercase tracking-[0.22em] text-amber-300/76">Next readiness lift</div>
                  <div className="mt-2">{card.mainnetGate}</div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link className={cn(buttonVariants({ size: "sm" }))} href={card.intakeRoute.href}>
                  {card.intakeRoute.label}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link className={cn(buttonVariants({ size: "sm", variant: "secondary" }))} href={card.bestRoute.href}>
                  {card.bestRoute.label}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

              {card.profileRoutes?.length ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  {card.profileRoutes.map((route) => (
                    <Link key={`${card.title}-${route.href}`} className={cn(buttonVariants({ size: "sm", variant: "outline" }))} href={route.href}>
                      {route.label}
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
