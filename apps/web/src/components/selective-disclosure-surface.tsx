"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Eye, FileSearch, LockKeyhole, ShieldCheck } from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const scenarioIcons = {
  auditor: FileSearch,
  committee: ShieldCheck,
  partner: Eye,
  incident: LockKeyhole,
} as const;

const scenarioLinks = {
  auditor: "/documents/canonical-custody-proof",
  committee: "/judge",
  partner: "/services/privacy-sdk-api-starter",
  incident: "/documents/privacy-and-encryption-proof-guide",
} as const;

export function SelectiveDisclosureSurface() {
  const { copy } = useI18n();
  const [selectedKey, setSelectedKey] = useState<(typeof copy.selectiveDisclosure.scenarios)[number]["key"]>("auditor");

  const selectedScenario = useMemo(
    () => copy.selectiveDisclosure.scenarios.find((entry) => entry.key === selectedKey) ?? copy.selectiveDisclosure.scenarios[0]!,
    [copy.selectiveDisclosure.scenarios, selectedKey],
  );

  return (
    <section className="grid gap-5">
      <div className="max-w-4xl">
        <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">{copy.selectiveDisclosure.eyebrow}</div>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{copy.selectiveDisclosure.title}</h2>
        <p className="mt-4 text-sm leading-7 text-white/62">{copy.selectiveDisclosure.description}</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {copy.selectiveDisclosure.scenarios.map((scenario) => {
          const active = scenario.key === selectedKey;
          const Icon = scenarioIcons[scenario.key];

          return (
            <button
              key={scenario.key}
              type="button"
              onClick={() => setSelectedKey(scenario.key)}
              className={cn(
                "rounded-[26px] border p-5 text-left transition",
                active
                  ? "border-cyan-300/28 bg-cyan-300/[0.08]"
                  : "border-white/10 bg-white/[0.04] hover:border-white/16 hover:bg-white/[0.06]",
              )}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-black/20 text-cyan-100">
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-4 text-lg font-medium text-white">{scenario.title}</div>
              <p className="mt-3 text-sm leading-7 text-white/60">{scenario.summary}</p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.08] p-6">
          <div className="text-xl font-semibold text-white">{selectedScenario.title}</div>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/68">{selectedScenario.summary}</p>

          <div className="mt-5 text-[11px] uppercase tracking-[0.24em] text-cyan-100/78">{copy.selectiveDisclosure.stepsLabel}</div>
          <div className="mt-3 space-y-3">
            {copy.selectiveDisclosure.steps.map((step) => (
              <div key={step} className="rounded-[22px] border border-white/8 bg-black/18 p-4 text-sm leading-7 text-white/62">
                {step}
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/trust" className={cn(buttonVariants({ size: "sm" }))}>
              {copy.selectiveDisclosure.openTrust}
            </Link>
            <Link href="/documents/privacy-and-encryption-proof-guide" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
              {copy.selectiveDisclosure.openGuide}
            </Link>
            <Link href={scenarioLinks[selectedScenario.key]} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
              {copy.selectiveDisclosure.openReviewLane}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/42">{copy.selectiveDisclosure.privateLabel}</div>
            <div className="mt-3 space-y-3">
              {copy.selectiveDisclosure.privateItems.map((item) => (
                <div key={item} className="rounded-[20px] border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/60">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[28px] border border-emerald-300/16 bg-emerald-300/[0.08] p-6">
            <div className="text-[11px] uppercase tracking-[0.24em] text-emerald-100/78">{copy.selectiveDisclosure.publicLabel}</div>
            <div className="mt-3 space-y-3">
              {copy.selectiveDisclosure.publicItems.map((item) => (
                <div key={item} className="rounded-[20px] border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/60">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
