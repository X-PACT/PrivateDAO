import type { Metadata } from "next";
import Link from "next/link";

import { LocalizedRouteSummary } from "@/components/localized-route-summary";
import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

const auddLanes = [
  {
    title: "AUDD merchant settlement",
    summary: "Invoice and merchant-facing payment rehearsal with wallet signature and explorer-visible proof.",
    href: "/services/testnet-billing-rehearsal",
  },
  {
    title: "AUDD treasury settlement",
    summary: "Governed reserve and supplier settlement lane for AUD-denominated treasury operations.",
    href: "/services/testnet-billing-rehearsal",
  },
  {
    title: "AUDD judge and proof continuity",
    summary: "Reviewer path for verifying the same lane from judge and proof surfaces.",
    href: "/judge",
  },
] as const;

export const metadata: Metadata = buildRouteMetadata({
  title: "AUDD Stablecoin Mode",
  description:
    "AUDD operating mode for merchant settlement and treasury workflows with wallet-first execution and proof continuity.",
  path: "/services/audd-stablecoin",
  keywords: ["audd", "stablecoin", "merchant settlement", "treasury", "solana"],
});

export default function AuddStablecoinPage() {
  return (
    <OperationsShell
      eyebrow="AUDD track"
      title="AUDD as an operational treasury mode, not a token toggle"
      description="This route packages AUDD usage as practical product lanes: merchant settlement, governed treasury settlement, and proof-linked review from the same wallet-first system."
      badges={[
        { label: "AUDD mode", variant: "warning" },
        { label: "Wallet-first", variant: "success" },
        { label: "Judge + proof linked", variant: "cyan" },
      ]}
    >
      <LocalizedRouteSummary routeKey="services" />

      <div className="rounded-[28px] border border-amber-300/16 bg-amber-300/[0.08] p-6">
        <div className="text-[11px] uppercase tracking-[0.28em] text-amber-100/78">Operating model</div>
        <h2 className="mt-3 text-2xl font-semibold text-white">Merchant and treasury settlement lanes for AUD-denominated flow</h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-white/66">
          AUDD is exposed as a production-style operating lane inside PrivateDAO. Users can run settlement rehearsals
          from the browser, and reviewers can validate signatures, policy continuity, and proof surfaces without
          leaving the product flow.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/services/testnet-billing-rehearsal" className={cn(buttonVariants({ size: "sm" }))}>
            Open billing route
          </Link>
          <Link href="/documents/audd-stablecoin-treasury-layer" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
            Open AUDD packet
          </Link>
          <Link href="/proof" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            Open proof lane
          </Link>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {auddLanes.map((lane) => (
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

