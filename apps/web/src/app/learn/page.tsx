import type { Metadata } from "next";
import Link from "next/link";

import { GettingStartedWorkspace } from "@/components/getting-started-workspace";
import { OperationsShell } from "@/components/operations-shell";
import { ProductLearningGuide } from "@/components/product-learning-guide";
import { VideoCenter } from "@/components/video-center";
import { buttonVariants } from "@/components/ui/button";
import { getExecutionSurfaceSnapshot } from "@/lib/devnet-service-metrics";
import { getJudgeRuntimeLogsSnapshot } from "@/lib/judge-runtime-logs";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Learn",
  description:
    "Learn PrivateDAO through the shortest onboarding path, wallet-first Devnet flows, and product-guided walkthroughs.",
  path: "/learn",
  keywords: ["learn", "onboarding", "devnet", "wallet-first", "walkthrough"],
});

export default function LearnPage() {
  const executionSnapshot = getExecutionSurfaceSnapshot();
  const runtimeSnapshot = getJudgeRuntimeLogsSnapshot();

  return (
    <OperationsShell
      eyebrow="Learn"
      title="Learn PrivateDAO through the shortest onboarding path and a plain-language product guide"
      description="This route packages onboarding, wallet-first entry, product explanation, real Devnet verification steps, and the clearest way to understand how governance, payments, gaming, privacy, API, and RPC fit together."
      badges={[
        { label: "Wallet-first", variant: "cyan" },
        { label: "Devnet live", variant: "success" },
        { label: "Guide + proof", variant: "violet" },
      ]}
    >
      <ProductLearningGuide
        executionSnapshot={executionSnapshot}
        runtimeSnapshot={runtimeSnapshot}
      />
      <div className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.08] p-6">
        <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/78">Ready to try it?</div>
        <h2 className="mt-3 text-2xl font-semibold text-white">Use one short path on Devnet</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/64">
          Start in the browser, connect a Devnet wallet, move into the governance flow, then open the judge route to
          verify signatures, proof, runtime evidence, and the blockchain trail itself. The learning surface stays
          here for context, but the real product experience starts on the next click and remains understandable to a
          normal user without scripts or terminal work.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/start" className={cn(buttonVariants({ size: "sm" }))}>
            Try it on Devnet
          </Link>
          <Link href="/judge" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
            Open judge route
          </Link>
        </div>
      </div>
      <GettingStartedWorkspace executionSnapshot={executionSnapshot} />
      <VideoCenter compact />
    </OperationsShell>
  );
}
