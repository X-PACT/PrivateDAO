"use client";

import Link from "next/link";

import { useI18n } from "@/components/i18n-provider";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LocalizedJudgePrimer() {
  const { copy } = useI18n();
  const content = copy.pageContent.judgePrimer;

  return (
    <section className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.08] p-6 text-sm leading-7 text-white/72">
      <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/78">{content.eyebrow}</div>
      <h2 className="mt-3 text-xl font-semibold text-white">{content.title}</h2>
      <p className="mt-4">{content.body}</p>
      <ol className="mt-4 space-y-3">
        {content.steps.map((step, index) => (
          <li key={step}>
            {index + 1}. {step}
          </li>
        ))}
      </ol>
      <div className="mt-4 text-white/62">{content.compareRun}</div>
      <div className="mt-5 flex flex-wrap gap-3">
        <WalletConnectButton size="sm" variant="default" />
        <Link href="/proof?judge=1" className={cn(buttonVariants({ size: "sm" }))}>
          {content.openProof}
        </Link>
        <Link href="/learn" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
          {content.openLearningGuide}
        </Link>
        <Link href="/documents/reviewer-fast-path" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
          {content.openFastPath}
        </Link>
        <Link href="/documents/privacy-and-encryption-proof-guide" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
          {content.openPrivacyGuide}
        </Link>
        <Link href="/viewer/agentic-treasury-micropayment-rail.generated" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
          {content.openRailProof}
        </Link>
      </div>
    </section>
  );
}
