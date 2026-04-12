"use client";

import Link from "next/link";
import { ArrowUpRight, FileCheck2, RadioTower, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import type { ExecutionSurfaceSnapshot } from "@/lib/devnet-service-metrics";
import { buildAuthoritativeExecutionEvidence } from "@/lib/authoritative-execution-evidence";
import type { JudgeRuntimeLogsSnapshot } from "@/lib/judge-runtime-logs";
import { useServiceHandoffSnapshot } from "@/lib/use-service-handoff-snapshot";
import { cn } from "@/lib/utils";

type JudgeExecutionContinuityPanelProps = {
  executionSnapshot: ExecutionSurfaceSnapshot;
  runtimeSnapshot: JudgeRuntimeLogsSnapshot;
};

export function JudgeExecutionContinuityPanel({
  executionSnapshot,
  runtimeSnapshot,
}: JudgeExecutionContinuityPanelProps) {
  const handoff = useServiceHandoffSnapshot("proof");

  if (!handoff?.payoutIntent) {
    return null;
  }

  const evidence = buildAuthoritativeExecutionEvidence(
    handoff,
    runtimeSnapshot,
    executionSnapshot,
  );
  const requestId = handoff.requestPayload?.requestId ?? handoff.proposalId;
  const amountDisplay = handoff.requestPayload?.amountDisplay ?? handoff.payoutIntent.amountDisplay;
  const reference = handoff.requestPayload?.reference ?? handoff.payoutIntent.reference;
  const executionTarget = handoff.requestPayload?.executionTarget ?? handoff.payoutIntent.executionTarget;
  const telemetryRoute = handoff.requestPayload?.telemetryRoute ?? handoff.requestDelivery?.telemetryRoute ?? "/network";
  const deliveryRoute = handoff.requestPayload?.deliveryRoute ?? handoff.requestDelivery?.deliveryRoute ?? "/command-center";
  const proofRoute = handoff.requestPayload?.evidenceRoute ?? handoff.payoutIntent.evidenceRoute;
  const deliveryState = handoff.requestDelivery?.state ?? handoff.requestPayload?.state ?? "draft";

  return (
    <Card className="border-emerald-300/20 bg-emerald-300/[0.08]">
      <CardHeader className="gap-3">
        <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-100/80">Judge execution continuity</div>
        <CardTitle>Live treasury execution payload attached to the judge route</CardTitle>
        <div className="max-w-4xl text-sm leading-7 text-white/62">
          The proof route is now reading the same delivered request object used by services, command-center, and telemetry panels.
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="grid gap-3">
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">Request ID</div>
            <div className="mt-2 text-sm font-medium text-white">{requestId}</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">Amount / asset</div>
            <div className="mt-2 text-sm font-medium text-white">{amountDisplay}</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">Reference</div>
            <div className="mt-2 text-sm font-medium text-white">{reference}</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">Delivery state</div>
            <div className="mt-2 text-sm font-medium text-white">{deliveryState}</div>
          </div>
        </div>
        <div className="grid gap-3">
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/40">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-200" />
              Execution target
            </div>
            <div className="mt-2 text-sm font-medium text-white">{executionTarget}</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/40">
              <RadioTower className="h-3.5 w-3.5 text-cyan-200" />
              Telemetry route
            </div>
            <div className="mt-2 break-all text-sm text-white/72">{telemetryRoute}</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/40">
              <FileCheck2 className="h-3.5 w-3.5 text-fuchsia-200" />
              Delivery route
            </div>
            <div className="mt-2 break-all text-sm text-white/72">{deliveryRoute}</div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={proofRoute} className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "justify-between")}>
              Open payout proof
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href={deliveryRoute} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}>
              Open command-center lane
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href={telemetryRoute} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}>
              Open network logs
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        {evidence ? (
          <div className="grid gap-3 xl:col-span-2">
            {evidence.monitoringTimeline.slice(0, 3).map((entry) => (
              <div key={entry.label} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-white">{entry.label}</div>
                  <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/72">{entry.status}</div>
                </div>
                <div className="mt-2 text-sm leading-7 text-white/62">{entry.detail}</div>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
