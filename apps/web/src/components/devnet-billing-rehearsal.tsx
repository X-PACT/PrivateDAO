"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { Buffer } from "buffer";

import { buttonVariants } from "@/components/ui/button";
import { buildSolanaTxUrl, SOLANA_NETWORK_LABEL } from "@/lib/solana-network";
import { getTreasuryReceiveConfig } from "@/lib/treasury-receive-config";
import { cn } from "@/lib/utils";

const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");

type BillingSku = {
  key: string;
  title: string;
  assetSymbol: "SOL" | "PUSD";
  amount: number;
  memoLabel: string;
  summary: string;
};

const testnetBillingSkus = [
  {
    key: "wallet-onboarding",
    title: "Wallet-first onboarding lane",
    assetSymbol: "SOL",
    amount: 0.003,
    memoLabel: "WALLET_ONBOARDING",
    summary: "A small Testnet charge that proves a normal visitor can pay from the browser and inspect the chain result.",
  },
  {
    key: "governance-cycle",
    title: "Governance cycle rehearsal",
    assetSymbol: "SOL",
    amount: 0.005,
    memoLabel: "GOVERNANCE_REHEARSAL",
    summary: "Use this when testing the commercial logic for proposal creation, vote operations, and proof-linked review.",
  },
  {
    key: "pusd-payroll",
    title: "PUSD confidential payroll lane",
    assetSymbol: "PUSD",
    amount: 1,
    memoLabel: "PUSD_CONFIDENTIAL_PAYROLL",
    summary: "Use this when testing Palm USD as the governed stablecoin rail for payroll, grants, and contributor settlement.",
  },
  {
    key: "pusd-gaming-reward",
    title: "PUSD gaming reward lane",
    assetSymbol: "PUSD",
    amount: 2,
    memoLabel: "PUSD_GAMING_REWARD",
    summary: "Use this when testing Palm USD as the stable reward asset for gaming DAO payouts and tournament pools.",
  },
  {
    key: "privacy-packet",
    title: "Privacy packet lane",
    assetSymbol: "SOL",
    amount: 0.007,
    memoLabel: "PRIVACY_PACKET",
    summary: "Use this when a visitor wants to see that reviewer-grade privacy and proof can be tied to an on-chain payment signal.",
  },
  {
    key: "confidential-payout",
    title: "Confidential payout rehearsal",
    assetSymbol: "SOL",
    amount: 0.01,
    memoLabel: "CONFIDENTIAL_PAYOUT",
    summary: "A larger Testnet rehearsal for the confidential treasury path before later contractized billing rails are introduced.",
  },
] satisfies BillingSku[];

function getAssociatedTokenAddress(owner: PublicKey, mint: PublicKey, tokenProgram: PublicKey) {
  const [address] = PublicKey.findProgramAddressSync(
    [owner.toBuffer(), tokenProgram.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  return address;
}

function createAssociatedTokenAccountIdempotentInstruction(params: {
  payer: PublicKey;
  ata: PublicKey;
  owner: PublicKey;
  mint: PublicKey;
  tokenProgram: PublicKey;
}) {
  return new TransactionInstruction({
    programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    keys: [
      { pubkey: params.payer, isSigner: true, isWritable: true },
      { pubkey: params.ata, isSigner: false, isWritable: true },
      { pubkey: params.owner, isSigner: false, isWritable: false },
      { pubkey: params.mint, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: params.tokenProgram, isSigner: false, isWritable: false },
    ],
    data: Buffer.from([1]),
  });
}

function createTransferCheckedInstruction(params: {
  source: PublicKey;
  mint: PublicKey;
  destination: PublicKey;
  owner: PublicKey;
  amountRaw: bigint;
  decimals: number;
  tokenProgram: PublicKey;
}) {
  const data = Buffer.alloc(10);
  data.writeUInt8(12, 0);
  data.writeBigUInt64LE(params.amountRaw, 1);
  data.writeUInt8(params.decimals, 9);
  return new TransactionInstruction({
    programId: params.tokenProgram,
    keys: [
      { pubkey: params.source, isSigner: false, isWritable: true },
      { pubkey: params.mint, isSigner: false, isWritable: false },
      { pubkey: params.destination, isSigner: false, isWritable: true },
      { pubkey: params.owner, isSigner: true, isWritable: false },
    ],
    data,
  });
}

function toTokenAmountRaw(amount: number, decimals: number) {
  const [whole, fraction = ""] = amount.toFixed(decimals).split(".");
  const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
  return BigInt(whole) * BigInt(10) ** BigInt(decimals) + BigInt(paddedFraction || "0");
}

export function TestnetBillingRehearsal() {
  const { connection } = useConnection();
  const { publicKey, connected, wallet, sendTransaction } = useWallet();
  const [selectedSkuKey, setSelectedSkuKey] = useState<(typeof testnetBillingSkus)[number]["key"]>("wallet-onboarding");
  const [status, setStatus] = useState<string>(`Choose a billing lane, connect a ${SOLANA_NETWORK_LABEL} wallet, then send the rehearsal charge.`);
  const [signature, setSignature] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const treasuryConfig = useMemo(() => getTreasuryReceiveConfig(), []);
  const selectedSku = testnetBillingSkus.find((item) => item.key === selectedSkuKey) ?? testnetBillingSkus[0];
  const selectedAsset = treasuryConfig.assets.find((asset) => asset.symbol === selectedSku.assetSymbol);
  const treasuryAddress = selectedAsset?.receiveAddress ?? treasuryConfig.treasuryAddress;
  const pusdConfigured = Boolean(
    selectedSku.assetSymbol !== "PUSD" ||
      (selectedAsset?.mint && selectedAsset?.receiveAddress && selectedAsset?.tokenProgram),
  );

  async function handleSendBillingRehearsal() {
    if (!connected || !publicKey) {
      setStatus(`Connect a ${SOLANA_NETWORK_LABEL} wallet first. The billing rehearsal is executed by the visitor wallet, not by a hidden backend signer.`);
      return;
    }

    setIsProcessing(true);
    setStatus(`Preparing the ${SOLANA_NETWORK_LABEL} billing rehearsal transaction...`);
    setSignature(null);
    setLogs([]);

    try {
      const latestBlockhash = await connection.getLatestBlockhash("confirmed");
      const memo = `PDAO:${selectedSku.memoLabel}:${Date.now()}`;
      const transaction = new Transaction({
        feePayer: publicKey,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });

      transaction.add(
        new TransactionInstruction({
          keys: [],
          programId: MEMO_PROGRAM_ID,
          data: Buffer.from(memo, "utf8"),
        }),
      );

      if (selectedSku.assetSymbol === "PUSD") {
        if (!selectedAsset?.mint || !selectedAsset.tokenProgram) {
          setStatus("PUSD rail is ready for the official Solana mint. Set NEXT_PUBLIC_TREASURY_PUSD_MINT and NEXT_PUBLIC_TREASURY_PUSD_RECEIVE_ADDRESS to run the browser-signed Palm USD transfer.");
          return;
        }
        const mint = new PublicKey(selectedAsset.mint);
        const tokenProgram = new PublicKey(selectedAsset.tokenProgram);
        const destinationOwner = new PublicKey(treasuryAddress);
        const sourceAta = getAssociatedTokenAddress(publicKey, mint, tokenProgram);
        const destinationAta = getAssociatedTokenAddress(destinationOwner, mint, tokenProgram);
        const decimals = selectedAsset.decimals ?? 6;
        const amountRaw = toTokenAmountRaw(selectedSku.amount, decimals);
        const balance = await connection.getTokenAccountBalance(sourceAta).catch(() => null);
        const currentAmount = BigInt(balance?.value.amount ?? "0");
        if (currentAmount < amountRaw) {
          setStatus(
            `Connected wallet needs at least ${selectedSku.amount.toFixed(decimals)} PUSD on ${SOLANA_NETWORK_LABEL}. Current detected PUSD balance is ${balance?.value.uiAmountString ?? "0"}.`,
          );
          return;
        }
        transaction.add(
          createAssociatedTokenAccountIdempotentInstruction({
            payer: publicKey,
            ata: destinationAta,
            owner: destinationOwner,
            mint,
            tokenProgram,
          }),
          createTransferCheckedInstruction({
            source: sourceAta,
            mint,
            destination: destinationAta,
            owner: publicKey,
            amountRaw,
            decimals,
            tokenProgram,
          }),
        );
      } else {
        const lamports = Math.max(1, Math.round(selectedSku.amount * LAMPORTS_PER_SOL));
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: new PublicKey(treasuryAddress),
            lamports,
          }),
        );
      }

      setStatus(`Awaiting wallet signature for the ${SOLANA_NETWORK_LABEL} billing rehearsal...`);
      const nextSignature = await sendTransaction(transaction, connection, {
        maxRetries: 3,
        skipPreflight: false,
      });

      setSignature(nextSignature);
      setStatus(`Signature received. Confirming the on-chain ${SOLANA_NETWORK_LABEL} billing rehearsal...`);

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
        `Billing rehearsal confirmed on ${SOLANA_NETWORK_LABEL}. Open the explorer link or the proof route to inspect the hash, memo, and runtime logs.`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : `${SOLANA_NETWORK_LABEL} billing rehearsal failed.`;
      setStatus(message);
      setLogs([]);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
      <section className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
        <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">Testnet billing rehearsal</div>
        <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
          Charge a small Testnet fee from the same wallet-first product, then inspect the proof on-chain
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/66">
          This is the current truthful commercial lane. The visitor signs a small SOL or configured PUSD transfer from
          the wallet, the chain records the memo and transfer, and the resulting signature becomes part of the business
          proof. The Palm USD lane is designed for confidential payroll, grant distribution, commerce, and gaming DAO
          reward settlement.
        </p>

        <div className="mt-6 grid gap-3">
          {testnetBillingSkus.map((sku) => {
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
                    {sku.assetSymbol === "SOL" ? sku.amount.toFixed(3) : sku.amount.toFixed(2)} {sku.assetSymbol}
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
            The live rehearsal uses a wallet-signed SOL transfer, or a PUSD SPL transfer when the Palm USD mint is
            configured, to the Testnet treasury address with a memo-coded SKU. Contractized subscription logic, fiat
            gateways, and institutional invoicing remain later layers.
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
              <span className="break-all text-white">{publicKey?.toBase58() ?? `Connect a ${SOLANA_NETWORK_LABEL} wallet to continue.`}</span>
            </div>
            <div className="mt-1">
              Treasury receive address: <span className="break-all text-white">{treasuryAddress}</span>
            </div>
            <div className="mt-1">
              Current SKU: <span className="text-white">{selectedSku.title}</span> ·{" "}
              <span className="text-white">
                {selectedSku.assetSymbol === "SOL" ? selectedSku.amount.toFixed(3) : selectedSku.amount.toFixed(2)} {selectedSku.assetSymbol}
              </span>
            </div>
            <div className="mt-1">
              Asset rail: <span className="text-white">{selectedSku.assetSymbol}</span>
              {selectedSku.assetSymbol === "PUSD" ? (
                <span className="text-white/58"> · {pusdConfigured ? "Palm USD mint configured" : "Ready for official Palm USD mint"}</span>
              ) : null}
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
              <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-100/82">Confirmed Testnet signature</div>
              <div className="mt-2 break-all text-white">{signature}</div>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={buildSolanaTxUrl(signature)}
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

export const DevnetBillingRehearsal = TestnetBillingRehearsal;
