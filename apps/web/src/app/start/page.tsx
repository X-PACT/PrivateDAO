import type { Metadata } from "next";

import { GettingStartedWorkspace } from "@/components/getting-started-workspace";
import { OperationsShell } from "@/components/operations-shell";
import { SponsorSignalBar } from "@/components/sponsor-signal-bar";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Get Started",
  description:
    "The easiest first-run path into PrivateDAO: choose a corridor, connect a wallet, and move from product onboarding into command-center governance.",
  path: "/start",
  keywords: ["getting started", "wallet onboarding", "consumer path", "service corridor"],
});

export default function StartPage() {
  return (
    <OperationsShell
      eyebrow="Quick start"
      title="Start PrivateDAO the way a normal user expects a serious product to work"
      description="Choose the right corridor, connect a wallet, and move through a guided governance flow without losing the proof, trust, and operational depth behind the product."
      badges={[
        { label: "Consumer-first shell", variant: "success" },
        { label: "Wallet-ready", variant: "cyan" },
        { label: "Proof still connected", variant: "violet" },
      ]}
    >
      <SponsorSignalBar />
      <GettingStartedWorkspace />
    </OperationsShell>
  );
}
