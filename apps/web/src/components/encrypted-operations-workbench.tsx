"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Copy, Download, LockKeyhole, ShieldCheck, WalletCards } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const operationProfiles = [
  {
    value: "confidential-payroll",
    label: "Confidential payroll",
    summary: "Prepare a governed salary or grant disbursement where the manifest stays off-chain and the settlement path remains reviewable.",
    amountHint: "1,000 USDC",
    recipientCount: "8",
    sponsorLift: ["Privacy", "Umbra", "Encrypt"],
  },
  {
    value: "confidential-bonus",
    label: "Confidential bonus",
    summary: "Route a bonus or retroactive reward through a private manifest and a governed settlement corridor.",
    amountHint: "500 USDC",
    recipientCount: "3",
    sponsorLift: ["Privacy", "Umbra"],
  },
  {
    value: "vendor-confidential-payout",
    label: "Confidential vendor payout",
    summary: "Pay a sensitive vendor or contractor through a treasury-approved path that keeps beneficiary detail private while preserving operator trust.",
    amountHint: "2,500 USDG",
    recipientCount: "1",
    sponsorLift: ["Umbra", "Encrypt"],
  },
] as const;

const privacyModes = [
  {
    value: "manifest-hash-and-commit-reveal",
    label: "Manifest hash + commit-reveal",
    summary: "Use the existing private governance discipline and keep recipient detail in an encrypted off-chain manifest.",
  },
  {
    value: "zk-receipt-bound",
    label: "ZK receipt bound",
    summary: "Attach a verifier-readable proof posture to the operation so the payout can be reviewed as a stronger private execution lane.",
  },
  {
    value: "refhe-gated-settlement",
    label: "REFHE-gated settlement",
    summary: "Keep the operation tied to the confidential settlement corridor used in the current Devnet proof and review surfaces.",
  },
] as const;

const settlementModes = [
  {
    value: "attested-evidence",
    label: "Attested evidence",
    summary: "Use the current settlement evidence posture with explicit reviewer-safe continuity.",
  },
  {
    value: "source-verifiable-receipt",
    label: "Source-verifiable receipt",
    summary: "Aim the operation toward a stronger receipt path that lifts sponsor trust and release readiness.",
  },
  {
    value: "release-candidate-path",
    label: "Release-candidate path",
    summary: "Package the operation as the next trust-lifting milestone in the confidential payout corridor.",
  },
] as const;

const operatorVisibilities = [
  {
    value: "reviewer-safe",
    label: "Reviewer-safe",
    summary: "Keep the operation understandable from public proof and trust routes.",
  },
  {
    value: "operator-focused",
    label: "Operator-focused",
    summary: "Bias the plan toward treasury operators, service review, and execution continuity.",
  },
  {
    value: "hybrid",
    label: "Hybrid",
    summary: "Keep the same plan useful for judges, reviewers, and operators at once.",
  },
] as const;

function selectionLabel<
  T extends ReadonlyArray<{ value: string; label: string }>
>(options: T, value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function EncryptedOperationsWorkbench() {
  const [profile, setProfile] = useState<(typeof operationProfiles)[number]["value"]>("confidential-payroll");
  const [privacyMode, setPrivacyMode] = useState<(typeof privacyModes)[number]["value"]>("manifest-hash-and-commit-reveal");
  const [settlementMode, setSettlementMode] = useState<(typeof settlementModes)[number]["value"]>("attested-evidence");
  const [operatorVisibility, setOperatorVisibility] = useState<(typeof operatorVisibilities)[number]["value"]>("hybrid");
  const [copied, setCopied] = useState(false);

  const activeProfile = operationProfiles.find((item) => item.value === profile) ?? operationProfiles[0];
  const activePrivacy = privacyModes.find((item) => item.value === privacyMode) ?? privacyModes[0];
  const activeSettlement = settlementModes.find((item) => item.value === settlementMode) ?? settlementModes[0];
  const activeVisibility = operatorVisibilities.find((item) => item.value === operatorVisibility) ?? operatorVisibilities[0];

  const plan = useMemo(() => {
    const requestId = `encrypted:${activeProfile.value}:${activePrivacy.value}:${activeSettlement.value}`.toUpperCase();
    const posture =
      activeSettlement.value === "source-verifiable-receipt"
        ? "Trust-lifting confidential operation"
        : activeSettlement.value === "release-candidate-path"
          ? "Release-candidate confidential operation"
          : "Reviewer-safe confidential operation";

    return {
      requestId,
      operationProfile: activeProfile.label,
      privacyMode: activePrivacy.label,
      settlementMode: activeSettlement.label,
      operatorVisibility: activeVisibility.label,
      sponsorLift: activeProfile.sponsorLift,
      recommendedAmount: activeProfile.amountHint,
      recipientCountHint: activeProfile.recipientCount,
      posture,
      rationale: `${activeProfile.summary} ${activePrivacy.summary} ${activeSettlement.summary}`,
      reviewerPath: "/security",
      servicePath: "/services",
      settlementPath: "/documents/settlement-receipt-closure",
      proofPath: "/documents/confidential-payout-evidence-packet",
      nextOperatorAction:
        activeSettlement.value === "source-verifiable-receipt"
          ? "Pair this operation with a stronger receipt narrative and keep the payout path readable from the public proof surfaces."
          : activePrivacy.value === "refhe-gated-settlement"
            ? "Route the operation through the REFHE settlement corridor and preserve the same evidence path through services and trust."
            : "Keep the manifest boundary explicit and carry the same operation plan into treasury review and governed execution.",
    };
  }, [activePrivacy, activeProfile, activeSettlement, activeVisibility]);

  async function copyPlan() {
    await navigator.clipboard.writeText(JSON.stringify(plan, null, 2));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function downloadPlan() {
    const blob = new Blob([JSON.stringify(plan, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `privatedao-${activeProfile.value}-encrypted-operation.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const checklist = [
    `Confirm the operation profile is ${activeProfile.label.toLowerCase()} and the recipient count posture still matches the intended treasury motion.`,
    `Confirm ${selectionLabel(privacyModes, privacyMode)} is the right privacy mode for the sponsor and reviewer expectations.`,
    `Confirm ${selectionLabel(settlementModes, settlementMode)} keeps the trust boundary readable enough for this submission and release stage.`,
    `Confirm ${selectionLabel(operatorVisibilities, operatorVisibility)} keeps the operation understandable to the target reviewer without weakening the privacy story.`,
  ];

  return (
    <Card className="rounded-[28px] border border-emerald-300/18 bg-emerald-300/[0.08] text-white shadow-[0_20px_80px_rgba(16,185,129,0.12)]">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-100/72">
              Encrypted operations lane
            </div>
            <CardTitle className="text-2xl font-semibold text-white">
              Plan a sponsor-grade confidential operation inside the product
            </CardTitle>
          </div>
          <div className="rounded-2xl border border-white/12 bg-black/20 p-3 text-emerald-50">
            <LockKeyhole className="h-5 w-5" />
          </div>
        </div>
        <div className="max-w-4xl text-sm leading-7 text-white/74">
          This workbench turns the confidential payout story into an actual operating plan. It helps the same product read better for Privacy, Umbra, and Encrypt by making the encrypted operation, settlement posture, and reviewer path explicit.
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="space-y-2 text-sm text-white/76">
            <div className="font-medium text-white">Operation profile</div>
            <select
              value={profile}
              onChange={(event) => setProfile(event.target.value as (typeof operationProfiles)[number]["value"])}
              className="w-full rounded-2xl border border-white/12 bg-black/25 px-4 py-3 text-white outline-none transition focus:border-emerald-300/40"
            >
              {operationProfiles.map((option) => (
                <option key={option.value} value={option.value} className="bg-slate-950 text-white">
                  {option.label}
                </option>
              ))}
            </select>
            <div className="text-xs leading-6 text-white/56">{activeProfile.summary}</div>
          </label>
          <label className="space-y-2 text-sm text-white/76">
            <div className="font-medium text-white">Privacy mode</div>
            <select
              value={privacyMode}
              onChange={(event) => setPrivacyMode(event.target.value as (typeof privacyModes)[number]["value"])}
              className="w-full rounded-2xl border border-white/12 bg-black/25 px-4 py-3 text-white outline-none transition focus:border-emerald-300/40"
            >
              {privacyModes.map((option) => (
                <option key={option.value} value={option.value} className="bg-slate-950 text-white">
                  {option.label}
                </option>
              ))}
            </select>
            <div className="text-xs leading-6 text-white/56">{activePrivacy.summary}</div>
          </label>
          <label className="space-y-2 text-sm text-white/76">
            <div className="font-medium text-white">Settlement posture</div>
            <select
              value={settlementMode}
              onChange={(event) => setSettlementMode(event.target.value as (typeof settlementModes)[number]["value"])}
              className="w-full rounded-2xl border border-white/12 bg-black/25 px-4 py-3 text-white outline-none transition focus:border-emerald-300/40"
            >
              {settlementModes.map((option) => (
                <option key={option.value} value={option.value} className="bg-slate-950 text-white">
                  {option.label}
                </option>
              ))}
            </select>
            <div className="text-xs leading-6 text-white/56">{activeSettlement.summary}</div>
          </label>
          <label className="space-y-2 text-sm text-white/76">
            <div className="font-medium text-white">Operator visibility</div>
            <select
              value={operatorVisibility}
              onChange={(event) => setOperatorVisibility(event.target.value as (typeof operatorVisibilities)[number]["value"])}
              className="w-full rounded-2xl border border-white/12 bg-black/25 px-4 py-3 text-white outline-none transition focus:border-emerald-300/40"
            >
              {operatorVisibilities.map((option) => (
                <option key={option.value} value={option.value} className="bg-slate-950 text-white">
                  {option.label}
                </option>
              ))}
            </select>
            <div className="text-xs leading-6 text-white/56">{activeVisibility.summary}</div>
          </label>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[24px] border border-white/12 bg-black/22 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-white">Confidential operation plan</div>
                <div className="mt-1 text-xs leading-6 text-white/56">
                  This plan can be carried into reviewer packets, treasury review, and sponsor-facing submission work without rewriting the product story.
                </div>
              </div>
              <div className="rounded-2xl border border-white/12 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-emerald-100/70">
                {plan.posture}
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/48">Recommended amount</div>
                <div className="mt-2 text-lg font-semibold text-white">{plan.recommendedAmount}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/48">Recipient count hint</div>
                <div className="mt-2 text-lg font-semibold text-white">{plan.recipientCountHint}</div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-emerald-300/16 bg-emerald-300/[0.08] p-4 text-sm leading-7 text-white/72">
              {plan.rationale}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {plan.sponsorLift.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/12 bg-white/6 px-3 py-1 text-xs text-white/78"
                >
                  Raises {item}
                </span>
              ))}
            </div>

            <pre className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-xs leading-6 text-emerald-100/84">
              {JSON.stringify(plan, null, 2)}
            </pre>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={copyPlan}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "border-white/14 bg-transparent text-white hover:bg-white/6",
                )}
              >
                <Copy className="mr-2 h-4 w-4" />
                {copied ? "Copied" : "Copy plan"}
              </button>
              <button
                type="button"
                onClick={downloadPlan}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "border-white/14 bg-transparent text-white hover:bg-white/6",
                )}
              >
                <Download className="mr-2 h-4 w-4" />
                Download JSON
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[24px] border border-white/12 bg-black/22 p-5">
              <div className="flex items-center gap-3 text-sm font-semibold text-white">
                <ShieldCheck className="h-4 w-4 text-emerald-200" />
                Review checklist
              </div>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-white/70">
                {checklist.map((item) => (
                  <li key={item} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[24px] border border-white/12 bg-black/22 p-5">
              <div className="flex items-center gap-3 text-sm font-semibold text-white">
                <WalletCards className="h-4 w-4 text-emerald-200" />
                Continue the same lane
              </div>
              <div className="mt-4 space-y-3 text-sm leading-7 text-white/66">
                <div>Use the security route for the privacy story, the services route for the treasury motion, and the settlement packet for reviewer continuity.</div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={plan.reviewerPath}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "border-white/14 bg-transparent text-white hover:bg-white/6",
                    )}
                  >
                    Open security
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link
                    href={plan.servicePath}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "border-white/14 bg-transparent text-white hover:bg-white/6",
                    )}
                  >
                    Open services
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link
                    href={plan.settlementPath}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "border-white/14 bg-transparent text-white hover:bg-white/6",
                    )}
                  >
                    Settlement packet
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
