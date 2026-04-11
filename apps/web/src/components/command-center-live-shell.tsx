"use client";

import dynamic from "next/dynamic";

import type { ExecutionSurfaceSnapshot } from "@/lib/devnet-service-metrics";

const GovernanceActionWorkbench = dynamic(
  () => import("@/components/governance-action-workbench").then((mod) => mod.GovernanceActionWorkbench),
  {
    ssr: false,
    loading: () => <div className="rounded-3xl border border-white/8 bg-white/4 p-6 text-sm text-white/60">Loading governance workbench…</div>,
  },
);

const ProposalWorkspace = dynamic(
  () => import("@/components/proposal-workspace").then((mod) => mod.ProposalWorkspace),
  {
    ssr: false,
    loading: () => <div className="rounded-3xl border border-white/8 bg-white/4 p-6 text-sm text-white/60">Loading proposal workspace…</div>,
  },
);

const WalletRuntimePanel = dynamic(
  () => import("@/components/wallet-runtime-panel").then((mod) => mod.WalletRuntimePanel),
  {
    ssr: false,
    loading: () => <div className="rounded-3xl border border-white/8 bg-white/4 p-6 text-sm text-white/60">Loading wallet runtime…</div>,
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
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ProposalWorkspace executionSnapshot={executionSnapshot} />
        <WalletRuntimePanel executionSnapshot={executionSnapshot} />
      </div>
    </>
  );
}
