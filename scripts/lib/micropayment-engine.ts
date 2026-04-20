import fs from "node:fs";
import path from "node:path";

import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  createTransferCheckedInstruction,
  getAccount,
  getMint,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";

import { resolveTokenProgramForMint, solscanTxUrl } from "../utils";

export type MicropaymentExecutionMode = "SOL" | "SPL";

export type MicropaymentTransferRecord = {
  batchIndex: number;
  action: string;
  recipient: string;
  amountRaw: string;
  amountDisplay: string;
  signature: string;
  explorerUrl: string;
  status: "finalized";
  slot: number;
  settledAt: string;
};

export type MicropaymentRailReport = {
  project: "PrivateDAO";
  feature: "Agentic Treasury Micropayment Rail";
  generatedAt: string;
  network: "devnet";
  assetMode: MicropaymentExecutionMode;
  settlementAssetSymbol: string;
  settlementMint: string | null;
  targetCount: number;
  batchCount: number;
  transferCount: number;
  successfulTransferCount: number;
  executionWallet: string;
  totalAmountRaw: string;
  totalAmountDisplay: string;
  actionsPerBatch: string[];
  reportPath: string;
  transfers: MicropaymentTransferRecord[];
};

export type MicropaymentRunOptions = {
  connection?: Connection;
  walletPath?: string;
  transferTarget?: number;
  targetCount?: number;
  stableMint?: string | null;
  stableSymbol?: string;
};

const DEFAULT_DEVNET_RPC =
  process.env.ANCHOR_PROVIDER_URL ||
  process.env.SOLANA_RPC_URL ||
  process.env.SOLANA_URL ||
  "https://api.devnet.solana.com";
const DEFAULT_WALLET_PATH =
  process.env.DEVNET_COORDINATOR_WALLET ||
  process.env.ANCHOR_WALLET ||
  "/home/x-pact/Desktop/wallet-keypair.json";
const DEFAULT_TARGET_COUNT = 10;
const DEFAULT_TRANSFER_TARGET = 50;
const SOL_MICROPAYMENT_ACTIONS = [
  { action: "proposal-approved", lamports: 20_000n },
  { action: "vote-settled", lamports: 20_000n },
  { action: "reveal-settled", lamports: 20_000n },
  { action: "execute-settled", lamports: 50_000n },
  { action: "proof-attached", lamports: 10_000n },
] as const;
const SPL_MICROPAYMENT_ACTIONS = [
  { action: "proposal-approved", amountRaw: 10_000n },
  { action: "vote-settled", amountRaw: 10_000n },
  { action: "reveal-settled", amountRaw: 10_000n },
  { action: "execute-settled", amountRaw: 50_000n },
  { action: "proof-attached", amountRaw: 10_000n },
] as const;

function loadKeypair(filePath: string) {
  const secret = Uint8Array.from(JSON.parse(fs.readFileSync(filePath, "utf8")) as number[]);
  return Keypair.fromSecretKey(secret);
}

function createConnection() {
  return new Connection(DEFAULT_DEVNET_RPC, "confirmed");
}

function ensureDir(dirPath: string) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function nowIso() {
  return new Date().toISOString();
}

function formatAmount(value: bigint, decimals: number, symbol: string) {
  const divisor = 10n ** BigInt(decimals);
  const whole = value / divisor;
  const fraction = value % divisor;
  const fractionString = fraction.toString().padStart(decimals, "0").replace(/0+$/, "");
  return fractionString.length > 0
    ? `${whole.toString()}.${fractionString} ${symbol}`
    : `${whole.toString()} ${symbol}`;
}

type MicropaymentPlanInput = {
  assetMode: MicropaymentExecutionMode;
  targetCount: number;
  transferTarget: number;
};

export type MicropaymentPlan = {
  assetMode: MicropaymentExecutionMode;
  targetCount: number;
  transferTarget: number;
  batchActionCount: number;
  batchCount: number;
  actionsPerBatch: string[];
};

function buildMicropaymentPlan({
  assetMode,
  targetCount,
  transferTarget,
}: MicropaymentPlanInput): MicropaymentPlan {
  const actions = assetMode === "SPL" ? SPL_MICROPAYMENT_ACTIONS : SOL_MICROPAYMENT_ACTIONS;
  return {
    assetMode,
    targetCount,
    transferTarget,
    batchActionCount: actions.length,
    batchCount: Math.ceil(transferTarget / actions.length),
    actionsPerBatch: actions.map((item) => item.action),
  };
}

async function sendAndFinalize(
  connection: Connection,
  transaction: Transaction,
  signer: Keypair,
) {
  const latestBlockhash = await connection.getLatestBlockhash("confirmed");
  transaction.feePayer = signer.publicKey;
  transaction.recentBlockhash = latestBlockhash.blockhash;
  transaction.sign(signer);

  const signature = await connection.sendRawTransaction(transaction.serialize(), {
    preflightCommitment: "confirmed",
    skipPreflight: false,
  });
  const confirmation = await connection.confirmTransaction(
    {
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    },
    "confirmed",
  );
  if (confirmation.value.err) {
    throw new Error(`transaction failed: ${JSON.stringify(confirmation.value.err)}`);
  }
  const tx = await connection.getTransaction(signature, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });
  return {
    signature,
    slot: tx?.slot ?? 0,
  };
}

async function detectStableExecutionMode(
  connection: Connection,
  signer: Keypair,
  stableMint: string | null | undefined,
) {
  if (!stableMint) {
    return null;
  }

  const mint = new PublicKey(stableMint);
  const tokenProgram = await resolveTokenProgramForMint(connection, mint);
  const mintInfo = await getMint(connection, mint, "confirmed", tokenProgram);
  const sourceAta = await getOrCreateAssociatedTokenAccount(
    connection,
    signer,
    mint,
    signer.publicKey,
    false,
    "confirmed",
    undefined,
    tokenProgram,
  );
  const sourceBalance = await getAccount(connection, sourceAta.address, "confirmed", tokenProgram);
  const minimumNeeded = SPL_MICROPAYMENT_ACTIONS.reduce((sum, item) => sum + item.amountRaw, 0n);
  return sourceBalance.amount >= minimumNeeded
    ? {
        mint,
        tokenProgram,
        decimals: mintInfo.decimals,
        sourceAta: sourceAta.address,
      }
    : null;
}

function writeReportArtifacts(report: MicropaymentRailReport) {
  const jsonPath = path.resolve("docs/agentic-treasury-micropayment-rail.generated.json");
  const markdownPath = path.resolve("docs/agentic-treasury-micropayment-rail.generated.md");
  ensureDir(path.dirname(jsonPath));

  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2) + "\n", "utf8");

  const markdown = buildMicropaymentMarkdown(report);
  fs.writeFileSync(markdownPath, markdown, "utf8");
}

function buildMicropaymentMarkdown(report: MicropaymentRailReport) {
  const lines = [
    "# Agentic Treasury Micropayment Rail Evidence",
    "",
    `- Generated at: \`${report.generatedAt}\``,
    `- Network: \`${report.network}\``,
    `- Asset mode: \`${report.assetMode}\``,
    `- Settlement asset: \`${report.settlementAssetSymbol}\``,
    `- Transfer count: \`${report.successfulTransferCount}/${report.transferCount}\``,
    `- Batch count: \`${report.batchCount}\``,
    `- Target count: \`${report.targetCount}\``,
    `- Total amount: \`${report.totalAmountDisplay}\``,
    `- Execution wallet: \`${report.executionWallet}\``,
    "",
    "## Transfer samples",
    "",
  ];

  for (const transfer of report.transfers.slice(0, 20)) {
    lines.push(
      `- Batch ${transfer.batchIndex + 1} · ${transfer.action} · \`${transfer.amountDisplay}\` · [${transfer.signature}](${transfer.explorerUrl})`,
    );
  }

  lines.push("", "## Machine-readable source", "", "- `docs/agentic-treasury-micropayment-rail.generated.json`");
  return lines.join("\n") + "\n";
}

export async function runAgenticMicropaymentRail(
  options: MicropaymentRunOptions = {},
): Promise<MicropaymentRailReport> {
  const connection = options.connection ?? createConnection();
  const signer = loadKeypair(options.walletPath ?? DEFAULT_WALLET_PATH);
  const targetCount = Math.max(1, options.targetCount ?? DEFAULT_TARGET_COUNT);
  const transferTarget = Math.max(5, options.transferTarget ?? DEFAULT_TRANSFER_TARGET);
  const stableMint =
    options.stableMint ??
    process.env.PRIVATE_DAO_MICROPAYMENT_MINT ??
    process.env.NEXT_PUBLIC_TREASURY_PUSD_MINT ??
    process.env.NEXT_PUBLIC_TREASURY_USDC_MINT ??
    null;
  const stableSymbol =
    options.stableSymbol ??
    process.env.PRIVATE_DAO_MICROPAYMENT_SYMBOL ??
    (process.env.NEXT_PUBLIC_TREASURY_PUSD_MINT ? "PUSD" : "USDC");

  const recipients = Array.from({ length: targetCount }, () => Keypair.generate());
  const stableContext = await detectStableExecutionMode(connection, signer, stableMint);
  const assetMode: MicropaymentExecutionMode = stableContext ? "SPL" : "SOL";
  const settlementAssetSymbol = stableContext ? stableSymbol : "SOL";
  const plan = buildMicropaymentPlan({
    assetMode: stableContext ? "SPL" : "SOL",
    targetCount,
    transferTarget,
  });
  const batchCount = plan.batchCount;
  const transfers: MicropaymentTransferRecord[] = [];
  let totalAmountRaw = 0n;

  if (!stableContext) {
    const rentActivationLamports = BigInt(await connection.getMinimumBalanceForRentExemption(0)) + 50_000n;
    for (const [recipientIndex, recipient] of recipients.entries()) {
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: signer.publicKey,
          toPubkey: recipient.publicKey,
          lamports: Number(rentActivationLamports),
        }),
      );
      const { signature, slot } = await sendAndFinalize(connection, tx, signer);
      totalAmountRaw += rentActivationLamports;
      transfers.push({
        batchIndex: recipientIndex,
        action: "recipient-activation",
        recipient: recipient.publicKey.toBase58(),
        amountRaw: rentActivationLamports.toString(),
        amountDisplay: formatAmount(rentActivationLamports, 9, "SOL"),
        signature,
        explorerUrl: solscanTxUrl(signature),
        status: "finalized",
        slot,
        settledAt: nowIso(),
      });
    }
  }

  for (let batchIndex = 0; batchIndex < batchCount; batchIndex += 1) {
    const recipient = recipients[batchIndex % recipients.length];

    if (stableContext) {
      for (const actionConfig of SPL_MICROPAYMENT_ACTIONS) {
        if (transfers.length >= transferTarget) {
          break;
        }
        const recipientAta = await getOrCreateAssociatedTokenAccount(
          connection,
          signer,
          stableContext.mint,
          recipient.publicKey,
          false,
          "confirmed",
          undefined,
          stableContext.tokenProgram,
        );
        const amountRaw = actionConfig.amountRaw;
        const tx = new Transaction().add(
          createTransferCheckedInstruction(
            stableContext.sourceAta,
            stableContext.mint,
            recipientAta.address,
            signer.publicKey,
            amountRaw,
            stableContext.decimals,
            [],
            stableContext.tokenProgram,
          ),
        );
        const { signature, slot } = await sendAndFinalize(connection, tx, signer);
        totalAmountRaw += amountRaw;
        transfers.push({
          batchIndex,
          action: actionConfig.action,
          recipient: recipient.publicKey.toBase58(),
          amountRaw: amountRaw.toString(),
          amountDisplay: formatAmount(amountRaw, stableContext.decimals, stableSymbol),
          signature,
          explorerUrl: solscanTxUrl(signature),
          status: "finalized",
          slot,
          settledAt: nowIso(),
        });
      }
    } else {
      for (const actionConfig of SOL_MICROPAYMENT_ACTIONS) {
        if (transfers.length >= transferTarget) {
          break;
        }
        const lamports = actionConfig.lamports;
        const tx = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: signer.publicKey,
            toPubkey: recipient.publicKey,
            lamports: Number(lamports),
          }),
        );
        const { signature, slot } = await sendAndFinalize(connection, tx, signer);
        totalAmountRaw += lamports;
        transfers.push({
          batchIndex,
          action: actionConfig.action,
          recipient: recipient.publicKey.toBase58(),
          amountRaw: lamports.toString(),
          amountDisplay: formatAmount(lamports, 9, "SOL"),
          signature,
          explorerUrl: solscanTxUrl(signature),
          status: "finalized",
          slot,
          settledAt: nowIso(),
        });
      }
    }
  }

  const report: MicropaymentRailReport = {
    project: "PrivateDAO",
    feature: "Agentic Treasury Micropayment Rail",
    generatedAt: nowIso(),
    network: "devnet",
    assetMode,
    settlementAssetSymbol,
    settlementMint: stableContext?.mint.toBase58() ?? null,
    targetCount,
    batchCount,
    transferCount: transfers.length,
    successfulTransferCount: transfers.length,
    executionWallet: signer.publicKey.toBase58(),
    totalAmountRaw: totalAmountRaw.toString(),
    totalAmountDisplay: formatAmount(
      totalAmountRaw,
      stableContext ? stableContext.decimals : 9,
      settlementAssetSymbol,
    ),
    actionsPerBatch: plan.actionsPerBatch,
    reportPath: "docs/agentic-treasury-micropayment-rail.generated.json",
    transfers,
  };

  writeReportArtifacts(report);
  return report;
}

export const __testables = {
  buildMicropaymentPlan,
  buildMicropaymentMarkdown,
  formatAmount,
  writeReportArtifacts,
};
