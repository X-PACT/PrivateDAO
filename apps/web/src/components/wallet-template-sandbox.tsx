"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";

import { Button } from "@/components/ui/button";
import { WalletConnectButton } from "@/components/wallet-connect-button";

function triggerWalletModal() {
  const trigger = document.querySelector<HTMLButtonElement>(".wallet-adapter-button-trigger");
  trigger?.click();
}

export function WalletTemplateSandbox() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const address = useMemo(() => publicKey?.toBase58() ?? null, [publicKey]);

  return (
    <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
        <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">Real wallet action</div>
        <h3 className="mt-3 text-xl font-semibold text-white">Open the same wallet lane the live product uses</h3>
        <p className="mt-3 text-sm leading-7 text-white/62">
          This button opens the real wallet adapter modal used across Start, Govern, and the rest of the site. Connect
          Solflare or another Devnet wallet here, then use the starter below to move directly into the governance flow.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <WalletConnectButton size="sm" />
        </div>
        <div className="mt-5 rounded-[24px] border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/68">
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/42">Connected signer</div>
          <div className="mt-2 break-all text-white">{address ?? "No signer connected yet."}</div>
          <div className="mt-3 text-white/60">
            Once a wallet is connected, the production route can take the user into Start or Govern without terminal
            setup or handwritten addresses.
          </div>
        </div>
      </div>
      <div className="rounded-[30px] border border-white/10 bg-black/20 p-4">
        <section className="grid gap-4 rounded-[20px] bg-[#081420] p-6 text-[#e0f0ff]">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/70">Wallet-first starter</div>
            <h2 className="mt-2 text-2xl font-semibold text-white">Connect first, then enter the product corridor</h2>
          </div>
          <p className="text-sm leading-7 text-white/80">
            This starter keeps the first Solana action simple: connect a Devnet wallet, display signer context, then
            move into governance or treasury work from one browser shell.
          </p>
          <div className="rounded-2xl bg-[#0c1e30] p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/70">Connected signer</div>
            <div className="mt-2 break-all font-mono text-white">{address ? `${address.slice(0, 4)}...${address.slice(-4)}` : "No wallet connected"}</div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button" size="sm" onClick={triggerWalletModal}>
              {address ? "Reconnect wallet" : "Connect wallet"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={!connected}
              onClick={() => router.push("/govern")}
            >
              Open governance corridor
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
