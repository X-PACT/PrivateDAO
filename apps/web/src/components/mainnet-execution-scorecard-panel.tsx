import Link from "next/link";
import { AlertTriangle, ArrowUpRight, CheckCircle2, FileCheck2, ShieldCheck, Waypoints } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getMainnetExecutionReadinessSnapshot } from "@/lib/mainnet-execution-readiness";
import { cn } from "@/lib/utils";

export function MainnetExecutionScorecardPanel() {
  const snapshot = getMainnetExecutionReadinessSnapshot();

  return (
    <Card className="border-amber-300/16 bg-[linear-gradient(180deg,rgba(24,16,8,0.96),rgba(10,10,18,0.99))]">
      <CardHeader className="space-y-3">
        <div className="text-[11px] uppercase tracking-[0.3em] text-amber-200/78">Mainnet execution scorecard</div>
        <CardTitle className="text-2xl">How much of the mainnet path is already structured vs still blocked externally</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-emerald-200/78">
              <FileCheck2 className="h-4 w-4" />
              Repo-defined path
            </div>
            <div className="mt-3 text-2xl font-medium text-white">
              {snapshot.launchOps.repoDocumented + snapshot.launchOps.repoDefined + snapshot.launchOps.devnetProven}/{snapshot.launchOps.total}
            </div>
            <div className="mt-3 text-sm leading-7 text-white/60">
              Documented, defined, or Devnet-proven launch steps already exist in the repo and can be reviewed now.
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-amber-200/78">
              <Waypoints className="h-4 w-4" />
              Pending external
            </div>
            <div className="mt-3 text-2xl font-medium text-white">
              {snapshot.launchOps.pendingExternal + snapshot.blockers.pendingExternal}
            </div>
            <div className="mt-3 text-sm leading-7 text-white/60">
              External actions still dominate the remaining path: audit, multisig, monitoring delivery, and release ceremony.
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-cyan-200/78">
              <CheckCircle2 className="h-4 w-4" />
              Runtime capture gap
            </div>
            <div className="mt-3 text-2xl font-medium text-white">
              {snapshot.launchOps.pendingRuntimeCaptures + snapshot.blockers.pendingRuntimeCaptures}
            </div>
            <div className="mt-3 text-sm leading-7 text-white/60">
              Real-device wallet evidence is still one of the clearest funding leverage points because it is bounded and measurable.
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-fuchsia-200/78">
              <ShieldCheck className="h-4 w-4" />
              Severity profile
            </div>
            <div className="mt-3 text-2xl font-medium text-white">
              {snapshot.blockers.critical} critical / {snapshot.blockers.high} high
            </div>
            <div className="mt-3 text-sm leading-7 text-white/60">
              The blocker set is not hidden. It is explicit, countable, and therefore more credible to a serious grant reviewer.
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-fuchsia-300/14 bg-fuchsia-300/[0.06] p-5 text-sm leading-7 text-white/64">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-fuchsia-200/78">
            <AlertTriangle className="h-4 w-4" />
            Claim boundary
          </div>
          <div className="mt-3">
            Production mainnet claim allowed: <span className="text-white/84">{String(snapshot.claimAllowed)}</span>. This surface exists to raise confidence through explicit execution structure, not through inflated readiness language.
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <Link href="/documents/mainnet-execution-readiness-packet" className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}>
            Execution packet
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/documents/funding-readiness-scorecard" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Funding scorecard
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/documents/runtime-operations-readiness-packet" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Runtime ops packet
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/documents/launch-ops-checklist" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Launch ops
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/documents/mainnet-blockers" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Mainnet blockers
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
