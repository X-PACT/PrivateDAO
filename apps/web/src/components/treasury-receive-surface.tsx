"use client";

import { useState } from "react";
import { CheckCircle2, Clipboard, Coins, Landmark, ShieldCheck, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getTreasuryReceiveConfig } from "@/lib/treasury-receive-config";
import { cn } from "@/lib/utils";

const assetIconMap = {
  SOL: Wallet,
  USDC: Coins,
  USDG: Landmark,
} as const;

export function TreasuryReceiveSurface() {
  const config = getTreasuryReceiveConfig();
  const [copied, setCopied] = useState<string | null>(null);

  async function copyValue(key: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(key);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Treasury receive surface</CardTitle>
        <p className="mt-2 text-sm leading-7 text-white/60">
          Accept public treasury support and pilot funding through explicit Devnet rails. This surface exposes only public receive addresses and asset metadata.
        </p>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="rounded-3xl border border-cyan-300/16 bg-cyan-300/[0.08] p-5">
          <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-100/76">Primary treasury route</div>
          <div className="mt-3 text-lg font-medium text-white">{config.network}</div>
          <div className="mt-3 break-all rounded-2xl border border-white/8 bg-black/20 p-4 font-mono text-sm leading-7 text-white/74">
            {config.treasuryAddress}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={() => copyValue("treasury", config.treasuryAddress)} className={cn(buttonVariants({ size: "sm" }))}>
              <Clipboard className="h-4 w-4" />
              Copy treasury address
            </button>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/62">
              Accepted assets: SOL / USDC / USDG
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          {config.assets.map((asset) => {
            const Icon = assetIconMap[asset.symbol];
            return (
              <div key={asset.symbol} className="rounded-3xl border border-white/8 bg-white/4 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-white/8 bg-black/20 p-3 text-emerald-200">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-lg font-medium text-white">{asset.symbol}</div>
                      <div className="mt-1 text-sm text-white/56">{asset.name}</div>
                    </div>
                  </div>
                  {copied === asset.symbol ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : null}
                </div>

                <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/46">Receive address</div>
                  <div className="mt-2 break-all font-mono text-sm leading-7 text-white/74">{asset.receiveAddress}</div>
                </div>

                <div className="mt-4 grid gap-3">
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/62">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-white/46">Network</div>
                    <div className="mt-2">{asset.network}</div>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/62">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-white/46">Mint</div>
                    <div className="mt-2 break-all font-mono text-xs text-white/70">
                      {asset.mint ?? "Configured at deployment through NEXT_PUBLIC_TREASURY_* env."}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/62">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-white/46">Use</div>
                    <div className="mt-2">{asset.note}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => copyValue(asset.symbol, asset.receiveAddress)}
                  className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "mt-4")}
                >
                  <Clipboard className="h-4 w-4" />
                  Copy {asset.symbol} route
                </button>
              </div>
            );
          })}
        </div>

        <div className="rounded-3xl border border-amber-300/16 bg-amber-300/[0.08] p-5 text-sm leading-7 text-white/66">
          <div className="flex items-center gap-2 text-white">
            <ShieldCheck className="h-4 w-4 text-amber-200" />
            Secure configuration
          </div>
          <div className="mt-3">{config.securityNote}</div>
        </div>
      </CardContent>
    </Card>
  );
}
