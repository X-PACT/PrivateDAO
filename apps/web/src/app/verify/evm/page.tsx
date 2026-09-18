"use client";

import { useEffect, useState } from "react";
import { EvmWalletSessionPanel } from "@/components/evm-wallet-session-panel";

type ManifestEntry = {
  network: string;
  chainId: number;
  contracts: { blind: { address: string }; record: { address: string } };
  record?: { txHash: string };
  blind?: { txHash: string };
};

type Manifest = { networks: ManifestEntry[] };

const rpcByNetwork: Record<string, string> = {
  "ethereum-sepolia": "https://ethereum-sepolia-rpc.publicnode.com",
  "base-sepolia": "https://sepolia.base.org",
  "tempo-testnet": "https://rpc.moderato.tempo.xyz",
};

const labels: Record<string, string> = { record: "Record Verification", blind: "Blind Verification" };

async function readValidity(rpc: string, address: string, id: string) {
  const data = `0x6a938567${id.slice(2).padStart(64, "0")}`;
  const response = await fetch(rpc, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to: address, data }, "latest"] }) });
  if (!response.ok) throw new Error("RPC request failed");
  const payload = await response.json();
  if (payload.error || typeof payload.result !== "string") throw new Error("Verification record was not found");
  return /[1-9a-f]/i.test(payload.result.slice(2));
}

export default function EvmVerificationPage() {
  const [state, setState] = useState<{ status: "loading" | "ready" | "error"; title?: string; message?: string; details?: Record<string, string>; explorer?: string }>({ status: "loading" });

  useEffect(() => {
    const load = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const network = params.get("network") || "";
        const type = params.get("type") || "";
        const id = params.get("id") || "";
        if (!rpcByNetwork[network] || !/^(record|blind)$/.test(type) || !/^0x[0-9a-fA-F]{64}$/.test(id)) throw new Error("This verification link is invalid or incomplete.");
        const manifestNames = ["phase-2-e2e.json", `phase-2-e2e-${network}.json`];
        let manifestResponse: Response | undefined;
        for (const name of manifestNames) {
          const candidate = await fetch(`/evm-verification/${name}`, { cache: "no-store" });
          if (candidate.ok) { manifestResponse = candidate; break; }
        }
        if (!manifestResponse) throw new Error("Verification manifest unavailable");
        const manifest = await manifestResponse.json() as Manifest;
        const entry = manifest.networks.find((item) => item.network === network);
        if (!entry) throw new Error("This network is not currently published for verification.");
        const address = type === "record" ? entry.contracts.record.address : entry.contracts.blind.address;
        const valid = await readValidity(rpcByNetwork[network], address, id);
        const txHash = type === "record" ? entry.record?.txHash : entry.blind?.txHash;
        const explorer = txHash
          ? `${network === "ethereum-sepolia" ? "https://sepolia.etherscan.io" : network === "tempo-testnet" ? "https://explore.testnet.tempo.xyz" : "https://sepolia.basescan.org"}/tx/${txHash}`
          : undefined;
        setState({ status: "ready", title: `${labels[type]} ${valid ? "verified" : "not valid"}`, message: valid ? "The on-chain verification is currently valid. No source record or private inputs are disclosed." : "The on-chain record exists but is expired or revoked.", details: { Network: network, "Chain ID": String(entry.chainId), "Verification ID": id, Status: valid ? "VALID" : "EXPIRED OR REVOKED" }, explorer });
      } catch (error) {
        setState({ status: "error", title: "Verification unavailable", message: error instanceof Error ? error.message : "Unable to read this verification record." });
      }
    };
    void load();
  }, []);

  return <main className="min-h-screen bg-[#05070b] px-4 py-16 text-white sm:px-6"><div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-cyan-950/20 sm:p-9"><div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">PrivateDAO public verification</div><h1 className="mt-4 text-3xl font-semibold tracking-tight">{state.title || "Checking verification"}</h1><p className="mt-4 text-sm leading-7 text-white/65">{state.message || "Reading the public on-chain record. Private inputs stay private."}</p>{state.details && <dl className="mt-7 grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm sm:grid-cols-2">{Object.entries(state.details).map(([key, value]) => <div key={key}><dt className="text-white/45">{key}</dt><dd className="mt-1 break-all text-white/90">{value}</dd></div>)}</dl>}{state.explorer && <a className="mt-7 inline-flex rounded-xl bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950" href={state.explorer} target="_blank" rel="noreferrer">View settlement transaction</a>}{<EvmWalletSessionPanel />}</div></main>;
}
