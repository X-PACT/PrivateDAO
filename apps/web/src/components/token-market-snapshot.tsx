"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, BarChart3, Droplets, ExternalLink, TrendingUp } from "lucide-react";

const pairAddress = "EZiPEFFGhvU7BmZTcsJxKFVw7Edby7KxN91fGfzpxHpz";
const apiUrl = `https://api.dexscreener.com/latest/dex/pairs/solana/${pairAddress}`;
const dexScreenerUrl = `https://dexscreener.com/solana/${pairAddress}`;

type DexPair = {
  priceUsd?: string;
  fdv?: number;
  marketCap?: number;
  liquidity?: { usd?: number };
  volume?: { h24?: number; h6?: number; h1?: number };
  priceChange?: { h24?: number; h6?: number; h1?: number };
  txns?: { h24?: { buys?: number; sells?: number } };
};

type DexResponse = {
  pair?: DexPair;
};

function money(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Live soon";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
}

function percent(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Live";
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function TokenMarketSnapshot() {
  const [pair, setPair] = useState<DexPair>();
  const [status, setStatus] = useState<"loading" | "live" | "fallback">("loading");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch(apiUrl, { cache: "no-store" });
        const payload = (await response.json()) as DexResponse;
        if (!cancelled && payload.pair) {
          setPair(payload.pair);
          setStatus("live");
          return;
        }
        if (!cancelled) setStatus("fallback");
      } catch {
        if (!cancelled) setStatus("fallback");
      }
    }
    void load();
    const timer = window.setInterval(load, 45_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const rows = useMemo(
    () => [
      { label: "Price", value: pair?.priceUsd ? `$${pair.priceUsd}` : "Live soon", icon: TrendingUp },
      { label: "Market cap", value: money(pair?.marketCap ?? pair?.fdv), icon: BarChart3 },
      { label: "Liquidity", value: money(pair?.liquidity?.usd), icon: Droplets },
      { label: "24h volume", value: money(pair?.volume?.h24), icon: Activity },
      { label: "24h change", value: percent(pair?.priceChange?.h24), icon: TrendingUp },
      {
        label: "24h trades",
        value:
          pair?.txns?.h24?.buys || pair?.txns?.h24?.sells
            ? `${pair.txns.h24.buys ?? 0} buys / ${pair.txns.h24.sells ?? 0} sells`
            : "Live soon",
        icon: Activity,
      },
    ],
    [pair],
  );

  return (
    <section className="rounded-[26px] border border-cyan-300/16 bg-cyan-300/[0.055] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100/76">Live market snapshot</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-white">PDAO market data</h2>
        </div>
        <a
          href={dexScreenerUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-white/12 bg-black/24 px-4 py-2 text-xs font-semibold text-white/74 hover:border-cyan-200/40 hover:text-white"
        >
          DexScreener
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <article key={row.label} className="rounded-2xl border border-white/10 bg-black/24 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/44">
                <Icon className="h-4 w-4 text-cyan-100" />
                {row.label}
              </div>
              <div className="mt-2 break-words text-lg font-semibold text-white">{row.value}</div>
            </article>
          );
        })}
      </div>
      <p className="mt-4 text-xs leading-6 text-white/44">
        Status: {status === "live" ? "live from DexScreener API" : status === "loading" ? "loading live market data" : "chart remains available if API is temporarily unavailable"}.
      </p>
    </section>
  );
}
