import Link from "next/link";
import { ArrowUpRight, BadgeCheck, BookOpenText, Bot, Cable, Gamepad2, LockKeyhole, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const offers = [
  {
    title: "Confidential Payroll and Grants",
    byline: "by REFHE + MagicBlock",
    summary:
      "Run sensitive payroll, grant, and treasury payouts from a protected corridor first, then expose the right proof and settlement trail for operators and reviewers.",
    href: "/security",
    cta: "Open confidential payroll corridor",
    icon: LockKeyhole,
  },
  {
    title: "Gaming Rewards and Treasury Control",
    byline: "by Fast RPC + governed rewards",
    summary:
      "Coordinate rewards, approvals, and treasury-linked gaming operations from one browser flow that stays fast, fair, and easy to review on-chain.",
    href: "/intelligence",
    cta: "Open gaming reward corridor",
    icon: Gamepad2,
  },
  {
    title: "Private Governance Operations",
    byline: "by commit-reveal + voice governance",
    summary:
      "Create proposals, vote privately, reveal at the right stage, and execute from one guided flow so a normal user can complete serious DAO actions without terminal habits.",
    href: "/govern",
    cta: "Open governance flow",
    icon: ShieldCheck,
  },
  {
    title: "Agentic Treasury Automation",
    byline: "by policy-bound micropayments",
    summary:
      "Turn approved treasury policy into repeated on-chain settlement actions with runtime evidence attached, so automated execution remains governed and auditable.",
    href: "/documents/agentic-treasury-micropayment-rail",
    cta: "Open agentic treasury rail",
    icon: Bot,
  },
  {
    title: "Runtime API and Fast Reads",
    byline: "by hosted reads + telemetry",
    summary:
      "Deliver fast state updates, diagnostics, analytics, and reviewer packets so operators can trust what the chain is doing in real time.",
    href: "/services",
    cta: "Open runtime API corridor",
    icon: Cable,
  },
  {
    title: "Learn and Ship on Devnet",
    byline: "by 4 lectures + starter kits",
    summary:
      "Take a normal frontend builder from zero to a working Solana product corridor in minutes, then let them practice real wallet, governance, RPC, privacy, and payment flows from the UI.",
    href: "/learn",
    cta: "Open the live bootcamp",
    icon: BookOpenText,
  },
  {
    title: "Judge and Verify Every Operation",
    byline: "by proof + explorer logs",
    summary:
      "Explain the product to a reviewer in plain language, open the matching Devnet hashes, and let them run the same lifecycle themselves without reading protocol internals first.",
    href: "/judge",
    cta: "Open the judge corridor",
    icon: BadgeCheck,
  },
] as const;

export function ProductOfferCards() {
  return (
    <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
      {offers.map((offer) => {
        const Icon = offer.icon;

        return (
          <Link key={offer.title} href={offer.href} className="group">
            <Card className="h-full border-white/10 bg-[linear-gradient(180deg,rgba(12,17,32,0.92),rgba(8,10,22,0.98))] transition hover:border-cyan-300/20 hover:bg-[linear-gradient(180deg,rgba(16,24,44,0.94),rgba(9,12,26,0.99))]">
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-black/25 text-cyan-100">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="mt-1 h-4 w-4 text-white/38 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-100" />
                </div>
                <div className="space-y-2">
                  <div className="text-[11px] uppercase tracking-[0.3em] text-emerald-300/72">{offer.byline}</div>
                  <CardTitle className="text-xl">{offer.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-sm leading-7 text-white/58">{offer.summary}</p>
                <div className="text-sm font-medium text-cyan-200">{offer.cta}</div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
