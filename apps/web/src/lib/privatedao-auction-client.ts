"use client";

import {
  AnchorProvider,
  BN,
  Program,
  type Idl,
} from "@coral-xyz/anchor";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  PublicKey,
  SystemProgram,
  type ConfirmOptions,
  type TransactionSignature,
} from "@solana/web3.js";
import {
  ConnectionMagicRouter,
  DELEGATION_PROGRAM_ID,
  EPHEMERAL_VAULT_ID,
  MAGIC_CONTEXT_ID,
  MAGIC_PROGRAM_ID,
  PERMISSION_PROGRAM_ID,
  getAuthToken,
  permissionPdaFromAccount,
  verifyTeeRpcIntegrity,
} from "@magicblock-labs/ephemeral-rollups-sdk";

export const AUCTION_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PRIVATEDAO_AUCTION_PROGRAM_ID ??
    "4Z7AeFRZHBCok68hhbUgVLC3uFaEP2aDWozsYVksPuQd",
);
export const MAGICBLOCK_TEE_RPC_URL =
  process.env.NEXT_PUBLIC_MAGICBLOCK_TEE_RPC_URL ?? "https://devnet-tee.magicblock.app";
export const AUCTION_SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_PRIVATEDAO_AUCTION_RPC_URL ?? "https://api.devnet.solana.com";
export const AUCTION_SOLANA_NETWORK = "devnet" as const;

const AUCTION_SEED = Buffer.from("auction");
const SESSION_SEED = Buffer.from("session");
const AUTH_SEED = Buffer.from("authorization");
const RECEIPT_SEED = Buffer.from("receipt");
const CONFIRM_OPTIONS: ConfirmOptions = { commitment: "confirmed", preflightCommitment: "confirmed" };

export type AuctionAddresses = {
  config: PublicKey;
  session: PublicKey;
  permission: PublicKey;
  receipt: PublicKey;
};

export type AuctionClient = {
  base: Program;
  tee: Program;
  baseConnection: Connection;
  teeConnection: ConnectionMagicRouter;
  addressesFor: (auctionId: Uint8Array) => AuctionAddresses;
  getTeeToken: () => Promise<{ token: string; expiresAt: number }>;
  initialize: (args: {
    auctionId: Uint8Array;
    biddingStart: number;
    biddingDeadline: number;
    rulesDigest: Uint8Array;
    policyDigest: Uint8Array;
    discloseWinningAmount: boolean;
    allowBidUpdates: boolean;
  }) => Promise<TransactionSignature>;
  activate: (addresses: AuctionAddresses) => Promise<TransactionSignature>;
  authorizeBidder: (addresses: AuctionAddresses, bidderCommitment: Uint8Array, bidderWallet: PublicKey) => Promise<TransactionSignature>;
  delegate: (addresses: AuctionAddresses, validator: PublicKey) => Promise<TransactionSignature>;
  initPermission: (addresses: AuctionAddresses, authorizations: PublicKey[]) => Promise<TransactionSignature>;
  setPrivate: (addresses: AuctionAddresses, isPrivate: boolean, authorizations: PublicKey[]) => Promise<TransactionSignature>;
  submitPrivateBid: (addresses: AuctionAddresses, bidderCommitment: Uint8Array, amount: BN, salt: Uint8Array, revision: number, authorization: PublicKey) => Promise<TransactionSignature>;
  closeBidding: (addresses: AuctionAddresses) => Promise<TransactionSignature>;
  finalizePrivateResult: (addresses: AuctionAddresses) => Promise<TransactionSignature>;
  commitAndUndelegate: (addresses: AuctionAddresses) => Promise<TransactionSignature>;
  finalizeReceipt: (addresses: AuctionAddresses, receiptId: Uint8Array, commitSignature: string, slot: number) => Promise<TransactionSignature>;
};

export type SignMessage = (message: Uint8Array) => Promise<Uint8Array>;

async function loadIdl(): Promise<Idl> {
  const response = await fetch("/idl/privatedao_auction.json", { cache: "no-store" });
  if (!response.ok) throw new Error("Auction program IDL is not available in this build.");
  return (await response.json()) as Idl;
}

async function send(method: { transaction: () => Promise<unknown> }, provider: AnchorProvider) {
  const transaction = await method.transaction();
  return provider.sendAndConfirm(transaction as Parameters<AnchorProvider["sendAndConfirm"]>[0], [], CONFIRM_OPTIONS);
}

export async function createAuctionClient(wallet: AnchorWallet, signMessage: SignMessage): Promise<AuctionClient> {
  if (AUCTION_SOLANA_NETWORK !== "devnet" && AUCTION_SOLANA_NETWORK !== "testnet") {
    throw new Error("Confidential Auctions is restricted to a development Solana network until certification.");
  }
  const idl = await loadIdl();
  const baseConnection = new Connection(AUCTION_SOLANA_RPC_URL, CONFIRM_OPTIONS.commitment);
  const baseProvider = new AnchorProvider(baseConnection, wallet, CONFIRM_OPTIONS);
  const base = new Program(idl, baseProvider);

  await verifyTeeRpcIntegrity(MAGICBLOCK_TEE_RPC_URL);
  const initialToken = await getAuthToken(MAGICBLOCK_TEE_RPC_URL, wallet.publicKey, signMessage);

  const teeUrl = `${MAGICBLOCK_TEE_RPC_URL}?token=${encodeURIComponent(initialToken.token)}`;
  const teeConnection = new ConnectionMagicRouter(teeUrl, { wsEndpoint: teeUrl.replace(/^https:/, "wss:") });
  const teeProvider = new AnchorProvider(teeConnection, wallet, CONFIRM_OPTIONS);
  const tee = new Program(idl, teeProvider);

  const addressesFor = (auctionId: Uint8Array): AuctionAddresses => {
    const [config] = PublicKey.findProgramAddressSync([AUCTION_SEED, Buffer.from(auctionId)], AUCTION_PROGRAM_ID);
    const [session] = PublicKey.findProgramAddressSync([SESSION_SEED, config.toBuffer()], AUCTION_PROGRAM_ID);
    const permission = permissionPdaFromAccount(session);
    const [receipt] = PublicKey.findProgramAddressSync([RECEIPT_SEED, config.toBuffer()], AUCTION_PROGRAM_ID);
    return { config, session, permission, receipt };
  };

  return {
    base,
    tee,
    baseConnection,
    teeConnection,
    addressesFor,
    getTeeToken: () => {
      return getAuthToken(MAGICBLOCK_TEE_RPC_URL, wallet.publicKey, signMessage);
    },
    initialize: ({ auctionId, biddingStart, biddingDeadline, rulesDigest, policyDigest, discloseWinningAmount, allowBidUpdates }) =>
      send(base.methods.initializeAuction(auctionId, new BN(biddingStart), new BN(biddingDeadline), rulesDigest, policyDigest, discloseWinningAmount, allowBidUpdates).accounts({ authority: wallet.publicKey, config: addressesFor(auctionId).config, session: addressesFor(auctionId).session, systemProgram: SystemProgram.programId }), baseProvider),
    activate: (a) => send(base.methods.activateAuction().accounts({ config: a.config, session: a.session, authority: wallet.publicKey }).preInstructions([]), baseProvider),
    authorizeBidder: (a, bidderCommitment, bidderWallet) => send(base.methods.authorizeBidder(bidderCommitment, bidderWallet).accounts({ config: a.config, authorization: PublicKey.findProgramAddressSync([AUTH_SEED, a.config.toBuffer(), Buffer.from(bidderCommitment)], AUCTION_PROGRAM_ID)[0], authority: wallet.publicKey, systemProgram: SystemProgram.programId }), baseProvider),
    delegate: (a, validator) => send(base.methods.delegateAuctionSession().accountsPartial({ payer: wallet.publicKey, session: a.session, config: a.config, ownerProgram: AUCTION_PROGRAM_ID, delegationProgram: DELEGATION_PROGRAM_ID, systemProgram: SystemProgram.programId }).remainingAccounts([{ pubkey: validator, isSigner: false, isWritable: false }]), baseProvider),
    initPermission: (a, authorizations) => send(tee.methods.initPermission().accounts({ session: a.session, config: a.config, permission: a.permission, ephemeralVault: EPHEMERAL_VAULT_ID, magicProgram: MAGIC_PROGRAM_ID, permissionProgram: PERMISSION_PROGRAM_ID }).remainingAccounts(authorizations.map((pubkey) => ({ pubkey, isSigner: false, isWritable: false }))), teeProvider),
    setPrivate: (a, isPrivate, authorizations) => send(tee.methods.setPrivate(isPrivate).accounts({ session: a.session, config: a.config, permission: a.permission, ephemeralVault: EPHEMERAL_VAULT_ID, magicProgram: MAGIC_PROGRAM_ID, permissionProgram: PERMISSION_PROGRAM_ID }).remainingAccounts(authorizations.map((pubkey) => ({ pubkey, isSigner: false, isWritable: false }))), teeProvider),
    submitPrivateBid: (a, bidderCommitment, amount, salt, revision, authorization) => send(tee.methods.submitPrivateBid(bidderCommitment, amount, salt, revision).accounts({ bidder: wallet.publicKey, session: a.session, authorization }), teeProvider),
    closeBidding: (a) => send(tee.methods.closeBidding().accounts({ session: a.session, authority: wallet.publicKey }), teeProvider),
    finalizePrivateResult: (a) => send(tee.methods.finalizePrivateResult().accounts({ authority: wallet.publicKey, session: a.session }), teeProvider),
    commitAndUndelegate: (a) => send(tee.methods.commitAndUndelegateSession().accounts({ payer: wallet.publicKey, session: a.session, magicContext: MAGIC_CONTEXT_ID, magicProgram: MAGIC_PROGRAM_ID }), teeProvider),
    finalizeReceipt: (a, receiptId, commitSignature, slot) => send(base.methods.finalizeReceipt(receiptId, commitSignature, new BN(slot), 1).accounts({ authority: wallet.publicKey, config: a.config, session: a.session, receipt: a.receipt, systemProgram: SystemProgram.programId }), baseProvider),
  };
}
