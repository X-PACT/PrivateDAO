// SPDX-License-Identifier: AGPL-3.0-or-later
import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";

export type MagicBlockUnsignedTransactionResponse = {
  kind: string;
  version: string;
  transactionBase64: string;
  sendTo: string;
  recentBlockhash: string;
  lastValidBlockHeight: number;
  instructionCount: number;
  requiredSigners: string[];
  validator: string | null;
  transferQueue?: string | null;
  rentPda?: string | null;
};

export type MagicBlockBalanceResponse = {
  address: string;
  mint: string;
  ata: string;
  location: "base" | "ephemeral";
  balance: string | number;
};

export type MagicBlockMintInitializationResponse = MagicBlockUnsignedTransactionResponse & {
  transferQueue: string;
  rentPda: string;
};

export type MagicBlockMintInitializationStatus = {
  mint: string;
  validator: string | null;
  transferQueue: string | null;
  initialized: boolean;
};

export type MagicBlockHealthResponse = {
  status: "ok" | string;
};

export type MagicBlockCluster = "devnet" | "mainnet-beta";
export type MagicBlockTransferVisibility = "public" | "private";
export type MagicBlockBalanceLocation = "base" | "ephemeral";

type MagicBlockRequestOptions = {
  method?: "GET" | "POST";
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
};

type MagicBlockRequestBase = {
  cluster?: MagicBlockCluster;
  validator?: string;
};

type MagicBlockBalanceRequest = MagicBlockRequestBase & {
  address: string;
  mint: string;
};

type MagicBlockInitializeMintRequest = MagicBlockRequestBase & {
  payer: string;
  mint: string;
};

type MagicBlockDepositRequest = MagicBlockRequestBase & {
  owner: string;
  amount: string | number;
  mint?: string;
  initIfMissing?: boolean;
  initVaultIfMissing?: boolean;
  initAtasIfMissing?: boolean;
  idempotent?: boolean;
};

type MagicBlockTransferRequest = MagicBlockRequestBase & {
  from: string;
  to: string;
  mint: string;
  amount: string | number;
  visibility: MagicBlockTransferVisibility;
  fromBalance: MagicBlockBalanceLocation;
  toBalance: MagicBlockBalanceLocation;
  initIfMissing?: boolean;
  initAtasIfMissing?: boolean;
  initVaultIfMissing?: boolean;
  memo?: string;
  minDelayMs?: number;
  maxDelayMs?: number;
  split?: number;
};

type MagicBlockWithdrawRequest = MagicBlockRequestBase & {
  owner: string;
  mint: string;
  amount: string | number;
  initIfMissing?: boolean;
  initAtasIfMissing?: boolean;
  escrowIndex?: number;
  idempotent?: boolean;
};

function trimValue(value?: string | null): string {
  return (value || "").trim();
}

function normalizeApiBase(base?: string | null): string {
  const resolved = trimValue(base || process.env.MAGICBLOCK_API_BASE || "https://per.devnet.magicblock.gg");
  return resolved.replace(/\/+$/, "");
}

function magicBlockTimeoutMs(): number {
  const parsed = Number(process.env.MAGICBLOCK_HTTP_TIMEOUT_MS || 3000);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 3000;
}

export function magicBlockApiBase(): string {
  return normalizeApiBase();
}

export function magicBlockCluster(): MagicBlockCluster {
  const cluster = trimValue(process.env.MAGICBLOCK_CLUSTER || "devnet").toLowerCase();
  return cluster === "mainnet-beta" ? "mainnet-beta" : "devnet";
}

async function magicBlockFetch<T>(
  pathname: string,
  { method = "GET", query, body }: MagicBlockRequestOptions = {},
  apiBase = magicBlockApiBase(),
): Promise<T> {
  const url = new URL(`${normalizeApiBase(apiBase)}${pathname}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), magicBlockTimeoutMs());
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`MagicBlock request timed out after ${magicBlockTimeoutMs()}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      payload?.error ||
      payload?.message ||
      `MagicBlock request failed: ${response.status} ${response.statusText}`,
    );
  }
  return payload as T;
}

export async function getMagicBlockHealth(apiBase?: string): Promise<MagicBlockHealthResponse> {
  return magicBlockFetch<MagicBlockHealthResponse>("/health", {}, apiBase);
}

export async function getMagicBlockBalance(
  request: MagicBlockBalanceRequest,
  apiBase?: string,
): Promise<MagicBlockBalanceResponse> {
  return magicBlockFetch<MagicBlockBalanceResponse>(
    "/v1/spl/balance",
    {
      query: {
        address: request.address,
        mint: request.mint,
        cluster: request.cluster || magicBlockCluster(),
      },
    },
    apiBase,
  );
}

export async function getMagicBlockPrivateBalance(
  request: MagicBlockBalanceRequest,
  apiBase?: string,
): Promise<MagicBlockBalanceResponse> {
  return magicBlockFetch<MagicBlockBalanceResponse>(
    "/v1/spl/private-balance",
    {
      query: {
        address: request.address,
        mint: request.mint,
        cluster: request.cluster || magicBlockCluster(),
      },
    },
    apiBase,
  );
}

export async function getMagicBlockMintInitializationStatus(
  request: Pick<MagicBlockInitializeMintRequest, "mint" | "cluster" | "validator">,
  apiBase?: string,
): Promise<MagicBlockMintInitializationStatus> {
  return magicBlockFetch<MagicBlockMintInitializationStatus>(
    "/v1/spl/is-mint-initialized",
    {
      query: {
        mint: request.mint,
        cluster: request.cluster || magicBlockCluster(),
        validator: request.validator,
      },
    },
    apiBase,
  );
}

export async function buildMagicBlockInitializeMint(
  request: MagicBlockInitializeMintRequest,
  apiBase?: string,
): Promise<MagicBlockMintInitializationResponse> {
  return magicBlockFetch<MagicBlockMintInitializationResponse>(
    "/v1/spl/initialize-mint",
    {
      method: "POST",
      body: {
        payer: request.payer,
        mint: request.mint,
        cluster: request.cluster || magicBlockCluster(),
        validator: request.validator,
      },
    },
    apiBase,
  );
}

export async function buildMagicBlockDeposit(
  request: MagicBlockDepositRequest,
  apiBase?: string,
): Promise<MagicBlockUnsignedTransactionResponse> {
  return magicBlockFetch<MagicBlockUnsignedTransactionResponse>(
    "/v1/spl/deposit",
    {
      method: "POST",
      body: {
        owner: request.owner,
        amount: String(request.amount),
        cluster: request.cluster || magicBlockCluster(),
        mint: request.mint,
        validator: request.validator,
        initIfMissing: request.initIfMissing,
        initVaultIfMissing: request.initVaultIfMissing,
        initAtasIfMissing: request.initAtasIfMissing,
        idempotent: request.idempotent,
      },
    },
    apiBase,
  );
}

export async function buildMagicBlockTransfer(
  request: MagicBlockTransferRequest,
  apiBase?: string,
): Promise<MagicBlockUnsignedTransactionResponse> {
  return magicBlockFetch<MagicBlockUnsignedTransactionResponse>(
    "/v1/spl/transfer",
    {
      method: "POST",
      body: {
        from: request.from,
        to: request.to,
        mint: request.mint,
        amount: String(request.amount),
        visibility: request.visibility,
        fromBalance: request.fromBalance,
        toBalance: request.toBalance,
        cluster: request.cluster || magicBlockCluster(),
        validator: request.validator,
        initIfMissing: request.initIfMissing,
        initAtasIfMissing: request.initAtasIfMissing,
        initVaultIfMissing: request.initVaultIfMissing,
        memo: request.memo,
        minDelayMs: request.minDelayMs,
        maxDelayMs: request.maxDelayMs,
        split: request.split,
      },
    },
    apiBase,
  );
}

export async function buildMagicBlockWithdraw(
  request: MagicBlockWithdrawRequest,
  apiBase?: string,
): Promise<MagicBlockUnsignedTransactionResponse> {
  return magicBlockFetch<MagicBlockUnsignedTransactionResponse>(
    "/v1/spl/withdraw",
    {
      method: "POST",
      body: {
        owner: request.owner,
        mint: request.mint,
        amount: String(request.amount),
        cluster: request.cluster || magicBlockCluster(),
        validator: request.validator,
        initIfMissing: request.initIfMissing,
        initAtasIfMissing: request.initAtasIfMissing,
        escrowIndex: request.escrowIndex,
        idempotent: request.idempotent,
      },
    },
    apiBase,
  );
}

export async function submitMagicBlockUnsignedTransaction(
  provider: anchor.AnchorProvider,
  built: MagicBlockUnsignedTransactionResponse,
): Promise<string> {
  const raw = Buffer.from(built.transactionBase64, "base64");
  const version = String(built.version || "").toLowerCase();
  if (version.includes("legacy")) {
    const transaction = Transaction.from(raw);
    return provider.sendAndConfirm(transaction, []);
  }

  const transaction = VersionedTransaction.deserialize(raw);
  if (!provider.wallet.signTransaction) {
    throw new Error("Connected wallet does not support transaction signing");
  }
  const signed = await provider.wallet.signTransaction(transaction as any);
  const signature = await provider.connection.sendRawTransaction(signed.serialize(), {
    skipPreflight: false,
    maxRetries: 3,
  });
  const latest = await provider.connection.getLatestBlockhash("confirmed");
  await provider.connection.confirmTransaction(
    {
      signature,
      blockhash: latest.blockhash,
      lastValidBlockHeight: latest.lastValidBlockHeight,
    },
    "confirmed",
  );
  return signature;
}

export async function submitMagicBlockUnsignedTransactionWithWallet(
  walletProvider: any,
  connection: Connection,
  built: MagicBlockUnsignedTransactionResponse,
): Promise<string> {
  const raw = Buffer.from(built.transactionBase64, "base64");
  const version = String(built.version || "").toLowerCase();
  if (version.includes("legacy")) {
    const transaction = Transaction.from(raw);
    const latest = await connection.getLatestBlockhash("confirmed");
    transaction.feePayer = walletProvider.publicKey;
    transaction.recentBlockhash = built.recentBlockhash || latest.blockhash;
    const signed = await walletProvider.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize(), {
      skipPreflight: false,
      maxRetries: 3,
    });
    await connection.confirmTransaction(
      {
        signature,
        blockhash: transaction.recentBlockhash,
        lastValidBlockHeight: built.lastValidBlockHeight || latest.lastValidBlockHeight,
      },
      "confirmed",
    );
    return signature;
  }

  const versioned = VersionedTransaction.deserialize(raw);
  const signed = await walletProvider.signTransaction(versioned);
  const signature = await connection.sendRawTransaction(signed.serialize(), {
    skipPreflight: false,
    maxRetries: 3,
  });
  const latest = await connection.getLatestBlockhash("confirmed");
  await connection.confirmTransaction(
    {
      signature,
      blockhash: latest.blockhash,
      lastValidBlockHeight: latest.lastValidBlockHeight,
    },
    "confirmed",
  );
  return signature;
}

export function magicBlockRouteHash(parts: Array<string | number | PublicKey | null | undefined>): number[] {
  const digest = anchor.utils.sha256.hash(
    parts
      .filter((item) => item !== null && item !== undefined)
      .map((item) => item instanceof PublicKey ? item.toBase58() : String(item))
      .join("|"),
  );
  return Array.from(Buffer.from(digest, "hex"));
}
