"use client";

import { useEffect, useState } from "react";
import { AnchorProvider, Program, type Idl } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { CheckCircle2, Loader2, ShieldAlert } from "lucide-react";

import { OperationsShell } from "@/components/operations-shell";
import { AUCTION_PROGRAM_ID, AUCTION_SOLANA_NETWORK, AUCTION_SOLANA_RPC_URL } from "@/lib/privatedao-auction-client";
import { createSolanaBrowserConnection, readSignatureStatuses } from "@/lib/network-adapters/solana-browser";

type Receipt = {
  solanaSignature: string;
  slot: number | bigint;
  finality: number;
  createdAt: number | bigint;
  auctionId: number[];
  rulesDigest: number[];
  policyDigest: number[];
  resultCommitment: number[];
  sessionReference: number[];
};

function hex(value: number[]) {
  return value.map((part) => part.toString(16).padStart(2, "0")).join("");
}

function readReceiptId() {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("receiptId") ?? "";
}

export default function AuctionReceiptPage() {
  const [state, setState] = useState<"loading" | "verified" | "pending" | "invalid">("loading");
  const [receipt, setReceipt] = useState<Receipt>();
  const [signatureConfirmed, setSignatureConfirmed] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const receiptId = readReceiptId();
        const receiptKey = new PublicKey(receiptId);
        const response = await fetch("/idl/privatedao_auction.json", { cache: "no-store" });
        if (!response.ok) throw new Error("The auction verifier is not available in this build.");
        const idl = (await response.json()) as Idl;
        const connection = createSolanaBrowserConnection(AUCTION_SOLANA_RPC_URL, "confirmed");
        const readOnlyWallet = {
          publicKey: receiptKey,
          signTransaction: async () => { throw new Error("Read-only verifier"); },
          signAllTransactions: async () => { throw new Error("Read-only verifier"); },
        };
        const provider = new AnchorProvider(connection, readOnlyWallet, { commitment: "confirmed" });
        const program = new Program(idl, provider);
        const account = await (program.account as unknown as { settlementReceipt: { fetch: (key: PublicKey) => Promise<Receipt> } }).settlementReceipt.fetch(receiptKey);
        if (cancelled) return;
        setReceipt(account);
        if (!account.solanaSignature || account.finality === 0) {
          setState("pending");
          return;
        }
        const status = await readSignatureStatuses(connection, [account.solanaSignature]);
        const confirmed = Boolean(status.value[0]?.confirmationStatus === "confirmed" || status.value[0]?.confirmationStatus === "finalized");
        setSignatureConfirmed(confirmed);
        setState(confirmed ? "verified" : "pending");
      } catch (cause) {
        if (cancelled) return;
        setState("invalid");
        setError(cause instanceof Error ? cause.message : "Receipt verification failed.");
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  const explorerUrl = receipt?.solanaSignature ? `https://explorer.solana.com/tx/${receipt.solanaSignature}?cluster=${AUCTION_SOLANA_NETWORK}` : undefined;
  const statusCopy = state === "verified" ? "VERIFIED" : state === "pending" ? "PENDING" : state === "loading" ? "VERIFYING" : "INVALID";

  return (
    <OperationsShell eyebrow="Public receipt" title="Verify an auction result without a wallet." description="This page reads the durable receipt and checks the reported Solana transaction status. It does not trust a submitted JSON file.">
      <section className="mx-auto grid max-w-3xl gap-5 rounded-[28px] border border-white/10 bg-white/[0.035] p-6 sm:p-8">
        <div className="flex items-center gap-3">
          {state === "loading" ? <Loader2 className="h-6 w-6 animate-spin text-cyan-200" /> : state === "verified" ? <CheckCircle2 className="h-6 w-6 text-emerald-300" /> : <ShieldAlert className="h-6 w-6 text-amber-200" />}
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-white/45">Auction result</div>
            <h1 className="mt-1 text-3xl font-semibold text-white">{statusCopy}</h1>
          </div>
        </div>
        {error ? <p className="rounded-2xl border border-red-200/20 bg-red-200/[0.06] p-4 text-sm text-red-100">{error}</p> : null}
        {receipt ? <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div><dt className="text-white/45">Auction ID</dt><dd className="mt-1 break-all font-mono text-xs text-white/80">{hex(receipt.auctionId)}</dd></div>
          <div><dt className="text-white/45">Finality</dt><dd className="mt-1 text-white/80">{receipt.finality > 0 ? "Recorded" : "Pending"}</dd></div>
          <div className="sm:col-span-2"><dt className="text-white/45">Result commitment</dt><dd className="mt-1 break-all font-mono text-xs text-white/80">{hex(receipt.resultCommitment)}</dd></div>
          <div className="sm:col-span-2"><dt className="text-white/45">Solana transaction</dt><dd className="mt-1 break-all font-mono text-xs text-white/80">{receipt.solanaSignature || "Not available yet"}</dd></div>
        </dl> : null}
        {explorerUrl && signatureConfirmed ? <a className="inline-flex w-fit rounded-xl border border-cyan-200/25 px-4 py-2 text-sm text-cyan-100 hover:bg-cyan-100/10" href={explorerUrl} target="_blank" rel="noreferrer">Open Solana evidence</a> : null}
        <p className="text-xs leading-6 text-white/45">A valid result requires a durable receipt, a finalized state, and a matching Solana transaction. Private bids are not shown here. An authorized prover can additionally bind a Groth16 outcome proof to this receipt through the auction outcome-proof endpoint.</p>
      </section>
    </OperationsShell>
  );
}
