"use client";

import Link from "next/link";
import { Activity, ArrowRight, ArrowUpRight, FileCheck2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useServiceHandoffSnapshot } from "@/lib/use-service-handoff-snapshot";
import { diagnosticsChecks, diagnosticsEvents } from "@/lib/site-data";
import { cn } from "@/lib/utils";

function buildFallbackTelemetrySelection(mode: "packet" | "snapshot" | "backend") {
  if (mode === "backend") {
    return {
      title: "Backend cutover path",
      summary: "Backend mode keeps diagnostics aligned with host readiness, route binding, and public health/metrics proof.",
      stateDetail: "Use the deployment and telemetry proof paths while the hosted read corridor is being hardened.",
      primaryHref: "/documents/read-node-same-domain-deploy",
      proofHref: "/documents/reviewer-telemetry-packet",
    };
  }

  if (mode === "snapshot") {
    return {
      title: "Read-node snapshot",
      summary: "Snapshot mode keeps diagnostics tied to indexed proposal coverage and read-node output.",
      stateDetail: "Use the snapshot packet when the reviewer needs state coverage and finalized counts without backend claims.",
      primaryHref: "/documents/read-node-snapshot",
      proofHref: "/documents/reviewer-telemetry-packet",
    };
  }

  return {
    title: "Reviewer telemetry packet",
    summary: "Packet mode keeps diagnostics reviewer-safe until a stronger telemetry lane is selected.",
    stateDetail: "Use the telemetry packet when the goal is proof, freshness, and export-safe diagnostics context.",
    primaryHref: "/documents/reviewer-telemetry-packet",
    proofHref: "/documents/reviewer-telemetry-packet",
  };
}

export function DiagnosticsCenter() {
  const handoff = useServiceHandoffSnapshot("diagnostics");
  const activeSelection = handoff?.telemetrySelection ?? buildFallbackTelemetrySelection(handoff?.telemetryMode ?? "packet");
  const modeDetail = activeSelection.summary;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle>Operational diagnostics</CardTitle>
          <div className="text-sm leading-7 text-white/54">
            Active telemetry mode: {handoff?.telemetryMode ?? "packet"} · {modeDetail}
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          {activeSelection ? (
            <div className="rounded-3xl border border-cyan-300/16 bg-cyan-300/[0.08] p-5">
              <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-100/78">Telemetry execution lane</div>
              <div className="mt-3 text-base font-medium text-white">{activeSelection.title}</div>
              <div className="mt-2 text-sm leading-7 text-white/62">{activeSelection.stateDetail}</div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href={activeSelection.primaryHref} className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
                  Open active diagnostics lane
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href={activeSelection.proofHref} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                  Open telemetry proof
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : null}
          {handoff?.payoutIntent ? (
            <div className="rounded-3xl border border-emerald-300/16 bg-emerald-300/[0.08] p-5">
              <div className="text-[11px] uppercase tracking-[0.24em] text-emerald-100/78">Execution continuity diagnostics</div>
              <div className="mt-3 text-base font-medium text-white">
                {handoff.requestPayload?.requestId ?? handoff.proposalId} · {handoff.payoutTitle}
              </div>
              <div className="mt-2 text-sm leading-7 text-white/62">
                {handoff.requestPayload?.amountDisplay ?? handoff.payoutIntent.amountDisplay}
                {" · "}
                {handoff.requestPayload?.reference ?? handoff.payoutIntent.reference}
                {" · lane "}
                {handoff.requestPayload?.lane ?? handoff.payoutIntent.lane}
              </div>
              <div className="mt-2 text-sm leading-7 text-white/62">
                {handoff.requestDelivery?.state === "delivered"
                  ? `Delivered into command-center${handoff.requestDelivery.deliveredAt ? ` at ${handoff.requestDelivery.deliveredAt}` : ""}.`
                  : handoff.requestDelivery?.state === "staged"
                    ? "Staged in services and ready for governed delivery."
                    : "Still in draft inside services."}
              </div>
              {handoff.requestPayload ? (
                <div className="mt-2 text-sm leading-7 text-white/62">
                  {handoff.requestPayload.executionTarget} · {handoff.requestPayload.requestRoute}
                </div>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href={handoff.requestDelivery?.deliveryRoute ?? "/command-center"} className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
                  Open command-center execution lane
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href={handoff.requestDelivery?.telemetryRoute ?? "/network"} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                  Follow network diagnostics
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : null}
          {diagnosticsChecks.map((check) => {
            const isInternal = check.href.startsWith("/");
            const content = (
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-white/8 bg-black/25 p-3 text-cyan-200">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="text-lg font-medium text-white">{check.name}</div>
                  </div>
                  <Badge variant={check.state === "Pending external" ? "warning" : check.state === "Tracked" ? "violet" : "success"}>
                    {check.state}
                  </Badge>
                  <p className="text-sm leading-7 text-white/56">{check.detail}</p>
                </div>
                <ArrowUpRight className="mt-1 h-4 w-4 text-cyan-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            );

            if (isInternal) {
              return (
                <Link
                  key={check.name}
                  href={check.href}
                  className="group rounded-3xl border border-white/8 bg-white/4 p-5 transition hover:border-cyan-300/30 hover:bg-white/6"
                >
                  {content}
                </Link>
              );
            }

            return (
              <a
              key={check.name}
              href={check.href}
              rel="noreferrer"
              target="_blank"
              className="group rounded-3xl border border-white/8 bg-white/4 p-5 transition hover:border-cyan-300/30 hover:bg-white/6"
            >
                {content}
              </a>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verification chain</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {diagnosticsEvents.map((event) => (
            <div key={event.title} className="rounded-3xl border border-white/8 bg-white/4 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/8 bg-black/25 p-3 text-emerald-200">
                  <FileCheck2 className="h-4 w-4" />
                </div>
                <div className="text-base font-medium text-white">{event.title}</div>
              </div>
              <p className="mt-3 text-sm leading-7 text-white/56">{event.body}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
