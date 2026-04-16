"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { CheckCircle2, ShieldAlert, WalletCards } from "lucide-react";

import { ExecutionSurfaceInline } from "@/components/execution-surface-inline";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PRIVATE_DAO_GOVERNANCE_MINT,
  PRIVATE_DAO_GOVERNANCE_TOKEN_PROGRAM,
  PRIVATE_DAO_PROGRAM_ID,
} from "@/lib/onchain-parity.generated";
import { PRIVATE_DAO_NETWORK } from "@/lib/onchain-parity";
import type { ExecutionSurfaceSnapshot } from "@/lib/devnet-service-metrics";

function shortenAddress(address: string) {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

type WalletRuntimePanelProps = {
  executionSnapshot: ExecutionSurfaceSnapshot;
};

export function WalletRuntimePanel({ executionSnapshot }: WalletRuntimePanelProps) {
  const { connected, publicKey, wallet } = useWallet();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet runtime</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">Connection state</div>
              <div className="mt-2 text-lg font-medium text-white">{connected ? "Wallet connected" : "Wallet not connected"}</div>
            </div>
            <Badge variant={connected ? "success" : "warning"}>{connected ? "Live" : "Action required"}</Badge>
          </div>
          <p className="mt-3 text-sm leading-7 text-white/56">
            The wallet surface is meant to be used, not only observed. Connect a Devnet wallet, sign the real product actions, and then use proof and runtime packets to confirm what happened.
          </p>
          <div className="mt-4">
            <WalletConnectButton />
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
            <div className="flex items-center gap-3">
              <WalletCards className="h-4 w-4 text-cyan-300" />
              <div className="text-sm font-medium text-white">Signing boundary</div>
            </div>
            <div className="mt-3 grid gap-3 text-sm leading-7 text-white/58">
              <div>Network: {PRIVATE_DAO_NETWORK}</div>
              <div>Program ID: {shortenAddress(PRIVATE_DAO_PROGRAM_ID)}</div>
              <div>Governance mint: {shortenAddress(PRIVATE_DAO_GOVERNANCE_MINT)}</div>
              <div>Token program: {shortenAddress(PRIVATE_DAO_GOVERNANCE_TOKEN_PROGRAM)}</div>
            </div>
          </div>
          <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
            <div className="flex items-center gap-3">
              <WalletCards className="h-4 w-4 text-cyan-300" />
              <div className="text-sm font-medium text-white">Active wallet</div>
            </div>
            <div className="mt-3 text-sm leading-7 text-white/58">
              {connected && publicKey
                ? `${wallet?.adapter.name ?? "Solana wallet"} · ${shortenAddress(publicKey.toBase58())}`
                : "Connect Solflare, Phantom, or Backpack on Devnet to activate the full product flow."}
            </div>
          </div>
          <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              <div className="text-sm font-medium text-white">Execution boundary</div>
            </div>
            <div className="mt-3 text-sm leading-7 text-white/58">Proposal actions in this UI remain aligned with proof packets, readiness rails, and wallet state. The intended experience is to verify the product by using it, not by reading static claims alone.</div>
          </div>
          <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-4 w-4 text-fuchsia-300" />
              <div className="text-sm font-medium text-white">Community verification</div>
            </div>
            <div className="mt-3 text-sm leading-7 text-white/58">
              PrivateDAO welcomes community testing, external review, and deeper runtime validation.
              The current product already gives the visitor a real Devnet flow to use and verify, while the broader ecosystem can help push the release path even further through testing, review, and operational feedback.
            </div>
          </div>
        </div>

        <ExecutionSurfaceInline mode="wallet" snapshot={executionSnapshot} />
      </CardContent>
    </Card>
  );
}
