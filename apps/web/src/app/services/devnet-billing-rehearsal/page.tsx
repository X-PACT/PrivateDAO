import type { Metadata } from "next";
import Link from "next/link";

import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Testnet Billing Rehearsal Alias",
  description:
    "Legacy billing route redirected to the current PrivateDAO Testnet billing rehearsal.",
  path: "/services/devnet-billing-rehearsal",
  keywords: ["testnet billing", "solana payment rehearsal", "web3 business model", "wallet billing"],
});

export default function DevnetBillingRehearsalAliasPage() {
  return (
    <OperationsShell
      eyebrow="Billing rehearsal"
      title="Devnet billing route preserved for submitted links"
      description="The active billing rehearsal now lives on the Testnet billing service route. This bridge keeps the older Devnet URL valid and points reviewers to payment, proof, and onboarding paths."
      badges={[
        { label: "Payment rehearsal", variant: "warning" },
        { label: "Route preserved", variant: "success" },
      ]}
    >
      <section className="rounded-[28px] border border-amber-300/16 bg-amber-300/[0.08] p-6">
        <h2 className="text-2xl font-semibold text-white">Open the current billing rehearsal</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/66">
          Use the current route for Testnet payment rehearsal, then continue to onboarding or proof verification.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/services/testnet-billing-rehearsal" className={cn(buttonVariants({ size: "sm" }))}>
            Open current billing route
          </Link>
          <Link href="/onboard" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
            Open onboarding
          </Link>
          <Link href="/proof" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            Open proof
          </Link>
        </div>
      </section>
    </OperationsShell>
  );
}
