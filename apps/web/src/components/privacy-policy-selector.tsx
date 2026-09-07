"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, LockKeyhole, ShieldCheck, WalletCards } from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const policyRoutes = {
  reviewer: {
    runHref: "/judge",
    verifyHref: "/proof",
    icon: BadgeCheck,
  },
  committee: {
    runHref: "/govern",
    verifyHref: "/judge",
    icon: ShieldCheck,
  },
  payout: {
    runHref: "/security",
    verifyHref: "/documents/privacy-and-encryption-proof-guide",
    icon: WalletCards,
  },
  disclosure: {
    runHref: "/trust",
    verifyHref: "/documents/canonical-custody-proof",
    icon: LockKeyhole,
  },
} as const;

type PrivacyPolicySelectorProps = {
  compact?: boolean;
};

export function PrivacyPolicySelector({ compact = false }: PrivacyPolicySelectorProps) {
  const { copy } = useI18n();
  const [selectedKey, setSelectedKey] = useState<(typeof copy.privacySelector.policies)[number]["key"]>("reviewer");

  const selectedPolicy = useMemo(
    () => copy.privacySelector.policies.find((policy) => policy.key === selectedKey) ?? copy.privacySelector.policies[0]!,
    [copy.privacySelector.policies, selectedKey],
  );

  return (
    <section className="grid gap-5">
      <div className="max-w-4xl">
        <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">{copy.privacySelector.eyebrow}</div>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{copy.privacySelector.title}</h2>
        <p className="mt-4 text-sm leading-7 text-white/62">{copy.privacySelector.description}</p>
      </div>

      <div className={cn("grid gap-4", compact ? "xl:grid-cols-2" : "xl:grid-cols-4")}>
        {copy.privacySelector.policies.map((policy) => {
          const route = policyRoutes[policy.key];
          const Icon = route.icon;
          const active = selectedKey === policy.key;

          return (
            <button
              key={policy.key}
              type="button"
              onClick={() => setSelectedKey(policy.key)}
              className={cn(
                "rounded-[26px] border p-5 text-left transition",
                active
                  ? "border-cyan-300/28 bg-cyan-300/[0.08]"
                  : "border-white/10 bg-white/[0.04] hover:border-white/16 hover:bg-white/[0.06]",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-black/20 text-cyan-100">
                  <Icon className="h-5 w-5" />
                </div>
                {active ? (
                  <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-cyan-100">
                    {copy.privacySelector.bestFit}
                  </span>
                ) : null}
              </div>
              <div className="mt-4 text-[11px] uppercase tracking-[0.24em] text-emerald-300/72">{policy.tech}</div>
              <div className="mt-2 text-lg font-medium text-white">{policy.title}</div>
              <p className="mt-3 text-sm leading-7 text-white/60">{policy.summary}</p>
            </button>
          );
        })}
      </div>

      <div className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.08] p-6">
        <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-100/78">{copy.privacySelector.bestFit}</div>
        <div className="mt-3 text-xl font-semibold text-white">{selectedPolicy.title}</div>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/68">{selectedPolicy.summary}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={policyRoutes[selectedPolicy.key].runHref} className={cn(buttonVariants({ size: "sm" }))}>
            {copy.privacySelector.runPolicy}
          </Link>
          <Link href={policyRoutes[selectedPolicy.key].verifyHref} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            {copy.privacySelector.verifyPolicy}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
