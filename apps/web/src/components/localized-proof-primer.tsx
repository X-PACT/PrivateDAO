"use client";

import Link from "next/link";

import { useI18n } from "@/components/i18n-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LocalizedProofPrimer() {
  const { copy } = useI18n();
  const content = copy.pageContent.proofPrimer;

  return (
    <section className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.08] p-5">
      <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/78">{content.eyebrow}</div>
      <h2 className="mt-3 max-w-4xl text-xl font-semibold text-white sm:text-2xl">{content.title}</h2>
      <p className="mt-3 max-w-4xl text-sm leading-7 text-white/72">{content.body}</p>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {content.bullets.map((bullet) => (
          <div key={bullet} className="rounded-[24px] border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/64">
            {bullet}
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/govern" className={cn(buttonVariants({ size: "sm" }))}>
          {content.openGovern}
        </Link>
        <Link href="/judge" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
          {content.openJudge}
        </Link>
        <Link href="/documents/privacy-and-encryption-proof-guide" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
          {content.openPrivacyGuide}
        </Link>
      </div>
    </section>
  );
}
