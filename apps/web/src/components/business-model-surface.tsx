"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const revenueStreams = [
  {
    title: "Usage-priced privacy operations",
    summary:
      "Charge per confidential payout, reviewer-grade proof packet, or privacy-heavy treasury action when the user is consuming expensive execution or verification rails.",
  },
  {
    title: "Organization operating plans",
    summary:
      "Package browser governance, hosted reads, operator support, selective disclosure, and rollout help into pilot, professional, and institutional lanes.",
  },
  {
    title: "PDAO access and treasury alignment",
    summary:
      "Use PDAO for governance rights, discount posture, and accountability layers without pretending it is already the sole billing token for every action.",
  },
] as const;

const internalModules = [
  {
    title: "Usability engine",
    summary:
      "Community feedback, wallet friction reduction, language clarity, and route simplification stay tied to the live product instead of a separate growth deck.",
  },
  {
    title: "Pricing watch",
    summary:
      "Keep pricing hypotheses visible, compare rails, and adjust entry points without changing the truth boundary around what is already live.",
  },
  {
    title: "Security and review automation",
    summary:
      "Coverage, fuzzing, runtime evidence, and review tooling support a stronger business posture because the service must remain auditable while it scales.",
  },
  {
    title: "Scalable service packaging",
    summary:
      "The same infrastructure must serve a normal user, a grant reviewer, a DAO operator, and later an institutional buyer without breaking the wallet-first flow.",
  },
] as const;

export function BusinessModelSurface() {
  return (
    <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 sm:p-7">
      <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-200/82">Business model</div>
      <h2 className="mt-3 max-w-4xl text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        Turn the live Testnet product into a sustainable infrastructure business without faking mainnet maturity
      </h2>
      <p className="mt-4 max-w-4xl text-sm leading-7 text-white/66">
        The commercial model stays simple and defensible: charge for privacy-heavy execution, sell organization-grade
        operating plans, and keep the wallet-first browser experience strong enough that a normal user can understand
        the value before any enterprise conversation starts.
      </p>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        {revenueStreams.map((item) => (
          <div key={item.title} className="rounded-[24px] border border-white/8 bg-black/20 p-5">
            <div className="text-base font-semibold text-white">{item.title}</div>
            <div className="mt-3 text-sm leading-7 text-white/62">{item.summary}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-[24px] border border-cyan-300/16 bg-cyan-300/[0.08] p-5 text-sm leading-7 text-white/70">
        The current truthful commercial rail is a <span className="font-semibold text-white">Testnet billing rehearsal</span>:
        a visitor with Testnet SOL can pay a small on-chain amount from the same wallet-first product, then inspect the
        signature and logs in the explorer. That proves the business logic on-chain without pretending there is already
        a finished mainnet checkout stack.
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {internalModules.map((item) => (
          <div key={item.title} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
            <div className="text-base font-semibold text-white">{item.title}</div>
            <div className="mt-3 text-sm leading-7 text-white/60">{item.summary}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/services/testnet-billing-rehearsal" className={cn(buttonVariants({ size: "sm" }))}>
          Open Testnet billing rehearsal
        </Link>
        <Link href="/documents/pricing-model" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
          Open pricing model
        </Link>
        <Link href="/documents/service-catalog" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
          Open service catalog
        </Link>
      </div>
    </section>
  );
}
