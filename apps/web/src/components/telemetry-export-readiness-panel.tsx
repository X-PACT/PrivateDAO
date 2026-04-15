import Link from "next/link";
import { Activity, ArrowUpRight, Database, FileSearch, RadioTower, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const exportChecks = [
  {
    title: "Indexed governance state",
    detail: "Proposal and DAO state can be inspected through reviewer packets, analytics surfaces, and hosted-read packaging without leaving the product shell.",
    icon: Database,
  },
  {
    title: "Runtime freshness",
    detail: "Diagnostics, runtime evidence, and telemetry packets stay close enough that a reviewer can judge data freshness instead of trusting static screenshots.",
    icon: RadioTower,
  },
  {
    title: "Buyer-safe infrastructure story",
    detail: "The same corridor explains product value to infrastructure buyers and data judges: API posture, hosted reads, proof, and blocker honesty.",
    icon: ShieldCheck,
  },
  {
    title: "Export packet discipline",
    detail: "The export packet, read-node snapshot, and analytics route now behave like one inspectable reviewer lane rather than disconnected notes.",
    icon: FileSearch,
  },
] as const;

export function TelemetryExportReadinessPanel() {
  return (
    <Card className="border-cyan-300/16 bg-[linear-gradient(180deg,rgba(9,16,28,0.96),rgba(8,11,20,0.99))]">
      <CardHeader className="space-y-3">
        <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/78">Telemetry export readiness</div>
        <CardTitle className="text-2xl">What a Dune or RPC reviewer can verify in under one minute</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm leading-7 text-white/66">
          This route now sells a real infrastructure corridor: indexed governance state, hosted-read posture, runtime freshness, and reviewer-safe export packets.
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {exportChecks.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-cyan-100">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-lg font-medium text-white">{item.title}</div>
                <div className="mt-3 text-sm leading-7 text-white/60">{item.detail}</div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <Link href="/documents/telemetry-export-packet" className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}>
            Export packet
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/documents/reviewer-telemetry-packet" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Telemetry packet
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/documents/read-node-snapshot" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Read-node snapshot
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/documents/runtime-evidence" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Runtime evidence
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/diagnostics" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Diagnostics
            <Activity className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
