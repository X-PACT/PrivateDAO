import Link from "next/link";
import { AlertTriangle, ArrowUpRight, BellRing, RadioTower, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getMonitoringDeliveryClosureSnapshot } from "@/lib/operational-closure-corridors";
import { cn } from "@/lib/utils";

export function MonitoringDeliveryClosurePanel() {
  const snapshot = getMonitoringDeliveryClosureSnapshot();

  return (
    <Card className="border-cyan-300/16 bg-[linear-gradient(180deg,rgba(10,18,28,0.96),rgba(10,10,18,0.99))]">
      <CardHeader className="space-y-3">
        <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/78">Monitoring delivery closure</div>
        <CardTitle className="text-2xl">The exact operating path between defined alert rules and believable live delivery</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-cyan-200/78">
              <BellRing className="h-4 w-4" />
              Defined rulebook
            </div>
            <div className="mt-3 text-2xl font-medium text-white">{snapshot.ruleCount} rules</div>
            <div className="mt-3 text-sm leading-7 text-white/60">
              {snapshot.criticalCount} critical and {snapshot.highCount} high-severity rules already exist in-repo.
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-amber-200/78">
              <AlertTriangle className="h-4 w-4" />
              Delivery status
            </div>
            <div className="mt-3 text-lg font-medium text-white">{snapshot.blockerStatus}</div>
            <div className="mt-3 text-sm leading-7 text-white/60">
              Owner: {snapshot.blockerOwner}. This remains a readiness gate before honest mainnet real-funds language.
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-emerald-200/78">
              <RadioTower className="h-4 w-4" />
              Exact next action
            </div>
            <div className="mt-3 text-sm leading-7 text-white/68">{snapshot.blockerNextAction}</div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/48">Delivery requirements</div>
            <div className="mt-3 grid gap-2 text-sm leading-7 text-white/62">
              {snapshot.deliveryRequirements.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                  <div className="text-white/82">{item.label}</div>
                  <div className="text-white/52">{item.status} · {item.evidence}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/48">Owner assignments</div>
            <div className="mt-3 grid gap-2 text-sm leading-7 text-white/62">
              {snapshot.ownerAssignments.map((item) => (
                <div key={item.role} className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                  <div className="text-white/82">{item.role}</div>
                  <div className="text-white/52">{item.status} · {item.scope}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/48">Evidence path</div>
            <div className="mt-3 grid gap-2 text-sm leading-7 text-white/62">
              {snapshot.evidencePaths.map((item) => (
                <div key={item}>{item}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/48">Transcript requirements</div>
          <div className="mt-3 grid gap-2 text-sm leading-7 text-white/62 md:grid-cols-2">
            {snapshot.transcriptRequirements.map((item) => (
              <div key={item}>{item}</div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-fuchsia-300/14 bg-fuchsia-300/[0.06] p-5 text-sm leading-7 text-white/64">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-fuchsia-200/78">
            <ShieldCheck className="h-4 w-4" />
            Readiness boundary
          </div>
          <div className="mt-3">{snapshot.claimBoundary}</div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <Link href="/documents/monitoring-delivery-evidence-packet" className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}>
            Monitoring packet
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/documents/monitoring-delivery-closure-packet" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Delivery packet
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/documents/monitoring-alert-rules" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Alert rules
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/documents/runtime-operations-readiness-packet" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Runtime ops packet
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/documents/mainnet-execution-readiness-packet" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Mainnet execution
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/documents/mainnet-blockers" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Mainnet readiness gates
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
