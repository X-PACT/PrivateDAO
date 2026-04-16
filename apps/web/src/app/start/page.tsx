import type { Metadata } from "next";
import Link from "next/link";

import { GettingStartedWorkspace } from "@/components/getting-started-workspace";
import { OperationsShell } from "@/components/operations-shell";
import { getExecutionSurfaceSnapshot } from "@/lib/devnet-service-metrics";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Get Started",
  description:
    "The easiest first-run path into PrivateDAO: connect a wallet, create a DAO, submit a proposal, and move through the live Devnet flow.",
  path: "/start",
  keywords: ["getting started", "wallet onboarding", "consumer path", "service corridor"],
});

export default function StartPage() {
  const executionSnapshot = getExecutionSurfaceSnapshot();

  return (
    <OperationsShell
      eyebrow="Quick start"
      title="Connect a wallet and start the full Devnet flow without learning the product architecture first"
      description="This page is the easy on-ramp. Connect a Devnet wallet, run the real governance flow yourself, and keep proof and trust surfaces one layer away when you want to inspect how the product stays private, fast, and verifiable, all from the browser without scripts or terminal work."
      navigationMode="guided"
      badges={[
        { label: "Consumer-first shell", variant: "success" },
        { label: "Wallet-ready", variant: "cyan" },
        { label: "Proof still connected", variant: "violet" },
      ]}
    >
      <GettingStartedWorkspace executionSnapshot={executionSnapshot} />
      <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
        <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/76">Need more after the first run?</div>
        <h2 className="mt-3 text-xl font-semibold text-white">Use one action route and one check route after this page</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/64">
          Go to <strong className="text-white">Govern</strong> to create a DAO, create a proposal, vote, and execute with your own Devnet wallet. Then open <strong className="text-white">Judge</strong> to verify the captured Devnet evidence, inspect signatures, and compare your flow against the product proof path.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/govern" className={cn(buttonVariants({ size: "sm" }))}>
            Open govern
          </Link>
          <Link href="/learn" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
            Open the guide
          </Link>
          <Link href="/judge" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
            Open judge route
          </Link>
        </div>
      </div>
    </OperationsShell>
  );
}
