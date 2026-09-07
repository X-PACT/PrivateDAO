"use client";

import Link from "next/link";
import { ArrowUpRight, LockKeyhole, ShieldCheck, WalletCards } from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PrivacyProofSnapshot } from "@/lib/privacy-proof-snapshot";

type PrivacyProofExplainerClientProps = {
  compact?: boolean;
  snapshot: PrivacyProofSnapshot;
};

export function PrivacyProofExplainerClient({
  compact = false,
  snapshot,
}: PrivacyProofExplainerClientProps) {
  const { copy } = useI18n();
  const content = copy.pageContent.privacyProofExplainer;

  const cardCopy = {
    voting: content.cards.find((card) => card.key === "voting")!,
    settlement: content.cards.find((card) => card.key === "settlement")!,
    browser: content.cards.find((card) => card.key === "browser")!,
  };

  const cards = [
    {
      title: cardCopy.voting.title,
      byline: cardCopy.voting.byline,
      privateUntil: cardCopy.voting.privateUntil,
      publicProof: cardCopy.voting.publicProof,
      routeHref: "/govern",
      routeLabel: cardCopy.voting.routeLabel,
      docHref: "/documents/privacy-and-encryption-proof-guide",
      docLabel: cardCopy.voting.docLabel,
      explorerHref: snapshot.explorer.governanceRevealHref,
      explorerLabel: cardCopy.voting.explorerLabel,
      extraHref: "/documents/zk-capability-matrix",
      extraLabel: cardCopy.voting.extraLabel,
      icon: ShieldCheck,
    },
    {
      title: cardCopy.settlement.title,
      byline: cardCopy.settlement.byline,
      privateUntil: cardCopy.settlement.privateUntil,
      publicProof: cardCopy.settlement.publicProof,
      routeHref: "/security",
      routeLabel: cardCopy.settlement.routeLabel,
      docHref: "/documents/confidential-payout-evidence-packet",
      docLabel: cardCopy.settlement.docLabel,
      explorerHref: snapshot.explorer.confidentialSettleHref,
      explorerLabel: cardCopy.settlement.explorerLabel,
      extraHref: "/documents/settlement-receipt-closure-packet",
      extraLabel: cardCopy.settlement.extraLabel,
      icon: LockKeyhole,
    },
    {
      title: cardCopy.browser.title,
      byline: cardCopy.browser.byline,
      privateUntil: cardCopy.browser.privateUntil,
      publicProof: cardCopy.browser.publicProof,
      routeHref: "/judge",
      routeLabel: cardCopy.browser.routeLabel,
      docHref: "/documents/real-device-runtime",
      docLabel: cardCopy.browser.docLabel,
      explorerHref: snapshot.explorer.governanceExecuteHref,
      explorerLabel: cardCopy.browser.explorerLabel,
      extraHref: "/proof",
      extraLabel: cardCopy.browser.extraLabel,
      icon: WalletCards,
    },
  ] as const;

  return (
    <section className="grid gap-5">
      <div className={compact ? "max-w-4xl" : "max-w-5xl"}>
        <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">{content.eyebrow}</div>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{content.title}</h2>
        <p className="mt-4 text-sm leading-7 text-white/62">{content.body}</p>
      </div>

      <div className={compact ? "grid gap-5 lg:grid-cols-3" : "grid gap-5 lg:grid-cols-3"}>
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
                <div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-white/42">{content.protectedLabel}</div>
                  <p className="mt-2 text-sm leading-7 text-white/60">{card.privateUntil}</p>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-white/42">{content.publicProofLabel}</div>
                  <p className="mt-2 text-sm leading-7 text-white/60">{card.publicProof}</p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  <Link
                    href={card.routeHref}
                    className="inline-flex items-center gap-2 rounded-full border border-cyan-300/24 bg-cyan-300/[0.08] px-4 py-2 text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-300/[0.14]"
                  >
                    {card.routeLabel}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href={card.docHref}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-white/72 transition hover:border-white/20 hover:text-white"
                  >
                    {card.docLabel}
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
                  <Link
                    href={card.extraHref}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-white/72 transition hover:border-white/20 hover:text-white"
                  >
                    {card.extraLabel}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
