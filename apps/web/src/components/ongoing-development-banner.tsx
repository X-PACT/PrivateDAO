"use client";

import Link from "next/link";

import { useI18n } from "@/components/i18n-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function OngoingDevelopmentBanner() {
  const { copy } = useI18n();

  return (
    <div className="relative z-20 border-b border-amber-300/16 bg-amber-300/[0.08]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.28em] text-amber-200/82">{copy.statusBanner.label}</div>
          <div className="mt-2 text-sm font-medium text-white">{copy.statusBanner.title}</div>
          <div className="mt-2 max-w-4xl text-sm leading-7 text-white/68">{copy.statusBanner.body}</div>
          <div className="mt-2 text-xs uppercase tracking-[0.2em] text-white/44">{copy.statusBanner.until}</div>
        </div>
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/70">
            {copy.statusBanner.retry}
          </span>
          <Link href="/trust" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
            {copy.statusBanner.openTrust}
          </Link>
          <Link href="/community" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            {copy.statusBanner.openCommunity}
          </Link>
        </div>
      </div>
    </div>
  );
}
