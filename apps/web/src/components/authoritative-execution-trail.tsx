"use client";

import Link from "next/link";
import { ArrowUpRight, Radar, ReceiptText, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { buildAuthoritativeExecutionEvidence } from "@/lib/authoritative-execution-evidence";
import type { JudgeRuntimeLogsSnapshot } from "@/lib/judge-runtime-logs";
import { buildServiceHandoffQuery } from "@/lib/service-handoff-state";
import { useServiceHandoffSnapshot } from "@/lib/use-service-handoff-snapshot";
import { cn } from "@/lib/utils";

type AuthoritativeExecutionTrailProps = {
  context: "services" | "command-center" | "proof";
  runtimeSnapshot: JudgeRuntimeLogsSnapshot;
};

export function AuthoritativeExecutionTrail({
  context,
  runtimeSnapshot,
}: AuthoritativeExecutionTrailProps) {
  const handoff = useServiceHandoffSnapshot(context);
  if (!handoff?.requestPayload) return null;

  const continuityQuery = buildServiceHandoffQuery(handoff);
  const payload = handoff.requestPayload;
  const evidence = buildAuthoritativeExecutionEvidence(handoff, runtimeSnapshot);
  if (!evidence) return null;

  return (
    <Card className="border-emerald-300/16 bg-[linear-gradient(180deg,rgba(11,23,24,0.95),rgba(8,16,18,0.98))]">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-200/78">
              Authoritative execution trail
            </div>
            <CardTitle>One request object carried through service, review, and runtime evidence</CardTitle>
          </div>
          <Badge variant="success">Payload authoritative</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/40">
            <ReceiptText className="h-3.5 w-3.5 text-emerald-200" />
            Request object
          </div>
          <div className="mt-3 text-sm font-medium text-white">{payload.kind}</div>
          <div className="mt-2 text-sm leading-7 text-white/60">
            {payload.requestId}
            <br />
            {payload.amountDisplay} · {payload.reference}
            <br />
            {payload.executionTarget}
          </div>
          <div className="mt-4 grid gap-3 text-sm leading-7 text-white/58">
            {evidence.requestRouteSummary.map((route, index) => (
              <div key={`${route}-${index}`}>
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                  {index === 0 ? "Request route" : index === 1 ? "Delivery route" : "Telemetry route"}
                </div>
                <div className="mt-1 break-all text-white/78">{route}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/40">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-200" />
            Execution timeline
          </div>
          <div className="mt-4 grid gap-3">
            {evidence.executionTimeline.map((entry, index) => (
              <div key={`${entry.label}-${index}`} className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-white">{entry.label}</div>
                  <div className="text-[11px] uppercase tracking-[0.22em] text-emerald-200/72">{entry.status}</div>
                </div>
                <div className="mt-2 break-all text-sm leading-7 text-white/60">{entry.detail}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-black/20 p-4 xl:col-span-2">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/40">
            <Radar className="h-3.5 w-3.5 text-fuchsia-200" />
            Linked reviewer lanes
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={`/services?${continuityQuery}#treasury-payment-request`} className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "justify-between")}>
              Open services lane
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href={`/command-center?${continuityQuery}#proposal-review-action`} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}>
              Open command-center lane
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href={`/proof?${continuityQuery}`} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}>
              Open judge route
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href={`/network?${continuityQuery}#runtime-evidence-continuity`} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}>
              Open runtime logs
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
