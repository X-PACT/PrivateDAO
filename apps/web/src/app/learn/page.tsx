import type { Metadata } from "next";

import { GettingStartedWorkspace } from "@/components/getting-started-workspace";
import { OperationsShell } from "@/components/operations-shell";
import { VideoCenter } from "@/components/video-center";
import { getExecutionSurfaceSnapshot } from "@/lib/devnet-service-metrics";
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

  return (
    <OperationsShell
      eyebrow="Learn"
      title="Learn PrivateDAO through the shortest onboarding and product paths"
      description="This route packages onboarding, wallet-first entry, and the clearest first-run product steps for normal users and judges."
      badges={[
        { label: "Wallet-first", variant: "cyan" },
        { label: "Devnet live", variant: "success" },
        { label: "Search or ask AI", variant: "violet" },
      ]}
    >
      <GettingStartedWorkspace executionSnapshot={executionSnapshot} />
      <VideoCenter compact />
    </OperationsShell>
  );
}
