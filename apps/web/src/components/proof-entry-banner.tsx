"use client";

import { useSearchParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";

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
        This proof route was opened through the legacy reviewer query entrypoint. The Next.js surface keeps the reviewer path intact and routes you directly into the proof and hardening materials without sending you back to the old docs shell.
      </p>
    </div>
  );
}
