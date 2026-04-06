// SPDX-License-Identifier: AGPL-3.0-or-later
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  buildMagicBlockDeposit,
  buildMagicBlockInitializeMint,
  buildMagicBlockTransfer,
  buildMagicBlockWithdraw,
  getMagicBlockBalance,
  getMagicBlockHealth,
  getMagicBlockMintInitializationStatus,
  getMagicBlockPrivateBalance,
  magicBlockApiBase,
  magicBlockCluster,
  submitMagicBlockUnsignedTransaction,
} from "./lib/magicblock-payments";
import { parseArgs, solscanTxUrl } from "./utils";

async function main() {
  const args = parseArgs();
  const [action = "health"] = process.argv.slice(2).filter((part) => !part.startsWith("--"));
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const apiBase = String(args.apiBase || magicBlockApiBase()).trim();
  const cluster = String(args.cluster || magicBlockCluster()).trim();

  if (action === "health") {
    console.log(JSON.stringify(await getMagicBlockHealth(apiBase), null, 2));
    return;
  }

  if (action === "mint-status") {
    if (!args.mint) throw new Error("--mint is required");
    console.log(JSON.stringify(await getMagicBlockMintInitializationStatus({
      mint: String(args.mint),
      cluster: cluster as any,
      validator: args.validator ? String(args.validator) : undefined,
    }, apiBase), null, 2));
    return;
  }

  if (action === "balance" || action === "private-balance") {
    if (!args.address || !args.mint) throw new Error("--address and --mint are required");
    const request = {
      address: String(args.address),
      mint: String(args.mint),
      cluster: cluster as any,
    };
    const payload = action === "balance"
      ? await getMagicBlockBalance(request, apiBase)
      : await getMagicBlockPrivateBalance(request, apiBase);
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  if (action === "initialize-mint") {
    if (!args.mint) throw new Error("--mint is required");
    const built = await buildMagicBlockInitializeMint({
      payer: provider.wallet.publicKey.toBase58(),
      mint: new PublicKey(String(args.mint)).toBase58(),
      cluster: cluster as any,
      validator: args.validator ? String(args.validator) : undefined,
    }, apiBase);
    const signature = await submitMagicBlockUnsignedTransaction(provider, built);
    console.log(`Initialize mint tx: ${signature}`);
    console.log(`Explorer: ${solscanTxUrl(signature)}`);
    console.log(JSON.stringify({
      validator: built.validator,
      transferQueue: built.transferQueue,
      rentPda: built.rentPda,
    }, null, 2));
    return;
  }

  if (action === "deposit") {
    if (!args.mint || !args.owner || !args.amount) throw new Error("--owner, --mint, and --amount are required");
    const built = await buildMagicBlockDeposit({
      owner: String(args.owner),
      mint: String(args.mint),
      amount: String(args.amount),
      cluster: cluster as any,
      validator: args.validator ? String(args.validator) : undefined,
      initIfMissing: true,
      initAtasIfMissing: true,
      initVaultIfMissing: true,
      idempotent: true,
    }, apiBase);
    const signature = await submitMagicBlockUnsignedTransaction(provider, built);
    console.log(`Deposit tx: ${signature}`);
    console.log(`Explorer: ${solscanTxUrl(signature)}`);
    return;
  }

  if (action === "transfer") {
    if (!args.mint || !args.from || !args.to || !args.amount) throw new Error("--from, --to, --mint, and --amount are required");
    const built = await buildMagicBlockTransfer({
      from: String(args.from),
      to: String(args.to),
      mint: String(args.mint),
      amount: String(args.amount),
      visibility: String(args.visibility || "private") as any,
      fromBalance: String(args.fromBalance || "base") as any,
      toBalance: String(args.toBalance || "ephemeral") as any,
      cluster: cluster as any,
      validator: args.validator ? String(args.validator) : undefined,
      initIfMissing: true,
      initAtasIfMissing: true,
      initVaultIfMissing: true,
      memo: args.memo ? String(args.memo) : undefined,
    }, apiBase);
    const signature = await submitMagicBlockUnsignedTransaction(provider, built);
    console.log(`Transfer tx: ${signature}`);
    console.log(`Explorer: ${solscanTxUrl(signature)}`);
    console.log(JSON.stringify({ validator: built.validator, sendTo: built.sendTo }, null, 2));
    return;
  }

  if (action === "withdraw") {
    if (!args.mint || !args.owner || !args.amount) throw new Error("--owner, --mint, and --amount are required");
    const built = await buildMagicBlockWithdraw({
      owner: String(args.owner),
      mint: String(args.mint),
      amount: String(args.amount),
      cluster: cluster as any,
      validator: args.validator ? String(args.validator) : undefined,
      initIfMissing: true,
      initAtasIfMissing: true,
      idempotent: true,
    }, apiBase);
    const signature = await submitMagicBlockUnsignedTransaction(provider, built);
    console.log(`Withdraw tx: ${signature}`);
    console.log(`Explorer: ${solscanTxUrl(signature)}`);
    return;
  }

  throw new Error(`Unknown action: ${action}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
