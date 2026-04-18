import type { Metadata } from "next";
import Link from "next/link";

import { LocalizedRouteSummary } from "@/components/localized-route-summary";
import { OperationsShell } from "@/components/operations-shell";
import { PrivacyPolicySelector } from "@/components/privacy-policy-selector";
import { PrivacySdkApiStarter } from "@/components/privacy-sdk-api-starter";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Privacy SDK / API Starter",
  description:
    "Starter route for integrating wallet-first privacy policies, hosted reads, and selective disclosure patterns from PrivateDAO into other Solana apps.",
  path: "/services/privacy-sdk-api-starter",
  keywords: ["privacy sdk", "api starter", "solana integration", "private dao api"],
});

export default function PrivacySdkApiStarterPage() {
  return (
    <OperationsShell
      eyebrow="Integration starter"
      title="Integrate the privacy layer as a product service, not as a protocol rewrite"
      description="This route packages the current PrivateDAO integration story into one place: wallet-first browser starters, hosted read patterns, privacy policy binding, and selective disclosure handoff for real operator systems."
      badges={[
        { label: "Integration-ready", variant: "cyan" },
        { label: "Privacy policy aware", variant: "violet" },
        { label: "Devnet-linked", variant: "success" },
      ]}
    >
      <LocalizedRouteSummary routeKey="services" />
      <div className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.08] p-6 text-sm leading-7 text-white/68">
        This starter route is deliberately grounded: it shows how to integrate the existing live product surfaces and read patterns first, then widen toward institutional disclosure or broader API packaging once those closures are proven.
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/services" className={cn(buttonVariants({ size: "sm" }))}>
            Open services
          </Link>
          <Link href="/learn/toolkit" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
            Open toolkit
          </Link>
          <Link href="/trust" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            Open trust
          </Link>
        </div>
      </div>
      <PrivacySdkApiStarter />
      <PrivacyPolicySelector compact />
    </OperationsShell>
  );
}
