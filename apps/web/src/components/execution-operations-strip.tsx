"use client";

import Link from "next/link";
import { ArrowUpRight, BellRing, RadioTower, ShieldCheck, Smartphone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { buildServiceHandoffQuery } from "@/lib/service-handoff-state";
import { useServiceHandoffSnapshot } from "@/lib/use-service-handoff-snapshot";
import { cn } from "@/lib/utils";

type ExecutionOperationsStripProps = {
  context: "command-center" | "proof" | "network";
};

export function ExecutionOperationsStrip({
  context,
}: ExecutionOperationsStripProps) {
  const handoff = useServiceHandoffSnapshot(context);
  const payload = handoff?.requestPayload ?? null;

  if (!handoff || !payload) {
    return null;
  }

  const continuityQuery = buildServiceHandoffQuery(handoff);
  const proofHref = continuityQuery ? `/proof?${continuityQuery}` : "/proof";
  const networkHref = continuityQuery ? `/network?${continuityQuery}` : "/network";
  const commandHref = continuityQuery
    ? `/command-center?${continuityQuery}#proposal-review-action`
    : "/command-center#proposal-review-action";

  return (
    <div className="rounded-3xl border border-cyan-300/16 bg-cyan-300/[0.07] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/76">Execution operations</div>
          <div className="mt-2 text-base font-medium text-white">
            {payload.requestId} · {payload.amountDisplay}
          </div>
          <div className="mt-2 text-sm leading-7 text-white/60">
            {payload.reference} · {payload.executionTarget}
          </div>
        </div>
        <Badge variant="cyan">{handoff.requestDelivery?.state ?? payload.state}</Badge>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href={commandHref} className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "justify-between")}>
          <ShieldCheck className="h-4 w-4" />
          Open final signing lane
        </Link>
        <Link href={networkHref} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}>
          <RadioTower className="h-4 w-4" />
          Open authoritative telemetry
        </Link>
        <Link href="/documents/monitoring-alert-rules" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}>
          <BellRing className="h-4 w-4" />
          Open alert rules
        </Link>
        <Link href="/documents/real-device-runtime" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}>
          <Smartphone className="h-4 w-4" />
          Open real-device runtime
        </Link>
        <Link href={proofHref} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}>
          Open payout proof
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
