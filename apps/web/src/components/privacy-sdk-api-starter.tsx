"use client";

import Link from "next/link";
import { ArrowUpRight, Blocks, Cable, FileSearch, ShieldCheck } from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PrivacySdkApiStarterProps = {
  compact?: boolean;
};

const githubBase = "https://github.com/X-PACT/PrivateDAO/tree/main";

const starterCards = [
  {
    key: "browser",
    href: "/wallet-template",
    codeHref: `${githubBase}/templates/frontend-solana-bootcamp/wallet-connect-starter`,
    icon: Blocks,
  },
  {
    key: "readApi",
    href: "/services",
    codeHref: `${githubBase}/scripts/lib/read-node.ts`,
    icon: Cable,
  },
  {
    key: "policy",
    href: "/products",
    codeHref: `${githubBase}/apps/web/src/components/privacy-policy-selector.tsx`,
    icon: ShieldCheck,
  },
  {
    key: "disclosure",
    href: "/trust",
    codeHref: `${githubBase}/docs/canonical-custody-proof.md`,
    icon: FileSearch,
  },
] as const;

export function PrivacySdkApiStarter({ compact = false }: PrivacySdkApiStarterProps) {
  const { copy } = useI18n();

  return (
    <section className="grid gap-5">
      <div className="max-w-4xl">
        <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">{copy.sdkStarter.eyebrow}</div>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{copy.sdkStarter.title}</h2>
        <p className="mt-4 text-sm leading-7 text-white/62">{copy.sdkStarter.description}</p>
      </div>

      <div className={cn("grid gap-4", compact ? "xl:grid-cols-2" : "xl:grid-cols-4")}>
        {starterCards.map((card, index) => {
          const localizedCard = copy.sdkStarter.cards[index]!;
          const Icon = card.icon;

          return (
            <div key={card.key} className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-black/20 text-cyan-100">
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-4 text-lg font-medium text-white">{localizedCard.title}</div>
              <p className="mt-3 text-sm leading-7 text-white/60">{localizedCard.summary}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href={card.href} className={cn(buttonVariants({ size: "sm" }))}>
                  {copy.sdkStarter.openStarter}
                </Link>
                <a
                  href={card.codeHref}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
                >
                  {copy.sdkStarter.openCode}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
