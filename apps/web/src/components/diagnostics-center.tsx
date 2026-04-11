"use client";

import Link from "next/link";
import { Activity, ArrowRight, ArrowUpRight, FileCheck2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useServiceHandoffSnapshot } from "@/lib/use-service-handoff-snapshot";
import { diagnosticsChecks, diagnosticsEvents } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function DiagnosticsCenter() {
  const handoff = useServiceHandoffSnapshot("command-center");
  const modeDetail =
    handoff?.telemetrySelection?.summary ??
    "Diagnostics falls back to the reviewer packet until a stronger telemetry mode is staged.";

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
          {handoff?.telemetrySelection ? (
            <div className="rounded-3xl border border-cyan-300/16 bg-cyan-300/[0.08] p-5">
              <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-100/78">Telemetry execution lane</div>
              <div className="mt-3 text-base font-medium text-white">{handoff.telemetrySelection.title}</div>
              <div className="mt-2 text-sm leading-7 text-white/62">{handoff.telemetrySelection.stateDetail}</div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href={handoff.telemetrySelection.primaryHref} className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
                  Open active diagnostics lane
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href={handoff.telemetrySelection.proofHref} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                  Open telemetry proof
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
