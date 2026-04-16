import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, Flag, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CapitalReadinessPacketStrip() {
  return (
    <Card className="border-cyan-300/16 bg-[linear-gradient(180deg,rgba(10,16,30,0.96),rgba(8,10,22,0.98))]">
      <CardHeader className="space-y-3">
        <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/78">Capital confidence</div>
        <CardTitle className="text-2xl">Startup and grant reviewers now have a direct product-to-release packet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-cyan-100">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
            <div className="mt-4 text-lg font-medium text-white">Commercial story</div>
            <div className="mt-3 text-sm leading-7 text-white/60">
              The packet ties live product, services, and buyer-facing value together before asking reviewers to inspect
              trust, operations, and release discipline.
            </div>
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-emerald-100">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="mt-4 text-lg font-medium text-white">Trust discipline</div>
            <div className="mt-3 text-sm leading-7 text-white/60">
              The packet keeps custody, audit, monitoring, and execution discipline visible so startup reviewers see a
              serious product path rather than hype.
            </div>
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-fuchsia-100">
              <Flag className="h-5 w-5" />
            </div>
            <div className="mt-4 text-lg font-medium text-white">Best fit now</div>
            <div className="mt-3 text-sm leading-7 text-white/60">
              This corridor is tuned for startup and grant reviewers who care more about product maturity, operating
              discipline, and release leverage than raw feature count.
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <Link href="/documents/capital-readiness-packet" className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}>
            Open capital packet
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/start" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Open start
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/services" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Open services
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/trust" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Open trust
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/documents/mainnet-blockers" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Open release readiness map
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
