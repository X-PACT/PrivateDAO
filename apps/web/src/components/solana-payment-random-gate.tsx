"use client";

import { useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Buffer } from "buffer";
import { ArrowRight, CheckCircle2, Copy, Hash, ShieldCheck, Shuffle, Wallet } from "lucide-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";

import { WalletConnectButton } from "@/components/wallet-connect-button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createSolanaBrowserConnection, sendAndConfirmBrowserTransaction } from "@/lib/network-adapters/solana-browser";

const apiBase = "https://api.privatedao.org/api/v1/payment-gate/random";
const mainnetConnection = createSolanaBrowserConnection("https://rpc.solanatracker.io/public", "confirmed");

type Invoice = {
  invoiceId: string;
  walletAddress: string;
  network: string;
  paymentAsset: "SOL";
  treasuryAddress: string;
  amountSol: number;
  amountLamports: number;
  memo: string;
  expiresInSeconds: number;
};

type PrepareResponse = {
  ok: boolean;
  invoice?: Invoice;
  error?: string;
};

type VerifyResponse = {
  ok: boolean;
  status: string;
  randomNumber?: number;
  receipt?: {
    label: string;
    transactionSignature: string;
    treasuryAddress: string;
    amountSol: number;
    amountLamports: number;
    unlockResult: string;
    timestamp: string;
    network: string;
  };
  verification?: {
    ok: boolean;
    reason: string;
    signature?: string;
    treasuryAddress?: string;
    transferredLamports?: number;
    requiredLamports?: number;
    providerEndpoint?: string;
  };
  error?: string;
};

export function SolanaPaymentRandomGate() {
  const { connected, publicKey, sendTransaction } = useWallet();
  const [invoice, setInvoice] = useState<Invoice>();
  const [signature, setSignature] = useState("");
  const [result, setResult] = useState<VerifyResponse>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<"prepare" | "pay" | "verify" | null>(null);

  const walletAddress = useMemo(() => publicKey?.toBase58() || "", [publicKey]);

  async function prepareInvoice() {
    if (!walletAddress) {
      setError("Connect a Solana wallet first.");
      return;
    }
    setLoading("prepare");
    setError("");
    setResult(undefined);
    try {
      const response = await fetch(`${apiBase}/prepare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      });
      const payload = (await response.json()) as PrepareResponse;
      if (!response.ok || !payload.ok || !payload.invoice) throw new Error(payload.error || "Could not prepare invoice.");
      setInvoice(payload.invoice);
    } catch (prepareError) {
      setError(prepareError instanceof Error ? prepareError.message : "Could not prepare invoice.");
    } finally {
      setLoading(null);
    }
  }

  async function payWithWallet() {
    if (!publicKey || !invoice) return;
    setLoading("pay");
    setError("");
    setResult(undefined);
    try {
      const transaction = new Transaction();
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(invoice.treasuryAddress),
          lamports: invoice.amountLamports,
        }),
      );
      transaction.add(
        new TransactionInstruction({
          keys: [],
          programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
          data: Buffer.from(invoice.memo, "utf8"),
        }),
      );
      const txSignature = await sendAndConfirmBrowserTransaction(mainnetConnection, transaction, sendTransaction);
      setSignature(txSignature);
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "Wallet payment failed.");
    } finally {
      setLoading(null);
    }
  }

  async function verifyPayment(txSignature = signature) {
    if (!invoice || !walletAddress || !txSignature.trim()) {
      setError("Prepare an invoice and provide the payment signature first.");
      return;
    }
    setLoading("verify");
    setError("");
    try {
      const response = await fetch(`${apiBase}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, invoiceId: invoice.invoiceId, signature: txSignature.trim() }),
      });
      const payload = (await response.json()) as VerifyResponse;
      setResult(payload);
      if (!response.ok || !payload.ok) throw new Error(payload.error || payload.verification?.reason || "Payment was not verified.");
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "Payment was not verified.");
    } finally {
      setLoading(null);
    }
  }

  async function copyValue(value: string) {
    await navigator.clipboard.writeText(value);
  }

  return (
    <section className="rounded-[28px] border border-violet-300/18 bg-white/[0.035] p-5 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="text-[11px] uppercase tracking-[0.26em] text-violet-100/76">Live payment gate</div>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
            Pay with Solana, verify on-chain, unlock a result.
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/64">
            This is the small public demo for the community: connect a wallet, pay the configured SOL amount to the
            PrivateDAO treasury, then the backend verifies the transaction on Solana Mainnet before unlocking the random
            number generator.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <WalletConnectButton />
            <button type="button" onClick={prepareInvoice} disabled={!connected || loading !== null} className={cn(buttonVariants({ size: "sm" }))}>
              {loading === "prepare" ? "Preparing..." : "Prepare invoice"}
              <Wallet className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="rounded-2xl border border-white/10 bg-black/24 p-4">
            <div className="text-sm font-semibold text-white">Payment policy</div>
            <div className="mt-3 grid gap-2 text-sm text-white/62 sm:grid-cols-2">
              <div>Network: Solana Mainnet</div>
              <div>Asset: SOL</div>
              <div>Amount: {invoice ? invoice.amountSol : 0.1} SOL</div>
              <div>Verification: backend on-chain read</div>
            </div>
          </div>

          {invoice ? (
            <div className="rounded-2xl border border-cyan-300/16 bg-cyan-300/[0.06] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-100/70">Treasury address</div>
                  <div className="mt-2 break-all font-mono text-xs text-white">{invoice.treasuryAddress}</div>
                </div>
                <button type="button" onClick={() => copyValue(invoice.treasuryAddress)} className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
              </div>
              <div className="mt-3 grid gap-2 text-sm text-white/62 sm:grid-cols-2">
                <div>Invoice: {invoice.invoiceId}</div>
                <div>Memo: {invoice.memo}</div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" onClick={payWithWallet} disabled={loading !== null} className={cn(buttonVariants({ size: "sm" }))}>
                  {loading === "pay" ? "Sending..." : "Pay from wallet"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : null}

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <label className="grid gap-2 text-sm text-white/72">
              Payment signature
              <input
                value={signature}
                onChange={(event) => setSignature(event.target.value)}
                placeholder="Paste signature or pay from wallet"
                className="rounded-2xl border border-white/10 bg-black/28 px-3 py-3 font-mono text-xs text-white outline-none focus:border-violet-200/60"
              />
            </label>
            <button
              type="button"
              onClick={() => verifyPayment()}
              disabled={!invoice || loading !== null}
              className={cn(buttonVariants({ size: "sm" }), "mt-3")}
            >
              {loading === "verify" ? "Verifying..." : "Verify and generate"}
              <Shuffle className="h-4 w-4" />
            </button>
          </div>

          {result?.ok ? (
            <div className="rounded-2xl border border-emerald-300/22 bg-emerald-300/[0.08] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                {result.receipt?.label || "Verified on Solana Mainnet"}
              </div>
              <div className="mt-3 text-4xl font-semibold text-white">{result.randomNumber}</div>
              <div className="mt-3 grid gap-2 text-sm text-white/62">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-200" />
                  {result.verification?.reason}
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-cyan-100" />
                  Provider: {result.verification?.providerEndpoint || "configured RPC fallback"}
                </div>
              </div>
              {result.receipt ? (
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/24 p-4">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-emerald-100/70">Proof receipt</div>
                  <div className="mt-3 grid gap-2 text-xs leading-6 text-white/64">
                    <div>
                      Transaction signature:{" "}
                      <span className="break-all font-mono text-white">{result.receipt.transactionSignature}</span>
                    </div>
                    <div>
                      Treasury address: <span className="break-all font-mono text-white">{result.receipt.treasuryAddress}</span>
                    </div>
                    <div>Amount: {result.receipt.amountSol} SOL</div>
                    <div>Unlock result: {result.receipt.unlockResult}</div>
                    <div>Timestamp: {result.receipt.timestamp}</div>
                    <div>Network: {result.receipt.network}</div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {error ? <div className="rounded-2xl border border-red-300/18 bg-red-400/10 p-3 text-sm text-red-100">{error}</div> : null}
        </div>
      </div>
    </section>
  );
}
