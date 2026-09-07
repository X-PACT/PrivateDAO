"use client";

import { getAssociatedTokenAddressSync, createAssociatedTokenAccountInstruction, createSyncNativeInstruction, NATIVE_MINT, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, PublicKey, SystemProgram, Transaction, VersionedTransaction } from "@solana/web3.js";

const DEVNET_RPC = process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC || "https://api.devnet.solana.com";
const DEVNET_WSS = DEVNET_RPC.replace(/^http/, "ws");
export const UMBRA_DEVNET_WSOL_MINT = "So11111111111111111111111111111111111111112";
const FINALITY_TIMEOUT_MS = 120_000;

type PhantomProvider = {
  publicKey?: PublicKey;
  connect: () => Promise<unknown>;
  signMessage: (message: Uint8Array, display?: string) => Promise<{ signature: Uint8Array }>;
  signTransaction: (transaction: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>;
};

function phantomProvider(): PhantomProvider {
  const provider = (window as Window & { phantom?: { solana?: PhantomProvider } }).phantom?.solana;
  if (!provider) throw new Error("Phantom is required for Umbra Devnet settlement.");
  return provider;
}

function toBaseUnits(amount: string, decimals = 9) {
  if (!/^\d+(\.\d+)?$/.test(amount)) throw new Error("Payroll amount must be a positive decimal.");
  const [whole, fraction = ""] = amount.split(".");
  if (fraction.length > decimals) throw new Error(`Payroll amount supports at most ${decimals} decimals.`);
  const value = BigInt(whole) * (BigInt(10) ** BigInt(decimals)) + BigInt((fraction + "0".repeat(decimals)).slice(0, decimals));
  if (value <= BigInt(0)) throw new Error("Payroll amount must be positive.");
  return value.toString();
}

async function waitForFinalized(connection: Connection, signature: string) {
  const deadline = Date.now() + FINALITY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const status = (await connection.getSignatureStatuses([signature])).value[0];
    if (status?.err) throw new Error(`Umbra Devnet transaction failed: ${JSON.stringify(status.err)}`);
    if (status?.confirmationStatus === "finalized") return status;
    await new Promise((resolve) => window.setTimeout(resolve, 1500));
  }
  throw new Error("Umbra Devnet transaction did not reach Finalized within 120 seconds.");
}

function walletStandardAdapter(provider: PhantomProvider, address: string) {
  const account = { address, publicKey: new PublicKey(address).toBytes(), chains: ["solana:devnet"], features: ["solana:signTransaction", "solana:signMessage"] };
  const wallet = {
    name: "Phantom",
    version: "1.0.0",
    chains: ["solana:devnet"],
    accounts: [account],
    features: {
      "solana:signTransaction": {
        signTransaction: async (...requests: Array<{ account: typeof account; transaction: Uint8Array }>) => Promise.all(requests.map(async ({ transaction }) => {
          let signed: Transaction | VersionedTransaction;
          try { signed = await provider.signTransaction(VersionedTransaction.deserialize(transaction)); }
          catch { signed = await provider.signTransaction(Transaction.from(transaction)); }
          return { signedTransaction: signed.serialize() };
        })),
      },
      "solana:signMessage": {
        signMessage: async ({ message }: { account: typeof account; message: Uint8Array }) => ({ signature: (await provider.signMessage(message, "utf8")).signature }),
      },
    },
  };
  return { wallet, account } as const;
}

export async function createUmbraDevnetWalletSession() {
  const provider = phantomProvider();
  await provider.connect();
  const address = provider.publicKey?.toBase58();
  if (!address) throw new Error("Phantom did not return a public key.");
  const { wallet, account } = walletStandardAdapter(provider, address);
  const sdk = await import("@umbra-privacy/sdk");
  const registration = await import("@umbra-privacy/sdk/registration");
  const depositOps = await import("@umbra-privacy/sdk/deposit");
  const signer = sdk.createSignerFromWalletAccount({ wallet: wallet as never, account: account as never });
  const client = await sdk.getUmbraClient({ signer, network: "devnet", rpcUrl: DEVNET_RPC, rpcSubscriptionsUrl: DEVNET_WSS, deferMasterSeedSignature: true });
  const connection = new Connection(DEVNET_RPC, "finalized");
  return {
    address,
    client,
    async authorizePayroll(apiBase: string) {
      const base = apiBase.replace(/\/+$/, "");
      const challengeResponse = await fetch(`${base}/payroll/session`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "challenge", wallet: address }) });
      const challengeBody = await challengeResponse.json() as { ok?: boolean; challenge?: { message: string; nonce: string; expiresAt: string }; error?: string };
      if (!challengeResponse.ok || !challengeBody.ok || !challengeBody.challenge) throw new Error(challengeBody.error || "Payroll wallet challenge failed.");
      const signed = await provider.signMessage(new TextEncoder().encode(challengeBody.challenge.message), "utf8");
      const signature = btoa(String.fromCharCode(...signed.signature));
      const sessionResponse = await fetch(`${base}/payroll/session`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "verify", wallet: address, nonce: challengeBody.challenge.nonce, message: challengeBody.challenge.message, signature }) });
      const sessionBody = await sessionResponse.json() as { ok?: boolean; session?: { token: string; wallet: string; expiresAt: string }; error?: string };
      if (!sessionResponse.ok || !sessionBody.ok || !sessionBody.session) throw new Error(sessionBody.error || "Payroll wallet session could not be established.");
      return sessionBody.session;
    },
    async registerConfidential() {
      const register = registration.getUserRegistrationFunction({ client });
      return register({ confidential: true, anonymous: false });
    },
    async ensureWsolBalance(requiredBaseUnits: bigint) {
      if (requiredBaseUnits <= BigInt(0)) throw new Error("WSOL payroll amount must be positive.");
      const owner = new PublicKey(address);
      const ata = getAssociatedTokenAddressSync(NATIVE_MINT, owner, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
      const accountInfo = await connection.getAccountInfo(ata, "finalized");
      let currentBaseUnits = BigInt(0);
      if (accountInfo) {
        const balance = await connection.getTokenAccountBalance(ata, "finalized");
        currentBaseUnits = BigInt(balance.value.amount);
      }
      const missingBaseUnits = requiredBaseUnits > currentBaseUnits ? requiredBaseUnits - currentBaseUnits : BigInt(0);
      if (!accountInfo && missingBaseUnits === BigInt(0)) throw new Error("Unable to initialize the Devnet WSOL account.");
      if (!accountInfo || missingBaseUnits > BigInt(0)) {
        const rent = accountInfo ? 0 : await connection.getMinimumBalanceForRentExemption(165);
        const transaction = new Transaction().add(
          ...(accountInfo ? [] : [createAssociatedTokenAccountInstruction(owner, ata, owner, NATIVE_MINT, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)]),
          SystemProgram.transfer({ fromPubkey: owner, toPubkey: ata, lamports: rent + Number(missingBaseUnits) }),
          createSyncNativeInstruction(ata, TOKEN_PROGRAM_ID),
        );
        transaction.feePayer = owner;
        transaction.recentBlockhash = (await connection.getLatestBlockhash("finalized")).blockhash;
        const signed = await provider.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signed.serialize(), { skipPreflight: false, maxRetries: 3 });
        await waitForFinalized(connection, signature);
      }
      return { ata: ata.toBase58(), balanceBaseUnits: requiredBaseUnits.toString() };
    },
    async settleRecipient(recipientAddress: string, amount: string, memo = "", optionalDataHex?: string) {
      if (recipientAddress.length < 32) throw new Error("Invalid Solana recipient address.");
      new PublicKey(recipientAddress);
      const deposit = depositOps.getATAIntoETADirectDepositorFunction({ client });
      const optionalData = new Uint8Array(32);
      if (optionalDataHex) {
        if (!/^[a-f0-9]{64}$/i.test(optionalDataHex)) throw new Error("Umbra settlement binding must be a 32-byte hex value.");
        for (let index = 0; index < 32; index += 1) optionalData[index] = Number.parseInt(optionalDataHex.slice(index * 2, index * 2 + 2), 16);
      } else {
        new TextEncoder().encode(memo).slice(0, 32).forEach((value, index) => { optionalData[index] = value; });
      }
      const destination = recipientAddress as Parameters<typeof deposit>[0];
      const mint = UMBRA_DEVNET_WSOL_MINT as Parameters<typeof deposit>[1];
      const transferAmount = BigInt(toBaseUnits(amount)) as Parameters<typeof deposit>[2];
      const options = { optionalData } as NonNullable<Parameters<typeof deposit>[3]>;
      const result = await deposit(destination, mint, transferAmount, options);
      const queueSignature = String((result as { queueSignature?: unknown }).queueSignature || "");
      const rawSignatures = (result as { signatures?: readonly unknown[] }).signatures;
      const signatures = rawSignatures ? rawSignatures.map(String) : [];
      if (!queueSignature && signatures.length === 0) {
        throw new Error("Umbra returned no transaction signature for the payroll settlement.");
      }
      const finalSignature = queueSignature || signatures[0];
      await waitForFinalized(connection, finalSignature);
      return { queueSignature: finalSignature, signatures, result };
    },
  };
}
