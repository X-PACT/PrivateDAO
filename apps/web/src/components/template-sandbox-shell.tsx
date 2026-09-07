import type { ReactNode } from "react";
import Link from "next/link";

import { LearnBootcampNav } from "@/components/learn-bootcamp-nav";
import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TemplateSandboxShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  badges: Array<{
    label: string;
    variant?: "cyan" | "violet" | "success" | "warning";
  }>;
  templateAlias: string;
  lessonHref: string;
  lessonLabel: string;
  liveHref: string;
  liveLabel: string;
  verifyHref: string;
  verifyLabel: string;
  templateHref: string;
  focusPoints: string[];
  children: ReactNode;
};

export function TemplateSandboxShell({
  eyebrow,
  title,
  description,
  badges,
  templateAlias,
  lessonHref,
  lessonLabel,
  liveHref,
  liveLabel,
  verifyHref,
  verifyLabel,
  templateHref,
  focusPoints,
  children,
}: TemplateSandboxShellProps) {
  return (
    <OperationsShell
      eyebrow={eyebrow}
      title={title}
      description={description}
      badges={badges}
    >
      <LearnBootcampNav />
      <div className="rounded-[30px] border border-cyan-300/16 bg-cyan-300/[0.08] p-6">
        <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/76">Template sandbox</div>
        <h2 className="mt-3 text-2xl font-semibold text-white">{templateAlias}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/66">
          This route turns the starter into a live in-product sandbox. Use it to understand the UI pattern quickly,
          then move directly into the production Testnet corridor and verify the blockchain result from the linked proof
          route.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={lessonHref} className={cn(buttonVariants({ size: "sm" }))}>
            {lessonLabel}
          </Link>
          <Link href={liveHref} className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
            {liveLabel}
          </Link>
          <Link href={verifyHref} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            {verifyLabel}
          </Link>
          <a
            href={templateHref}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
          >
            Open template source
          </a>
        </div>
      </div>
      {children}
      <div className="grid gap-4 md:grid-cols-3">
        {focusPoints.map((item, index) => (
          <div key={`${templateAlias}:${index}`} className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/42">Focus {index + 1}</div>
            <p className="mt-3 text-sm leading-7 text-white/62">{item}</p>
          </div>
        ))}
      </div>
    </OperationsShell>
  );
}
