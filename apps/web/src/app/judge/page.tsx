import type { Metadata } from "next";
import Link from "next/link";

import { JudgeRuntimeLogsPanel } from "@/components/judge-runtime-logs-panel";
import { OperationsShell } from "@/components/operations-shell";
import { DevnetExecutionScreenshotsStrip } from "@/components/devnet-execution-screenshots-strip";
import { JudgeTechnologyGuide } from "@/components/judge-technology-guide";
import { LocalizedRouteSummary } from "@/components/localized-route-summary";
import { PrivacyPolicySelector } from "@/components/privacy-policy-selector";
import { PrivacyProofExplainer } from "@/components/privacy-proof-explainer";
import { buttonVariants } from "@/components/ui/button";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { getJudgeRuntimeLogsSnapshot } from "@/lib/judge-runtime-logs";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Verification Route",
  description:
    "Fast verification route for inspecting the DAO lifecycle, real Devnet transactions, agentic treasury micropayments, and the clearest proof surfaces inside PrivateDAO.",
  path: "/judge",
  keywords: ["verification", "devnet proof", "micropayments", "governance proof"],
});

export default function JudgePage() {
  const runtimeSnapshot = getJudgeRuntimeLogsSnapshot();

  return (
    <OperationsShell
      eyebrow="Verification"
      title="Inspect the real product, the real transactions, and the shortest proof path first"
      description="This route is built for fast verification. It shows the DAO lifecycle, captured Devnet signatures, the Agentic Treasury Micropayment Rail, and the shortest route into the deeper proof and document surfaces. A normal visitor can use it too: the chain evidence is public and readable even when the protected parts of the workflow stay private until the correct stage."
      badges={[
        { label: "Verification first", variant: "cyan" },
        { label: "Devnet live", variant: "success" },
        { label: "Proof-linked", variant: "violet" },
      ]}
    >
      <LocalizedRouteSummary routeKey="judge" />
      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.08] p-6 text-sm leading-7 text-white/72">
          <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/78">What to verify first</div>
          <ol className="mt-4 space-y-3">
            <li>1. Proposal lifecycle from create to execute.</li>
            <li>2. Vote, reveal, and execution signatures on Solana Devnet.</li>
            <li>3. Agentic Treasury Micropayment Rail with many real Devnet transfers.</li>
          </ol>
          <div className="mt-4 text-white/62">
            These are captured reference executions on Devnet. When you later run your own wallet flow, use this judge
            route and the proof center as the comparison point. The visible blockchain layer should reassure a normal
            reviewer that governance happened fairly, settlement happened for real, and the protected parts stayed
            private for the right reasons instead of disappearing into a black box.
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <WalletConnectButton size="sm" variant="default" />
            <Link href="/proof?judge=1" className={cn(buttonVariants({ size: "sm" }))}>
              Open full proof
            </Link>
            <Link href="/learn" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
              Open learning guide
            </Link>
            <Link href="/documents/reviewer-fast-path" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
              Open fast path
            </Link>
            <Link href="/documents/privacy-and-encryption-proof-guide" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
              Open privacy proof guide
            </Link>
            <Link href="/viewer/agentic-treasury-micropayment-rail.generated" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
              Open generated rail proof
            </Link>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="rounded-[26px] border border-white/8 bg-white/[0.04] p-5">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/42">Governance proof</div>
            <div className="mt-2 text-base font-medium text-white">
              {runtimeSnapshot.governance.proposal} · {runtimeSnapshot.governance.verificationStatus}
            </div>
          </div>
          <div className="rounded-[26px] border border-white/8 bg-white/[0.04] p-5">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/42">Micropayment rail</div>
            <div className="mt-2 text-base font-medium text-white">
              {runtimeSnapshot.agenticMicropayments.available
                ? `${runtimeSnapshot.agenticMicropayments.successfulTransferCount}/${runtimeSnapshot.agenticMicropayments.transferCount} real transfers`
                : "rail proof not attached yet"}
            </div>
            {runtimeSnapshot.agenticMicropayments.available ? (
              <div className="mt-2 text-sm leading-7 text-white/60">
                {runtimeSnapshot.agenticMicropayments.settlementAssetSymbol} ·{" "}
                {runtimeSnapshot.agenticMicropayments.assetMode} · {runtimeSnapshot.agenticMicropayments.freshness}
              </div>
            ) : null}
          </div>
          <div className="rounded-[26px] border border-white/8 bg-white/[0.04] p-5">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/42">Runtime freshness</div>
            <div className="mt-2 text-base font-medium text-white">{runtimeSnapshot.freshness}</div>
          </div>
        </div>
      </div>

      <DevnetExecutionScreenshotsStrip />
      <PrivacyPolicySelector compact />
      <PrivacyProofExplainer />
      <JudgeTechnologyGuide />
      <JudgeRuntimeLogsPanel />
    </OperationsShell>
  );
}
