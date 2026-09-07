"use client";

import dynamic from "next/dynamic";

import type { ExecutionSurfaceSnapshot } from "@/lib/devnet-service-metrics";

const GovernanceSessionPanel = dynamic(
  () => import("@/components/governance-session-panel").then((mod) => mod.GovernanceSessionPanel),
  {
    ssr: false,
    loading: () => null,
  },
);

const GovernanceActionWorkbench = dynamic(
  () => import("@/components/governance-action-workbench").then((mod) => mod.GovernanceActionWorkbench),
  {
    ssr: false,
    loading: () => null,
  },
);

const ProposalWorkspace = dynamic(
  () => import("@/components/proposal-workspace").then((mod) => mod.ProposalWorkspace),
  {
    ssr: false,
    loading: () => null,
  },
);

const WalletRuntimePanel = dynamic(
  () => import("@/components/wallet-runtime-panel").then((mod) => mod.WalletRuntimePanel),
  {
    ssr: false,
    loading: () => null,
  },
);

type CommandCenterLiveShellProps = {
  executionSnapshot: ExecutionSurfaceSnapshot;
};

export function CommandCenterLiveShell({
  executionSnapshot,
}: CommandCenterLiveShellProps) {
  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <GovernanceActionWorkbench />
        <GovernanceSessionPanel title="Payload-driven execution session" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ProposalWorkspace executionSnapshot={executionSnapshot} />
        <WalletRuntimePanel executionSnapshot={executionSnapshot} />
      </div>
    </>
  );
}
