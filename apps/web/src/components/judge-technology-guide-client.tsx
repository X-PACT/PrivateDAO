"use client";

import Link from "next/link";
import { ArrowUpRight, LockKeyhole, Radio, ShieldCheck, WalletCards } from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { JudgeRuntimeLogsSnapshot } from "@/lib/judge-runtime-logs";

type JudgeTechnologyGuideClientProps = {
  snapshot: JudgeRuntimeLogsSnapshot;
};

function buildSolanaTxUrl(signature: string) {
  return `https://solscan.io/tx/${signature}?cluster=devnet`;
}

export function JudgeTechnologyGuideClient({ snapshot }: JudgeTechnologyGuideClientProps) {
  const { copy } = useI18n();
  const content = copy.pageContent.judgeTechnologyGuide;

  const proposalTx = snapshot.governance.entries[0]?.signature;
  const revealTx = snapshot.governance.entries.find((entry) => entry.label === "reveal")?.signature;
  const confidentialTx = snapshot.confidential.entries[0]?.signature;
  const micropaymentTx = snapshot.agenticMicropayments.entries[0]?.signature;

  const cardCopy = {
    voting: content.cards.find((card) => card.key === "voting")!,
    payments: content.cards.find((card) => card.key === "payments")!,
    runtime: content.cards.find((card) => card.key === "runtime")!,
    treasury: content.cards.find((card) => card.key === "treasury")!,
  };

  const cards = [
    {
      title: cardCopy.voting.title,
      byline: cardCopy.voting.byline,
      summary: cardCopy.voting.summary,
      routeHref: "/govern",
      routeLabel: cardCopy.voting.routeLabel,
      explorerHref: revealTx ? buildSolanaTxUrl(revealTx) : null,
      explorerLabel: cardCopy.voting.explorerLabel,
      icon: ShieldCheck,
    },
    {
      title: cardCopy.payments.title,
      byline: cardCopy.payments.byline,
      summary: cardCopy.payments.summary,
      routeHref: "/security",
      routeLabel: cardCopy.payments.routeLabel,
      explorerHref: confidentialTx ? buildSolanaTxUrl(confidentialTx) : null,
      explorerLabel: cardCopy.payments.explorerLabel,
      icon: LockKeyhole,
    },
    {
      title: cardCopy.runtime.title,
      byline: cardCopy.runtime.byline,
      summary: cardCopy.runtime.summary,
      routeHref: "/services",
      routeLabel: cardCopy.runtime.routeLabel,
      explorerHref: proposalTx ? buildSolanaTxUrl(proposalTx) : null,
      explorerLabel: cardCopy.runtime.explorerLabel,
      icon: Radio,
    },
    {
      title: cardCopy.treasury.title,
      byline: cardCopy.treasury.byline,
      summary: cardCopy.treasury.summary,
      routeHref: "/documents/agentic-treasury-micropayment-rail",
      routeLabel: cardCopy.treasury.routeLabel,
      explorerHref: micropaymentTx ? buildSolanaTxUrl(micropaymentTx) : null,
      explorerLabel: cardCopy.treasury.explorerLabel,
      icon: WalletCards,
    },
  ] as const;

  return (
    <section className="grid gap-5">
      <div className="max-w-4xl">
        <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">{content.eyebrow}</div>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{content.title}</h2>
        <p className="mt-4 text-sm leading-7 text-white/62">{content.body}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title} className="border-white/10 bg-white/[0.04]">
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-black/25 text-cyan-100">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/72">{card.byline}</div>
                </div>
                <CardTitle className="text-2xl text-white">{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-sm leading-7 text-white/60">{card.summary}</p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <Link
                    href={card.routeHref}
                    className="inline-flex items-center gap-2 rounded-full border border-cyan-300/24 bg-cyan-300/[0.08] px-4 py-2 text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-300/[0.14]"
                  >
                    {card.routeLabel}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  {card.explorerHref ? (
                    <a
                      href={card.explorerHref}
                      rel="noreferrer"
                      target="_blank"
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-white/72 transition hover:border-white/20 hover:text-white"
                    >
                      {card.explorerLabel}
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
