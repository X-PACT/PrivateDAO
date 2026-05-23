import Link from "next/link";
import { ArrowUpRight, BrainCircuit, Gamepad2, Gavel, KeyRound, LockKeyhole, ReceiptText, ShieldCheck, WalletCards } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const capabilityLanes = [
  {
    icon: Gavel,
    title: "Private governance",
    body: "Create proposals, protect voting intent, execute through wallet-signed Testnet operations, and inspect proof immediately.",
    href: "/govern",
  },
  {
    icon: BrainCircuit,
    title: "Decision intelligence",
    body: "Use GoldRush, QVAC-style local review, and policy context before a signer approves treasury or governance action.",
    href: "/intelligence",
  },
  {
    icon: KeyRound,
    title: "Treasury policy",
    body: "Review stablecoin lanes, Token-2022 identity, route context, and controlled treasury execution before settlement.",
    href: "/treasury",
  },
  {
    icon: LockKeyhole,
    title: "Confidential payroll",
    body: "Package payroll and payout operations as privacy-aware, proof-linked workflows instead of public spreadsheet operations.",
    href: "/payroll",
  },
  {
    icon: ShieldCheck,
    title: "Encrypted payments",
    body: "Route confidential settlement lanes through proof, receipts, and security surfaces without exposing sensitive intent first.",
    href: "/services/cloak-private-settlement",
  },
  {
    icon: Gamepad2,
    title: "GamingDAO rewards",
    body: "Connect tournaments, reward pools, and player-friendly governance to the same wallet-first proof system.",
    href: "/gaming",
  },
  {
    icon: WalletCards,
    title: "Wallet-first web + Android",
    body: "Start from a browser or APK, connect a Testnet wallet, sign, verify, and keep the same operating language.",
    href: "/start",
  },
  {
    icon: ReceiptText,
    title: "Proof and judge route",
    body: "Open live evidence, timelock enforcement, ZK verifier receipt, Token-2022 proof, and runtime logs from one route.",
    href: "/judge",
  },
] as const;

export function ProductCommandCenter({ compact = false }: { compact?: boolean }) {
  return (
    <section className="rounded-[32px] border border-cyan-300/16 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.15),transparent_34%),radial-gradient(circle_at_92%_8%,rgba(20,241,149,0.13),transparent_30%),linear-gradient(180deg,rgba(7,12,24,0.96),rgba(4,7,16,0.98))] p-5 shadow-[0_26px_90px_rgba(0,0,0,0.30)] md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-100/78">One product operating layer</div>
          <h2 className="mt-3 max-w-4xl text-2xl font-semibold tracking-[-0.035em] text-white md:text-3xl">
            Governance, intelligence, confidential money movement, wallet execution, and proof now converge into one usable product.
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-white/64">
            PrivateDAO is not a collection of pages. It is a browser-first Testnet operating system for Solana organizations:
            review the decision, sign from the wallet, run the operation, and verify the evidence from the same interface.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/start" className={cn(buttonVariants({ size: "sm" }))}>
            Start product
          </Link>
          <Link href="/judge" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
            Judge evidence
          </Link>
          <Link href="/pricing" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            Business model
          </Link>
        </div>
      </div>

      <div className={cn("mt-5 grid gap-3", compact ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-2 xl:grid-cols-4")}>
        {capabilityLanes.map((lane) => {
          const Icon = lane.icon;
          return (
            <Link key={lane.title} href={lane.href} className="group rounded-[24px] border border-white/9 bg-black/22 p-4 transition hover:-translate-y-0.5 hover:border-cyan-300/26 hover:bg-black/30">
              <div className="flex items-center justify-between gap-3">
                <div className="rounded-2xl border border-cyan-300/16 bg-cyan-300/[0.09] p-2.5 text-cyan-100">
                  <Icon className="h-4 w-4" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-white/32 transition group-hover:text-cyan-100" />
              </div>
              <div className="mt-3 text-base font-semibold text-white">{lane.title}</div>
              <p className="mt-2 text-sm leading-6 text-white/58">{lane.body}</p>
            </Link>
          );
        })}
      </div>

      {!compact ? (
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {[
            ["Live evidence", "ZK verifier, Squads timelock, Token-2022, runtime logs", "/judge"],
            ["Trust and security", "Custody gates, remediation, audit packets, monitoring surfaces", "/security"],
            ["Learn by doing", "Short lessons that open the matching live product route", "/learn"],
            ["Generate action", "Use assistant and intelligence lanes to prepare decisions and task files", "/assistant"],
          ].map(([title, detail, href]) => (
            <Link key={title} href={href} className="rounded-2xl border border-white/8 bg-white/[0.045] p-4 transition hover:border-emerald-300/20 hover:bg-white/[0.065]">
              <div className="text-sm font-semibold text-white">{title}</div>
              <p className="mt-2 text-xs leading-5 text-white/54">{detail}</p>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
