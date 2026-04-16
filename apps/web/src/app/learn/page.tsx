import type { Metadata } from "next";

import { GettingStartedWorkspace } from "@/components/getting-started-workspace";
import { OperationsShell } from "@/components/operations-shell";
import { ProductLearningGuide } from "@/components/product-learning-guide";
import { VideoCenter } from "@/components/video-center";
import { getExecutionSurfaceSnapshot } from "@/lib/devnet-service-metrics";
import { getJudgeRuntimeLogsSnapshot } from "@/lib/judge-runtime-logs";
import { buildRouteMetadata } from "@/lib/route-metadata";

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
      <GettingStartedWorkspace executionSnapshot={executionSnapshot} />
      <VideoCenter compact />
    </OperationsShell>
  );
}
