import { PublicKey } from "@solana/web3.js";

const EVM_ADDRESS = /^0x[a-fA-F0-9]{40}$/;

export function normalizeSolanaWallet(value: string | undefined): string {
  const wallet = value?.trim() ?? "";
  try {
    return new PublicKey(wallet).toBase58();
  } catch {
    throw new Error("Invalid Solana wallet address.");
  }
}

export function normalizeEvmWallet(value: string | undefined): string {
  const wallet = value?.trim() ?? "";
  if (!EVM_ADDRESS.test(wallet)) throw new Error("Invalid EVM wallet address.");
  return wallet.toLowerCase();
}

export function normalizeWalletForChain(value: string | undefined, chain: string): string {
  return chain === "solana-mainnet" ? normalizeSolanaWallet(value) : normalizeEvmWallet(value);
}
