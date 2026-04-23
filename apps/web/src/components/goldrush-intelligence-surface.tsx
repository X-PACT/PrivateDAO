"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, DatabaseZap, Radar, WalletCards } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type GoldRushTemplateId =
  | "wallet-history"
  | "stablecoin-flows"
  | "counterparty-screen"
  | "token-holdings";

const goldRushTemplates: {
  id: GoldRushTemplateId;
  title: string;
  summary: string;
  payload: (wallet: string) => Record<string, unknown>;
}[] = [
  {
    id: "wallet-history",
    title: "Wallet history intelligence",
    summary: "Use structured wallet history as a reviewer-friendly pre-execution check before treasury approval.",
    payload: (wallet) => ({
      queryType: "wallet-history",
      chainName: "solana-mainnet",
      walletAddress: wallet,
      include: ["transactions", "classifications", "token-metadata"],
    }),
  },
  {
    id: "stablecoin-flows",
    title: "Stablecoin flow review",
    summary: "Inspect recent stablecoin movement before approving payroll, vendor, or settlement operations.",
    payload: (wallet) => ({
      queryType: "stablecoin-flows",
      chainName: "solana-mainnet",
      walletAddress: wallet,
      assets: ["USDC", "USDT", "PUSD", "AUDD"],
    }),
  },
  {
    id: "counterparty-screen",
    title: "Counterparty screen",
    summary: "Check whether a treasury recipient or operator wallet has the kind of history that should trigger closer review.",
    payload: (wallet) => ({
      queryType: "counterparty-screen",
      chainName: "solana-mainnet",
      walletAddress: wallet,
      include: ["history", "balances", "labels"],
    }),
  },
  {
    id: "token-holdings",
    title: "Token holdings snapshot",
    summary: "Review asset concentration before proposing a route, rebalance, or payout-funding motion.",
    payload: (wallet) => ({
      queryType: "token-holdings",
      chainName: "solana-mainnet",
      walletAddress: wallet,
      include: ["balances", "prices", "metadata"],
    }),
  },
];

export function GoldRushIntelligenceSurface() {
  const [walletAddress, setWalletAddress] = useState("So11111111111111111111111111111111111111112");
  const [activeTemplate, setActiveTemplate] = useState<GoldRushTemplateId>("wallet-history");
  const [deliveryState, setDeliveryState] = useState(
    "Prepare a GoldRush intelligence payload here, then connect a proxy endpoint to forward live requests.",
  );
  const [responsePreview, setResponsePreview] = useState<string>("");
  const [running, setRunning] = useState(false);

  const payload = useMemo(() => {
    const template = goldRushTemplates.find((entry) => entry.id === activeTemplate) ?? goldRushTemplates[0];
    return template.payload(walletAddress.trim() || "So11111111111111111111111111111111111111112");
  }, [activeTemplate, walletAddress]);

  async function handleRun() {
    const endpoint = process.env.NEXT_PUBLIC_GOLDRUSH_PROXY_ENDPOINT;
    if (!endpoint) {
      setDeliveryState("GoldRush workbench ready. Add NEXT_PUBLIC_GOLDRUSH_PROXY_ENDPOINT to run live classified wallet queries.");
      setResponsePreview(JSON.stringify(payload, null, 2));
      return;
    }

    setRunning(true);
    setDeliveryState("Sending GoldRush intelligence request...");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => null);
      setResponsePreview(JSON.stringify(body ?? { status: response.status }, null, 2));
      setDeliveryState(response.ok ? "GoldRush intelligence response received." : `GoldRush endpoint responded ${response.status}.`);
    } catch (error) {
      setDeliveryState(error instanceof Error ? error.message : "GoldRush request failed.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="rounded-[28px] border border-amber-300/16 bg-amber-300/[0.08] p-6">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-amber-100/76">
        <DatabaseZap className="h-4 w-4" />
        GoldRush intelligence workbench
      </div>
      <h2 className="mt-3 text-2xl font-semibold text-white">Structured on-chain intelligence for treasury and counterparty review</h2>
      <p className="mt-3 max-w-4xl text-sm leading-7 text-white/68">
        This surface turns GoldRush into a real pre-execution lane inside PrivateDAO: prepare wallet history, stablecoin flow,
        counterparty, and holdings queries before the signer moves into execution. The UI is live now; forwarding to a live
        GoldRush-backed proxy is activated through one environment variable.
      </p>

      <div className="mt-5 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/44">Query template</div>
            <div className="mt-3 grid gap-3">
              {goldRushTemplates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setActiveTemplate(template.id)}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-left transition",
                    activeTemplate === template.id
                      ? "border-amber-300/24 bg-amber-300/[0.10] text-white"
                      : "border-white/10 bg-black/20 text-white/68 hover:border-white/16 hover:bg-white/[0.04]",
                  )}
                >
                  <div className="text-sm font-medium text-white">{template.title}</div>
                  <div className="mt-1 text-sm leading-6 text-white/60">{template.summary}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/44">Wallet under review</div>
            <input
              value={walletAddress}
              onChange={(event) => setWalletAddress(event.target.value)}
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
              placeholder="Solana wallet address"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className={cn(buttonVariants({ size: "sm" }))} onClick={() => void handleRun()} disabled={running}>
                {running ? "Running..." : "Run GoldRush query"}
              </button>
              <Link href="/execute" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
                Continue to execute
              </Link>
              <Link href="/proof" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                Open proof path
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-cyan-100/76">
              <Radar className="h-4 w-4" />
              Delivery state
            </div>
            <div className="mt-3 text-sm leading-7 text-white/72">{deliveryState}</div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/44">
              <WalletCards className="h-4 w-4 text-amber-100/76" />
              Prepared request payload
            </div>
            <pre className="mt-3 overflow-x-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-xs leading-6 text-white/70">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/44">Latest response preview</div>
            <pre className="mt-3 overflow-x-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-xs leading-6 text-white/70">
              {responsePreview || "No response yet. Run the workbench or connect the proxy endpoint first."}
            </pre>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/services" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
              Open services
            </Link>
            <a
              href="https://goldrush.dev/docs"
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
            >
              GoldRush docs
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
