import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { CommercialCheckout } from "@/components/commercial-checkout";
import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Solana Payment Gate",
  description:
    "A live PrivateDAO payment-gated demo: pay with Solana, verify the transaction on-chain, then unlock a result.",
  path: "/payment-gate",
  keywords: ["PrivateDAO payment gate", "Solana payment verification", "wallet gated demo", "crypto subscription payment"],
});

export default function PaymentGatePage() {
  return (
    <OperationsShell
      eyebrow="Payment activation"
      title="A simple Solana payment gate for PrivateDAO products."
      description="Connect a wallet, pay from the browser, verify the transaction on-chain, and unlock a result only after the payment is confirmed."
      navigationMode="guided"
      badges={[
        { label: "Solana Mainnet payment", variant: "violet" },
        { label: "Backend verification", variant: "cyan" },
        { label: "Community-ready", variant: "success" },
      ]}
    >
      <section className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="text-[11px] uppercase tracking-[0.26em] text-cyan-100/76">What this proves</div>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
              Payment is the first step of a real organization license lifecycle.
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/64">
              Payment verification creates an order, verifies the exact Solana transaction, creates the organization,
              issues a signed license, and exposes activation and deployment details.
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-300/16 bg-cyan-300/[0.06] p-4">
            <div className="flex gap-3 text-sm leading-6 text-white/64">
              <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-cyan-100" />
              <span>
                Verification runs on the backend against Solana Mainnet RPC fallbacks. QuickNode x402 can be enabled on
                AWS with a wallet keypair when available; until then Solana Tracker and Ankr keep reads live.
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/pricing#commercial-checkout" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                Product checkout
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/token" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                Community token
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CommercialCheckout />
    </OperationsShell>
  );
}
