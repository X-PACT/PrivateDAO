import type { Metadata } from "next";
import Link from "next/link";

import { LocalizedRouteSummary } from "@/components/localized-route-summary";
import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

const pusdLanes = [
  {
    title: "PUSD payroll lane",
    summary: "Stable payout rehearsal for contributor and payroll-oriented treasury operations.",
    href: "/services/testnet-billing-rehearsal",
  },
  {
    title: "PUSD reward pool lane",
    summary: "Gaming and contribution reward distribution lane for recurring operator loops.",
    href: "/services/testnet-billing-rehearsal",
  },
  {
    title: "PUSD governance continuity",
    summary: "Proof-linked treasury lane for judge review with wallet-first execution context.",
    href: "/judge",
  },
] as const;

export const metadata: Metadata = buildRouteMetadata({
  title: "PUSD Stablecoin Mode",
  description:
    "PUSD operating mode for payroll, grants, and reward pool workflows with wallet-first execution and proof continuity.",
  path: "/services/pusd-stablecoin",
  keywords: ["pusd", "stablecoin", "payroll", "rewards", "treasury", "solana"],
});

export default function PusdStablecoinPage() {
  return (
    <OperationsShell
      eyebrow="PUSD track"
      title="PUSD as a governed treasury lane for payroll and rewards"
      description="This route frames PUSD as a core operational currency inside PrivateDAO for payroll, grants, and reward loops while preserving wallet-first UX and reviewer continuity."
      badges={[
        { label: "PUSD mode", variant: "success" },
        { label: "Wallet-first", variant: "cyan" },
        { label: "Judge + proof linked", variant: "violet" },
      ]}
    >
      <LocalizedRouteSummary routeKey="services" />

      <div className="rounded-[28px] border border-emerald-300/16 bg-emerald-300/[0.08] p-6">
        <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-100/78">Operating model</div>
        <h2 className="mt-3 text-2xl font-semibold text-white">Payroll, grants, and reward pools under governed stablecoin flow</h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-white/66">
          PUSD is integrated as a practical treasury rail. Operators can run billing and payout rehearsals from the
          browser, then validate execution context through judge and proof surfaces.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/services/testnet-billing-rehearsal" className={cn(buttonVariants({ size: "sm" }))}>
            Open billing route
          </Link>
          <Link href="/documents/pusd-stablecoin-treasury-layer" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
            Open PUSD packet
          </Link>
          <Link href="/proof" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            Open proof lane
          </Link>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {pusdLanes.map((lane) => (
          <div key={lane.title} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
            <div className="text-base font-medium text-white">{lane.title}</div>
            <p className="mt-3 text-sm leading-7 text-white/62">{lane.summary}</p>
            <Link href={lane.href} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "mt-4 w-full justify-between")}>
              Open lane
            </Link>
          </div>
        ))}
      </div>
    </OperationsShell>
  );
}

