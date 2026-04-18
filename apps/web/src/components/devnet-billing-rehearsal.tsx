"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { Buffer } from "buffer";

import { buttonVariants } from "@/components/ui/button";
import { getTreasuryReceiveConfig } from "@/lib/treasury-receive-config";
import { cn } from "@/lib/utils";

const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

const devnetBillingSkus = [
  {
    key: "wallet-onboarding",
    title: "Wallet-first onboarding lane",
    amountSol: 0.003,
    memoLabel: "WALLET_ONBOARDING",
    summary: "A small Devnet charge that proves a normal visitor can pay from the browser and inspect the chain result.",
  },
  {
    key: "governance-cycle",
    title: "Governance cycle rehearsal",
    amountSol: 0.005,
    memoLabel: "GOVERNANCE_REHEARSAL",
    summary: "Use this when testing the commercial logic for proposal creation, vote operations, and proof-linked review.",
  },
  {
    key: "privacy-packet",
    title: "Privacy packet lane",
    amountSol: 0.007,
    memoLabel: "PRIVACY_PACKET",
    summary: "Use this when a visitor wants to see that reviewer-grade privacy and proof can be tied to an on-chain payment signal.",
  },
  {
    key: "confidential-payout",
    title: "Confidential payout rehearsal",
    amountSol: 0.01,
    memoLabel: "CONFIDENTIAL_PAYOUT",
    summary: "A larger Devnet rehearsal for the confidential treasury path before later contractized billing rails are introduced.",
  },
] as const;

function buildExplorerUrl(signature: string) {
  return `https://solscan.io/tx/${signature}?cluster=devnet`;
}

export function DevnetBillingRehearsal() {
  const { connection } = useConnection();
  const { publicKey, connected, wallet, sendTransaction } = useWallet();
  const [selectedSkuKey, setSelectedSkuKey] = useState<(typeof devnetBillingSkus)[number]["key"]>("wallet-onboarding");
  const [status, setStatus] = useState<string>("Choose a billing lane, connect a Devnet wallet, then send the rehearsal charge.");
  const [signature, setSignature] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const treasuryConfig = useMemo(() => getTreasuryReceiveConfig(), []);
  const selectedSku = devnetBillingSkus.find((item) => item.key === selectedSkuKey) ?? devnetBillingSkus[0];
  const treasuryAddress = treasuryConfig.assets.find((asset) => asset.symbol === "SOL")?.receiveAddress ?? treasuryConfig.treasuryAddress;

  async function handleSendBillingRehearsal() {
    if (!connected || !publicKey) {
      setStatus("Connect a Devnet wallet first. The billing rehearsal is executed by the visitor wallet, not by a hidden backend signer.");
      return;
    }

    setIsProcessing(true);
    setStatus("Preparing the Devnet billing rehearsal transaction...");
    setSignature(null);
    setLogs([]);

    try {
      const latestBlockhash = await connection.getLatestBlockhash("confirmed");
      const lamports = Math.max(1, Math.round(selectedSku.amountSol * LAMPORTS_PER_SOL));
      const memo = `PDAO:${selectedSku.memoLabel}:${Date.now()}`;
      const transaction = new Transaction({
        feePayer: publicKey,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      }).add(
        new TransactionInstruction({
          keys: [],
          programId: MEMO_PROGRAM_ID,
          data: Buffer.from(memo, "utf8"),
        }),
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(treasuryAddress),
          lamports,
        }),
      );

      setStatus("Awaiting wallet signature for the Devnet billing rehearsal...");
      const nextSignature = await sendTransaction(transaction, connection, {
        maxRetries: 3,
        skipPreflight: false,
      });

      setSignature(nextSignature);
      setStatus("Signature received. Confirming the on-chain Devnet billing rehearsal...");

      await connection.confirmTransaction(
        {
          signature: nextSignature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        "confirmed",
      );

      const confirmedTransaction = await connection.getTransaction(nextSignature, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      });

      setLogs(confirmedTransaction?.meta?.logMessages?.slice(0, 8) ?? []);
      setStatus(
        "Billing rehearsal confirmed on Devnet. Open the explorer link or the proof route to inspect the hash, memo, and runtime logs.",
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Devnet billing rehearsal failed.";
      setStatus(message);
      setLogs([]);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
      <section className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
        <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">Devnet billing rehearsal</div>
        <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
          Charge a small Devnet fee from the same wallet-first product, then inspect the proof on-chain
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/66">
          This is the current truthful commercial lane. The visitor signs a small SOL transfer from the wallet, the
          chain records the memo and transfer, and the resulting signature becomes part of the business proof. It is a
          Devnet billing rehearsal today, not a finished fiat or mainnet subscription stack.
        </p>

        <div className="mt-6 grid gap-3">
          {devnetBillingSkus.map((sku) => {
            const selected = sku.key === selectedSkuKey;
            return (
              <button
                key={sku.key}
                type="button"
                className={cn(
                  "rounded-[24px] border px-4 py-4 text-left transition",
                  selected
                    ? "border-cyan-300/28 bg-cyan-300/[0.10]"
                    : "border-white/8 bg-black/20 hover:border-white/14 hover:bg-white/[0.04]",
                )}
                onClick={() => setSelectedSkuKey(sku.key)}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="text-base font-semibold text-white">{sku.title}</div>
                  <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/70">
                    {sku.amountSol.toFixed(3)} SOL
                  </div>
                </div>
                <div className="mt-3 text-sm leading-7 text-white/60">{sku.summary}</div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-[24px] border border-emerald-300/16 bg-emerald-300/[0.08] p-5 text-sm leading-7 text-white/72">
          <div className="text-[11px] uppercase tracking-[0.2em] text-emerald-200/82">Current boundary</div>
          <div className="mt-2">
            The live rehearsal uses a wallet-signed SOL transfer to the Devnet treasury address with a memo-coded SKU.
            Contractized subscription logic, fiat gateways, and institutional invoicing remain later layers.
          </div>
        </div>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-black/20 p-6">
        <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">Execution panel</div>
        <div className="mt-3 text-xl font-semibold text-white">Run the charge and inspect the result</div>
        <div className="mt-4 grid gap-4">
          <div className="rounded-[24px] border border-white/8 bg-[#081420] p-4 text-sm leading-7 text-white/70">
            <div>
              Wallet: <span className="text-white">{connected && wallet ? wallet.adapter.name : "Not connected"}</span>
            </div>
            <div className="mt-1">
              Visitor address:{" "}
              <span className="break-all text-white">{publicKey?.toBase58() ?? "Connect a Devnet wallet to continue."}</span>
            </div>
            <div className="mt-1">
              Treasury receive address: <span className="break-all text-white">{treasuryAddress}</span>
            </div>
            <div className="mt-1">
              Current SKU: <span className="text-white">{selectedSku.title}</span> ·{" "}
              <span className="text-white">{selectedSku.amountSol.toFixed(3)} SOL</span>
            </div>
            <div className="mt-1">
              Network: <span className="text-white">{treasuryConfig.network}</span>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4 text-sm leading-7 text-white/64">
            {status}
          </div>

          {signature ? (
            <div className="rounded-[24px] border border-cyan-300/16 bg-cyan-300/[0.08] p-4 text-sm leading-7 text-white/72">
              <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-100/82">Confirmed Devnet signature</div>
              <div className="mt-2 break-all text-white">{signature}</div>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={buildExplorerUrl(signature)}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}
                >
                  Open explorer
                </a>
                <Link href="/proof?judge=1" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                  Open proof route
                </Link>
              </div>
            </div>
          ) : null}

          {logs.length > 0 ? (
            <div className="rounded-[24px] border border-white/8 bg-black/30 p-4">
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/44">Observed runtime logs</div>
              <div className="mt-3 space-y-2 text-xs leading-6 text-white/64">
                {logs.map((entry, index) => (
                  <div key={`${index}-${entry}`} className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2">
                    {entry}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={cn(buttonVariants({ size: "sm" }))}
              disabled={isProcessing}
              onClick={() => void handleSendBillingRehearsal()}
            >
              {isProcessing ? "Processing..." : "Run billing rehearsal"}
            </button>
            <Link href="/documents/pricing-model" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
              Open pricing model
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
