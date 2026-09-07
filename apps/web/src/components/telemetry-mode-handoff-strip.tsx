"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Radar, ServerCog, ScrollText } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildServiceHandoffQuery,
  readServiceHandoffState,
  readStoredServiceHandoffState,
  SERVICE_HANDOFF_EVENT,
  SERVICE_HANDOFF_STORAGE_KEY,
  type ServiceHandoffTelemetryMode,
} from "@/lib/service-handoff-state";
import { cn } from "@/lib/utils";

type TelemetryModeHandoffStripProps = {
  context: "analytics" | "diagnostics" | "network";
};

const modeCopy: Record<
  ServiceHandoffTelemetryMode,
  {
    title: string;
    detail: string;
    href: string;
    label: string;
    icon: typeof Radar;
  }
> = {
  packet: {
    title: "Reviewer telemetry packet",
    detail: "Stay on the reviewer-safe packet when the goal is fast proof, freshness, and packet-grade evidence.",
    href: "/documents/reviewer-telemetry-packet",
    label: "Open reviewer telemetry packet",
    icon: ScrollText,
  },
  snapshot: {
    title: "Read-node snapshot",
    detail: "Use the indexed snapshot when the reviewer needs proposal coverage, finalized counts, and read-node output directly.",
    href: "/documents/read-node-snapshot",
    label: "Open read-node snapshot",
    icon: Radar,
  },
  backend: {
    title: "Backend cutover path",
    detail: "Use the host-ready backend path when the reviewer is validating cutover, route binding, and public health/metrics posture.",
    href: "/documents/read-node-same-domain-deploy",
    label: "Open backend cutover path",
    icon: ServerCog,
  },
};

function subscribeToStorage(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = (event: StorageEvent) => {
    if (event.key === SERVICE_HANDOFF_STORAGE_KEY) {
      callback();
    }
  };
  const customHandler = () => callback();
  window.addEventListener("storage", handler);
  window.addEventListener(SERVICE_HANDOFF_EVENT, customHandler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(SERVICE_HANDOFF_EVENT, customHandler);
  };
}

function getStoredSnapshot() {
  return readStoredServiceHandoffState();
}

export function TelemetryModeHandoffStrip({
  context,
}: TelemetryModeHandoffStripProps) {
  const searchParams = useSearchParams();
  const storedState = useSyncExternalStore(
    subscribeToStorage,
    getStoredSnapshot,
    () => null,
  );
  const queryState = readServiceHandoffState(searchParams);
  const selectedMode = useMemo<ServiceHandoffTelemetryMode>(
    () => queryState?.telemetryMode ?? storedState?.telemetryMode ?? "packet",
    [queryState, storedState],
  );
  const activeState = queryState ?? storedState;
  const activeRequestPayload =
    activeState && "requestPayload" in activeState ? activeState.requestPayload : undefined;
  const continuityQuery = useMemo(
    () => (activeState ? buildServiceHandoffQuery(activeState) : ""),
    [activeState],
  );
  const selected = modeCopy[selectedMode];
  const Icon = selected.icon;
  const homeHref =
    context === "analytics"
      ? "/analytics#telemetry-inspection"
      : context === "diagnostics"
        ? "/diagnostics"
        : "/network";
  const analyticsHref = continuityQuery ? `/analytics?${continuityQuery}#telemetry-inspection` : "/analytics#telemetry-inspection";
  const diagnosticsHref = continuityQuery ? `/diagnostics?${continuityQuery}` : "/diagnostics";
  const networkHref = continuityQuery ? `/network?${continuityQuery}` : "/network";

  return (
    <Card className="border-cyan-300/14 bg-[linear-gradient(180deg,rgba(9,16,31,0.96),rgba(6,11,21,0.98))]">
      <CardHeader className="gap-3">
        <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/80">
          Telemetry mode handoff
        </div>
        <CardTitle>Selected telemetry mode now drives this route</CardTitle>
        <div className="max-w-4xl text-sm leading-7 text-white/58">
          The telemetry lane chosen in the wallet-first workbench is now consumed here as a real
          reviewer mode, not just a payload string.
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/42">
              <Icon className="h-3.5 w-3.5 text-cyan-200/78" />
              Active telemetry mode
            </div>
            <div className="mt-3 text-lg font-semibold tracking-tight text-white">{selected.title}</div>
            <div className="mt-2 text-sm leading-7 text-white/58">{selected.detail}</div>
          </div>
          <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/42">Mode continuity</div>
            <div className="mt-3 text-sm leading-7 text-white/58">
              Payload mode: <span className="font-medium text-white">{selectedMode}</span>
            </div>
            <div className="mt-2 text-sm leading-7 text-white/58">
              Source: {queryState ? "query handoff" : storedState ? `stored from ${storedState.source}` : "default packet mode"}
            </div>
            <div className="mt-2 text-sm leading-7 text-white/58">
              Route continuity: analytics, diagnostics, and network stay on the same telemetry lane.
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href={selected.href} className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}>
                {selected.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={homeHref} className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
                Stay on {context}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={analyticsHref} className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
                Open analytics
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={diagnosticsHref} className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
                Open diagnostics
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={networkHref} className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
                Open network
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {activeRequestPayload ? (
              <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm leading-7 text-white/58">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/42">Request payload continuity</div>
                <div className="mt-2 text-white/78">
                  {activeRequestPayload.requestId} · {activeRequestPayload.amountDisplay}
                </div>
                <div className="mt-1 text-white/62">{activeRequestPayload.requestRoute}</div>
                <div className="mt-1 text-white/62">{activeRequestPayload.deliveryRoute}</div>
                <div className="mt-1 text-white/62">{activeRequestPayload.telemetryRoute}</div>
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
