import { ArrowUpRight, Database, LineChart, ShieldCheck, TowerControl } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const exportSummaries = [
  {
    title: "Telemetry posture",
    body: "Runtime evidence, diagnostics, and analytics now behave like one reviewer-safe telemetry corridor rather than three disconnected surfaces.",
    icon: LineChart,
  },
  {
    title: "Hosted-read proof",
    body: "Frontier integrations, read-node snapshot, and services packaging keep hosted reads visible as buyer and reviewer value.",
    icon: Database,
  },
  {
    title: "Operational trust",
    body: "Launch trust, custody truth, and runtime evidence remain close enough that data reviewers can inspect proof without leaving the product shell.",
    icon: ShieldCheck,
  },
  {
    title: "Export-ready route",
    body: "The telemetry packet now gives a compact path into diagnostics, analytics, runtime evidence, and the hosted-read proof chain.",
    icon: TowerControl,
  },
] as const;

export function AnalystGradeDataCorridor() {
  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/78">Analyst-grade data corridor</div>
        <CardTitle className="text-2xl">Export-ready summaries and hosted-read proof for reviewer-grade telemetry</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {exportSummaries.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-cyan-100">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-lg font-medium text-white">{item.title}</div>
                <div className="mt-3 text-sm leading-7 text-white/60">{item.body}</div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Link href="/documents/reviewer-telemetry-packet" className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}>
            Open telemetry packet
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/documents/read-node-snapshot" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Open read-node snapshot
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/diagnostics" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Open diagnostics
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/documents/read-node-ops" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Open read-node ops
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/documents/frontier-integrations" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Open integrations
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
