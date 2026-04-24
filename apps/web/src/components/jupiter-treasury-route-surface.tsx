"use client";

import Link from "next/link";
import { useState } from "react";
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

type JupiterPreviewResponse = {
  request?: {
    inputMint?: string;
    outputMint?: string;
    amount?: string;
    taker?: string | null;
    slippageBps?: number | null;
  };
  summary?: {
    mode?: string | null;
    router?: string | null;
    inAmount?: string | null;
    outAmount?: string | null;
    inUsdValue?: number | null;
    outUsdValue?: number | null;
    priceImpact?: number | null;
    slippageBps?: number | null;
    gasless?: boolean | null;
    requestId?: string | null;
    totalTime?: number | null;
    transactionAvailable?: boolean | null;
  };
  topRoutes?: Array<{
    label?: string | null;
    inAmount?: string | null;
    outAmount?: string | null;
    percent?: number | null;
  }>;
  error?: string;
};

const DEFAULT_INPUT_MINT = "So11111111111111111111111111111111111111112";
const DEFAULT_OUTPUT_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

function formatUsd(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
}

export function JupiterTreasuryRouteSurface() {
  const [inputMint, setInputMint] = useState(DEFAULT_INPUT_MINT);
  const [outputMint, setOutputMint] = useState(DEFAULT_OUTPUT_MINT);
  const [amount, setAmount] = useState("1000000");
  const [slippageBps, setSlippageBps] = useState("50");
  const [deliveryState, setDeliveryState] = useState(
    "Prepare a governed treasury route preview here, then attach the quote logic to rebalance and payout-funding actions.",
  );
  const [preview, setPreview] = useState<JupiterPreviewResponse | null>(null);
  const [running, setRunning] = useState(false);

  async function handlePreview() {
    const endpoint = process.env.NEXT_PUBLIC_JUPITER_ORDER_ENDPOINT?.trim() || "/api/jupiter/order";

    setRunning(true);
    setDeliveryState("Requesting Jupiter route preview...");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputMint,
          outputMint,
          amount,
          slippageBps: Number(slippageBps),
        }),
      });
      const body = (await response.json().catch(() => null)) as JupiterPreviewResponse | null;
      setPreview(body);
      setDeliveryState(response.ok ? "Jupiter route preview received." : body?.error ?? `Jupiter endpoint responded ${response.status}.`);
    } catch (error) {
      setPreview(null);
      setDeliveryState(error instanceof Error ? error.message : "Jupiter route preview failed.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <Card
      id="jupiter-treasury-route"
      className="border-cyan-300/16 bg-[linear-gradient(180deg,rgba(8,18,25,0.96),rgba(7,12,20,0.98))]"
    >
      <CardHeader className="gap-3">
        <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-100/78">
          Jupiter-backed treasury route
        </div>
        <CardTitle>Treasury swaps and rebalances now have a live preview lane</CardTitle>
        <div className="max-w-4xl text-sm leading-7 text-white/60">
          PrivateDAO is turning treasury routing into a governed operator flow: review the route, inspect price and slippage posture, then carry the same context into treasury action and proof.
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
              The route stays framed as treasury motion, not speculative trading.
            </div>
          </div>
          <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/42">
              <WalletCards className="h-3.5 w-3.5 text-cyan-100/78" />
              Wallet-first path
            </div>
            <div className="mt-3 text-base font-semibold tracking-tight text-white">Same signer, same govern shell</div>
            <div className="mt-2 text-sm leading-6 text-white/56">
              Review and sign should happen in the same product path already used for DAO actions.
            </div>
          </div>
          <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/42">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-100/78" />
              Reviewer clarity
            </div>
            <div className="mt-3 text-base font-semibold tracking-tight text-white">Quote, policy, and receipt together</div>
            <div className="mt-2 text-sm leading-6 text-white/56">
              A reviewer should be able to see why the route was chosen and what it implied before funds moved.
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.96fr_1.04fr]">
          <div className="space-y-4">
            <div className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5">
              <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-100/78">Live route preview</div>
              <div className="mt-4 grid gap-3">
                <label className="space-y-2">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/42">Input mint</div>
                  <input value={inputMint} onChange={(event) => setInputMint(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none" />
                </label>
                <label className="space-y-2">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/42">Output mint</div>
                  <input value={outputMint} onChange={(event) => setOutputMint(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none" />
                </label>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="space-y-2">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-white/42">Amount</div>
                    <input value={amount} onChange={(event) => setAmount(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none" />
                  </label>
                  <label className="space-y-2">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-white/42">Slippage bps</div>
                    <input value={slippageBps} onChange={(event) => setSlippageBps(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none" />
                  </label>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button type="button" className={cn(buttonVariants({ size: "sm" }))} onClick={() => void handlePreview()} disabled={running}>
                    {running ? "Loading..." : "Run route preview"}
                  </button>
                  <Link href="/govern#proposal-review-action" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
                    Open govern flow
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="rounded-[26px] border border-cyan-300/18 bg-cyan-300/[0.08] p-5">
              <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-100/80">Current route state</div>
              <div className="mt-3 text-sm leading-7 text-white/68">{deliveryState}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5">
              <div className="text-[11px] uppercase tracking-[0.24em] text-white/48">Quote summary</div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm text-white/62">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/46">Router</div>
                  <div className="mt-2 text-white">{preview?.summary?.router ?? "—"}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm text-white/62">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/46">Mode</div>
                  <div className="mt-2 text-white">{preview?.summary?.mode ?? "—"}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm text-white/62">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/46">Input value</div>
                  <div className="mt-2 text-white">{formatUsd(preview?.summary?.inUsdValue)}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm text-white/62">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/46">Output value</div>
                  <div className="mt-2 text-white">{formatUsd(preview?.summary?.outUsdValue)}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm text-white/62">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/46">Price impact</div>
                  <div className="mt-2 text-white">
                    {typeof preview?.summary?.priceImpact === "number" ? `${preview.summary.priceImpact}` : "—"}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm text-white/62">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/46">Gasless</div>
                  <div className="mt-2 text-white">
                    {typeof preview?.summary?.gasless === "boolean" ? (preview.summary.gasless ? "Yes" : "No") : "—"}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5">
              <div className="text-[11px] uppercase tracking-[0.24em] text-white/48">Top route plan</div>
              <div className="mt-4 grid gap-3">
                {(preview?.topRoutes ?? []).length > 0 ? (
                  preview?.topRoutes?.map((route, index) => (
                    <div key={`${route.label ?? "route"}-${index}`} className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm leading-7 text-white/60">
                      <div className="font-medium text-white">{route.label ?? "Unknown venue"}</div>
                      <div className="mt-1">
                        {route.percent ?? "—"}% · in {route.inAmount ?? "—"} · out {route.outAmount ?? "—"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm leading-7 text-white/60">
                    Run a live preview to populate route venues and split plan.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          {routeMoments.map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/8 bg-black/20 p-4">
              <div className="text-base font-medium text-white">{item.title}</div>
              <div className="mt-2 text-sm leading-7 text-white/60">{item.detail}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
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
