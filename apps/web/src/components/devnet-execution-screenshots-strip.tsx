import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DevnetExecutionScreenshotsStrip() {
  return (
    <div className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.08] p-6">
      <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/78">Visual chain proof</div>
      <div className="mt-3 max-w-3xl text-sm leading-7 text-white/68">
        Open a compact screenshots packet with real Solscan captures from the current Devnet execution wallet and
        the agentic micropayment rail. This helps a non-technical reviewer verify that the product is already creating
        real on-chain activity before they inspect the raw explorer records.
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/documents/devnet-execution-screenshots"
          className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}
        >
          Open screenshots packet
        </Link>
        <Link
          href="/documents/agentic-treasury-micropayment-rail"
          className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
        >
          Open rail packet
        </Link>
      </div>
    </div>
  );
}
