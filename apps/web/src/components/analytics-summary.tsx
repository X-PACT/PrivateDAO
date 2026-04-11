"use client";

import Link from "next/link";
import { ShieldAlert, Sparkles, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useServiceHandoffSnapshot } from "@/lib/use-service-handoff-snapshot";
import { analyticsReadiness, analyticsSnapshots } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function AnalyticsSummary() {
  const handoff = useServiceHandoffSnapshot("services");
  const modeTitle =
    handoff?.telemetrySelection?.title ??
    (handoff?.telemetryMode === "backend"
      ? "Backend path"
      : handoff?.telemetryMode === "snapshot"
        ? "Read-node snapshot"
        : "Reviewer packet");

  return (
    <div className="grid gap-6">
      <Card className="border-fuchsia-300/14 bg-[linear-gradient(180deg,rgba(19,12,34,0.95),rgba(11,9,24,0.98))]">
        <CardHeader className="pb-3">
          <div className="text-[11px] uppercase tracking-[0.28em] text-fuchsia-200/78">Telemetry continuity</div>
          <CardTitle className="text-xl">Analytics is now following {modeTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-7 text-white/58">
            {handoff?.telemetrySelection?.summary ??
              "Analytics falls back to the reviewer packet until a stronger telemetry mode is staged from the wallet-first workbench."}
          </p>
          {handoff?.telemetrySelection ? (
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={handoff.telemetrySelection.primaryHref} className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
                Open active telemetry lane
              </Link>
              <Link href={handoff.telemetrySelection.proofHref} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                Open proof route
              </Link>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {analyticsSnapshots.map((snapshot) => (
          <Card key={snapshot.label}>
            <CardHeader className="pb-3">
              <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">{snapshot.label}</div>
              <CardTitle className="text-2xl">{snapshot.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-7 text-white/58">{snapshot.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {analyticsReadiness.map((item, index) => (
          <Card key={item.title} className="h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-2xl border border-white/8 p-3 ${
                    item.tone === "success"
                      ? "bg-emerald-300/10 text-emerald-200"
                      : item.tone === "cyan"
                        ? "bg-cyan-300/10 text-cyan-200"
                        : "bg-amber-300/10 text-amber-200"
                  }`}
                >
                  {index === 0 ? <Sparkles className="h-4 w-4" /> : index === 1 ? <TrendingUp className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <Badge variant={item.tone === "success" ? "success" : item.tone === "cyan" ? "cyan" : "warning"}>
                    {item.tone === "success" ? "Live now" : item.tone === "cyan" ? "Operational" : "Boundary"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-7 text-white/58">{item.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
