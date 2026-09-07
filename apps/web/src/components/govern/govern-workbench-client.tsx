"use client";

import dynamic from "next/dynamic";

export const GovernWorkbenchClient = dynamic(
  () => import("@/components/governance-action-workbench").then((mod) => mod.GovernanceActionWorkbench),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-3xl border border-emerald-300/16 bg-emerald-300/[0.08] p-6 text-sm leading-7 text-white/72">
        Wallet-first governance controls are mounted in the browser for safe signing. The page content above is already reviewable while the wallet adapter hydrates.
      </div>
    ),
  },
);
