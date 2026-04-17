import Link from "next/link";
import { ArrowUpRight, CheckCircle2, ShieldCheck, Sparkles, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getOperationalValidationSnapshot,
  type OperationalValidationCard,
} from "@/lib/devnet-service-metrics";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const toneClasses = {
  cyan: "border-cyan-300/16 bg-cyan-300/[0.08]",
  emerald: "border-emerald-300/18 bg-emerald-300/8",
  amber: "border-amber-300/16 bg-amber-300/8",
  fuchsia: "border-fuchsia-300/16 bg-fuchsia-300/[0.08]",
};

const iconMap = {
  "Proposal flow health": CheckCircle2,
  "Wallet-by-wallet readiness": Wallet,
  "Proof freshness": ShieldCheck,
  "Product-lane commercial readiness": Sparkles,
};

type OperationalValidationPanelsProps = {
  title?: string;
};

function ValidationCard({ card }: { card: OperationalValidationCard }) {
  const Icon = iconMap[card.label as keyof typeof iconMap] ?? CheckCircle2;

  return (
    <div className={cn("rounded-3xl border p-5", toneClasses[card.tone])}>
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-white">
          <Icon className="h-4 w-4" />
        </div>
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-[0.24em] text-white/52">{card.label}</div>
          <div className="mt-2 text-xl font-semibold text-white sm:text-2xl">{card.value}</div>
        </div>
      </div>
      <div className="mt-4 text-sm leading-7 text-white/72">{card.detail}</div>
      <Link
        href={card.routeHref}
        className={cn(buttonVariants({ size: "sm", variant: "outline" }), "mt-4 w-full")}
      >
        {card.routeLabel}
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

export function OperationalValidationPanels({
  title = "Operational validation",
}: OperationalValidationPanelsProps) {
  const snapshot = getOperationalValidationSnapshot();
  const cards = [
    snapshot.proposalFlowHealth,
    snapshot.walletReadiness,
    snapshot.proofFreshness,
    snapshot.commercialReadiness,
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-3xl border border-white/8 bg-white/4 p-4 text-sm leading-7 text-white/60">
          These four panels keep live Devnet health, proof recency, wallet readiness, and product-to-market posture visible inside the daily product shell instead of hiding them in reviewer docs alone.
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {cards.map((card) => (
            <ValidationCard key={card.label} card={card} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
