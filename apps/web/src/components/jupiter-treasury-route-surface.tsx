import Link from "next/link";
import { ArrowRight, ArrowUpRight, RefreshCcw, ShieldCheck, WalletCards } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const routeMoments = [
  {
    title: "Governed treasury rebalance",
    detail:
      "Use DAO approval to move treasury posture from one asset stance to another without dropping the operator back into an ad hoc swap flow.",
  },
  {
    title: "Quote-aware payout funding",
    detail:
      "Prepare a payout in one asset, then fund it through a route that preserves quote context, slippage expectations, and the downstream settlement story.",
  },
  {
    title: "Reviewer-safe execution trail",
    detail:
      "Keep the route rationale, treasury policy, and settlement evidence visible together so a reviewer can understand why the treasury moved and how it stayed controlled.",
  },
] as const;

const nextMilestones = [
  "Attach a quote preview and route rationale to the treasury request object.",
  "Carry an execution-planning lane that keeps destination policy and settlement posture readable before governed delivery.",
  "Preserve swap and rebalance policy thresholds inside the govern flow.",
  "Publish post-route settlement receipts beside the same payout or treasury packet.",
] as const;

export function JupiterTreasuryRouteSurface() {
  return (
    <Card
      id="jupiter-treasury-route"
      className="border-cyan-300/16 bg-[linear-gradient(180deg,rgba(8,18,25,0.96),rgba(7,12,20,0.98))]"
    >
      <CardHeader className="gap-3">
        <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-100/78">
          Jupiter-backed treasury route
        </div>
        <CardTitle>Treasury swaps and rebalances are being turned into a governed product lane</CardTitle>
        <div className="max-w-4xl text-sm leading-7 text-white/60">
          PrivateDAO is extending the treasury corridor so a DAO-approved swap, rebalance, or payout-funding move can stay inside the same wallet-first operating story instead of breaking into a disconnected trading flow.
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/42">
              <RefreshCcw className="h-3.5 w-3.5 text-cyan-100/78" />
              Route focus
            </div>
            <div className="mt-3 text-base font-semibold tracking-tight text-white">Swap and rebalance policy</div>
            <div className="mt-2 text-sm leading-6 text-white/56">
              The route is being shaped around treasury-approved asset moves, not speculative trading language.
            </div>
          </div>
          <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/42">
              <WalletCards className="h-3.5 w-3.5 text-cyan-100/78" />
              Wallet-first path
            </div>
            <div className="mt-3 text-base font-semibold tracking-tight text-white">Same signer, same govern shell</div>
            <div className="mt-2 text-sm leading-6 text-white/56">
              The operator should be able to inspect the request, confirm the route, and sign from the same product shell already used for DAO actions.
            </div>
          </div>
          <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/42">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-100/78" />
              Reviewer clarity
            </div>
            <div className="mt-3 text-base font-semibold tracking-tight text-white">Quote, policy, and receipt together</div>
            <div className="mt-2 text-sm leading-6 text-white/56">
              The route is designed so a reviewer can follow intent, route choice, and settlement evidence without reconstructing the story from scattered screens.
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5">
            <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-100/78">What this route is for</div>
            <div className="mt-4 grid gap-3">
              {routeMoments.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="text-base font-medium text-white">{item.title}</div>
                  <div className="mt-2 text-sm leading-7 text-white/60">{item.detail}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[26px] border border-cyan-300/18 bg-cyan-300/[0.08] p-5">
              <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-100/80">Current operating posture</div>
              <div className="mt-3 text-base font-medium text-white">
                The treasury route is already legible in the product and now carries route-plan continuity, quote-backed review, and execution-planning context inside the same product shell.
              </div>
              <div className="mt-3 text-sm leading-7 text-white/64">
                The immediate goal is not to add sponsor logos. It is to make treasury swaps, rebalances, and payout-funding motions feel controlled, reviewable, and easy to understand from the first operator click.
              </div>
            </div>

            <div className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5">
              <div className="text-[11px] uppercase tracking-[0.24em] text-white/48">Next operating milestones</div>
              <div className="mt-4 grid gap-3">
                {nextMilestones.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm leading-7 text-white/60">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/govern#proposal-review-action" className={cn(buttonVariants({ size: "sm" }))}>
            Open govern flow
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/services#payout-route-selection" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
            Open treasury routes
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/documents/jupiter-treasury-route" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            Open Jupiter route brief
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
