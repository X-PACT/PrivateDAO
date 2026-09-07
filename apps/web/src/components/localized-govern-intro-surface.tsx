"use client";

import Link from "next/link";

import { useI18n } from "@/components/i18n-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LocalizedGovernIntroSurface() {
  const { copy } = useI18n();
  const content = copy.pageContent.governIntro;

  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
      <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/78">{content.eyebrow}</div>
      <h2 className="mt-3 max-w-4xl text-2xl font-semibold tracking-tight text-white sm:text-3xl">{content.title}</h2>
      <p className="mt-4 max-w-4xl text-sm leading-7 text-white/64">{content.body}</p>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {content.bullets.map((bullet) => (
          <div key={bullet} className="rounded-[24px] border border-white/8 bg-black/20 p-5 text-sm leading-7 text-white/60">
            {bullet}
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/live" className={cn(buttonVariants({ size: "sm" }))}>
          {content.openLiveState}
        </Link>
        <Link href="/proof" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
          {content.openProofRoute}
        </Link>
        <Link href="/security" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
          {content.openSecurityRoute}
        </Link>
      </div>
    </section>
  );
}
