import Link from "next/link";
import { ArrowUpRight, LockKeyhole, Radio, ShieldCheck, WalletCards } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getJudgeRuntimeLogsSnapshot } from "@/lib/judge-runtime-logs";

function buildSolanaTxUrl(signature: string) {
  return `https://solscan.io/tx/${signature}?cluster=devnet`;
}

export function JudgeTechnologyGuide() {
  const snapshot = getJudgeRuntimeLogsSnapshot();
  const proposalTx = snapshot.governance.entries[0]?.signature;
  const revealTx = snapshot.governance.entries.find((entry) => entry.label === "reveal")?.signature;
  const confidentialTx = snapshot.confidential.entries[0]?.signature;
  const micropaymentTx = snapshot.agenticMicropayments.entries[0]?.signature;

  const cards = [
    {
      title: "Keep voting fair before execution",
      byline: "with ZK + commit-reveal",
      summary:
        "The governance flow protects vote intent during the sensitive stage, then exposes the public execution trail when the DAO action is ready to verify.",
      routeHref: "/govern",
      routeLabel: "Run the governance flow",
      explorerHref: revealTx ? buildSolanaTxUrl(revealTx) : null,
      explorerLabel: "Open vote or reveal transaction",
      icon: ShieldCheck,
    },
    {
      title: "Settle sensitive payments without exposing the whole workflow",
      byline: "with REFHE + MagicBlock",
      summary:
        "PrivateDAO keeps payout intent and sensitive settlement context protected, then exposes the blockchain proof a reviewer needs after settlement lands.",
      routeHref: "/security",
      routeLabel: "Open confidential payment corridor",
      explorerHref: confidentialTx ? buildSolanaTxUrl(confidentialTx) : null,
      explorerLabel: "Open confidential payout transaction",
      icon: LockKeyhole,
    },
    {
      title: "Read live state quickly enough to trust it",
      byline: "with Fast RPC + hosted reads",
      summary:
        "Users see fresh state, signatures, logs, and action status quickly enough to trust what happened instead of guessing from a wallet popup or stale status.",
      routeHref: "/services",
      routeLabel: "Open runtime API corridor",
      explorerHref: proposalTx ? buildSolanaTxUrl(proposalTx) : null,
      explorerLabel: "Open a captured runtime transaction",
      icon: Radio,
    },
    {
      title: "Automate treasury actions under policy control",
      byline: "with the policy engine + micropayments",
      summary:
        "Approved DAO policy can drive repeated on-chain settlement actions, so the judge can inspect a real batch settlement trail instead of a single isolated transfer.",
      routeHref: "/documents/agentic-treasury-micropayment-rail",
      routeLabel: "Open the treasury rail brief",
      explorerHref: micropaymentTx ? buildSolanaTxUrl(micropaymentTx) : null,
      explorerLabel: "Open a micropayment transaction",
      icon: WalletCards,
    },
  ] as const;

  return (
    <section className="grid gap-5">
      <div className="max-w-4xl">
        <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">Judge technology guide</div>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Read the technology in plain language, then open the live route and the on-chain proof yourself
        </h2>
        <p className="mt-4 text-sm leading-7 text-white/62">
          This guide is intentionally simple. It explains what each production lane does for a real user, which
          PrivateDAO route lets you try it, and which Devnet transaction lets you verify that the chain recorded the
          action.
        </p>
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
