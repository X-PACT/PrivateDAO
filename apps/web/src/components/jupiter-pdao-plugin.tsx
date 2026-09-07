"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Zap } from "lucide-react";

const targetId = "jupiter-pdao-plugin";
const solMint = "So11111111111111111111111111111111111111112";
const pdaoMint = "9isGuumtaqvJeJeyLF44fvfskk2cv5mYsopexMBfpump";
const jupiterSwapUrl = `https://jup.ag/swap/SOL-${pdaoMint}`;

type JupiterInitProps = {
  displayMode: "integrated";
  integratedTargetId: string;
  defaultExplorer?: "Solscan" | "Solana Explorer" | "SolanaFM";
  formProps?: {
    initialInputMint?: string;
    initialOutputMint?: string;
    fixedMint?: string;
    swapMode?: "ExactInOrOut" | "ExactIn" | "ExactOut";
  };
  containerStyles?: Record<string, string | number>;
};

declare global {
  interface Window {
    Jupiter?: {
      init: (props: JupiterInitProps) => void;
      close?: () => void;
    };
  }
}

export function JupiterPdaoPlugin() {
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">("loading");

  useEffect(() => {
    let attempts = 0;
    let mounted = true;

    const timer = window.setInterval(() => {
      attempts += 1;
      if (window.Jupiter?.init) {
        window.Jupiter.init({
          displayMode: "integrated",
          integratedTargetId: targetId,
          defaultExplorer: "Solscan",
          formProps: {
            initialInputMint: solMint,
            initialOutputMint: pdaoMint,
            fixedMint: pdaoMint,
            swapMode: "ExactInOrOut",
          },
          containerStyles: {
            width: "100%",
            minHeight: "560px",
          },
        });
        if (mounted) setStatus("ready");
        window.clearInterval(timer);
        return;
      }
      if (attempts >= 40) {
        if (mounted) setStatus("fallback");
        window.clearInterval(timer);
      }
    }, 250);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <section className="rounded-[26px] border border-amber-300/18 bg-amber-300/[0.055] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-100/78">
            <Zap className="h-4 w-4" />
            Jupiter Ultra swap
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-white">Swap SOL to PDAO on-page.</h2>
        </div>
        <a
          href={jupiterSwapUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-white/12 bg-black/24 px-4 py-2 text-xs font-semibold text-white/74 hover:border-amber-200/40 hover:text-white"
        >
          Open Jupiter
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
      <div className="mt-4 overflow-hidden rounded-[22px] border border-white/10 bg-black/28">
        <div id={targetId} className="min-h-[560px] w-full" />
      </div>
      <p className="mt-4 text-xs leading-6 text-white/44">
        Status: {status === "ready" ? "Jupiter Plugin loaded" : status === "loading" ? "loading Jupiter Plugin" : "open the Jupiter link if the plugin is blocked by the browser"}.
      </p>
    </section>
  );
}
