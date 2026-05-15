"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProofEntryBanner() {
  const searchParams = useSearchParams();
  const judgeMode = searchParams.get("judge") === "1";

  if (!judgeMode) return null;

  return (
    <div className="mt-6 rounded-3xl border border-cyan-300/18 bg-cyan-300/10 p-5">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="cyan">Judge mode</Badge>
        <Badge variant="success">Legacy entry preserved</Badge>
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-cyan-50/85">
        This proof route was opened through the legacy reviewer query entrypoint. The canonical reviewer route is
        now `/judge`; this page remains the proof and receipt center for runtime logs, Testnet evidence, and hardening
        materials.
      </p>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-cyan-50/78">
        The strongest way to use it is to connect a Testnet wallet, run the live flow, then inspect this page after each action instead of treating proof as a detached reading exercise.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href="/judge" className={cn(buttonVariants({ size: "sm" }))}>
          Open canonical judge route
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/proof" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
          Open proof center
        </Link>
      </div>
    </div>
  );
}
