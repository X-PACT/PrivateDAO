import { decodeEventLog, encodeAbiParameters, encodeFunctionData, getAddress, keccak256, parseAbi, zeroAddress, type Address, type Hex, type TransactionReceipt } from "viem";
import { Abis } from "viem/tempo";
import { getL2TransactionHashes } from "viem/op-stack";

export const TEMPO_PAYMENT_CHAIN = 42431;
export const TEMPO_PAYMENT_TOKEN: Address = "0x20c0000000000000000000000000000000000001";
export const BASE_DEPOSIT_PORTAL: Address = "0x49f53e41452c74589e85ca1677426ba426459e85";
const portalAbi = parseAbi(["function depositTransaction(address to,uint256 value,uint64 gasLimit,bool isCreation,bytes data) payable"]);

export interface PaymentLine {
  /** Random opaque bytes32 reference; never an employee name or an unsalted employee ID. */
  reference: Hex;
  recipient: Address;
  amount: bigint;
}

function positive(amount: bigint): void {
  if (typeof amount !== "bigint" || amount <= 0n || amount >= 2n ** 256n) throw new Error("Invalid payment amount");
}

function address(value: Address): Address {
  const result = getAddress(value);
  if (result === zeroAddress) throw new Error("Zero payment address");
  return result;
}

/** Produces wallet-signable atomic Tempo calls; policy approval remains upstream. */
export function buildTempoPaymentBatch(input: {
  chainId: number; sender: Address; batchReference: Hex; lines: readonly PaymentLine[]; maxTotal: bigint;
}) {
  if (input.chainId !== TEMPO_PAYMENT_CHAIN) throw new Error("Tempo payments require testnet 42431");
  if (!/^0x[0-9a-fA-F]{64}$/.test(input.batchReference)) throw new Error("Invalid batch reference");
  if (!input.lines.length || input.lines.length > 100) throw new Error("Batch must contain 1-100 payments");
  positive(input.maxTotal);
  const sender = address(input.sender);
  const references = new Set<string>();
  const recipients = new Set<string>();
  let total = 0n;
  const payments = input.lines.map((line) => {
    positive(line.amount);
    if (!/^0x[0-9a-fA-F]{64}$/.test(line.reference)) throw new Error("Invalid payment reference");
    const recipient = address(line.recipient);
    const reference = line.reference.toLowerCase() as Hex;
    if (references.has(reference) || recipients.has(recipient)) throw new Error("Duplicate payment reference or recipient");
    references.add(reference);
    recipients.add(recipient);
    total += line.amount;
    // Network, asset, payer, payee, amount, and random references bind reconciliation.
    const memo = keccak256(encodeAbiParameters(
      [{ type: "string" }, { type: "uint256" }, { type: "address" }, { type: "address" }, { type: "bytes32" }, { type: "bytes32" }, { type: "address" }, { type: "uint256" }],
      ["privatedao.payment.v1", BigInt(input.chainId), TEMPO_PAYMENT_TOKEN, sender, input.batchReference, reference, recipient, line.amount],
    ));
    return { recipient, amount: line.amount, memo };
  });
  if (total > input.maxTotal) throw new Error("Payment budget exceeded");
  return {
    chainId: TEMPO_PAYMENT_CHAIN, sender, token: TEMPO_PAYMENT_TOKEN, total, payments,
    privacy: "public-onchain" as const,
    calls: payments.map((payment) => ({
      to: TEMPO_PAYMENT_TOKEN,
      data: encodeFunctionData({ abi: Abis.tip20, functionName: "transferWithMemo", args: [payment.recipient, payment.amount, payment.memo] }),
      value: 0n,
    })),
  };
}

/** Call with a receipt fetched from a chain-ID-checked RPC, not a client-uploaded receipt. */
export function reconcileTempoPayments(batch: ReturnType<typeof buildTempoPaymentBatch>, chainId: number, receipt: TransactionReceipt) {
  if (chainId !== batch.chainId || receipt.status !== "success" || receipt.from.toLowerCase() !== batch.sender.toLowerCase()) throw new Error("Payment receipt network, payer, or status mismatch");
  const expected = new Map(batch.payments.map((line) => [line.memo, line]));
  const seen = new Set<string>();
  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== batch.token.toLowerCase()) continue;
    let event;
    try { event = decodeEventLog({ abi: Abis.tip20, data: log.data, topics: log.topics, strict: true }); } catch { continue; }
    if (event.eventName !== "TransferWithMemo") continue;
    const { from, to, amount, memo } = event.args;
    if (from.toLowerCase() !== batch.sender.toLowerCase()) continue;
    const line = expected.get(memo);
    if (!line || seen.has(memo) || line.recipient.toLowerCase() !== to.toLowerCase() || line.amount !== amount) throw new Error("Payment reconciliation mismatch");
    seen.add(memo);
  }
  if (seen.size !== expected.size) throw new Error("Missing payment confirmations");
  return { state: "reconciled" as const, network: "tempo-testnet", transactionHash: receipt.transactionHash, blockNumber: receipt.blockNumber.toString(), count: seen.size, totalAtomic: batch.total.toString(), token: batch.token, privacy: batch.privacy };
}

/** Canonical ETH deposit, explicitly limited to Sepolia -> Base Sepolia. */
export function buildBaseTestnetDeposit(input: { sourceChainId: number; destinationChainId: number; recipient: Address; amount: bigint; maxAmount: bigint }) {
  if (input.sourceChainId !== 11155111 || input.destinationChainId !== 84532) throw new Error("Unsupported bridge route");
  positive(input.amount);
  positive(input.maxAmount);
  if (input.amount > input.maxAmount) throw new Error("Bridge budget exceeded");
  const recipient = address(input.recipient);
  return {
    chainId: 11155111, destinationChainId: 84532, recipient,
    to: BASE_DEPOSIT_PORTAL, value: input.amount,
    data: encodeFunctionData({ abi: portalAbi, functionName: "depositTransaction", args: [recipient, input.amount, 100_000n, false, "0x"] }),
  };
}

/** Derive the destination transaction from the canonical portal's deposit event. */
export function baseDepositDestinationHash(receipt: TransactionReceipt): Hex {
  if (receipt.status !== "success" || receipt.to?.toLowerCase() !== BASE_DEPOSIT_PORTAL.toLowerCase()) throw new Error("Invalid bridge source receipt");
  const hashes = getL2TransactionHashes({ logs: receipt.logs.filter((log) => log.address.toLowerCase() === BASE_DEPOSIT_PORTAL.toLowerCase()) });
  if (hashes.length !== 1) throw new Error("Expected one canonical deposit event");
  return hashes[0];
}

export function reconcileBaseDeposit(input: {
  deposit: ReturnType<typeof buildBaseTestnetDeposit>;
  sender: Address;
  sourceChainId: number;
  destinationChainId: number;
  sourceReceipt: TransactionReceipt;
  destinationReceipt: TransactionReceipt;
  sourceTransaction: { hash: Hex; from: Address; to: Address | null; input: Hex; value: bigint };
  destinationTransaction: { hash: Hex; to: Address | null; value: bigint };
}) {
  const { deposit, sourceReceipt, destinationReceipt, sourceTransaction, destinationTransaction } = input;
  if (input.sourceChainId !== 11155111 || input.destinationChainId !== 84532) throw new Error("Bridge network mismatch");
  if (sourceTransaction.hash !== sourceReceipt.transactionHash || sourceTransaction.from.toLowerCase() !== input.sender.toLowerCase()
    || sourceReceipt.from.toLowerCase() !== input.sender.toLowerCase() || sourceTransaction.to?.toLowerCase() !== deposit.to.toLowerCase()
    || sourceTransaction.input !== deposit.data || sourceTransaction.value !== deposit.value) throw new Error("Bridge source mismatch");
  const destinationHash = baseDepositDestinationHash(sourceReceipt);
  if (destinationReceipt.status !== "success" || destinationReceipt.transactionHash !== destinationHash || destinationTransaction.hash !== destinationHash
    || destinationTransaction.to?.toLowerCase() !== deposit.recipient.toLowerCase() || destinationTransaction.value !== deposit.value) throw new Error("Bridge destination mismatch");
  return { state: "destination_confirmed" as const, sourceChainId: 11155111, destinationChainId: 84532, sourceHash: sourceReceipt.transactionHash, destinationHash,
    sourceBlock: sourceReceipt.blockNumber.toString(), destinationBlock: destinationReceipt.blockNumber.toString(), amountWei: deposit.value.toString(), portal: deposit.to };
}
