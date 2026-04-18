import type { Metadata } from "next";
import Link from "next/link";

import { DevnetBillingRehearsal } from "@/components/devnet-billing-rehearsal";
import { LocalizedRouteBrief } from "@/components/localized-route-brief";
import { LocalizedRouteSummary } from "@/components/localized-route-summary";
import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Devnet Billing Rehearsal",
  description:
    "Run a small wallet-signed Devnet billing rehearsal, inspect the explorer signature and logs, and see how PrivateDAO turns product usage into a truthful Web3 business model.",
  path: "/services/devnet-billing-rehearsal",
  keywords: ["devnet billing", "solana payment rehearsal", "web3 business model", "wallet billing"],
});

export default function DevnetBillingRehearsalPage() {
  return (
    <OperationsShell
      eyebrow="Commercial execution"
      title="Show the business model on-chain with a small Devnet payment and a public signature"
      description="This route turns pricing into a real browser action. A visitor can sign a small Devnet billing rehearsal, inspect the resulting explorer hash, and understand how PrivateDAO evolves from public-good Devnet product into sustainable infrastructure."
      badges={[
        { label: "Devnet billing", variant: "cyan" },
        { label: "Wallet-signed", variant: "success" },
        { label: "Explorer-visible proof", variant: "warning" },
      ]}
    >
      <LocalizedRouteSummary routeKey="services" />
      <LocalizedRouteBrief routeKey="servicesCore" />
      <div className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.08] p-6 text-sm leading-7 text-white/68">
        This route is intentionally honest. It proves that the commercial lane is real on Devnet today. It does not
        pretend that institutional billing, fiat settlement, or mainnet subscriptions are already complete.
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/services" className={cn(buttonVariants({ size: "sm" }))}>
            Open services
          </Link>
          <Link href="/documents/pricing-model" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
            Open pricing model
          </Link>
          <Link href="/trust" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            Open trust
          </Link>
        </div>
      </div>
      <DevnetBillingRehearsal />
    </OperationsShell>
  );
}
