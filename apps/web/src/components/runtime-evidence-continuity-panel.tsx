"use client";

import Link from "next/link";
import { Activity, BellRing, Smartphone, ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { buildAuthoritativeExecutionEvidence } from "@/lib/authoritative-execution-evidence";
import type { ExecutionSurfaceSnapshot } from "@/lib/devnet-service-metrics";
import type { JudgeRuntimeLogsSnapshot } from "@/lib/judge-runtime-logs";
import { buildServiceHandoffQuery } from "@/lib/service-handoff-state";
import { useServiceHandoffSnapshot } from "@/lib/use-service-handoff-snapshot";
import { cn } from "@/lib/utils";

type RuntimeEvidenceContinuityPanelProps = {
  context: "proof" | "diagnostics" | "network";
  executionSnapshot: ExecutionSurfaceSnapshot;
  runtimeSnapshot: JudgeRuntimeLogsSnapshot;
};

export function RuntimeEvidenceContinuityPanel({
  context,
  executionSnapshot,
  runtimeSnapshot,
}: RuntimeEvidenceContinuityPanelProps) {
  const handoff = useServiceHandoffSnapshot(context);
  const continuityQuery = handoff ? buildServiceHandoffQuery(handoff) : "";
  const diagnosticsHref = continuityQuery ? `/diagnostics?${continuityQuery}` : "/diagnostics";
  const networkHref = continuityQuery ? `/network?${continuityQuery}` : "/network";
  const proofHref = continuityQuery ? `/proof?${continuityQuery}` : "/proof";
  const requestPayload = handoff?.requestPayload ?? null;
  const requestDelivery = handoff?.requestDelivery ?? null;
  const executionState = requestDelivery?.state ?? requestPayload?.state ?? "draft";
  const evidence =
    handoff && requestPayload
      ? buildAuthoritativeExecutionEvidence(handoff, runtimeSnapshot, executionSnapshot)
      : null;
  const runtimeTimeline =
    evidence?.monitoringTimeline ?? [
      {
        label: "Real-device coverage",
        detail: runtimeSnapshot.runtime.walletCoverage,
        status: "runtime capture",
      },
      {
        label: "Transaction capture",
        detail: runtimeSnapshot.runtime.txSuccessRate,
        status: "telemetry continuity",
      },
      {
        label: "Adversarial discipline",
        detail: runtimeSnapshot.runtime.adversarialSummary,
        status: "reviewer visible",
      },
    ];

  return (
    <Card className="border-fuchsia-300/16 bg-[linear-gradient(180deg,rgba(21,13,39,0.95),rgba(10,8,24,0.98))]">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-fuchsia-200/78">Runtime evidence continuity</div>
            <CardTitle>Real-device and monitoring proof stay attached to the active execution payload</CardTitle>
          </div>
          <Badge variant="violet">Judge and reviewer live</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-3">
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/40">
              <Smartphone className="h-3.5 w-3.5 text-fuchsia-200" />
              Real-device runtime
            </div>
            <div className="mt-2 text-sm font-medium text-white">{runtimeSnapshot.runtime.walletCoverage}</div>
            <div className="mt-2 text-sm leading-7 text-white/60">{runtimeSnapshot.runtime.txSuccessRate}</div>
            <div className="mt-2 text-sm leading-7 text-white/60">{runtimeSnapshot.runtime.adversarialSummary}</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/40">
              <BellRing className="h-3.5 w-3.5 text-cyan-200" />
              Monitoring evidence
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {executionSnapshot.incidentAlerts.map((alert) => (
                <div key={alert.title} className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium text-white">{alert.title}</div>
                    <Badge variant={alert.status === "Healthy" ? "success" : alert.status === "Watch" ? "warning" : "violet"}>
                      {alert.status}
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm leading-7 text-white/58">{alert.summary}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/40">
              <Activity className="h-3.5 w-3.5 text-emerald-200" />
              Runtime timeline
            </div>
            <div className="mt-3 grid gap-3">
              {runtimeTimeline.map((entry) => (
                <div key={entry.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-white">{entry.label}</div>
                    <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/72">
                      {entry.status}
                    </div>
                  </div>
                  <div className="mt-2 text-sm leading-7 text-white/60">{entry.detail}</div>
                  {entry.routeHref && entry.routeLabel ? (
                    <Link
                      href={entry.routeHref}
                      className={cn(
                        buttonVariants({ size: "sm", variant: "outline" }),
                        "mt-3 justify-between",
                      )}
                    >
                      {entry.routeLabel}
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid gap-3">
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/40">
              <Activity className="h-3.5 w-3.5 text-emerald-200" />
              Active request object
            </div>
            <div className="mt-2 text-sm font-medium text-white">
              {requestPayload?.requestId ?? handoff?.proposalId ?? "No active delivery payload"}
            </div>
            {requestPayload ? (
              <div className="mt-2 text-sm leading-7 text-white/60">
                state {executionState}
                <br />
                {requestPayload.amountDisplay} · {requestPayload.reference}
                <br />
                {requestPayload.executionTarget}
                <br />
                {requestPayload.requestRoute}
                <br />
                {requestPayload.deliveryRoute}
                <br />
                {requestPayload.telemetryRoute}
              </div>
            ) : (
              <div className="mt-2 text-sm leading-7 text-white/60">
                Runtime evidence remains available even when there is no active treasury delivery handoff.
              </div>
            )}
          </div>
          {requestPayload ? (
            <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/40">
                <BellRing className="h-3.5 w-3.5 text-cyan-200" />
                Monitoring intake
              </div>
              <div className="mt-2 text-sm font-medium text-white">
                {executionState === "executed"
                  ? "Same payload now anchors runtime and monitoring review after submit."
                  : "Same payload stays attached to runtime and monitoring before final submit."}
              </div>
              <div className="mt-2 text-sm leading-7 text-white/60">
                {requestDelivery?.stateDetail ?? "Runtime review is attached to the active execution object."}
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link href={networkHref} className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "justify-between")}>
                  Open live network intake
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href="/documents/monitoring-alert-rules" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}>
                  Open alert rules
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Link href={proofHref} className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "justify-between")}>
              Open judge route
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href={diagnosticsHref} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}>
              Open diagnostics evidence
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href={networkHref} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}>
              Open network logs
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href="/documents/incident-readiness-runbook" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}>
              Open monitoring runbook
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
