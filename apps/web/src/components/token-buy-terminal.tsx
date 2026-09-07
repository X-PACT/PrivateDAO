"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Copy, ExternalLink, Wallet } from "lucide-react";

const tokenAddress = "9isGuumtaqvJeJeyLF44fvfskk2cv5mYsopexMBfpump";
const pumpFunUrl = `https://pump.fun/coin/${tokenAddress}`;
const dexScreenerUrl = "https://dexscreener.com/solana/EZiPEFFGhvU7BmZTcsJxKFVw7Edby7KxN91fGfzpxHpz";
const streamflowUrl = "https://app.streamflow.finance/contract/solana/mainnet/3s5gg6upQXd4USTUQKdrWPBexEa2sZwzoD4P3HLA4tUK";

export function TokenBuyTerminal() {
  const [copied, setCopied] = useState(false);

  async function copyAddress() {
    await navigator.clipboard.writeText(tokenAddress);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section className="rounded-[26px] border border-violet-300/16 bg-violet-300/[0.06] p-5">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-100/76">
        <Wallet className="h-4 w-4" />
        PDAO access terminal
      </div>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em] text-white">
        Buy, verify, and use PDAO from one surface.
      </h2>
      <p className="mt-3 text-sm leading-7 text-white/62">
        Trading happens on external Solana venues. PrivateDAO does not custody trading funds. Product access and service
        payments use the separate Payment Gate receipt flow.
      </p>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/24 p-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/42">Contract address</div>
        <div className="mt-2 break-all font-mono text-sm text-white">{tokenAddress}</div>
        <button
          type="button"
          onClick={copyAddress}
          className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/78 hover:border-violet-200/40 hover:text-white"
        >
          {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-100" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy CA"}
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <a
          href={pumpFunUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-between rounded-2xl border border-white/10 bg-black/24 px-4 py-3 text-sm font-semibold text-white hover:border-violet-200/36"
        >
          Open Pump.fun
          <ExternalLink className="h-4 w-4" />
        </a>
        <a
          href={dexScreenerUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-between rounded-2xl border border-white/10 bg-black/24 px-4 py-3 text-sm font-semibold text-white hover:border-cyan-200/36"
        >
          Live chart
          <ExternalLink className="h-4 w-4" />
        </a>
        <a
          href={streamflowUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-between rounded-2xl border border-white/10 bg-black/24 px-4 py-3 text-sm font-semibold text-white hover:border-emerald-200/36"
        >
          Streamflow lock
          <ExternalLink className="h-4 w-4" />
        </a>
        <Link
          href="/payment-gate"
          className="inline-flex items-center justify-between rounded-2xl border border-white/10 bg-black/24 px-4 py-3 text-sm font-semibold text-white hover:border-emerald-200/36"
        >
          Service payment receipt
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
