"use client";

import Link from "next/link";

import { useI18n } from "@/components/i18n-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LocalizedCommunityBuildSurface() {
  const { copy } = useI18n();
  const content = copy.pageContent.communityBuild;

  return (
    <div className="rounded-3xl border border-cyan-300/16 bg-cyan-300/[0.05] p-5">
      <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/78">{content.eyebrow}</div>
      <div className="mt-3 max-w-4xl text-2xl font-semibold tracking-tight text-white sm:text-3xl">{content.title}</div>
      <div className="mt-3 max-w-3xl text-sm leading-7 text-white/62">{content.body}</div>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/documents/engineering-delivery-model" className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}>
          {content.openEngineeringModel}
        </Link>
        <Link href="/learn" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
          {content.openLearningGuide}
        </Link>
        <Link href="/judge" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
          {content.openVerificationRoute}
        </Link>
      </div>
    </div>
  );
}
