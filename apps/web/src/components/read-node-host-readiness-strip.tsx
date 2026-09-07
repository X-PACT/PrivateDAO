import Link from "next/link";
import { ArrowRight, Gauge, HeartPulse, Route, Server } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getReadNodeHostReadinessSnapshot,
  type ReadNodeHostReadinessContext,
} from "@/lib/read-node-host-readiness";
import { cn } from "@/lib/utils";

type ReadNodeHostReadinessStripProps = {
  context: ReadNodeHostReadinessContext;
};

const statMeta = [
  { key: "deploymentTarget", label: "Deploy target", icon: Server },
  { key: "publicHealthPath", label: "Health", icon: HeartPulse },
  { key: "publicMetricsPath", label: "Metrics", icon: Gauge },
  { key: "operatorChecks", label: "Public checks", icon: Route },
] as const;

export function ReadNodeHostReadinessStrip({ context }: ReadNodeHostReadinessStripProps) {
  const snapshot = getReadNodeHostReadinessSnapshot(context);

  return (
    <Card className="border-emerald-300/16 bg-emerald-300/[0.06]">
      <CardHeader className="gap-3">
        <div className="text-[11px] uppercase tracking-[0.3em] text-emerald-200/80">Host readiness</div>
        <CardTitle>{snapshot.title}</CardTitle>
        <div className="max-w-4xl text-sm leading-7 text-white/60">{snapshot.description}</div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
          <div className="text-[11px] uppercase tracking-[0.24em] text-white/40">Readiness state</div>
          <div className="mt-2 text-base font-medium text-white">{snapshot.readinessState}</div>
          <div className="mt-2 text-sm leading-7 text-white/58">{snapshot.exactBoundary}</div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {statMeta.map((item) => {
            const Icon = item.icon;
            const value = snapshot[item.key];

            return (
              <div key={item.key} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/42">
                  <Icon className="h-3.5 w-3.5 text-emerald-200/78" />
                  {item.label}
                </div>
                <div className="mt-3 text-lg font-semibold tracking-tight text-white">{value}</div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-3 xl:grid-cols-3">
          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/40">Indexed proof</div>
            <div className="mt-2 text-sm leading-7 text-white/62">{snapshot.indexedCoverage}</div>
          </div>
          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/40">Settlement proof</div>
            <div className="mt-2 text-sm leading-7 text-white/62">{snapshot.settlementCoverage}</div>
          </div>
          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/40">Telemetry freshness</div>
            <div className="mt-2 text-sm leading-7 text-white/62">{snapshot.telemetryFreshness}</div>
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-2">
          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/40">Route binding</div>
            <div className="mt-2 text-sm leading-7 text-white/62">{snapshot.bindingPrimary}</div>
          </div>
          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/40">UI fallback policy</div>
            <div className="mt-2 text-sm leading-7 text-white/62">{snapshot.fallbackPrimary}</div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Link href={snapshot.packetHref} className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}>
            {snapshot.packetLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={snapshot.deployHref} className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            {snapshot.deployLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={snapshot.snapshotHref} className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            {snapshot.snapshotLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={snapshot.telemetryHref} className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            {snapshot.telemetryLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
