"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ExecuteCurrentOperationPanelProps = {
  governanceStatus: string;
  proposalFlowHealth: string;
  intelligenceStatus: string;
  proofFreshness: string;
};

type OperationMode = "private-payroll" | "vendor-payment" | "treasury-rebalance" | "rewards-gaming";

const modeLabels: Record<OperationMode, string> = {
  "private-payroll": "Private Payroll",
  "vendor-payment": "Vendor Payment",
  "treasury-rebalance": "Treasury Rebalance",
  "rewards-gaming": "Rewards / Gaming",
};

const privacyRailProfiles = {
  cloak: {
    title: "Cloak private settlement lane",
    fit: "Best for payroll, vendor settlement, and selective-disclosure treasury motions.",
    delivery:
      "Live now as encrypted payload preparation, receipt continuity, and proof-linked private operation framing. Direct settlement depth is under continuous expansion.",
    proofHref: "/proof",
    routeHref: "/execute#private-payroll",
    routeLabel: "Open payroll lane",
  },
  umbra: {
    title: "Umbra confidential payout lane",
    fit: "Best for recipient privacy, claim-style distribution, and user-facing confidential payout UX.",
    delivery:
      "Live now as a concrete product lane and reviewer-safe payout path. Direct settlement binding is being deepened inside the same execution corridor.",
    proofHref: "/judge",
    routeHref: "/execute#vendor-payment",
    routeLabel: "Open vendor lane",
  },
  magicblock: {
    title: "MagicBlock execution corridor",
    fit: "Best for responsive private actions, rewards, and runtime-sensitive governed execution.",
    delivery:
      "Evidence-backed in the current package as a faster execution corridor with receipt continuity and runtime visibility.",
    proofHref: "/proof",
    routeHref: "/execute#rewards-gaming",
    routeLabel: "Open rewards lane",
  },
  standard: {
    title: "Standard public testnet lane",
    fit: "Best for baseline governance, treasury actions, and visible on-chain settlement on Solana Testnet.",
    delivery: "Live now as the cleanest path for standard DAO lifecycle and treasury execution verification.",
    proofHref: "/judge",
    routeHref: "/govern",
    routeLabel: "Open govern flow",
  },
} as const;

export function ExecuteCurrentOperationPanel({
  governanceStatus,
  proposalFlowHealth,
  intelligenceStatus,
  proofFreshness,
}: ExecuteCurrentOperationPanelProps) {
  const [mode, setMode] = useState<OperationMode>("private-payroll");
  const [asset, setAsset] = useState<"PUSD" | "AUDD" | "USDC" | "USDT" | "SOL">("PUSD");
  const [privacyRail, setPrivacyRail] = useState<"cloak" | "umbra" | "magicblock" | "standard">("cloak");

  const summary = useMemo(
    () => ({
      policyLock: mode === "treasury-rebalance" ? "route-bound policy" : "proposal-bound policy",
      requiresIntelligence: "required before execute",
      stablecoinMode:
        asset === "AUDD"
          ? "AUDD regional mode"
          : asset === "PUSD"
            ? "PUSD institutional mode"
            : asset === "SOL"
              ? "SOL neutral mode"
              : "USDC/USDT global mode",
      proofRequirement: mode === "private-payroll" || mode === "vendor-payment" ? "enhanced receipt + audit packet" : "standard receipt + runtime logs",
    }),
    [asset, mode],
  );

  const selectedRailProfile = privacyRailProfiles[privacyRail];
  const recommendedRail =
    mode === "private-payroll" || mode === "vendor-payment"
      ? "cloak"
      : mode === "rewards-gaming"
        ? "magicblock"
        : "standard";

  return (
    <aside className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,20,36,0.96),rgba(8,12,24,0.98))] p-5 xl:sticky xl:top-28 xl:max-h-[calc(100vh-8rem)] xl:overflow-auto">
      <div className="text-[11px] uppercase tracking-[0.24em] text-white/42">Current Operation</div>
      <div className="mt-3 text-lg font-semibold text-white">{modeLabels[mode]}</div>

      <div className="mt-4 grid gap-3">
        <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">Mode</div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(Object.keys(modeLabels) as OperationMode[]).map((entry) => (
              <button
                key={entry}
                className={cn(
                  "rounded-xl border px-2 py-1.5 text-xs uppercase tracking-[0.15em] transition",
                  mode === entry
                    ? "border-cyan-300/26 bg-cyan-300/[0.12] text-cyan-100"
                    : "border-white/10 bg-black/20 text-white/58",
                )}
                onClick={() => setMode(entry)}
                type="button"
              >
                {entry.split("-")[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">Asset</div>
          <select
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
            onChange={(event) => setAsset(event.target.value as "PUSD" | "AUDD" | "USDC" | "USDT" | "SOL")}
            value={asset}
          >
            <option value="PUSD">PUSD</option>
            <option value="AUDD">AUDD</option>
            <option value="USDC">USDC</option>
            <option value="USDT">USDT</option>
            <option value="SOL">SOL</option>
          </select>
        </div>

        <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">Privacy Rail</div>
          <select
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
            onChange={(event) => setPrivacyRail(event.target.value as "cloak" | "umbra" | "magicblock" | "standard")}
            value={privacyRail}
          >
            <option value="cloak">Cloak</option>
            <option value="umbra">Umbra</option>
            <option value="magicblock">MagicBlock</option>
            <option value="standard">Standard</option>
          </select>
          <div className="mt-3 rounded-xl border border-cyan-300/16 bg-cyan-300/[0.08] px-3 py-2 text-xs leading-6 text-white/72">
            <div className="uppercase tracking-[0.18em] text-cyan-100/78">Selected rail</div>
            <div className="mt-1 text-sm text-white">{selectedRailProfile.title}</div>
            <div className="mt-1">{selectedRailProfile.fit}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {[
          { label: "Governance status", value: governanceStatus },
          { label: "Proposal flow health", value: proposalFlowHealth },
          { label: "Intelligence status", value: intelligenceStatus },
          { label: "Proof freshness", value: proofFreshness },
          { label: "Policy lock", value: summary.policyLock },
          { label: "Stablecoin mode", value: summary.stablecoinMode },
          { label: "Proof requirement", value: summary.proofRequirement },
          { label: "Intelligence gate", value: summary.requiresIntelligence },
          { label: "Recommended rail", value: privacyRailProfiles[recommendedRail].title },
        ].map((entry) => (
          <div key={entry.label} className="rounded-xl border border-white/8 bg-black/20 px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.17em] text-white/40">{entry.label}</div>
            <div className="mt-1 text-sm text-white/74">{entry.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-emerald-300/16 bg-emerald-300/[0.08] p-3">
        <div className="text-[11px] uppercase tracking-[0.2em] text-emerald-100/76">Rail delivery</div>
        <div className="mt-2 text-sm leading-7 text-white/72">{selectedRailProfile.delivery}</div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link className={cn(buttonVariants({ size: "sm" }))} href="/intelligence">
          Intelligence
        </Link>
        <Link className={cn(buttonVariants({ size: "sm", variant: "secondary" }))} href={selectedRailProfile.proofHref}>
          Proof path
        </Link>
        <Link className={cn(buttonVariants({ size: "sm", variant: "outline" }))} href={selectedRailProfile.routeHref}>
          {selectedRailProfile.routeLabel}
        </Link>
      </div>
    </aside>
  );
}
