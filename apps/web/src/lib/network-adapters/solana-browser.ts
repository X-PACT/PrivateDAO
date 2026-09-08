import {
  Connection,
  type Commitment,
  type PublicKey,
  type SendOptions,
  type Transaction,
  type VersionedTransaction,
} from "@solana/web3.js";

export type SolanaBrowserConnection = Connection;

export function createSolanaBrowserConnection(endpoint: string, commitment: Commitment): SolanaBrowserConnection {
  return new Connection(endpoint, commitment);
}

export function readAccountInfo(connection: SolanaBrowserConnection, address: PublicKey, commitment: Commitment) {
  return connection.getAccountInfo(address, commitment);
}

export function readTokenAccountBalance(connection: SolanaBrowserConnection, address: PublicKey, commitment: Commitment) {
  return connection.getTokenAccountBalance(address, commitment);
}

export function estimateAccountRent(connection: SolanaBrowserConnection, dataLength: number) {
  return connection.getMinimumBalanceForRentExemption(dataLength);
}

export function latestBlockhash(connection: SolanaBrowserConnection, commitment: Commitment) {
  return connection.getLatestBlockhash(commitment);
}

export function submitSignedTransaction(
  connection: SolanaBrowserConnection,
  signed: Transaction | VersionedTransaction,
  options?: SendOptions,
) {
  return connection.sendRawTransaction(signed.serialize(), options);
}

export function confirmTransaction(connection: SolanaBrowserConnection, signature: string, commitment: Commitment) {
  return connection.confirmTransaction(signature, commitment);
}

export async function waitForFinalized(
  connection: SolanaBrowserConnection,
  signature: string,
  timeoutMs = 120_000,
  pollMs = 1_500,
) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const status = (await connection.getSignatureStatuses([signature])).value[0];
    if (status?.err) throw new Error(`Solana transaction failed: ${JSON.stringify(status.err)}`);
    if (status?.confirmationStatus === "finalized") return status;
    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }
  throw new Error(`Solana transaction did not reach Finalized within ${timeoutMs} milliseconds.`);
}
