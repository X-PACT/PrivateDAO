import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Smartphone, Target } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getRealDeviceCaptureClosureSnapshot } from "@/lib/real-device-capture-closure";
import { cn } from "@/lib/utils";

export function RealDeviceCaptureClosurePanel() {
  const snapshot = getRealDeviceCaptureClosureSnapshot();

  return (
    <Card className="border-emerald-300/16 bg-[linear-gradient(180deg,rgba(12,18,24,0.96),rgba(10,10,18,0.99))]">
      <CardHeader className="space-y-3">
        <div className="text-[11px] uppercase tracking-[0.3em] text-emerald-200/78">Real-device closure program</div>
        <CardTitle className="text-2xl">The exact capture board that still separates strong Devnet proof from believable mainnet posture</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-emerald-200/78">
              <CheckCircle2 className="h-4 w-4" />
              Completion
            </div>
            <div className="mt-3 text-2xl font-medium text-white">{snapshot.completionLabel}</div>
            <div className="mt-3 text-sm leading-7 text-white/60">
              This is a capture program, not a speculative roadmap. Every row below maps to a wallet/client that still needs recorded proof.
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-cyan-200/78">
              <Smartphone className="h-4 w-4" />
              Pending targets
            </div>
            <div className="mt-3 text-2xl font-medium text-white">{snapshot.pendingCount}</div>
            <div className="mt-3 text-sm leading-7 text-white/60">
              Phantom, Solflare, Backpack, Glow, and Android/mobile still need closure in the same reviewer-visible intake path.
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-fuchsia-200/78">
              <Target className="h-4 w-4" />
              Submission standard
            </div>
            <div className="mt-3 text-lg font-medium text-white">connect + sign + submit</div>
            <div className="mt-3 text-sm leading-7 text-white/60">
              A capture only counts when it shows diagnostics visibility and a signed Devnet outcome or an explicit wallet-side error boundary.
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {snapshot.targets.map((target) => (
            <div key={target.id} className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/48">{target.environmentType}</div>
                  <div className="mt-2 text-xl font-medium text-white">{target.walletLabel}</div>
                </div>
                <div className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-amber-100">
                  {target.status}
                </div>
              </div>

              <div className="mt-4 text-sm leading-7 text-white/68">{target.nextAction}</div>

              <div className="mt-4 grid gap-2">
                {target.captureSignals.map((signal) => (
                  <div key={signal} className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm leading-7 text-white/64">
                    {signal}
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-4">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/48">Required evidence</div>
                <div className="mt-3 grid gap-2 text-sm leading-7 text-white/62">
                  {target.requiredEvidence.map((item) => (
                    <div key={item}>{item}</div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Link href="/documents/real-device-capture-closure-packet" className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}>
            Capture closure packet
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/documents/real-device-runtime" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Real-device runtime
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/documents/runtime-operations-readiness-packet" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Runtime ops packet
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/documents/funding-readiness-scorecard" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Funding scorecard
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
