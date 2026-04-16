import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, LockKeyhole, RadioTower, ShieldCheck, Smartphone } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const corridors = [
  {
    title: "Startup accelerator",
    summary: "Operating plan, use-of-capital, and release confidence packet for serious capital reviewers.",
    href: "/documents/capital-readiness-packet",
    icon: BriefcaseBusiness,
  },
  {
    title: "Poland grants",
    summary: "DAO tooling, payments, decentralisation, and proof-of-work corridor tied to the actual grant philosophy.",
    href: "/documents/reviewer-fast-path",
    icon: ShieldCheck,
  },
  {
    title: "Telemetry and RPC",
    summary: "Hosted reads, runtime freshness, export packet, and analytics scorecard for infrastructure-side reviewers.",
    href: "/analytics",
    icon: RadioTower,
  },
  {
    title: "Confidential payout",
    summary: "Privacy, payout proof, and settlement evidence in one governed corridor that already reads like product infrastructure.",
    href: "/services#settlement-receipt-readiness",
    icon: LockKeyhole,
  },
  {
    title: "Runtime operations",
    summary: "Real-device wallet matrix and monitoring coverage presented as the highest-value operational acceleration lane.",
    href: "/security#real-device-capture-readiness",
    icon: Smartphone,
  },
] as const;

export function FundingCorridorIndexPanel() {
  return (
    <Card className="border-emerald-300/16 bg-[linear-gradient(180deg,rgba(10,20,16,0.96),rgba(10,10,18,0.99))]">
      <CardHeader className="space-y-3">
        <div className="text-[11px] uppercase tracking-[0.3em] text-emerald-200/78">Funding corridor index</div>
        <CardTitle className="text-2xl">Where a serious grant or accelerator reviewer should actually go</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm leading-7 text-white/66">
          This compresses the funding story into five routes: capital packet, regional grant fit, telemetry value,
          confidential payout proof, and the operating lanes that accelerate the product from strong Devnet delivery to
          production confidence.
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {corridors.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-emerald-100">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-lg font-medium text-white">{item.title}</div>
                <div className="mt-3 text-sm leading-7 text-white/60">{item.summary}</div>
                <Link href={item.href} className={cn(buttonVariants({ variant: "outline" }), "mt-4 w-full justify-between")}>
                  Open route
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
