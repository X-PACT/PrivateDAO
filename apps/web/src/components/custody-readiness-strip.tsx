"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, KeyRound, ShieldCheck, WalletCards } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { buildCustodyNarrative, custodyEvidenceStorageKey, emptyCustodyEvidence, getCustodyEvidenceCompletion, type CustodyEvidence } from "@/lib/custody-evidence";
import { cn } from "@/lib/utils";

type CustodyReadinessStripProps = {
  context?: "dashboard" | "command-center" | "services";
};

const contextCopy: Record<NonNullable<CustodyReadinessStripProps["context"]>, { label: string; description: string }> = {
  dashboard: {
    label: "Dashboard readiness",
    description: "Execution visibility is stronger when custody evidence is visible before reviewers or buyers inspect the board.",
  },
  "command-center": {
    label: "Command-center readiness",
    description: "Operators need custody state in the same shell as create, vote, reveal, and execute so launch boundaries stay explicit.",
  },
  services: {
    label: "Commercial readiness",
    description: "Buyers and judges should see the custody boundary beside service packaging, not only inside security-only routes.",
  },
};

export function CustodyReadinessStrip({ context = "dashboard" }: CustodyReadinessStripProps) {
  const [evidence, setEvidence] = useState<CustodyEvidence>(emptyCustodyEvidence);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(custodyEvidenceStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<CustodyEvidence>;
      setEvidence({ ...emptyCustodyEvidence, ...parsed });
    } catch {
      setEvidence(emptyCustodyEvidence);
    }
  }, []);

  const completion = useMemo(() => getCustodyEvidenceCompletion(evidence), [evidence]);
  const narrative = useMemo(() => buildCustodyNarrative(evidence), [evidence]);
  const copy = contextCopy[context];
  const missingItems = useMemo(
    () =>
      [
        { key: "multisigAddress", label: "Multisig address", href: "/custody#multisig-address" },
        { key: "threshold", label: "Threshold", href: "/custody#threshold" },
        { key: "signerRoster", label: "Signer roster", href: "/custody#signer-roster" },
        { key: "upgradeTransferSignature", label: "Upgrade transfer signature", href: "/custody#upgrade-transfer-signature" },
        { key: "treasuryTransferSignature", label: "Treasury transfer signature", href: "/custody#treasury-transfer-signature" },
        { key: "postTransferReadouts", label: "Post-transfer readouts", href: "/custody#post-transfer-readouts" },
      ].filter((item) => !completion.checks[item.key as keyof typeof completion.checks]),
    [completion.checks],
  );

  const readinessDetail =
    completion.completed === 0
      ? "No custody ceremony evidence is recorded yet, so trust and mainnet posture must remain bounded."
      : completion.completed < completion.total
        ? "Some ceremony evidence is recorded, which improves reviewer confidence but still leaves launch discipline incomplete."
        : "Custody evidence is fully recorded in-product, which materially improves trust continuity across buyer, reviewer, and operator paths.";

  return (
    <div className="rounded-[28px] border border-cyan-300/16 bg-[linear-gradient(135deg,rgba(8,16,30,0.94),rgba(8,12,24,0.98))] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.22)] sm:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
              <KeyRound className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/72">{copy.label}</div>
              <div className="mt-1 text-lg font-semibold tracking-tight text-white sm:text-xl">{narrative.headline}</div>
            </div>
            <Badge variant={completion.completed === 0 ? "warning" : completion.completed < completion.total ? "cyan" : "success"}>
              {narrative.badge}
            </Badge>
          </div>

          <p className="mt-4 max-w-4xl text-sm leading-7 text-white/62">{copy.description}</p>

          <div className="mt-4 grid gap-3 xl:grid-cols-[1fr_1fr_1.2fr]">
            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-cyan-100">
                <ShieldCheck className="h-4 w-4" />
                <div className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Trust state</div>
              </div>
              <div className="mt-3 text-sm leading-7 text-white/62">{readinessDetail}</div>
            </div>
            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-emerald-100">
                <WalletCards className="h-4 w-4" />
                <div className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Evidence completion</div>
              </div>
              <div className="mt-3 text-2xl font-semibold tracking-tight text-white">
                {completion.completed}/{completion.total}
              </div>
              <div className="mt-2 text-sm leading-7 text-white/54">
                Multisig, threshold, signer roster, transfer signatures, and post-transfer readouts are counted together.
              </div>
            </div>
            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Immediate next move</div>
              <div className="mt-3 text-sm leading-7 text-white/62">{narrative.summary}</div>
            </div>
            <div className="rounded-[22px] border border-amber-300/12 bg-amber-300/[0.06] p-4 xl:col-span-3">
              <div className="flex items-center gap-2 text-amber-100">
                <AlertTriangle className="h-4 w-4" />
                <div className="text-xs uppercase tracking-[0.24em] text-amber-200/78">Missing evidence items</div>
              </div>
              {missingItems.length === 0 ? (
                <div className="mt-3 text-sm leading-7 text-white/62">
                  No missing items are detected in the local custody packet. Keep the recorded values synchronized with the real multisig ceremony and external validation flow.
                </div>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {missingItems.map((item) => (
                    <Link
                      key={item.key}
                      href={item.href}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs font-medium text-white/78 transition hover:border-cyan-300/30 hover:text-white"
                    >
                      {item.label}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 xl:w-auto xl:min-w-[240px]">
          <Link href="/custody" className={cn(buttonVariants({ size: "sm" }), "justify-between")}>
            Open custody workspace
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/documents/launch-trust-packet" className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "justify-between")}>
            Open launch trust packet
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/engage" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}>
            Open buyer path
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
