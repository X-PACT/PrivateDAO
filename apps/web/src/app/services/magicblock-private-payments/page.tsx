import type { Metadata } from "next";
import Link from "next/link";

import { LocalizedRouteSummary } from "@/components/localized-route-summary";
import { MagicBlockPrivatePaymentsStatus } from "@/components/magicblock-private-payments-status";
import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "MagicBlock Private Payments",
  description:
    "MagicBlock private payment corridor for challenge/login authenticated private balance reads and unsigned deposit, transfer, and withdraw transactions.",
  path: "/services/magicblock-private-payments",
  keywords: ["magicblock", "private payments", "ephemeral rollups", "solana payments", "private balance"],
});

export default function MagicBlockPrivatePaymentsPage() {
  return (
    <OperationsShell
      eyebrow="MagicBlock track"
      title="Private payment corridor with wallet-signed access control"
      description="This route keeps MagicBlock Private Payments visible as an execution lane: health, challenge initiation, bearer-token boundary, unsigned transaction builders, and reviewer proof in one place."
      badges={[
        { label: "Private Payments API", variant: "cyan" },
        { label: "Challenge/login", variant: "success" },
        { label: "Unsigned tx builders", variant: "violet" },
      ]}
    >
      <LocalizedRouteSummary routeKey="services" />

      <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
        <div className="text-[11px] uppercase tracking-[0.28em] text-white/44">Reviewer route</div>
        <h2 className="mt-3 text-2xl font-semibold text-white">Fast payments stay explicit about who can read private state</h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-white/66">
          The public API health and challenge paths can be checked live. Private balances and private transfers must
          pass through the MagicBlock login flow, then the returned unsigned transaction is signed by the user's wallet
          and submitted to the target connection indicated by the API response.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/services/umbra-confidential-payout" className={cn(buttonVariants({ size: "sm" }))}>
            Open Umbra payout lane
          </Link>
          <Link href="/services/cloak-private-settlement" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
            Open Cloak lane
          </Link>
          <Link href="/proof" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            Open proof
          </Link>
        </div>
      </div>

      <MagicBlockPrivatePaymentsStatus />
    </OperationsShell>
  );
}
