import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Coins, HandCoins, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const quickActions = [
  {
    title: "Pilot funding",
    summary: "Open the buyer-facing pilot path with the strongest startup/demo bundle already attached.",
    href: "/engage?profile=pilot-funding",
    icon: BriefcaseBusiness,
  },
  {
    title: "Treasury top-up",
    summary: "Route capital into services, trust, and operating runway with the treasury bundle preselected.",
    href: "/engage?profile=treasury-top-up",
    icon: Wallet,
  },
  {
    title: "Vendor payout",
    summary: "Start a governed vendor payout flow tied to command execution and diagnostics from the first click.",
    href: "/engage?profile=vendor-payout",
    icon: Coins,
  },
  {
    title: "Contributor payout",
    summary: "Open the contributor payout lane with governed treasury execution and trust context already attached.",
    href: "/engage?profile=contributor-payout",
    icon: HandCoins,
  },
] as const;

type TreasuryProfileQuickActionsProps = {
  title?: string;
};

export function TreasuryProfileQuickActions({ title = "Commercial quick actions" }: TreasuryProfileQuickActionsProps) {
  return (
    <Card id="payout-route-selection">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        {quickActions.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.title} className="rounded-3xl border border-white/8 bg-white/4 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-cyan-200">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-base font-medium text-white">{item.title}</div>
              </div>
              <p className="mt-3 text-sm leading-7 text-white/60">{item.summary}</p>
              <Link className={cn(buttonVariants({ size: "sm" }), "mt-4")} href={item.href}>
                Open route
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
