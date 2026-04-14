"use client";

import dynamic from "next/dynamic";

export const GovernWorkbenchClient = dynamic(
  () => import("@/components/governance-action-workbench").then((mod) => mod.GovernanceActionWorkbench),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-3xl border border-white/8 bg-white/4 p-6 text-sm text-white/60">
        Loading guided governance flow...
      </div>
    ),
  },
);
