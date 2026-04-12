"use client";

import Link from "next/link";
import { Radar, ServerCog, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { buildAuthoritativeExecutionEvidence } from "@/lib/authoritative-execution-evidence";
import type { JudgeRuntimeLogsSnapshot } from "@/lib/judge-runtime-logs";
import { buildServiceHandoffQuery } from "@/lib/service-handoff-state";
import { useServiceHandoffSnapshot, useServiceHandoffTelemetryMode } from "@/lib/use-service-handoff-snapshot";
import { cn } from "@/lib/utils";

type TelemetryRuntimeFocusClientProps = {
  context: "analytics" | "diagnostics" | "network";
  snapshot: JudgeRuntimeLogsSnapshot;
};

const modeCopy = {
  packet: {
    title: "Reviewer packet log focus",
    detail:
      "Packet mode stays export-safe and keeps runtime truth attached to the reviewer packet, frontier proof, and custody-ready trust paths.",
    href: "/documents/reviewer-telemetry-packet",
    label: "Open reviewer telemetry packet",
  },
  snapshot: {
    title: "Indexed snapshot log focus",
    detail:
      "Snapshot mode emphasizes indexed governance and confidential execution coverage so reviewers can inspect finalized state and proposal continuity quickly.",
    href: "/documents/read-node-snapshot",
    label: "Open read-node snapshot",
  },
  backend: {
    title: "Backend cutover log focus",
    detail:
      "Backend mode keeps the runtime story tied to cutover, route binding, and public health/metrics proof instead of packet-only evidence.",
    href: "/documents/read-node-same-domain-deploy",
    label: "Open backend cutover path",
  },
} as const;

const contextHref = {
  analytics: "/analytics#telemetry-inspection",
  diagnostics: "/diagnostics",
  network: "/network",
} as const;

function attachContinuityQuery(href: string, query: string) {
  if (!query) return href;
  const [path, hash] = href.split("#");
  return hash ? `${path}?${query}#${hash}` : `${path}?${query}`;
}

export function TelemetryRuntimeFocusClient({
  context,
  snapshot,
}: TelemetryRuntimeFocusClientProps) {
  const mode = useServiceHandoffTelemetryMode(context);
  const handoff = useServiceHandoffSnapshot(context);
  const active = modeCopy[mode];
  const entries =
    mode === "backend"
      ? snapshot.v3Hardening.governanceEntries.slice(0, 3)
      : mode === "snapshot"
        ? snapshot.governance.entries.slice(0, 3)
        : snapshot.confidential.entries.slice(0, 3);
  const summary =
    mode === "backend"
      ? `${snapshot.v3Hardening.mode} · governance executed ${snapshot.v3Hardening.governanceExecuted ? "yes" : "no"} · settlement evidence ${snapshot.v3Hardening.settlementEvidenceConsumed ? "consumed" : "pending"}`
      : mode === "snapshot"
        ? `${snapshot.governance.proposal} · ${snapshot.governance.verificationStatus}`
        : `${snapshot.confidential.proposal} · ${snapshot.confidential.verificationStatus}`;
  const authoritativeEvidence = handoff?.requestPayload
    ? buildAuthoritativeExecutionEvidence(handoff, snapshot)
    : null;
  const continuityEntry = authoritativeEvidence
    ? {
        label: authoritativeEvidence.requestSummary,
        signature: authoritativeEvidence.requestRouteSummary.join(" · "),
        status:
          handoff?.requestDelivery?.state === "delivered"
            ? "delivered-from-services"
            : handoff?.requestDelivery?.state === "staged"
              ? "staged-for-delivery"
              : "draft-execution-context",
        slot: undefined,
      }
    : null;
  const renderedEntries = continuityEntry ? [continuityEntry, ...entries] : entries;
  const continuityQuery = handoff ? buildServiceHandoffQuery(handoff) : "";
  const contextualHref = attachContinuityQuery(contextHref[context], continuityQuery);

  return (
    <Card className="border-cyan-300/14 bg-[linear-gradient(180deg,rgba(9,16,31,0.96),rgba(6,11,21,0.98))]">
      <CardHeader className="gap-3">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-cyan-200/78">
          {mode === "backend" ? (
            <ServerCog className="h-4 w-4" />
          ) : mode === "snapshot" ? (
            <Radar className="h-4 w-4" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
          Runtime log focus
        </div>
        <CardTitle>{active.title}</CardTitle>
        <div className="max-w-4xl text-sm leading-7 text-white/60">{active.detail}</div>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
          <div className="text-[11px] uppercase tracking-[0.24em] text-white/42">Freshness</div>
          <div className="mt-2 text-lg font-medium text-white">{snapshot.freshness}</div>
          <div className="mt-4 text-sm leading-7 text-white/58">{summary}</div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={active.href} className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
              {active.label}
            </Link>
            <Link href={contextualHref} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
              Stay on {context}
            </Link>
          </div>
          {handoff?.payoutIntent ? (
            <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-4">
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/38">Execution continuity</div>
              <div className="mt-2 text-sm font-medium text-white">
                {handoff.requestPayload?.amountDisplay ?? handoff.payoutIntent.amountDisplay}
                {" · "}
                {handoff.requestPayload?.reference ?? handoff.payoutIntent.reference}
              </div>
              <div className="mt-2 text-sm leading-7 text-white/58">
                {handoff.requestDelivery?.state === "delivered"
                  ? "Delivery state is already consumed by command-center and kept visible in runtime panels."
                  : handoff.requestDelivery?.state === "staged"
                    ? "Delivery state is staged and ready for command-center execution."
                    : "Delivery context is present, but the request remains editable."}
              </div>
              {handoff.requestPayload ? (
                <div className="mt-2 text-sm leading-7 text-white/58">
                  {handoff.requestPayload.kind} · {handoff.requestPayload.executionTarget}
                  <br />
                  {handoff.requestPayload.requestRoute}
                  <br />
                  {handoff.requestPayload.deliveryRoute}
                  <br />
                  {handoff.requestPayload.telemetryRoute}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="grid gap-3">
          {renderedEntries.map((entry) => (
            <div key={`${mode}-${entry.label}-${entry.signature}`} className="rounded-2xl border border-white/8 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-white">{entry.label}</div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/78">{entry.status}</div>
              </div>
              <div className="mt-2 break-all text-xs leading-6 text-white/58">{entry.signature}</div>
              {entry.slot ? <div className="mt-1 text-[11px] uppercase tracking-[0.22em] text-white/35">slot {entry.slot}</div> : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
