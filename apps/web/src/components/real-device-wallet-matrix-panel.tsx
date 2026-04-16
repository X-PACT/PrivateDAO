import Link from "next/link";
import { AlertTriangle, ArrowUpRight, BellRing, CheckCircle2, ShieldCheck, Smartphone } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getRuntimeOperationsReadinessSnapshot } from "@/lib/runtime-operations-readiness";
import { cn } from "@/lib/utils";

export function RealDeviceWalletMatrixPanel() {
  const snapshot = getRuntimeOperationsReadinessSnapshot();

  return (
    <Card className="border-amber-300/16 bg-[linear-gradient(180deg,rgba(24,18,8,0.96),rgba(12,10,18,0.99))]">
      <CardHeader className="space-y-3">
        <div className="text-[11px] uppercase tracking-[0.3em] text-amber-200/78">Wallet matrix and monitoring</div>
        <CardTitle className="text-2xl">The two operating systems that turn a strong Devnet product into a confident mainnet candidate</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm leading-7 text-white/66">
          This surface uses generated runtime and alert artifacts directly. It shows how wallet coverage and monitoring
          discipline are being pushed into the same product story a reviewer can inspect after a real Devnet session.
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-amber-200/78">
              <Smartphone className="h-4 w-4" />
              Real-device wallet matrix
            </div>
            <div className="mt-4 grid gap-3">
              {snapshot.walletMatrix.cards.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/48">{item.label}</div>
                  <div className="mt-2 text-lg font-medium text-white">{item.value}</div>
                  <div className="mt-2 text-sm leading-7 text-white/60">{item.detail}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm leading-7 text-white/64">
              <span className="text-white/84">Target environments:</span> {snapshot.walletMatrix.environmentSummary}
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-cyan-200/78">
              <BellRing className="h-4 w-4" />
              Monitoring and alerting
            </div>
            <div className="mt-4 grid gap-3">
              {snapshot.monitoring.cards.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/48">{item.label}</div>
                  <div className="mt-2 text-lg font-medium text-white">{item.value}</div>
                  <div className="mt-2 text-sm leading-7 text-white/60">{item.detail}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm leading-7 text-white/64">
              <span className="text-white/84">Current operating boundary:</span> {snapshot.monitoring.claimBoundary}
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <Link href="/documents/runtime-operations-readiness-packet" className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}>
            Ops readiness packet
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/documents/real-device-runtime" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Real-device runtime
            <Smartphone className="h-4 w-4" />
          </Link>
          <Link href="/documents/monitoring-alert-rules" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Alert rules
            <BellRing className="h-4 w-4" />
          </Link>
          <Link href="/documents/funding-readiness-scorecard" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Funding scorecard
            <CheckCircle2 className="h-4 w-4" />
          </Link>
          <Link href="/documents/mainnet-blockers" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Release readiness map
            <AlertTriangle className="h-4 w-4" />
          </Link>
        </div>

        <div className="rounded-3xl border border-fuchsia-300/14 bg-fuchsia-300/[0.06] p-5 text-sm leading-7 text-white/64">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-fuchsia-200/78">
            <ShieldCheck className="h-4 w-4" />
            Why this matters to funders
          </div>
          <div className="mt-3">
            These are not abstract roadmap promises. They are the practical operating layers that let funders and judges
            see a real product gaining the coverage and discipline needed for production release.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
