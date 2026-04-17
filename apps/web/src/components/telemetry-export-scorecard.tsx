import Link from "next/link";
import { ArrowUpRight, Database, RadioTower, ShieldCheck, Target } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getDevnetServiceMetrics, getOperationalValidationSnapshot } from "@/lib/devnet-service-metrics";
import { cn } from "@/lib/utils";

export function TelemetryExportScorecard() {
  const metrics = getDevnetServiceMetrics();
  const validation = getOperationalValidationSnapshot();
  const topCards = metrics.overview.slice(0, 4);

  return (
    <Card className="border-cyan-300/16 bg-[linear-gradient(180deg,rgba(8,16,26,0.96),rgba(9,11,20,0.99))]">
      <CardHeader className="space-y-3">
        <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/78">Telemetry export scorecard</div>
        <CardTitle className="text-2xl">The data points that make the infrastructure story reviewable fast</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {topCards.map((card) => (
            <div key={card.label} className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/48">{card.label}</div>
              <div className="mt-2 text-2xl font-medium text-white">{card.value}</div>
              <div className="mt-3 text-sm leading-7 text-white/60">{card.detail}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-cyan-200/78">
              <Target className="h-4 w-4" />
              Reviewer-safe validation
            </div>
            <div className="mt-4 grid gap-3">
              {[
                validation.proposalFlowHealth,
                validation.walletReadiness,
                validation.proofFreshness,
                validation.commercialReadiness,
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/48">{item.label}</div>
                  <div className="mt-2 text-lg font-medium text-white">{item.value}</div>
                  <div className="mt-2 text-sm leading-7 text-white/60">{item.detail}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-emerald-200/78">
              <Database className="h-4 w-4" />
              Why this raises Dune and RPC fit
            </div>
            <div className="mt-4 grid gap-3 text-sm leading-7 text-white/64">
              <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                This is no longer a generic analytics route. It shows what is indexed, how fresh it is, and where the reviewer can verify the same story through packets and diagnostics.
              </div>
              <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                It also makes the commercial infrastructure thesis clearer: hosted reads, telemetry, runtime evidence, and trust are one corridor, not four unrelated claims.
              </div>
              <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                That is closer to what wins infrastructure side tracks: concise metrics, reviewable surfaces, and explicit blocker honesty.
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <Link href="/documents/telemetry-export-packet" className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}>
            Export packet
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/documents/reviewer-telemetry-packet" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Reviewer telemetry
            <RadioTower className="h-4 w-4" />
          </Link>
          <Link href="/documents/read-node-snapshot" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Read-node snapshot
            <Database className="h-4 w-4" />
          </Link>
          <Link href="/documents/runtime-evidence" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Runtime evidence
            <ShieldCheck className="h-4 w-4" />
          </Link>
          <Link href="/analytics" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Analytics route
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
