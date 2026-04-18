import Link from "next/link";
import { ArrowUpRight, LockKeyhole, ShieldCheck, WalletCards } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPrivacyProofSnapshot } from "@/lib/privacy-proof-snapshot";

type PrivacyProofExplainerProps = {
  compact?: boolean;
};

export function PrivacyProofExplainer({ compact = false }: PrivacyProofExplainerProps) {
  const snapshot = getPrivacyProofSnapshot();

  const cards = [
    {
      title: "Fair voting without early vote leakage",
      byline: "Commit-reveal + ZK proof anchors",
      privateUntil: "The vote choice stays hidden during the commit stage. The chain records a commitment first, then the reveal later.",
      publicProof: "The reveal and execute signatures are public, and the proof-anchor transaction shows that the review surface is tied to real proposal context.",
      routeHref: "/govern",
      routeLabel: "Run governance flow",
      docHref: "/documents/privacy-and-encryption-proof-guide",
      docLabel: "Open plain-language proof guide",
      explorerHref: snapshot.explorer.governanceRevealHref,
      explorerLabel: "Open reveal transaction",
      extraHref: "/documents/zk-capability-matrix",
      extraLabel: "Open ZK matrix",
      icon: ShieldCheck,
    },
    {
      title: "Confidential settlement with public execution proof",
      byline: "REFHE + MagicBlock corridor",
      privateUntil: "Sensitive payout intent, recipient context, and settlement posture stay protected until the right review stage.",
      publicProof: "The chain still records deposit, private-transfer, settle, and execute hashes so a reviewer can see the corridor land on Devnet without reading the hidden payload itself.",
      routeHref: "/security",
      routeLabel: "Open confidential operations",
      docHref: "/documents/confidential-payout-evidence-packet",
      docLabel: "Open payout evidence packet",
      explorerHref: snapshot.explorer.confidentialSettleHref,
      explorerLabel: "Open settle transaction",
      extraHref: "/documents/settlement-receipt-closure-packet",
      extraLabel: "Open receipt closure packet",
      icon: LockKeyhole,
    },
    {
      title: "Normal users can verify the result from the browser",
      byline: "Fast RPC + logs + wallet-native proof",
      privateUntil: "Nothing secret is forced into plaintext just to make the UI understandable.",
      publicProof: "The product exposes signatures, logs, status, screenshots, and mobile wallet evidence so the same workflow can be checked from a browser, a wallet app, or Solscan.",
      routeHref: "/judge",
      routeLabel: "Open verification route",
      docHref: "/documents/real-device-runtime",
      docLabel: "Open mobile runtime evidence",
      explorerHref: snapshot.explorer.governanceExecuteHref,
      explorerLabel: "Open execute transaction",
      extraHref: "/proof",
      extraLabel: "Open proof center",
      icon: WalletCards,
    },
  ] as const;

  return (
    <section className="grid gap-5">
      <div className={compact ? "max-w-4xl" : "max-w-5xl"}>
        <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">Privacy and encryption, explained simply</div>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          The secret parts stay hidden. The proof that the operation happened stays public.
        </h2>
        <p className="mt-4 text-sm leading-7 text-white/62">
          PrivateDAO does not treat privacy as “nothing is visible.” It treats privacy as stage control. Sensitive vote
          intent and payout context stay protected until the correct step, while the blockchain still records the
          commitment, reveal, settlement, execute, and proof-anchor transactions that a reviewer can inspect.
        </p>
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
                  <div className="text-[11px] uppercase tracking-[0.24em] text-white/42">What stays protected</div>
                  <p className="mt-2 text-sm leading-7 text-white/60">{card.privateUntil}</p>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-white/42">What the reviewer can still verify</div>
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
