"use client";

import Link from "next/link";

import { useI18n } from "@/components/i18n-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LocalizedStartGuidanceSurface() {
  const { copy } = useI18n();
  const content = copy.pageContent.startGuidance;

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
      <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/76">{content.eyebrow}</div>
      <h2 className="mt-3 text-xl font-semibold text-white">{content.title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-white/64">{content.body}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/govern" className={cn(buttonVariants({ size: "sm" }))}>
          {content.openGovern}
        </Link>
        <Link href="/learn" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
          {content.openGuide}
        </Link>
        <Link href="/judge" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
          {content.openVerificationRoute}
        </Link>
      </div>
    </section>
  );
}
