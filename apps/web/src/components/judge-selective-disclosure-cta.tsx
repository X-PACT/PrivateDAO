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

const scenarioRoutes = {
  auditor: "/documents/canonical-custody-proof",
  committee: "/documents/selective-disclosure-operating-surface",
  partner: "/services/privacy-sdk-api-starter",
  incident: "/documents/privacy-and-encryption-proof-guide",
} as const;

export function JudgeSelectiveDisclosureCta() {
  const { copy } = useI18n();
  const content = copy.pageContent.judgeDisclosure;
  const [selectedKey, setSelectedKey] = useState<(typeof content.scenarios)[number]["key"]>("auditor");

  const selectedScenario = useMemo(
    () => content.scenarios.find((entry) => entry.key === selectedKey) ?? content.scenarios[0]!,
    [content.scenarios, selectedKey],
  );

  return (
    <section className="grid gap-5 rounded-[30px] border border-cyan-300/16 bg-cyan-300/[0.06] p-6">
      <div className="max-w-4xl">
        <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/74">{content.eyebrow}</div>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{content.title}</h2>
        <p className="mt-4 text-sm leading-7 text-white/64">{content.description}</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {content.scenarios.map((scenario) => {
          const active = scenario.key === selectedKey;
          const Icon = scenarioIcons[scenario.key];

          return (
            <button
              key={scenario.key}
              type="button"
              onClick={() => setSelectedKey(scenario.key)}
              className={cn(
                "rounded-[24px] border p-5 text-left transition",
                active
                  ? "border-cyan-300/28 bg-cyan-300/[0.09]"
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

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-black/18 p-5">
        <div className="max-w-3xl">
          <div className="text-lg font-medium text-white">{selectedScenario.title}</div>
          <p className="mt-2 text-sm leading-7 text-white/62">{selectedScenario.summary}</p>
        </div>
        <Link href={scenarioRoutes[selectedScenario.key]} className={cn(buttonVariants({ size: "sm" }))}>
          {content.openScenario}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
