import Link from "next/link";
import { AlertTriangle, ArrowUpRight, BellRing, ShieldCheck, Smartphone, Waypoints } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const readinessCards = [
  {
    title: "Real-device wallet matrix",
    detail: "Supported wallet environments are defined and reviewable, but completion still depends on captured runs across browser wallets and Android/mobile runtime.",
    icon: Smartphone,
  },
  {
    title: "Monitoring rules exist",
    detail: "RPC, governance, proof, treasury, and authority alerts are already defined in-repo. What remains is live delivery, ownership, and tested transcripts.",
    icon: BellRing,
  },
  {
    title: "Mainnet confidence gap",
    detail: "These two areas are operational blockers, not product-concept blockers. Closing them shortens the path to an honest mainnet release candidate.",
    icon: ShieldCheck,
  },
  {
    title: "Fundable next action",
    detail: "This is exactly the kind of bounded execution work grants and accelerators should fund: measurable, visible, and directly tied to release credibility.",
    icon: Waypoints,
  },
] as const;

export function RuntimeOperationsReadinessPanel() {
  return (
    <Card className="border-amber-300/16 bg-[linear-gradient(180deg,rgba(26,18,10,0.96),rgba(12,10,18,0.99))]">
      <CardHeader className="space-y-3">
        <div className="text-[11px] uppercase tracking-[0.3em] text-amber-200/78">Runtime operations readiness</div>
        <CardTitle className="text-2xl">The last operational gap between live Testnet proof and a credible mainnet release path</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm leading-7 text-white/66">
          Funders and reviewers need one route that explains why wallet runtime coverage and monitoring closure matter, what already exists, and what still remains explicitly open.
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {readinessCards.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-amber-100">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-lg font-medium text-white">{item.title}</div>
                <div className="mt-3 text-sm leading-7 text-white/60">{item.detail}</div>
              </div>
            );
          })}
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
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/documents/mainnet-blockers" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Mainnet blockers
            <AlertTriangle className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
