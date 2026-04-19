import Link from "next/link";
import { ArrowRight, CheckCircle2, MousePointerClick, ReceiptText, ShieldCheck, WalletCards } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const operationSteps = [
  {
    icon: WalletCards,
    title: "1. Connect",
    detail: "Open the wallet button, choose Solflare first or Phantom, Glow, Backpack, or a Wallet Standard wallet, then approve Testnet.",
    href: "/wallet-template",
    cta: "Wallet sandbox",
  },
  {
    icon: MousePointerClick,
    title: "2. Run",
    detail: "Continue to Govern, create the DAO, submit the treasury proposal, then commit, reveal, finalize, and execute from the same browser session.",
    href: "/govern",
    cta: "Open Govern",
  },
  {
    icon: ReceiptText,
    title: "3. Verify",
    detail: "Open the Testnet lifecycle packet and inspect signatures, accounts, treasury delta, and Solscan links without touching the terminal.",
    href: "/documents/testnet-lifecycle-rehearsal-2026-04-19",
    cta: "Open Testnet proof",
  },
  {
    icon: ShieldCheck,
    title: "4. Understand",
    detail: "Use Proof and Learn to see why commit-reveal, ZK policy checks, confidential settlement gates, and reviewer lanes matter.",
    href: "/learn",
    cta: "Open Learn",
  },
] as const;

export function NormalUserOperationPath() {
  return (
    <Card className="overflow-hidden border-emerald-300/16 bg-[radial-gradient(circle_at_12%_0%,rgba(20,241,149,0.18),transparent_32%),radial-gradient(circle_at_88%_12%,rgba(0,194,255,0.14),transparent_30%),linear-gradient(180deg,rgba(7,13,24,0.96),rgba(4,7,16,0.98))]">
      <CardHeader className="space-y-3 p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-emerald-300/22 bg-emerald-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-emerald-100">
            Normal user path
          </span>
          <span className="rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-cyan-100">
            Browser only
          </span>
        </div>
        <CardTitle className="max-w-4xl text-3xl md:text-4xl">
          The product flow is meant to be clicked, signed, executed, and verified by a normal visitor
        </CardTitle>
        <p className="max-w-4xl text-sm leading-7 text-white/62">
          This route turns the technical stack into a simple operating loop: connect a Testnet wallet, run the governance
          lifecycle, inspect the hash, then learn why the privacy and treasury controls are trustworthy.
        </p>
      </CardHeader>
      <CardContent className="px-6 pb-6 md:px-8 md:pb-8">
        <div className="relative grid gap-4 lg:grid-cols-4">
          <div className="pointer-events-none absolute left-6 right-6 top-8 hidden h-px bg-gradient-to-r from-emerald-300/0 via-emerald-300/38 to-cyan-300/0 lg:block" />
          {operationSteps.map((step) => {
            const Icon = step.icon;
            return (
              <Link
                key={step.title}
                href={step.href}
                className="group relative rounded-[28px] border border-white/8 bg-black/24 p-5 transition duration-300 hover:-translate-y-1 hover:border-emerald-300/28 hover:bg-white/[0.055]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-emerald-100 shadow-[0_0_40px_rgba(20,241,149,0.08)]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-5 text-lg font-semibold text-white">{step.title}</div>
                <p className="mt-3 min-h-28 text-sm leading-7 text-white/58">{step.detail}</p>
                <div className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cyan-100">
                  {step.cta}
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-[26px] border border-white/8 bg-white/[0.045] p-4">
          <div className="flex items-start gap-3 text-sm leading-7 text-white/64">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />
            <span>
              Automated checks now cover route loading, wallet modal visibility, wallet options, Testnet proof routing,
              static export integrity, and the script-driven on-chain lifecycle.
            </span>
          </div>
          <Link className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "shrink-0")} href="/proof/?judge=1">
            Verify after running
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
